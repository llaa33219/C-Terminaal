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
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
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