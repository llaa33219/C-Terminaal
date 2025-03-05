// direct-profile.js 파일에 적용할 코드
(function() {
    // 페이지가 완전히 로드되었을 때 실행
    window.addEventListener('load', function() {
      console.log('직접 이벤트 바인딩 방식 적용 중...');
      
      // 1. 전역 함수 정의 - 가장 간단하게 접근할 수 있는 함수
      window.openMyProfile = function() {
        console.log('openMyProfile 함수 호출됨');
        
        // 모든 섹션 숨기기
        var sections = document.querySelectorAll('.section');
        for(var i = 0; i < sections.length; i++) {
          sections[i].style.display = 'none';
        }
        
        // 프로필 섹션 표시
        var profileSection = document.getElementById('profile-section');
        if(profileSection) {
          profileSection.style.display = 'block';
          console.log('프로필 섹션 표시됨');
          
          // 프로필 데이터 로드 시도
          if(window.profileManager && typeof profileManager.loadProfile === 'function') {
            profileManager.loadProfile();
            console.log('프로필 데이터 로드됨');
          }
        }
        
        // 드롭다운 메뉴 닫기
        var dropdown = document.querySelector('.user-dropdown');
        if(dropdown) dropdown.style.display = 'none';
        
        return false; // 이벤트 전파 방지
      };
      
      // 2. 가장 직접적인 방법으로 이벤트 설정
      applyDirectEventBinding();
      
      // 3. 테스트 버튼 추가
      addDirectTestButton();
      
      // 4. 페이지 전환 함수 오버라이드
      overrideShowSection();
    });
    
    // 직접 이벤트 바인딩 적용 함수
    function applyDirectEventBinding() {
      console.log('직접 이벤트 바인딩 적용 시작');
      
      // 1. 프로필 링크에 직접 onclick 속성 설정
      var profileLinks = document.querySelectorAll('a#nav-profile');
      for(var i = 0; i < profileLinks.length; i++) {
        var link = profileLinks[i];
        
        // HTML 속성으로 직접 설정 (가장 강력한 방법)
        link.setAttribute('onclick', 'return openMyProfile();');
        
        // href 속성도 변경
        link.setAttribute('href', 'javascript:openMyProfile();');
        
        console.log('프로필 링크에 직접 속성 설정 완료:', link);
      }
      
      // 2. 사용자 아바타에 클릭 이벤트 직접 설정
      var avatar = document.getElementById('user-avatar');
      if(avatar) {
        avatar.setAttribute('onclick', 'toggleUserDropdown(); return false;');
        console.log('아바타에 직접 onclick 속성 설정 완료');
        
        // 전역 함수 정의 - 드롭다운 토글
        window.toggleUserDropdown = function() {
          var dropdown = document.querySelector('.user-dropdown');
          if(!dropdown) return false;
          
          if(dropdown.style.display === 'block') {
            dropdown.style.display = 'none';
          } else {
            dropdown.style.display = 'block';
            
            // 드롭다운 내의 프로필 링크에도 직접 이벤트 설정
            var dropdownProfileLinks = dropdown.querySelectorAll('a');
            for(var i = 0; i < dropdownProfileLinks.length; i++) {
              var link = dropdownProfileLinks[i];
              if(link.id === 'nav-profile' || link.textContent.trim() === '내 프로필') {
                link.setAttribute('onclick', 'return openMyProfile();');
                link.setAttribute('href', 'javascript:openMyProfile();');
                console.log('드롭다운 내 프로필 링크에 직접 속성 설정 완료:', link);
              }
            }
          }
          
          return false;
        };
      }
      
      // 3. HTML 문서에 직접 인라인 스크립트 삽입
      var scriptElement = document.createElement('script');
      scriptElement.innerHTML = `
        // 인라인 스크립트로 정의된 함수
        function directOpenProfile() {
          console.log('인라인 스크립트에서 정의된 함수 호출됨');
          return openMyProfile();
        }
      `;
      document.body.appendChild(scriptElement);
      
      console.log('직접 이벤트 바인딩 적용 완료');
    }
    
    // 테스트 버튼 추가
    function addDirectTestButton() {
      // 이미 존재하는지 확인
      if(document.getElementById('direct-profile-btn')) return;
      
      // 버튼 생성
      var btn = document.createElement('button');
      btn.id = 'direct-profile-btn';
      btn.innerHTML = '직접 마이페이지 열기';
      btn.style.cssText = 'position: fixed; top: 80px; right: 20px; z-index: 9999; padding: 10px; background: #0070f3; color: white; border: none; border-radius: 4px; cursor: pointer;';
      
      // onclick 속성 직접 설정
      btn.setAttribute('onclick', 'openMyProfile(); return false;');
      
      document.body.appendChild(btn);
      console.log('직접 이벤트가 설정된 테스트 버튼 추가됨');
    }
    
    // showSection 함수 오버라이드
    function overrideShowSection() {
      if(typeof window.showSection === 'function') {
        console.log('showSection 함수 오버라이드 시도');
        
        // 원본 함수 백업
        window.originalShowSection = window.showSection;
        
        // 새 버전으로 교체
        window.showSection = function(sectionId) {
          console.log('오버라이드된 showSection 호출:', sectionId);
          
          // 프로필 섹션인 경우 특별 처리
          if(sectionId === 'profile-section') {
            return openMyProfile();
          }
          
          // 그 외의 경우 원본 함수 호출
          return window.originalShowSection(sectionId);
        };
        
        console.log('showSection 함수 오버라이드 완료');
      }
    }
    
    // 주기적으로 이벤트 바인딩 확인 및 재적용
    setInterval(function() {
      // 프로필 링크 확인
      var profileLinks = document.querySelectorAll('a#nav-profile');
      for(var i = 0; i < profileLinks.length; i++) {
        var link = profileLinks[i];
        if(!link.getAttribute('onclick') || link.getAttribute('onclick').indexOf('openMyProfile') === -1) {
          console.log('프로필 링크의 이벤트가 사라짐, 재설정 중...');
          link.setAttribute('onclick', 'return openMyProfile();');
          link.setAttribute('href', 'javascript:openMyProfile();');
        }
      }
      
      // 드롭다운 메뉴 내의 링크도 확인
      var dropdown = document.querySelector('.user-dropdown');
      if(dropdown && dropdown.style.display === 'block') {
        var dropdownLinks = dropdown.querySelectorAll('a');
        for(var i = 0; i < dropdownLinks.length; i++) {
          var link = dropdownLinks[i];
          if((link.id === 'nav-profile' || link.textContent.trim() === '내 프로필') && 
             (!link.getAttribute('onclick') || link.getAttribute('onclick').indexOf('openMyProfile') === -1)) {
            link.setAttribute('onclick', 'return openMyProfile();');
            link.setAttribute('href', 'javascript:openMyProfile();');
          }
        }
      }
    }, 2000);
  })();