// 프로필 페이지 핸들러 (개선된 버전)
(function() {
    // 페이지 로드 후 실행
    window.addEventListener('load', function() {
      console.log('프로필 핸들러 로드됨');
      
      // 프로필 페이지 표시 함수 - 이 함수가 작동함을 확인했음
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
          
          // 네비게이션 링크 활성화 상태 업데이트
          document.querySelectorAll('.nav-links a').forEach(function(link) {
            link.classList.remove('active');
          });
          
          // 프로필 데이터 로드 시도
          try {
            if (window.profileManager && typeof window.profileManager.loadProfile === 'function') {
              window.profileManager.loadProfile();
              console.log('프로필 데이터 로드됨');
            }
          } catch(err) {
            console.log('프로필 데이터 로드 실패:', err);
          }
          
          console.log('프로필 섹션 표시 성공');
        } else {
          console.error('profile-section을 찾을 수 없음!');
        }
        
        // 드롭다운 메뉴 닫기
        const dropdown = document.querySelector('.user-dropdown');
        if (dropdown) {
          dropdown.style.display = 'none';
        }
      };
      
      // 테스트 버튼 추가 (작동하는 버튼)
      addTestButton();
      
      // 프로필 링크 설정 (중요!)
      setupProfileLink();
      
      // 사용자 드롭다운 메뉴 설정
      setupUserDropdown();
    });
    
    // 프로필 링크 설정 함수
    function setupProfileLink() {
      // 주기적으로 링크 확인 및 이벤트 설정
      function checkAndSetupLink() {
        const profileLink = document.getElementById('nav-profile');
        if (!profileLink) return false;
        
        console.log('프로필 링크 발견, 이벤트 설정 중...');
        
        // 기존 이벤트 제거를 위해 복제
        const newLink = profileLink.cloneNode(true);
        profileLink.parentNode.replaceChild(newLink, profileLink);
        
        // 새 이벤트 설정 - 작동하는 showProfilePage 함수 사용
        newLink.onclick = function(e) {
          e.preventDefault();
          e.stopPropagation();
          console.log('프로필 링크 클릭됨');
          window.showProfilePage();
          return false;
        };
        
        console.log('프로필 링크 이벤트 설정 완료');
        return true;
      }
      
      // 바로 설정 시도
      if (!checkAndSetupLink()) {
        // 실패 시 일정 간격으로 다시 시도
        console.log('프로필 링크를 찾지 못함, 주기적으로 다시 시도합니다');
        var linkCheckInterval = setInterval(function() {
          if (checkAndSetupLink()) {
            clearInterval(linkCheckInterval);
          }
        }, 1000);
      }
    }
    
    // 사용자 드롭다운 메뉴 설정
    function setupUserDropdown() {
      // 아바타 요소 찾기
      const userAvatar = document.getElementById('user-avatar');
      if (!userAvatar) {
        console.error('user-avatar 요소를 찾을 수 없습니다');
        return;
      }
      
      // 드롭다운 메뉴 요소 찾기
      const dropdown = document.querySelector('.user-dropdown');
      if (!dropdown) {
        console.error('user-dropdown 요소를 찾을 수 없습니다');
        return;
      }
      
      console.log('사용자 아바타와 드롭다운 메뉴 발견');
      
      // 아바타 클릭 이벤트 재설정
      userAvatar.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('아바타 클릭됨 (새 핸들러)');
        
        // 드롭다운 표시 토글
        if (dropdown.style.display === 'none' || !dropdown.style.display) {
          dropdown.style.display = 'block';
          console.log('드롭다운 메뉴 표시됨');
          
          // 드롭다운 내의 모든 링크 처리
          setupDropdownLinks(dropdown);
          
        } else {
          dropdown.style.display = 'none';
          console.log('드롭다운 메뉴 숨김');
        }
        
        return false;
      };
      
      // 페이지 클릭 시 드롭다운 닫기
      document.addEventListener('click', function(e) {
        if (dropdown.style.display === 'block' && !dropdown.contains(e.target) && e.target !== userAvatar) {
          dropdown.style.display = 'none';
        }
      });
      
      console.log('사용자 아바타 이벤트 설정 완료');
    }
    
    // 드롭다운 내 링크 설정
    function setupDropdownLinks(dropdown) {
      // 드롭다운 내 모든 링크 찾기
      const links = dropdown.querySelectorAll('a');
      
      links.forEach(function(link) {
        // 내 프로필 링크 찾기
        if (link.id === 'nav-profile' || link.textContent.trim() === '내 프로필') {
          console.log('드롭다운 내 프로필 링크 발견, 이벤트 설정');
          
          // 기존 이벤트 모두 제거
          const newLink = link.cloneNode(true);
          link.parentNode.replaceChild(newLink, link);
          
          // 새 이벤트 설정 - 작동하는 showProfilePage 함수 직접 호출
          newLink.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('드롭다운 내 프로필 링크 클릭됨');
            window.showProfilePage();
            return false;
          };
        }
      });
    }
    
    // 테스트 버튼 추가 (작동하는 버튼)
    function addTestButton() {
      // 이미 존재하는지 확인
      if (document.getElementById('profile-test-btn')) return;
      
      // 새 버튼 생성
      const btn = document.createElement('button');
      btn.id = 'profile-test-btn';
      btn.innerText = '마이페이지 열기';
      btn.style.cssText = 'position: fixed; top: 80px; right: 20px; z-index: 9999; padding: 10px; background: #0070f3; color: white; border: none; border-radius: 4px; cursor: pointer;';
      
      // 클릭 이벤트 - 작동하는 방식 사용
      btn.onclick = function() {
        window.showProfilePage();
      };
      
      // 문서에 추가
      document.body.appendChild(btn);
      console.log('테스트 버튼 추가됨');
    }
  })();