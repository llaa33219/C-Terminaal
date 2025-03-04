// direct-profile.js 파일에 다음 코드를 추가하거나 교체하세요

// DOMContentLoaded와 load 이벤트 모두에 핸들러 추가
['DOMContentLoaded', 'load'].forEach(function(eventType) {
    window.addEventListener(eventType, function() {
      console.log(`${eventType} 이벤트 발생 - 프로필 링크 처리 시작`);
      
      // 네비게이션바에서 프로필 링크 강제 처리
      setupNavProfileLink();
      
      // 드롭다운 메뉴 내의 프로필 링크 강제 처리
      setupDropdownProfileLink();
    });
  });
  
  // 네비게이션바 프로필 링크 설정
  function setupNavProfileLink() {
    const navProfileLink = document.getElementById('nav-profile');
    if (!navProfileLink) {
      console.error('nav-profile 요소를 찾을 수 없습니다');
      return;
    }
    
    console.log('네비게이션 프로필 링크 발견, 이벤트 강제 설정');
    
    // 기존 모든 이벤트 제거를 위해 요소 복제
    const newLink = navProfileLink.cloneNode(true);
    if (navProfileLink.parentNode) {
      navProfileLink.parentNode.replaceChild(newLink, navProfileLink);
      
      // 새 이벤트 연결
      newLink.addEventListener('click', handleProfileLinkClick);
      newLink.onclick = handleProfileLinkClick; // 두 가지 방식으로 이벤트 연결
      
      console.log('네비게이션 프로필 링크에 새 이벤트 연결됨');
    }
  }
  
  // 드롭다운 메뉴 내부 프로필 링크 설정
  function setupDropdownProfileLink() {
    // 드롭다운 메뉴 찾기
    const dropdown = document.querySelector('.user-dropdown');
    if (!dropdown) {
      console.error('user-dropdown 요소를 찾을 수 없습니다');
      return;
    }
    
    // 드롭다운 내의 모든 링크 처리
    const links = dropdown.querySelectorAll('a');
    
    links.forEach(function(link) {
      // 내 프로필 링크 찾기 (텍스트 내용이나 ID로)
      if (link.id === 'nav-profile' || link.textContent.trim() === '내 프로필') {
        console.log('드롭다운 메뉴에서 프로필 링크 발견, 이벤트 강제 설정');
        
        // 기존 이벤트 제거를 위해 복제
        const newLink = link.cloneNode(true);
        link.parentNode.replaceChild(newLink, link);
        
        // 새 이벤트 연결
        newLink.addEventListener('click', handleProfileLinkClick);
        newLink.onclick = handleProfileLinkClick;
        
        console.log('드롭다운 프로필 링크에 새 이벤트 연결됨');
      }
    });
  }
  
  // 프로필 링크 클릭 처리 함수
  function handleProfileLinkClick(e) {
    e.preventDefault();
    console.log('프로필 링크 클릭됨!');
    
    // 모든 섹션 숨기기
    document.querySelectorAll('.section').forEach(function(section) {
      section.style.display = 'none';
    });
    
    // 프로필 섹션 표시
    const profileSection = document.getElementById('profile-section');
    if (profileSection) {
      profileSection.style.display = 'block';
      console.log('프로필 섹션이 표시됨');
      
      // 프로필 데이터 로드 시도
      try {
        if (window.profileManager && typeof window.profileManager.loadProfile === 'function') {
          window.profileManager.loadProfile();
          console.log('프로필 데이터 로드됨');
        } else {
          console.warn('profileManager가 정의되지 않았거나 loadProfile 함수가 없습니다');
        }
      } catch (error) {
        console.error('프로필 로드 중 오류:', error);
      }
    } else {
      console.error('profile-section 요소를 찾을 수 없습니다!');
    }
    
    // 드롭다운 메뉴 닫기
    const dropdown = document.querySelector('.user-dropdown');
    if (dropdown) {
      dropdown.style.display = 'none';
    }
    
    return false;
  }
  
  // 1초마다 프로필 링크 상태 확인 및 이벤트 재설정
  setInterval(function() {
    // nav-profile 요소가 있고 클릭 이벤트가 없는 경우 다시 설정
    const navProfileLink = document.getElementById('nav-profile');
    if (navProfileLink && !navProfileLink.getAttribute('data-event-attached')) {
      console.log('주기적 검사: nav-profile 요소 발견, 이벤트 재설정');
      navProfileLink.setAttribute('data-event-attached', 'true');
      navProfileLink.addEventListener('click', handleProfileLinkClick);
      navProfileLink.onclick = handleProfileLinkClick;
    }
  }, 2000);