/**
 * 프로필 링크 수정 스크립트
 * 이 파일은 프로필 링크 클릭 이벤트를 완전히 재설정합니다.
 */

// 즉시 실행 함수
(function() {
    // 페이지 로드 완료 확인
    function fixProfileLink() {
      console.log('프로필 링크 수정 시작');
      
      // 프로필 링크 요소 찾기
      const profileLink = document.getElementById('nav-profile');
      if (!profileLink) {
        console.error('프로필 링크를 찾을 수 없습니다');
        return;
      }
      
      // 기존 이벤트 핸들러를 제거하기 위해 요소 복제
      const newProfileLink = profileLink.cloneNode(true);
      profileLink.parentNode.replaceChild(newProfileLink, profileLink);
      
      // 새 이벤트 핸들러 추가 - 간단하고 직접적인 방식
      newProfileLink.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('프로필 링크 클릭됨');
        
        // 모든 섹션 숨기기
        document.querySelectorAll('.section').forEach(section => {
          section.style.display = 'none';
        });
        
        // 프로필 섹션 표시
        const profileSection = document.getElementById('profile-section');
        if (profileSection) {
          profileSection.style.display = 'block';
        } else {
          console.error('프로필 섹션을 찾을 수 없습니다');
          return;
        }
        
        // 네비게이션 링크 상태 업데이트
        document.querySelectorAll('.nav-links a').forEach(link => {
          link.classList.remove('active');
        });
        newProfileLink.classList.add('active');
        
        // 프로필 데이터 로드
        try {
          // 로그인 상태 확인
          const savedUser = localStorage.getItem('c-terminal-user');
          if (!savedUser) {
            alert('프로필을 보려면 먼저 로그인하세요.');
            document.getElementById('home-section').style.display = 'block';
            return;
          }
          
          // 사용자 정보 가져오기
          const user = JSON.parse(savedUser);
          
          // 기본 프로필 정보 표시
          const elements = {
            username: document.getElementById('profile-username'),
            handle: document.getElementById('profile-handle'),
            bio: document.getElementById('profile-bio'),
            avatar: document.getElementById('profile-avatar-img'),
            location: document.getElementById('profile-location'),
            email: document.getElementById('profile-email'),
            joinDate: document.getElementById('profile-joined-date')
          };
          
          // 기본 정보 업데이트
          if (elements.username) elements.username.textContent = user.username || '사용자';
          if (elements.handle) elements.handle.textContent = `@${(user.username || 'user').toLowerCase()}`;
          if (elements.bio) elements.bio.textContent = user.bio || '자기소개가 없습니다.';
          if (elements.avatar) elements.avatar.src = user.avatar || 'img/default-avatar.svg';
          if (elements.location) elements.location.textContent = user.location || '위치 정보 없음';
          if (elements.email) elements.email.textContent = user.email || '이메일 정보 없음';
          
          // 가입일 포맷팅
          if (elements.joinDate) {
            const joinDate = user.joinDate ? new Date(user.joinDate) : new Date();
            elements.joinDate.textContent = `가입일: ${joinDate.toLocaleDateString()}`;
          }
          
          // 프로젝트 통계
          try {
            const allProjects = JSON.parse(localStorage.getItem('c-terminal-projects')) || [];
            const userProjects = allProjects.filter(p => p.ownerId === user.id);
            
            const projectsCount = document.getElementById('projects-count');
            if (projectsCount) projectsCount.textContent = userProjects.length;
            
            // 프로젝트 목록 표시
            const projectsContainer = document.getElementById('user-projects');
            if (projectsContainer) {
              projectsContainer.innerHTML = '';
              
              if (userProjects.length === 0) {
                projectsContainer.innerHTML = '<p class="empty-message">아직 프로젝트가 없습니다. 플레이그라운드에서 새 프로젝트를 만들어보세요!</p>';
              } else {
                userProjects.forEach(project => {
                  const projectCard = document.createElement('div');
                  projectCard.className = 'project-card';
                  projectCard.innerHTML = `
                    <div class="project-preview">
                      <!-- 프로젝트 미리보기 영역 -->
                    </div>
                    <div class="project-info-card">
                      <h3 class="project-title">${project.title}</h3>
                      <p class="project-description">블록 코딩 프로젝트</p>
                      <div class="project-meta">
                        <span>수정: ${new Date(project.lastModified).toLocaleDateString()}</span>
                        <span>${project.isPublic ? '공개' : '비공개'}</span>
                      </div>
                    </div>
                  `;
                  
                  projectsContainer.appendChild(projectCard);
                });
              }
            }
          } catch (error) {
            console.error('프로젝트 데이터 로드 오류:', error);
          }
          
          // 팔로워/팔로잉 통계
          const followersCount = document.getElementById('followers-count');
          const followingCount = document.getElementById('following-count');
          
          if (followersCount) followersCount.textContent = user.followers?.length || '0';
          if (followingCount) followingCount.textContent = user.following?.length || '0';
          
          console.log('프로필 데이터 로드 완료');
        } catch (error) {
          console.error('프로필 데이터 처리 중 오류:', error);
        }
      });
      
      console.log('프로필 링크 수정 완료');
    }
    
    // 페이지가 이미 로드되었는지 확인
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      fixProfileLink();
    } else {
      // 아직 로드 중이면 이벤트 리스너 추가
      window.addEventListener('load', fixProfileLink);
    }
  })();