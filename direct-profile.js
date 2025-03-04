// 간단한 프로필 링크 처리기
(function() {
    // 페이지 로드 후 실행
    document.addEventListener('DOMContentLoaded', function() {
      console.log('간단한 프로필 처리기 초기화 중...');
      
      // 간단한 임의 함수 정의 - 프로필 페이지 표시하기
      window.showProfilePage = function() {
        console.log('프로필 페이지 표시 함수 호출됨');
        
        // 모든 섹션 숨기기
        document.querySelectorAll('.section').forEach(function(section) {
          section.style.display = 'none';
        });
        
        // 프로필 섹션 표시
        const profileSection = document.getElementById('profile-section');
        if (profileSection) {
          profileSection.style.display = 'block';
          console.log('프로필 섹션 표시 성공');
        } else {
          console.error('profile-section을 찾을 수 없음!');
        }
      };
      
      // 테스트 버튼 추가
      addTestButton();
    });
    
    // 테스트 버튼 추가 함수
    function addTestButton() {
      // 이미 존재하는지 확인
      if (document.getElementById('simple-profile-btn')) return;
      
      // 새 버튼 만들기
      const btn = document.createElement('button');
      btn.id = 'simple-profile-btn';
      btn.innerText = '마이페이지 열기';
      btn.style.cssText = 'position: fixed; top: 80px; right: 20px; z-index: 9999; padding: 10px; background: #0070f3; color: white; border: none; border-radius: 4px; cursor: pointer;';
      
      // 클릭 이벤트
      btn.onclick = function() {
        window.showProfilePage();
      };
      
      // body에 추가
      document.body.appendChild(btn);
      console.log('테스트 버튼 추가됨');
    }
  })();