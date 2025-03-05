// 완전히 새로운 접근 방식 - 페이지 로드 시 자동 초기화 
(function() {
    // 페이지 로드 완료 시 실행
    window.addEventListener('load', function() {
      console.log('페이지 로드 완료 - 프로필 핸들러 초기화');
      
      // 1. profileManager 상태 확인 및 강제 초기화
      if (window.profileManager) {
        console.log('profileManager 발견, 강제 초기화 시도');
        
        if (typeof window.profileManager.init === 'function') {
          try {
            // 초기화 호출
            window.profileManager.init();
            console.log('profileManager 초기화 성공');
          } catch (e) {
            console.error('profileManager 초기화 오류:', e);
          }
        }
      } else {
        console.error('profileManager 객체가 존재하지 않음!');
      }
  
      // 2. 전역 프로필 열기 함수 정의
      window.openMyProfile = function(preventLogging) {
        if (!preventLogging) console.log('프로필 열기 함수 호출됨');
        
        // 모든 섹션 숨기기
        document.querySelectorAll('.section').forEach(function(section) {
          section.style.display = 'none';
        });
        
        // 프로필 섹션 표시
        var profileSection = document.getElementById('profile-section');
        if (profileSection) {
          profileSection.style.display = 'block';
          
          // 네비게이션 링크 활성화 상태 업데이트
          document.querySelectorAll('.nav-links a').forEach(function(link) {
            link.classList.remove('active');
          });
          
          // 프로필 매니저 로드 함수 호출
          try {
            if (window.profileManager && typeof window.profileManager.loadProfile === 'function') {
              window.profileManager.loadProfile();
              if (!preventLogging) console.log('프로필 데이터 로드됨');
            }
          } catch (err) {
            console.error('프로필 로드 실패:', err);
          }
        }
        
        // 드롭다운 메뉴 닫기
        var dropdown = document.querySelector('.user-dropdown');
        if (dropdown) dropdown.style.display = 'none';
        
        return false;
      };
      
      // 3. 강제 초기화 - 마이페이지에 자동으로 한번 접근했다가 홈으로 복귀
      setTimeout(function() {
        console.log('프로필 매니저 강제 초기화 시도 - 마이페이지 자동 접근');
        
        // 현재 활성화된 섹션 저장
        var activeSection = null;
        document.querySelectorAll('.section').forEach(function(section) {
          if (section.style.display !== 'none') {
            activeSection = section.id;
          }
        });
        
        // 프로필 페이지 자동 열기 (로그 없이)
        window.openMyProfile(true);
        
        // 0.5초 후에 원래 섹션으로 복귀
        setTimeout(function() {
          if (activeSection) {
            console.log('원래 섹션으로 복귀:', activeSection);
            document.querySelectorAll('.section').forEach(function(section) {
              section.style.display = section.id === activeSection ? 'block' : 'none';
            });
          }
          
          // 이제 프로필 링크에 이벤트 직접 연결
          setupAllProfileLinks();
          
          console.log('강제 초기화 및 복귀 완료');
        }, 300);
      }, 1000);
      
      // 4. 테스트 버튼 추가
      addProfileButton();
    });
    
    // 모든 프로필 링크에 이벤트 설정
    function setupAllProfileLinks() {
      console.log('모든 프로필 링크 이벤트 설정 시작');
      
      // 모든 #nav-profile ID를 가진 링크 찾기
      document.querySelectorAll('#nav-profile').forEach(function(link) {
        console.log('프로필 링크 발견:', link);
        
        // HTML 속성으로 직접 설정
        link.setAttribute('onclick', 'return openMyProfile();');
        link.setAttribute('href', 'javascript:void(0);');
        
        // JavaScript 이벤트도 설정
        link.onclick = function(e) {
          e.preventDefault();
          return openMyProfile();
        };
      });
      
      // 아바타에도 이벤트 설정
      var avatar = document.getElementById('user-avatar');
      if (avatar) {
        avatar.onclick = function() {
          var dropdown = document.querySelector('.user-dropdown');
          if (!dropdown) return;
          
          // 토글
          dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
          
          // 드롭다운이 표시되면 그 안의 프로필 링크에도 이벤트 설정
          if (dropdown.style.display === 'block') {
            dropdown.querySelectorAll('a').forEach(function(link) {
              if (link.id === 'nav-profile' || link.textContent.trim() === '내 프로필') {
                link.setAttribute('onclick', 'return openMyProfile();');
                link.setAttribute('href', 'javascript:void(0);');
                
                link.onclick = function(e) {
                  e.preventDefault();
                  return openMyProfile();
                };
              }
            });
          }
        };
      }
      
      console.log('모든 프로필 링크 이벤트 설정 완료');
    }
    
    // 테스트 버튼 추가
    function addProfileButton() {
      if (document.getElementById('direct-profile-btn')) return;
      
      var btn = document.createElement('button');
      btn.id = 'direct-profile-btn';
      btn.innerHTML = '마이페이지 열기';
      btn.style.cssText = 'position: fixed; top: 80px; right: 20px; z-index: 9999; padding: 10px; background: #0070f3; color: white; border: none; border-radius: 4px; cursor: pointer;';
      
      btn.onclick = function() {
        openMyProfile();
      };
      
      document.body.appendChild(btn);
    }
    
    // 주기적으로 프로필 링크 이벤트 유지
    setInterval(function() {
      document.querySelectorAll('#nav-profile').forEach(function(link) {
        if (!link.hasAttribute('onclick') || link.getAttribute('onclick').indexOf('openMyProfile') === -1) {
          link.setAttribute('onclick', 'return openMyProfile();');
          link.setAttribute('href', 'javascript:void(0);');
          
          link.onclick = function(e) {
            e.preventDefault();
            return openMyProfile();
          };
        }
      });
    }, 2000);
  })();