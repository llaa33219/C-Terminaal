export default {
    async fetch(request, env, ctx) {
      const url = new URL(request.url);
      
      // API 엔드포인트 확인
      if (url.pathname.startsWith('/api/storage')) {
        return handleStorageRequest(request, env);
      }
      
      // 일반 Pages 자산 제공
      return env.ASSETS.fetch(request);
    }
  };
  
  async function handleStorageRequest(request, env) {
    // CORS 헤더 설정
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };
    
    // OPTIONS 요청 처리
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    
    try {
      const url = new URL(request.url);
      const path = url.pathname.replace('/api/storage/', '');
      
      // 요청 본문 파싱
      let data = {};
      if (request.method !== "GET") {
        data = await request.json();
      }
      
      // R2 버킷 인스턴스
      const bucket = env.R2_BUCKET;
      
      if (path === 'upload' && request.method === 'POST') {
        // 파일 업로드 처리
        const { filePath, content } = data;
        await bucket.put(filePath, content);
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } 
      else if (path === 'download' && request.method === 'POST') {
        // 파일 다운로드 처리
        const { filePath } = data;
        const object = await bucket.get(filePath);
        
        if (!object) {
          return new Response(JSON.stringify({ error: "File not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        
        const fileContent = await object.text();
        return new Response(fileContent, {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      else if (path === 'delete' && request.method === 'POST') {
        // 파일 삭제 처리
        const { filePath } = data;
        await bucket.delete(filePath);
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      
      return new Response(JSON.stringify({ error: "Invalid endpoint" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }