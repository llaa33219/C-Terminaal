/**
 * direct-profile.js - 프로필 페이지 직접 제어 스크립트
 * 이 파일은 프로필 섹션이 제대로 작동하지 않는 문제를 해결합니다.
 */

// 즉시 실행 함수로 격리
(function() {
    console.log('direct-profile.js 로드됨');
    
    // 전역 함수 정의 - 프로필 로딩 직접 처리
    window.directLoadProfile = function() {
      console.log('직접 프로필 로드 실행');
      
      // 로그인 여부 확인
      const loggedIn = checkLoginStatus();
      if (!loggedIn) {
        console.log('로그인되지 않음, 프로필 로드 중단');
        alert('프로필을 보려면 먼저 로그인하세요.');
        showSection('home-section');
        return;
      }
      
      // 사용자 정보 가져오기
      const currentUser = getCurrentUser();
      if (!currentUser) {
        console.error('사용자 정보를 찾을 수 없음');
        return;
      }
      
      // 프로필 UI 업데이트
      updateProfileUI(currentUser);
      
      // 사용자 프로젝트 표시
      loadUserProjects(currentUser.id);
      
      console.log('프로필 로드 완료');
    };
    
    // 로그인 상태 확인 간소화 함수
    function checkLoginStatus() {
      if (window.authManager && typeof authManager.isLoggedIn === 'function') {
        return authManager.isLoggedIn();
      }
      
      // 대체 확인 방법
      const savedUser = localStorage.getItem('c-terminal-user');
      return !!savedUser;
    }
    
    // 현재 사용자 정보 가져오기
    function getCurrentUser() {
      if (window.authManager && typeof authManager.getCurrentUser === 'function') {
        return authManager.getCurrentUser();
      }
      
      // 대체 방법
      try {
        const savedUser = localStorage.getItem('c-terminal-user');
        return savedUser ? JSON.parse(savedUser) : null;
      } catch (e) {
        console.error('사용자 정보 파싱 오류:', e);
        return null;
      }
    }
    
    // 프로필 UI 업데이트 직접 구현
    function updateProfileUI(user) {
      // 기본 사용자 정보 표시
      const usernameEl = document.getElementById('profile-username');
      const bioEl = document.getElementById('profile-bio');
      const avatarEl = document.getElementById('profile-avatar-img');
      const handleEl = document.getElementById('profile-handle');
      
      if (usernameEl) usernameEl.textContent = user.username || '사용자';
      if (bioEl) bioEl.textContent = user.bio || '자기소개가 없습니다.';
      if (avatarEl) avatarEl.src = user.avatar || 'img/default-avatar.svg';
      if (handleEl) handleEl.textContent = `@${(user.username || 'user').toLowerCase()}`;
      
      // 추가 정보 업데이트
      const locationEl = document.getElementById('profile-location');
      const emailEl = document.getElementById('profile-email');
      const joinedDateEl = document.getElementById('profile-joined-date');
      
      if (locationEl) locationEl.textContent = user.location || '위치 정보 없음';
      if (emailEl) emailEl.textContent = user.email || '이메일 정보 없음';
      
      // 가입일 포맷팅
      if (joinedDateEl) {
        const joinDate = user.joinDate ? new Date(user.joinDate) : new Date();
        joinedDateEl.textContent = `가입일: ${joinDate.toLocaleDateString()}`;
      }
      
      // 통계 정보 업데이트
      updateStats(user);
    }
    
    // 통계 정보 업데이트
    function updateStats(user) {
      // 프로젝트 수
      const projectsCount = document.getElementById('projects-count');
      if (projectsCount) {
        const projects = getUserProjects(user.id);
        projectsCount.textContent = projects.length;
      }
      
      // 팔로워/팔로잉 수
      const followersCount = document.getElementById('followers-count');
      const followingCount = document.getElementById('following-count');
      const followersCountDetail = document.getElementById('followers-count-detail');
      const followingCountDetail = document.getElementById('following-count-detail');
      
      const followers = user.followers || [];
      const following = user.following || [];
      
      if (followersCount) followersCount.textContent = followers.length;
      if (followingCount) followingCount.textContent = following.length;
      if (followersCountDetail) followersCountDetail.textContent = followers.length;
      if (followingCountDetail) followingCountDetail.textContent = following.length;
    }
    
    // 사용자 프로젝트 가져오기
    function getUserProjects(userId) {
      try {
        const allProjects = JSON.parse(localStorage.getItem('c-terminal-projects')) || [];
        return allProjects.filter(p => p.ownerId === userId);
      } catch (e) {
        console.error('프로젝트 데이터 로드 오류:', e);
        return [];
      }
    }
    
    // 프로젝트 목록 표시
    function loadUserProjects(userId) {
      const projectsContainer = document.getElementById('user-projects');
      if (!projectsContainer) return;
      
      projectsContainer.innerHTML = '';
      
      const projects = getUserProjects(userId);
      
      if (projects.length === 0) {
        projectsContainer.innerHTML = '<p class="empty-message">아직 프로젝트가 없습니다. 플레이그라운드에서 새 프로젝트를 만들어보세요!</p>';
        return;
      }
      
      // 프로젝트 카드 생성 및 표시
      projects.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.innerHTML = `
          <div class="project-preview">
            <!-- 프로젝트 미리보기 영역 -->
          </div>
          <div class="project-info-card">
            <h3 class="project-title">${project.title}</h3>
            <p class="project-description">블록 코딩 프로젝트</p>
            <div class="project-tags">
              <span class="project-tag">${project.isPublic ? '공개' : '비공개'}</span>
            </div>
            <div class="project-meta">
              <span>수정: ${new Date(project.lastModified).toLocaleDateString()}</span>
            </div>
          </div>
        `;
        
        // 프로젝트 클릭 이벤트
        projectCard.addEventListener('click', () => {
          loadProject(project.id);
        });
        
        projectsContainer.appendChild(projectCard);
      });
    }
    
    // 프로젝트 로드 함수
    function loadProject(projectId) {
      // 프로젝트 목록에서 해당 ID의 프로젝트 찾기
      const projects = JSON.parse(localStorage.getItem('c-terminal-projects')) || [];
      const project = projects.find(p => p.id === projectId);
      
      if (!project) {
        alert('프로젝트를 찾을 수 없습니다.');
        return;
      }
      
      // 현재 프로젝트로 설정
      localStorage.setItem('c-terminal-current-project', JSON.stringify(project));
      
      // 플레이그라운드로 이동
      showSection('playground-section');
    }
    
    // 프로필 내비게이션 이벤트 재설정
    function setupProfileNavigation() {
      const profileLink = document.getElementById('nav-profile');
      if (!profileLink) {
        console.error('프로필 링크를 찾을 수 없음');
        return;
      }
      
      // 이벤트 리스너 완전히 재설정을 위해 요소 복제
      const newProfileLink = profileLink.cloneNode(true);
      profileLink.parentNode.replaceChild(newProfileLink, profileLink);
      
      // 새 이벤트 리스너 추가
      newProfileLink.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('프로필 링크 클릭 - 직접 처리 실행');
        
        // 모든 섹션 숨기기
        document.querySelectorAll('.section').forEach(section => {
          section.style.display = 'none';
        });
        
        // 프로필 섹션 표시
        const profileSection = document.getElementById('profile-section');
        if (profileSection) {
          profileSection.style.display = 'block';
        }
        
        // 네비게이션 링크 업데이트
        document.querySelectorAll('.nav-links a').forEach(link => {
          link.classList.remove('active');
        });
        newProfileLink.classList.add('active');
        
        // 직접 프로필 로드 실행
        window.directLoadProfile();
      });
      
      console.log('프로필 내비게이션 설정 완료');
    }
    
    // 페이지 로드 후 초기화
    if (document.readyState === 'complete') {
      setupProfileNavigation();
    } else {
      window.addEventListener('load', setupProfileNavigation);
    }
  })();