// direct-profile.js 파일을 이 코드로 업데이트하세요
(function() {
    // 페이지 로드 후 실행
    window.addEventListener('load', function() {
      console.log('프로필 핸들러 로드됨');
      
      // 프로필 매니저 강제 초기화
      if (window.profileManager && typeof window.profileManager.init === 'function') {
        window.profileManager.init();
        console.log('프로필 매니저 명시적 초기화 완료');
      }
      
      // 프로필 페이지 표시 함수 - 개선된 버전
      window.showProfilePage = function() {
        console.log('프로필 페이지 표시 함수 호출됨');
        
        // 프로필 매니저 확인 및 초기화
        if (window.profileManager) {
          // 프로필 매니저가 아직 초기화되지 않았다면 초기화
          if (typeof window.profileManager.init === 'function' && !window.profileManager._initialized) {
            window.profileManager.init();
            window.profileManager._initialized = true;
            console.log('프로필 매니저 지연 초기화 완료');
          }
        } else {
          console.warn('profileManager가 정의되지 않음');
        }
        
        // 모든 섹션 숨기기
        document.querySelectorAll('.section').forEach(function(section) {
          section.style.display = 'none';
        });
        
        // 프로필 섹션 표시
        const profileSection = document.getElementById('profile-section');
        if (profileSection) {
          profileSection.style.display = 'block';
          
          // 프로필 데이터 로드
          try {
            if (window.profileManager && typeof window.profileManager.loadProfile === 'function') {
              window.profileManager.loadProfile();
              console.log('프로필 데이터 로드됨');
            }
          } catch(err) {
            console.error('프로필 데이터 로드 실패:', err);
          }
          
          console.log('프로필 섹션 표시 성공');
        } else {
          console.error('profile-section을 찾을 수 없음!');
        }
        
        // 드롭다운 닫기
        const dropdown = document.querySelector('.user-dropdown');
        if (dropdown) dropdown.style.display = 'none';
      };
      
      // showSection 함수 오버라이드 (기존 함수 백업)
      if (typeof window.originalShowSection === 'undefined' && typeof window.showSection === 'function') {
        window.originalShowSection = window.showSection;
        
        // 오버라이드된 버전
        window.showSection = function(sectionId) {
          console.log('오버라이드된 showSection 호출:', sectionId);
          
          // profile-section인 경우 특별 처리
          if (sectionId === 'profile-section') {
            window.showProfilePage();
            return;
          }
          
          // 다른 섹션은 원래 함수로 처리
          window.originalShowSection(sectionId);
        };
        
        console.log('showSection 함수 성공적으로 오버라이드됨');
      }
      
      // 테스트 버튼 추가 (작동하는 버튼)
      addTestButton();
      
      // 프로필 링크 이벤트 설정 (지연 설정)
      setTimeout(setupProfileLink, 500);
      
      // 사용자 드롭다운 설정
      setupUserDropdown();
    });
    
    // 프로필 링크 이벤트 설정
    function setupProfileLink() {
      const profileLink = document.getElementById('nav-profile');
      if (!profileLink) {
        console.error('nav-profile 요소를 찾을 수 없음');
        return;
      }
      
      console.log('프로필 링크 발견, 이벤트 직접 설정');
      
      // onclick 직접 설정 (가장 강력한 방법)
      profileLink.onclick = function(e) {
        e.preventDefault();
        console.log('프로필 링크 클릭됨');
        window.showProfilePage();
        return false;
      };
      
      // href 속성 변경
      profileLink.href = "javascript:window.showProfilePage(); return false;";
      
      console.log('프로필 링크 이벤트 설정 완료');
    }
    
    // 드롭다운 메뉴 설정
    function setupUserDropdown() {
      const userAvatar = document.getElementById('user-avatar');
      if (!userAvatar) return;
      
      const dropdown = document.querySelector('.user-dropdown');
      if (!dropdown) return;
      
      // 아바타 클릭 처리
      userAvatar.onclick = function(e) {
        e.preventDefault();
        console.log('아바타 클릭됨');
        
        if (dropdown.style.display === 'none' || !dropdown.style.display) {
          dropdown.style.display = 'block';
          
          // 드롭다운 표시 후 곧바로 링크 설정
          setupDropdownLinks(dropdown);
        } else {
          dropdown.style.display = 'none';
        }
        
        return false;
      };
    }
    
    // 드롭다운 내 링크 설정
    function setupDropdownLinks(dropdown) {
      // 모든 링크 찾기
      const links = dropdown.querySelectorAll('a');
      
      links.forEach(function(link) {
        // 프로필 링크 찾기
        if (link.id === 'nav-profile' || link.textContent.trim() === '내 프로필') {
          console.log('드롭다운 내 프로필 링크 설정');
          
          // 직접 onclick 설정 및 href 변경 (가장 강력한 방법)
          link.onclick = function(e) {
            e.preventDefault();
            console.log('드롭다운 내 프로필 링크 클릭됨');
            window.showProfilePage();
            return false;
          };
          
          link.href = "javascript:window.showProfilePage(); return false;";
        }
      });
    }
    
    // 테스트 버튼 추가
    function addTestButton() {
      if (document.getElementById('profile-test-btn')) return;
      
      const btn = document.createElement('button');
      btn.id = 'profile-test-btn';
      btn.innerText = '마이페이지 열기';
      btn.style.cssText = 'position: fixed; top: 80px; right: 20px; z-index: 9999; padding: 10px; background: #0070f3; color: white; border: none; border-radius: 4px; cursor: pointer;';
      
      btn.onclick = function() {
        window.showProfilePage();
      };
      
      document.body.appendChild(btn);
    }
  })();