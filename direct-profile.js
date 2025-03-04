// 직접 프로필 페이지 전환 처리를 위한 스크립트
(function() {
    // 페이지 로드 완료 후 실행
    window.addEventListener('load', function() {
      console.log('direct-profile.js 로드됨');
      
      // 프로필 버튼에 이벤트 리스너 강제 연결
      function setupProfileNav() {
        const profileBtn = document.getElementById('nav-profile');
        if (!profileBtn) {
          console.error('프로필 버튼을 찾을 수 없습니다');
          return;
        }
        
        console.log('프로필 버튼 발견, 이벤트 연결 중...');
        
        // 기존 이벤트 리스너 제거를 위해 복제
        const newBtn = profileBtn.cloneNode(true);
        profileBtn.parentNode.replaceChild(newBtn, profileBtn);
        
        // 새 이벤트 직접 연결
        newBtn.addEventListener('click', function(e) {
          e.preventDefault();
          console.log('프로필 버튼 클릭됨!');
          
          // 모든 섹션 숨기기
          document.querySelectorAll('.section').forEach(function(section) {
            section.style.display = 'none';
          });
          
          // 프로필 섹션 표시
          const profileSection = document.getElementById('profile-section');
          if (profileSection) {
            profileSection.style.display = 'block';
            console.log('프로필 섹션 표시됨');
            
            // 프로필 매니저 존재하면 로드 함수 호출
            if (window.profileManager && typeof window.profileManager.loadProfile === 'function') {
              console.log('프로필 매니저 로드 함수 호출');
              window.profileManager.loadProfile();
            } else {
              console.warn('프로필 매니저가 정의되지 않았거나 loadProfile 함수가 없습니다');
            }
          } else {
            console.error('profile-section을 찾을 수 없습니다');
          }
        });
        
        console.log('프로필 버튼 이벤트 연결 완료');
      }
      
      // 프로필 네비게이션 설정
      setupProfileNav();
      
      // 사용자 아바타 클릭 시 드롭다운 토글 처리
      const userAvatar = document.getElementById('user-avatar');
      if (userAvatar) {
        userAvatar.addEventListener('click', function() {
          console.log('아바타 클릭됨');
          const dropdown = document.querySelector('.user-dropdown');
          if (dropdown) {
            // 표시 상태 토글
            if (dropdown.style.display === 'none' || !dropdown.style.display) {
              dropdown.style.display = 'block';
              console.log('드롭다운 표시');
            } else {
              dropdown.style.display = 'none';
              console.log('드롭다운 숨김');
            }
          }
        });
      }
    });
  })();