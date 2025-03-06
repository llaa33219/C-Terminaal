/**
 * 프로필 기능 수정 패치
 * 이 코드를 'direct-profile.js' 파일로 저장하고 index.html에 추가하세요.
 */

// IIFE로 실행하여 변수 범위 격리
(function() {
    console.log('[패치] 프로필 기능 패치 로드됨');
    
    // 두 함수 간의 충돌 식별
    if (window.loadUserProfile && window.profileManager && window.profileManager.loadProfile) {
      console.log('[패치] 함수 충돌 감지: loadUserProfile과 profileManager.loadProfile');
      
      // app.js의 loadUserProfile 함수 백업
      window._originalLoadUserProfile = window.loadUserProfile;
      
      // loadUserProfile 함수 재정의 - profileManager.loadProfile을 호출하도록 변경
      window.loadUserProfile = function() {
        console.log('[패치] 통합된 loadUserProfile 실행');
        
        // 로그인 상태 확인
        if (!window.authManager || !window.authManager.isLoggedIn()) {
          window.showSection('home-section');
          alert('프로필을 보려면 먼저 로그인하세요.');
          return;
        }
        
        try {
          // 프로필 매니저 초기화
          if (typeof window.profileManager.init === 'function') {
            window.profileManager.init();
            console.log('[패치] profileManager 초기화 완료');
          }
          
          // profileManager를 통해 프로필 로드
          if (typeof window.profileManager.loadProfile === 'function') {
            window.profileManager.loadProfile();
            console.log('[패치] profileManager.loadProfile 호출 성공');
          } else {
            console.error('[패치] profileManager.loadProfile 함수를 찾을 수 없음');
            
            // 대체 방법으로 원래 함수 호출
            window._originalLoadUserProfile();
          }
        } catch (error) {
          console.error('[패치] 프로필 로드 오류:', error);
          
          // 오류 발생 시 원래 함수로 폴백
          try {
            window._originalLoadUserProfile();
          } catch (fallbackError) {
            console.error('[패치] 폴백 실패:', fallbackError);
          }
        }
      };
      
      console.log('[패치] loadUserProfile 함수 재정의 완료');
    }
    
    // DOMContentLoaded 이벤트를 감지했는지 확인
    if (document.readyState === 'loading') {
      // 아직 로드 중이면 이벤트 리스너 추가
      document.addEventListener('DOMContentLoaded', fixProfileNavigation);
    } else {
      // 이미 로드되었으면 바로 실행
      fixProfileNavigation();
    }
    
    // 네비게이션 이벤트 충돌 해결
    function fixProfileNavigation() {
      // nav-profile 요소 가져오기
      const profileNavLink = document.getElementById('nav-profile');
      if (!profileNavLink) {
        console.error('[패치] nav-profile 요소를 찾을 수 없음');
        return;
      }
      
      console.log('[패치] 프로필 네비게이션 이벤트 리스너 수정');
      
      // 모든 이벤트 리스너 제거를 위해 요소 복제
      const newProfileLink = profileNavLink.cloneNode(true);
      profileNavLink.parentNode.replaceChild(newProfileLink, profileNavLink);
      
      // 새 단일 이벤트 리스너 등록
      newProfileLink.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('[패치] 프로필 링크 클릭 - 통합 핸들러 실행');
        
        // 프로필 섹션으로 전환
        window.showSection('profile-section');
        
        // 통합된 loadUserProfile 함수 호출
        window.loadUserProfile();
      });
      
      console.log('[패치] 프로필 네비게이션 이벤트 수정 완료');
    }
  })();