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

  // direct-profile.js 파일에 다음 코드를 추가해주세요 (기존 코드 유지)

// 1초마다 프로필 링크 확인 및 이벤트 연결 시도
setInterval(function() {
    const profileLink = document.getElementById('nav-profile');
    if (profileLink && !profileLink.hasAttribute('data-event-attached')) {
      console.log('프로필 링크 발견 - 이벤트 연결 중');
      
      // 이벤트 추적을 위한 속성 추가
      profileLink.setAttribute('data-event-attached', 'true');
      
      // 직접 클릭 이벤트 추가
      profileLink.onclick = function(e) {
        e.preventDefault();
        console.log('프로필 링크 클릭됨! 프로필 페이지로 이동 시도');
        
        // 모든 섹션 숨기기
        document.querySelectorAll('.section').forEach(function(section) {
          section.style.display = 'none';
        });
        
        // 프로필 섹션 표시
        const profileSection = document.getElementById('profile-section');
        if (profileSection) {
          profileSection.style.display = 'block';
          console.log('프로필 섹션이 표시됨');
        } else {
          console.error('profile-section 요소를 찾을 수 없음!');
        }
        
        // 프로필 로드 함수 호출 시도
        if (window.profileManager && typeof window.profileManager.loadProfile === 'function') {
          window.profileManager.loadProfile();
          console.log('프로필 데이터 로드 완료');
        }
        
        // 드롭다운 메뉴 닫기
        const dropdown = document.querySelector('.user-dropdown');
        if (dropdown) {
          dropdown.style.display = 'none';
        }
        
        // 추가 디버깅 정보
        console.log('현재 표시된 섹션:');
        document.querySelectorAll('.section').forEach(function(section) {
          console.log(`${section.id}: ${section.style.display}`);
        });
        
        return false;
      };
      
      console.log('프로필 링크에 이벤트가 성공적으로 연결됨');
    }
  }, 1000);

  // 테스트 버튼 이벤트 추가
window.addEventListener('load', function() {
    const testBtn = document.getElementById('test-profile-btn');
    if (testBtn) {
      testBtn.addEventListener('click', function() {
        console.log('테스트 버튼 클릭됨');
        
        // profile-section 확인
        const profileSection = document.getElementById('profile-section');
        console.log('프로필 섹션 존재 여부:', !!profileSection);
        
        if (profileSection) {
          // 모든 섹션 숨기기
          document.querySelectorAll('.section').forEach(function(section) {
            section.style.display = 'none';
          });
          
          // 프로필 섹션 강제 표시
          profileSection.style.display = 'block';
          profileSection.style.opacity = '1';
          profileSection.style.visibility = 'visible';
          
          console.log('프로필 섹션 표시됨');
          
          // 마이페이지 탐색 메뉴 활성화
          document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.remove('active');
          });
          
          const profileNav = document.getElementById('nav-profile');
          if (profileNav) profileNav.classList.add('active');
        } else {
          console.error('profile-section이 존재하지 않습니다! HTML을 확인하세요.');
        }
      });
    }
  });

  // 페이지 로드 시 섹션 디버깅
window.addEventListener('load', function() {
    console.log('=== 섹션 디버깅 정보 ===');
    const sections = document.querySelectorAll('.section');
    console.log(`총 ${sections.length}개 섹션 발견`);
    
    sections.forEach(function(section) {
      console.log(`섹션 ID: ${section.id}, 표시 상태: ${section.style.display}`);
    });
    
    const profileSection = document.getElementById('profile-section');
    if (profileSection) {
      console.log('프로필 섹션 정보:');
      console.log('- ID:', profileSection.id);
      console.log('- 클래스:', profileSection.className);
      console.log('- 표시 상태:', profileSection.style.display);
      console.log('- HTML 구조:', profileSection.innerHTML.substring(0, 100) + '...');
    } else {
      console.error('profile-section을 찾을 수 없습니다!');
    }
  });