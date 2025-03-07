// C-Terminal Cloudflare Worker
// R2 버킷 연동을 위한 API 엔드포인트 제공

export default {
  // 모든 요청 처리
  async fetch(request, env, ctx) {
    // URL 분석
    const url = new URL(request.url);
    
    // API 요청만 처리
    if (url.pathname.startsWith('/api/')) {
      return await handleApiRequest(request, env);
    }
    
    // 정적 자산 요청 처리 (HTML 문서의 Content-Type 설정 포함)
    const response = await env.ASSETS.fetch(request);
    
    // HTML 문서인 경우 Content-Type 헤더 설정
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("text/html")) {
      const newHeaders = new Headers(response.headers);
      newHeaders.set("Content-Type", "text/html; charset=UTF-8");
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });
    }
    
    // 다른 정적 자산은 그대로 반환
    return response;
  }
};

// API 요청 처리 함수
async function handleApiRequest(request, env) {
  // CORS 헤더 설정
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*", // 실제 배포 시 정확한 도메인으로 제한 권장
    "Access-Control-Allow-Methods": "GET, PUT, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Custom-Auth, X-Requested-With",
    "Access-Control-Max-Age": "86400",
  };

  // OPTIONS 요청 처리 (CORS preflight)
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }
  
  try {
    const url = new URL(request.url);
    
    // /api/ 프리픽스 제거하여 실제 경로 추출
    const path = url.pathname.replace(/^\/api\//, "");
    
    // 버킷이 존재하는지 확인
    if (!env.R2_BUCKET) {
      return new Response("R2 bucket binding not found", { 
        status: 500,
        headers: corsHeaders
      });
    }

    // 인증 확인 (간단한 API 키 확인) - 일시적으로 비활성화
    const apiKey = request.headers.get("X-Custom-Auth");
    if (false && path.startsWith("community/") && path !== "community/posts/list") {
      // GET 방식의 읽기 요청을 제외한 모든 커뮤니티 요청은 인증 필요
      if (request.method !== "GET" && apiKey !== env.API_KEY) {
        return new Response("Unauthorized", { 
          status: 401,
          headers: corsHeaders 
        });
      }
    }
    
    // 커뮤니티 API 요청 처리
    if (path.startsWith("community/")) {
      return await handleCommunityRequest(request, env, path, corsHeaders);
    }
    
    // 기존 파일 스토리지 API 요청 처리
    // HTTP 메서드에 따른 처리
    if (request.method === "GET") {
      // R2에서 파일 가져오기
      const object = await env.R2_BUCKET.get(path);
      
      if (!object) {
        return new Response("Object Not Found", { 
          status: 404,
          headers: corsHeaders 
        });
      }
      
      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set("etag", object.httpEtag);
      
      // CORS 헤더 추가
      Object.entries(corsHeaders).forEach(([key, value]) => {
        headers.set(key, value);
      });
      
      return new Response(object.body, {
        headers
      });
    } 
    else if (request.method === "PUT") {
      // R2에 파일 업로드
      const contentType = request.headers.get("Content-Type") || "application/octet-stream";
      
      await env.R2_BUCKET.put(path, request.body, {
        httpMetadata: {
          contentType: contentType,
        },
      });
      
      return new Response("File uploaded successfully", {
        status: 200,
        headers: corsHeaders
      });
    } 
    else if (request.method === "DELETE") {
      // R2에서 파일 삭제
      await env.R2_BUCKET.delete(path);
      
      return new Response("File deleted successfully", {
        status: 200,
        headers: corsHeaders
      });
    } 
    else if (request.method === "POST" && path === "list") {
      // 특정 경로의 파일 목록 가져오기
      const prefix = url.searchParams.get("prefix") || "";
      const delimiter = url.searchParams.get("delimiter") || "/";
      
      const listed = await env.R2_BUCKET.list({
        prefix: prefix,
        delimiter: delimiter
      });
      
      return new Response(JSON.stringify({
        objects: listed.objects.map(object => ({
          key: object.key,
          size: object.size,
          uploaded: object.uploaded
        })),
        delimitedPrefixes: listed.delimitedPrefixes
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    
    // 지원하지 않는 메서드
    return new Response("Method Not Allowed", {
      status: 405,
      headers: corsHeaders
    });
  } 
  catch (err) {
    // 오류 처리
    return new Response("Server Error: " + err.message, {
      status: 500,
      headers: corsHeaders
    });
  }
}

// 커뮤니티 관련 API 요청 처리
async function handleCommunityRequest(request, env, path, corsHeaders) {
  const url = new URL(request.url);
  const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };
  
  try {
    // 커뮤니티 API 엔드포인트 처리
    if (path === "community/posts/list") {
      // 게시물 목록 가져오기
      const sortBy = url.searchParams.get("sort") || "new"; // new, hot, top
      const page = parseInt(url.searchParams.get("page") || "1");
      const limit = parseInt(url.searchParams.get("limit") || "20");
      
      // 포스트 인덱스 가져오기 (모든 포스트 메타데이터)
      let indexObject = await env.R2_BUCKET.get("community/posts/index.json");
      let posts = [];
      
      if (indexObject) {
        posts = JSON.parse(await indexObject.text());
      }
      
      // 정렬
      if (sortBy === "hot") {
        posts.sort((a, b) => b.likes - a.likes);
      } else if (sortBy === "top") {
        posts.sort((a, b) => (b.comments || 0) - (a.comments || 0));
      } else {
        // 기본: new - 날짜 기준
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));
      }
      
      // 페이지네이션
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedPosts = posts.slice(startIndex, endIndex);
      
      return new Response(JSON.stringify({
        posts: paginatedPosts,
        total: posts.length,
        page: page,
        limit: limit,
        totalPages: Math.ceil(posts.length / limit)
      }), {
        headers: jsonHeaders
      });
    }
    else if (path === "community/posts/create" && request.method === "POST") {
      // 새 게시물 생성
      const post = await request.json();
      
      // 필수 필드 확인
      if (!post.title || !post.content || !post.author) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), {
          status: 400,
          headers: jsonHeaders
        });
      }
      
      // 고유 ID 및 타임스탬프 추가
      post.id = `post_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      post.date = new Date().toISOString();
      post.likes = 0;
      post.comments = 0;
      post.likedBy = [];
      
      // 인덱스에 메타데이터 추가
      let indexObject = await env.R2_BUCKET.get("community/posts/index.json");
      let posts = [];
      
      if (indexObject) {
        posts = JSON.parse(await indexObject.text());
      }
      
      // 메타데이터만 저장하기 위해 콘텐츠 원문은 제외
      const postMeta = { ...post };
      delete postMeta.content; // 전체 콘텐츠는 별도 저장
      
      posts.push(postMeta);
      
      // 인덱스 업데이트
      await env.R2_BUCKET.put("community/posts/index.json", JSON.stringify(posts), {
        httpMetadata: { contentType: "application/json" }
      });
      
      // 전체 게시물 저장
      await env.R2_BUCKET.put(`community/posts/post_${post.id}.json`, JSON.stringify(post), {
        httpMetadata: { contentType: "application/json" }
      });
      
      // 사용자별 게시물 인덱스 업데이트
      const userPostsKey = `community/users/${post.author.id}/posts.json`;
      let userPostsObject = await env.R2_BUCKET.get(userPostsKey);
      let userPosts = [];
      
      if (userPostsObject) {
        userPosts = JSON.parse(await userPostsObject.text());
      }
      
      userPosts.push(postMeta);
      
      await env.R2_BUCKET.put(userPostsKey, JSON.stringify(userPosts), {
        httpMetadata: { contentType: "application/json" }
      });
      
      return new Response(JSON.stringify(post), {
        status: 201,
        headers: jsonHeaders
      });
    }
    else if (path.match(/^community\/posts\/[^/]+$/) && request.method === "GET") {
      // 특정 게시물 가져오기
      const postId = path.split('/').pop();
      
      // 'post_' 접두사가 이미 포함되어 있는지 확인
      const postPath = postId.startsWith('post_') 
      ? `community/posts/${postId}.json` 
      : `community/posts/post_${postId}.json`;
      
      const postObject = await env.R2_BUCKET.get(postPath);
      
      if (!postObject) {
        return new Response(JSON.stringify({ error: "Post not found" }), {
          status: 404,
          headers: jsonHeaders
        });
      }
      
      const post = JSON.parse(await postObject.text());
      
      // 댓글 가져오기
      const commentsObject = await env.R2_BUCKET.get(`community/comments/${postId}.json`);
      let comments = [];
      
      if (commentsObject) {
        comments = JSON.parse(await commentsObject.text());
      }
      
      post.commentList = comments;
      
      return new Response(JSON.stringify(post), {
        headers: jsonHeaders
      });
    }
    else if (path.match(/^community\/posts\/[^/]+\/like$/) && request.method === "POST") {
      // 게시물 좋아요
      const postId = path.split('/')[2];
      const { userId } = await request.json();
      
      if (!userId) {
        return new Response(JSON.stringify({ error: "User ID is required" }), {
          status: 400,
          headers: jsonHeaders
        });
      }
      
      // 인덱스에서 게시물 찾기
      let indexObject = await env.R2_BUCKET.get("community/posts/index.json");
      
      if (!indexObject) {
        return new Response(JSON.stringify({ error: "Posts index not found" }), {
          status: 404,
          headers: jsonHeaders
        });
      }
      
      let posts = JSON.parse(await indexObject.text());
      const postIndex = posts.findIndex(p => p.id === postId);
      
      if (postIndex === -1) {
        return new Response(JSON.stringify({ error: "Post not found" }), {
          status: 404,
          headers: jsonHeaders
        });
      }
      
      // 게시물 전체 정보 가져오기
      const postObject = await env.R2_BUCKET.get(`community/posts/post_${postId}.json`);
      
      if (!postObject) {
        return new Response(JSON.stringify({ error: "Post data not found" }), {
          status: 404,
          headers: jsonHeaders
        });
      }
      
      const post = JSON.parse(await postObject.text());
      
      // 이미 좋아요했는지 확인
      if (post.likedBy && post.likedBy.includes(userId)) {
        return new Response(JSON.stringify({ error: "Already liked this post" }), {
          status: 400,
          headers: jsonHeaders
        });
      }
      
      // 좋아요 추가
      post.likes = (post.likes || 0) + 1;
      post.likedBy = [...(post.likedBy || []), userId];
      
      // 인덱스 업데이트
      posts[postIndex].likes = post.likes;
      
      // 저장
      await env.R2_BUCKET.put("community/posts/index.json", JSON.stringify(posts), {
        httpMetadata: { contentType: "application/json" }
      });
      
      await env.R2_BUCKET.put(`community/posts/post_${postId}.json`, JSON.stringify(post), {
        httpMetadata: { contentType: "application/json" }
      });
      
      // 사용자 좋아요 목록 업데이트
      const userLikesKey = `community/users/${userId}/likes.json`;
      let userLikesObject = await env.R2_BUCKET.get(userLikesKey);
      let userLikes = [];
      
      if (userLikesObject) {
        userLikes = JSON.parse(await userLikesObject.text());
      }
      
      userLikes.push({ 
        postId: post.id, 
        date: new Date().toISOString() 
      });
      
      await env.R2_BUCKET.put(userLikesKey, JSON.stringify(userLikes), {
        httpMetadata: { contentType: "application/json" }
      });
      
      return new Response(JSON.stringify({ success: true, likes: post.likes }), {
        headers: jsonHeaders
      });
    }
    else if (path.match(/^community\/posts\/[^/]+\/comment$/) && request.method === "POST") {
      // 댓글 작성
      const postId = path.split('/')[2];
      const comment = await request.json();
      
      // 필수 필드 확인
      if (!comment.content || !comment.author) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), {
          status: 400,
          headers: jsonHeaders
        });
      }
      
      // 댓글 ID 및 날짜 추가
      comment.id = `comment_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      comment.date = new Date().toISOString();
      
      // 댓글 목록 가져오기
      const commentsKey = `community/comments/${postId}.json`;
      let commentsObject = await env.R2_BUCKET.get(commentsKey);
      let comments = [];
      
      if (commentsObject) {
        comments = JSON.parse(await commentsObject.text());
      }
      
      comments.push(comment);
      
      // 댓글 저장
      await env.R2_BUCKET.put(commentsKey, JSON.stringify(comments), {
        httpMetadata: { contentType: "application/json" }
      });
      
      // 포스트의 댓글 카운트 업데이트
      let indexObject = await env.R2_BUCKET.get("community/posts/index.json");
      
      if (indexObject) {
        let posts = JSON.parse(await indexObject.text());
        const postIndex = posts.findIndex(p => p.id === postId);
        
        if (postIndex !== -1) {
          posts[postIndex].comments = comments.length;
          
          await env.R2_BUCKET.put("community/posts/index.json", JSON.stringify(posts), {
            httpMetadata: { contentType: "application/json" }
          });
        }
      }
      
      return new Response(JSON.stringify(comment), {
        status: 201,
        headers: jsonHeaders
      });
    } 
    else if (path === "community/posts/user" && request.method === "GET") {
      // 특정 사용자의 게시물 가져오기
      const userId = url.searchParams.get("userId");
      
      if (!userId) {
        return new Response(JSON.stringify({ error: "User ID is required" }), {
          status: 400,
          headers: jsonHeaders
        });
      }
      
      const userPostsKey = `community/users/${userId}/posts.json`;
      let userPostsObject = await env.R2_BUCKET.get(userPostsKey);
      
      if (!userPostsObject) {
        return new Response(JSON.stringify({ posts: [] }), {
          headers: jsonHeaders
        });
      }
      
      const posts = JSON.parse(await userPostsObject.text());
      
      return new Response(JSON.stringify({ posts }), {
        headers: jsonHeaders
      });
    }
    
    // 지원하지 않는 API 엔드포인트
    return new Response(JSON.stringify({ error: "Endpoint not found" }), {
      status: 404,
      headers: jsonHeaders
    });
  } 
  catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: jsonHeaders
    });
  }
}