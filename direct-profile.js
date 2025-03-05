// final-profile-handler.js
(function() {
    // 전역 상태 관리 (페이지 전환에도 유지됨)
    window._profileState = window._profileState || {
      initialized: false,
      pageTransitions: 0
    };
    
    // 페이지 로드 완료 후 실행
    window.addEventListener('load', initializeProfileSystem);
    
    // 프로필 시스템 초기화 - 이 함수는 여러번 호출해도 안전
    function initializeProfileSystem() {
      console.log('프로필 시스템 초기화, 현재 상태:', window._profileState);
      
      // 1. 전역 프로필 열기 함수 정의 (항상 최신 함수 사용)
      window.openMyProfilePage = function(fromAutoInit) {
        if (!fromAutoInit) console.log('프로필 페이지 열기 함수 호출됨');
        
        // 모든 섹션 숨기기
        document.querySelectorAll('.section').forEach(function(section) {
          section.style.display = 'none';
        });
        
        // 프로필 섹션 표시
        var profileSection = document.getElementById('profile-section');
        if (profileSection) {
          profileSection.style.display = 'block';
          
          // 프로필 매니저 초기화 및 로드
          if (window.profileManager) {
            // 강제 초기화
            if (typeof window.profileManager.init === 'function') {
              try {
                window.profileManager.init();
                window._profileState.initialized = true;
              } catch (e) {
                console.error('프로필 매니저 초기화 오류:', e);
              }
            }
            
            // 프로필 데이터 로드
            if (typeof window.profileManager.loadProfile === 'function') {
              try {
                window.profileManager.loadProfile();
                if (!fromAutoInit) console.log('프로필 데이터 로드됨');
              } catch (e) {
                console.error('프로필 데이터 로드 오류:', e);
              }
            }
          }
        }
        
        // 드롭다운 메뉴 닫기
        var dropdown = document.querySelector('.user-dropdown');
        if (dropdown) dropdown.style.display = 'none';
        
        return false;
      };
      
      // 2. 기존 showSection 함수 오버라이드
      overridePageNavigation();
      
      // 3. 모든 프로필 링크 이벤트 재설정
      setupAllProfileLinks();
      
      // 4. 필요 시 자동 초기화 실행
      if (!window._profileState.initialized) {
        performAutoInitialization();
      }
      
      // 5. 테스트 버튼 추가
      addTestButton();
      
      // 6. 페이지 전환 감지 설정
      monitorPageTransitions();
    }
    
    // showSection 함수 오버라이드
    function overridePageNavigation() {
      // 원본 showSection 함수가 있으면 백업
      if (typeof window.originalShowSection === 'undefined' && typeof window.showSection === 'function') {
        window.originalShowSection = window.showSection;
        
        // 새 버전으로 교체
        window.showSection = function(sectionId) {
          console.log('페이지 전환 감지:', sectionId);
          window._profileState.pageTransitions++;
          
          // 프로필 섹션인 경우 특수 처리
          if (sectionId === 'profile-section') {
            window.openMyProfilePage();
            return;
          }
          
          // 다른 섹션은 원래 함수로 처리
          var result = window.originalShowSection(sectionId);
          
          // 페이지 전환 후 프로필 링크 재설정
          setTimeout(setupAllProfileLinks, 100);
          
          return result;
        };
        
        console.log('showSection 함수 오버라이드 완료');
      }
    }
    
    // 모든 프로필 링크 이벤트 설정
    function setupAllProfileLinks() {
      console.log('프로필 링크 설정 (전환 횟수: ' + window._profileState.pageTransitions + ')');
      
      // ID가 nav-profile인 모든 링크 찾기
      document.querySelectorAll('#nav-profile').forEach(function(link) {
        // 직접적인 onclick 속성 설정
        link.setAttribute('onclick', 'event.preventDefault(); return window.openMyProfilePage();');
        
        // 자바스크립트 이벤트 처리기도 설정
        link.onclick = function(e) {
          e.preventDefault();
          return window.openMyProfilePage();
        };
        
        // href 속성 변경
        link.href = 'javascript:void(0);';
        
        // 데이터 속성으로 이벤트 설정 추적
        link.setAttribute('data-profile-event-set', 'true');
        
        console.log('프로필 링크에 이벤트 설정 완료:', link);
      });
      
      // 사용자 아바타 클릭 이벤트 설정
      setupUserAvatar();
    }
    
    // 사용자 아바타 이벤트 설정
    function setupUserAvatar() {
      var avatar = document.getElementById('user-avatar');
      if (!avatar) return;
      
      // 직접 이벤트 설정
      avatar.onclick = function(e) {
        e.preventDefault();
        
        // 드롭다운 메뉴 토글
        var dropdown = document.querySelector('.user-dropdown');
        if (!dropdown) return;
        
        if (dropdown.style.display === 'block') {
          dropdown.style.display = 'none';
        } else {
          dropdown.style.display = 'block';
          
          // 드롭다운 내의 프로필 링크 이벤트 설정
          dropdown.querySelectorAll('a').forEach(function(link) {
            if (link.id === 'nav-profile' || link.textContent.trim() === '내 프로필') {
              // 직접 onclick 속성 설정
              link.setAttribute('onclick', 'event.preventDefault(); return window.openMyProfilePage();');
              
              // 자바스크립트 이벤트 처리기
              link.onclick = function(e) {
                e.preventDefault();
                return window.openMyProfilePage();
              };
              
              // href 속성 변경
              link.href = 'javascript:void(0);';
            }
          });
        }
        
        return false;
      };
    }
    
    // 자동 초기화 실행
    function performAutoInitialization() {
      console.log('프로필 매니저 자동 초기화 수행 중...');
      
      // 현재 활성 섹션 저장
      var activeSection = '';
      document.querySelectorAll('.section').forEach(function(section) {
        if (section.style.display !== 'none') {
          activeSection = section.id;
        }
      });
      
      // 숨겨서 프로필 페이지 접근
      window.openMyProfilePage(true);
      
      // 잠시 후 원래 섹션으로 복귀
      setTimeout(function() {
        if (activeSection) {
          document.querySelectorAll('.section').forEach(function(section) {
            section.style.display = section.id === activeSection ? 'block' : 'none';
          });
        }
        
        // 프로필 시스템이 초기화되었음을 기록
        window._profileState.initialized = true;
        console.log('자동 초기화 완료 및 복귀');
        
        // 프로필 링크 이벤트 재설정
        setupAllProfileLinks();
      }, 300);
    }
    
    // 페이지 전환 감지 및 이벤트 유지
    function monitorPageTransitions() {
      // 주기적으로 프로필 링크 이벤트 재설정
      setInterval(function() {
        var needsUpdate = false;
        
        // 이벤트가 설정되지 않은 프로필 링크 찾기
        document.querySelectorAll('#nav-profile').forEach(function(link) {
          if (!link.getAttribute('data-profile-event-set')) {
            needsUpdate = true;
          }
        });
        
        // 필요시 이벤트 재설정
        if (needsUpdate) {
          console.log('프로필 링크 이벤트 유실 감지, 재설정 중...');
          setupAllProfileLinks();
        }
      }, 1000);
      
      // DOM 변경 감지 (MutationObserver 사용)
      try {
        var observer = new MutationObserver(function(mutations) {
          mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' || mutation.type === 'attributes') {
              // DOM 변경 시 프로필 링크 확인
              setupAllProfileLinks();
            }
          });
        });
        
        // 관찰 시작
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['style', 'class']
        });
        
        console.log('DOM 변경 감지 모니터링 시작');
      } catch (e) {
        console.error('DOM 변경 감지 설정 실패:', e);
      }
    }
    
    // 테스트 버튼 추가
    function addTestButton() {
      if (document.getElementById('profile-test-btn')) return;
      
      var btn = document.createElement('button');
      btn.id = 'profile-test-btn';
      btn.innerHTML = '마이페이지 열기';
      btn.style.cssText = 'position: fixed; top: 80px; right: 20px; z-index: 9999; padding: 10px; background: #0070f3; color: white; border: none; border-radius: 4px; cursor: pointer;';
      
      // 직접 onclick 속성 설정
      btn.setAttribute('onclick', 'return window.openMyProfilePage();');
      
      document.body.appendChild(btn);
      console.log('테스트 버튼 추가됨');
    }
  })();