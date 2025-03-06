// 마이페이지(GitHub 스타일) 관련 JavaScript 함수

// 프로필 관리자 - 기존 authManager와 연동
const profileManager = {
    // 고정된 프로젝트 목록
    pinnedProjects: [],
    
    // 활동 내역 (샘플 데이터)
    activityData: [],
    
    // 초기화
    init: function() {
      // 로컬 스토리지에서 고정된 프로젝트 불러오기
      this.loadPinnedProjects();
      
      // 샘플 활동 데이터 생성
      this.generateSampleActivityData();
      
      // 이벤트 리스너 등록
      this.bindEvents();
    },
    
    // 이벤트 리스너 등록
    bindEvents: function() {
      // 프로필 탭 전환 이벤트
      document.querySelectorAll('.profile-tabs .tab-btn').forEach(tab => {
        tab.addEventListener('click', this.handleTabChange.bind(this));
      });
      
      // 프로필 편집 버튼
      const editProfileBtn = document.getElementById('edit-profile-btn');
      if (editProfileBtn) {
        editProfileBtn.addEventListener('click', this.openProfileEditModal.bind(this));
      }
      
      // 프로필 저장 버튼
      const saveProfileBtn = document.getElementById('save-profile-btn');
      if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', this.saveProfileChanges.bind(this));
      }
      
      // 아바타 편집 버튼
      const editAvatarBtn = document.getElementById('edit-avatar-btn');
      if (editAvatarBtn) {
        editAvatarBtn.addEventListener('click', () => {
          document.getElementById('avatar-upload').click();
        });
      }
      
      // 아바타 업로드 변경 이벤트
      const avatarUpload = document.getElementById('avatar-upload');
      if (avatarUpload) {
        avatarUpload.addEventListener('change', this.handleAvatarUpload.bind(this));
      }
      
      // 핀 고정 수정 버튼
      const customizePinsBtn = document.getElementById('customize-pins-btn');
      if (customizePinsBtn) {
        customizePinsBtn.addEventListener('click', this.openPinsModal.bind(this));
      }
      
      // 핀 추가 버튼 (빈 상태일 때)
      const addPinsBtn = document.getElementById('add-pins-btn');
      if (addPinsBtn) {
        addPinsBtn.addEventListener('click', this.openPinsModal.bind(this));
      }
      
      // 핀 설정 저장 버튼
      const savePinsBtn = document.getElementById('save-pins-btn');
      if (savePinsBtn) {
        savePinsBtn.addEventListener('click', this.savePinnedProjects.bind(this));
      }
      
      // 새 프로젝트 버튼
      const newProjectBtn = document.getElementById('new-project-btn');
      if (newProjectBtn) {
        newProjectBtn.addEventListener('click', () => {
          // 새 프로젝트 생성 (플레이그라운드로 이동)
          currentProject = {
            id: null,
            title: '제목 없는 프로젝트',
            blocks: null,
            isPublic: true,
            lastModified: new Date()
          };
          localStorage.setItem(STORAGE_KEYS.PROJECT, JSON.stringify(currentProject));
          showSection('playground-section');
          
          // Blockly 워크스페이스 초기화
          if (window.workspace) {
            workspace.clear();
          }
        });
      }
      
      // 프로젝트 검색 및 필터링
      const projectSearch = document.getElementById('project-search');
      if (projectSearch) {
        projectSearch.addEventListener('input', this.filterProjects.bind(this));
      }
      
      const projectTypeFilter = document.getElementById('project-type-filter');
      if (projectTypeFilter) {
        projectTypeFilter.addEventListener('change', this.filterProjects.bind(this));
      }
      
      const projectSort = document.getElementById('project-sort');
      if (projectSort) {
        projectSort.addEventListener('change', this.filterProjects.bind(this));
      }
    },
    
    // 프로필 페이지 로드
    loadProfile: function() {
      // 로그인 상태 확인
      if (!authManager.isLoggedIn()) {
        showSection('home-section');
        alert('프로필을 보려면 먼저 로그인하세요.');
        return;
      }
      
      const currentUser = authManager.getCurrentUser();
      
      // 사용자 정보 표시
      this.updateProfileUI(currentUser);
      
      // 기여도 그래프 생성
      this.generateContributionGraph();
      
      // 고정된 프로젝트 표시
      this.displayPinnedProjects();
      
      // 사용자 프로젝트 목록 표시
      this.loadUserProjects();
      
      // 활동 타임라인 표시
      this.displayActivityTimeline();
      
      // 팔로워/팔로잉 정보 표시
      this.displayFollowLists();
    },
    
    // 프로필 UI 업데이트
    updateProfileUI: function(user) {
      // 기본 정보 업데이트
      document.getElementById('profile-username').textContent = user.username;
      document.getElementById('profile-handle').textContent = `@${user.username.toLowerCase()}`;
      document.getElementById('profile-bio').textContent = user.bio || '자기소개가 없습니다.';
      document.getElementById('profile-avatar-img').src = user.avatar || 'img/default-avatar.svg';
      
      // 추가 정보 업데이트
      document.getElementById('profile-location').textContent = user.location || '위치 정보 없음';
      document.getElementById('profile-email').textContent = user.email || '이메일 정보 없음';
      
      // 가입일 포맷팅
      const joinDate = user.joinDate ? new Date(user.joinDate) : new Date();
      const joinDateFormatted = joinDate.toLocaleDateString('ko-KR', { 
        year: 'numeric', month: 'long', day: 'numeric' 
      });
      document.getElementById('profile-joined-date').textContent = `가입일: ${joinDateFormatted}`;
      
      // 통계 정보 업데이트
      this.updateStatistics(user);
    },
    
    // 통계 정보 업데이트
    updateStatistics: function(user) {
      // 프로젝트 수 업데이트
      const projectResult = projectManager.getUserProjects();
      const projectCount = projectResult.success ? projectResult.projects.length : 0;
      
      document.getElementById('projects-count').textContent = projectCount;
      
      // 팔로워/팔로잉 수 업데이트
      const followerCount = user.followers?.length || 0;
      const followingCount = user.following?.length || 0;
      
      document.getElementById('followers-count').textContent = followerCount;
      document.getElementById('following-count').textContent = followingCount;
      document.getElementById('followers-count-detail').textContent = followerCount;
      document.getElementById('following-count-detail').textContent = followingCount;
      
      // 좋아요 수 계산 (자신의 게시물이 받은 좋아요)
      let likeCount = 0;
      
      try {
        const allPosts = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMMUNITY_POSTS) || '[]');
        const userPosts = allPosts.filter(post => post.author.id === user.id);
        
        likeCount = userPosts.reduce((sum, post) => sum + (post.likes || 0), 0);
      } catch (error) {
        console.error('좋아요 수 계산 오류:', error);
      }
      
      document.getElementById('likes-count').textContent = likeCount;
    },
    
    // 기여도 그래프 생성
    generateContributionGraph: function() {
      const calendarContainer = document.getElementById('contribution-calendar');
      if (!calendarContainer) return;
      
      calendarContainer.innerHTML = '';
      
      // 현재 날짜에서 1년 전까지의 날짜 생성
      const today = new Date();
      const oneYearAgo = new Date(today);
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      
      // 각 날짜별 활동량 생성 (실제로는 사용자 활동 데이터 기반으로 생성해야 함)
      // 여기서는 랜덤 샘플 데이터 생성
      const activityMap = new Map();
      let currentDate = new Date(oneYearAgo);
      
      while (currentDate <= today) {
        // 오늘 날짜는 최대 활동량으로 설정
        if (currentDate.toDateString() === today.toDateString()) {
          activityMap.set(currentDate.toDateString(), 4);
        } else {
          // 가짜 활동 데이터 생성 (0-4)
          const activity = Math.floor(Math.random() * 5);
          activityMap.set(currentDate.toDateString(), activity);
        }
        
        // 다음 날짜로 이동
        currentDate = new Date(currentDate);
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // 기여도 그래프 생성
      currentDate = new Date(oneYearAgo);
      
      while (currentDate <= today) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        // 활동량에 따른 색상 설정
        const activity = activityMap.get(currentDate.toDateString()) || 0;
        dayElement.style.backgroundColor = `var(--contribution-color-${activity})`;
        
        // 툴팁 설정
        const dateString = currentDate.toLocaleDateString('ko-KR', {
          year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
        });
        dayElement.title = `${dateString}: ${activity ? activity + '개의 활동' : '활동 없음'}`;
        
        // 그래프에 추가
        calendarContainer.appendChild(dayElement);
        
        // 다음 날짜로 이동
        currentDate = new Date(currentDate);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    },
    
    // 고정된 프로젝트 불러오기
    loadPinnedProjects: function() {
      try {
        // 로그인 상태 확인
        if (!authManager.isLoggedIn()) return;
        
        const currentUser = authManager.getCurrentUser();
        
        // 로컬 스토리지에서 고정된 프로젝트 목록 불러오기
        const pinnedData = localStorage.getItem(`c-terminal-pinned-projects-${currentUser.id}`);
        
        if (pinnedData) {
          this.pinnedProjects = JSON.parse(pinnedData);
        } else {
          // 기본값 = 빈 배열
          this.pinnedProjects = [];
        }
      } catch (error) {
        console.error('고정된 프로젝트 로드 오류:', error);
        this.pinnedProjects = [];
      }
    },
    
    // 고정된 프로젝트 저장
    savePinnedProjects: function() {
      try {
        // 로그인 상태 확인
        if (!authManager.isLoggedIn()) {
          alert('로그인이 필요합니다.');
          return;
        }
        
        const currentUser = authManager.getCurrentUser();
        
        // 선택된 프로젝트 수집
        const selectedProjectIds = [];
        const checkboxes = document.querySelectorAll('.pin-checkbox:checked');
        
        checkboxes.forEach(checkbox => {
          selectedProjectIds.push(checkbox.value);
        });
        
        // 최대 6개로 제한
        if (selectedProjectIds.length > 6) {
          selectedProjectIds.length = 6;
          alert('최대 6개까지 고정할 수 있습니다. 처음 6개만 저장됩니다.');
        }
        
        // 저장
        this.pinnedProjects = selectedProjectIds;
        localStorage.setItem(`c-terminal-pinned-projects-${currentUser.id}`, JSON.stringify(selectedProjectIds));
        
        // UI 업데이트
        this.displayPinnedProjects();
        
        // 모달 닫기
        closeCurrentModal();
        
      } catch (error) {
        console.error('고정 프로젝트 저장 오류:', error);
        alert('프로젝트 저장 중 오류가 발생했습니다.');
      }
    },
    
    // 고정된 프로젝트 표시
    displayPinnedProjects: function() {
      const container = document.getElementById('pinned-projects');
      if (!container) return;
      
      // 컨테이너 초기화
      container.innerHTML = '';
      
      // 고정된 프로젝트가 없는 경우 빈 메시지 표시
      if (!this.pinnedProjects || this.pinnedProjects.length === 0) {
        container.innerHTML = `
          <div class="empty-pins-message">
            <i class="fas fa-thumbtack"></i>
            <p>아직 핀 고정된 프로젝트가 없습니다.</p>
            <button id="add-pins-btn" class="btn btn-outline">프로젝트 고정하기</button>
          </div>
        `;
        
        // 버튼에 이벤트 리스너 추가
        const addPinsBtn = document.getElementById('add-pins-btn');
        if (addPinsBtn) {
          addPinsBtn.addEventListener('click', this.openPinsModal.bind(this));
        }
        
        return;
      }
      
      // 프로젝트 정보 가져오기
      const projectResult = projectManager.getUserProjects();
      if (!projectResult.success) {
        console.error('프로젝트 목록 로드 실패');
        return;
      }
      
      const allProjects = projectResult.projects;
      
      // 고정된 프로젝트 표시
      this.pinnedProjects.forEach(projectId => {
        const project = allProjects.find(p => p.id === projectId);
        if (!project) return;
        
        const projectElement = document.createElement('div');
        projectElement.className = 'pinned-project-card';
        projectElement.dataset.projectId = project.id;
        
        projectElement.innerHTML = `
          <div class="pinned-project-header">
            <div>
              <div class="pinned-project-title">${securityUtils.escapeHTML(project.title)}</div>
            </div>
            <div class="pinned-project-visibility">${project.isPublic ? '공개' : '비공개'}</div>
          </div>
          <div class="pinned-project-desc">블록 코딩 프로젝트</div>
          <div class="pinned-project-footer">
            <span><i class="far fa-calendar-alt"></i> ${new Date(project.lastModified).toLocaleDateString()}</span>
          </div>
        `;
        
        // 클릭 이벤트 - 프로젝트 열기
        projectElement.addEventListener('click', () => {
          projectManager.loadProject(project.id);
          showSection('playground-section');
        });
        
        container.appendChild(projectElement);
      });
    },
    
    // 핀 고정 모달 열기
    openPinsModal: function() {
      // 먼저 사용자 프로젝트 목록 가져오기
      const projectResult = projectManager.getUserProjects();
      if (!projectResult.success) {
        alert('프로젝트 목록을 불러오는 중 오류가 발생했습니다.');
        return;
      }
      
      const projects = projectResult.projects;
      
      // 프로젝트가 없는 경우
      if (projects.length === 0) {
        alert('고정할 프로젝트가 없습니다. 먼저 프로젝트를 만들어보세요.');
        return;
      }
      
      // 핀 프로젝트 목록 생성
      const listContainer = document.getElementById('pin-projects-list');
      if (!listContainer) return;
      
      listContainer.innerHTML = '';
      
      projects.forEach(project => {
        const isPinned = this.pinnedProjects.includes(project.id);
        
        const projectElement = document.createElement('div');
        projectElement.className = 'pin-project-item';
        
        projectElement.innerHTML = `
          <input type="checkbox" class="pin-checkbox" value="${project.id}" ${isPinned ? 'checked' : ''}>
          <div class="pin-project-info">
            <div class="pin-project-title">${securityUtils.escapeHTML(project.title)}</div>
            <div class="pin-project-desc">마지막 수정: ${new Date(project.lastModified).toLocaleDateString()}</div>
          </div>
        `;
        
        listContainer.appendChild(projectElement);
      });
      
      // 모달 열기
      openModal('customize-pins-modal');
    },
    
    // 프로필 편집 모달 열기
    openProfileEditModal: function() {
      const currentUser = authManager.getCurrentUser();
      if (!currentUser) return;
      
      // 현재 프로필 정보로 모달 필드 채우기
      document.getElementById('edit-username').value = currentUser.username || '';
      document.getElementById('edit-bio').value = currentUser.bio || '';
      document.getElementById('edit-location').value = currentUser.location || '';
      document.getElementById('edit-website').value = currentUser.website || '';
      document.getElementById('avatar-preview').src = currentUser.avatar || 'img/default-avatar.svg';
      
      // 모달 열기
      openModal('edit-profile-modal');
    },
    
    // 프로필 변경사항 저장
    saveProfileChanges: function() {
      // 입력값 가져오기
      const username = document.getElementById('edit-username').value;
      const bio = document.getElementById('edit-bio').value;
      const location = document.getElementById('edit-location').value;
      const website = document.getElementById('edit-website').value;
      
      // 기본 유효성 검사
      if (!username) {
        alert('사용자 이름은 필수입니다.');
        return;
      }
      
      // 사용자 정보 업데이트
      const updatedUser = {
        username: username,
        bio: bio,
        location: location,
        website: website
      };
      
      const result = authManager.updateProfile(updatedUser);
      
      if (result.success) {
        // 모달 닫기
        closeCurrentModal();
        
        // 프로필 페이지 새로고침
        this.loadProfile();
        
        alert('프로필이 업데이트되었습니다.');
      } else {
        alert(result.message || '프로필 업데이트 중 오류가 발생했습니다.');
      }
    },
    
    // 아바타 업로드 처리
    handleAvatarUpload: function(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      // 파일 유형 검사
      if (!file.type.match('image.*')) {
        alert('이미지 파일만 업로드할 수 있습니다.');
        return;
      }
      
      // 파일 크기 검사 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기는 5MB 이하여야 합니다.');
        return;
      }
      
      // FileReader를 사용하여 이미지 미리보기
      const reader = new FileReader();
      reader.onload = (e) => {
        // 이미지 미리보기 업데이트
        document.getElementById('avatar-preview').src = e.target.result;
        
        // 실제 구현에서는 여기에 서버 업로드 로직 추가
        
        // 사용자 아바타 URL 업데이트 (데모용으로 Data URL 사용)
        const updatedUser = {
          avatar: e.target.result
        };
        
        // 프로필 업데이트
        const result = authManager.updateProfile(updatedUser);
        
        if (result.success) {
          // 프로필 이미지 업데이트
          document.getElementById('profile-avatar-img').src = e.target.result;
          document.getElementById('user-avatar').src = e.target.result;
        }
      };
      
      reader.readAsDataURL(file);
    },
    
    // 사용자 프로젝트 로드
    loadUserProjects: function() {
      // 프로젝트 목록 가져오기
      const result = projectManager.getUserProjects();
      
      const projectsContainer = document.getElementById('user-projects');
      if (!projectsContainer) return;
      
      projectsContainer.innerHTML = '';
      
      if (!result.success || !result.projects || result.projects.length === 0) {
        projectsContainer.innerHTML = '<p class="empty-message">아직 프로젝트가 없습니다. 플레이그라운드에서 새 프로젝트를 만들어보세요!</p>';
        return;
      }
      
      // 정렬 방식 가져오기
      const sortSelect = document.getElementById('project-sort');
      const sortBy = sortSelect ? sortSelect.value : 'updated';
      
      // 프로젝트 정렬
      let projects = [...result.projects];
      
      switch (sortBy) {
        case 'updated':
          projects.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
          break;
        case 'created':
          // 생성일이 없으면 lastModified를 사용
          projects.sort((a, b) => new Date(b.createdAt || b.lastModified) - new Date(a.createdAt || a.lastModified));
          break;
        case 'name':
          projects.sort((a, b) => a.title.localeCompare(b.title));
          break;
      }
      
      // 프로젝트 카드 생성
      projects.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.innerHTML = `
          <div class="project-preview">
            <!-- 실제 구현에서는 프로젝트 미리보기 이미지 추가 -->
            <div class="project-preview-overlay">
              <button class="project-action-btn" title="프로젝트 핀 고정" data-action="pin" data-project-id="${project.id}">
                <i class="fas fa-thumbtack"></i>
              </button>
              <button class="project-action-btn" title="프로젝트 설정" data-action="settings" data-project-id="${project.id}">
                <i class="fas fa-cog"></i>
              </button>
            </div>
          </div>
          <div class="project-info-card">
            <h3 class="project-title">${securityUtils.escapeHTML(project.title)}</h3>
            <p class="project-description">블록 코딩 프로젝트</p>
            <div class="project-tags">
              <span class="project-tag">${project.isPublic ? '공개' : '비공개'}</span>
            </div>
            <div class="project-meta">
              <span>수정: ${new Date(project.lastModified).toLocaleDateString()}</span>
            </div>
          </div>
        `;
        
        // 프로젝트 카드 클릭 이벤트
        projectCard.addEventListener('click', (e) => {
          // 액션 버튼 클릭을 제외하고 프로젝트 열기
          const actionBtn = e.target.closest('.project-action-btn');
          if (actionBtn) {
            e.stopPropagation();
            
            const action = actionBtn.dataset.action;
            const projectId = actionBtn.dataset.projectId;
            
            if (action === 'pin') {
              this.toggleProjectPin(projectId);
            } else if (action === 'settings') {
              this.openProjectSettings(projectId);
            }
            
            return;
          }
          
          // 프로젝트 열기
          projectManager.loadProject(project.id);
          showSection('playground-section');
        });
        
        projectsContainer.appendChild(projectCard);
      });
    },
    
    // 프로젝트 핀 고정/해제
    toggleProjectPin: function(projectId) {
      // 이미 고정된 프로젝트인지 확인
      const pinnedIndex = this.pinnedProjects.indexOf(projectId);
      
      if (pinnedIndex === -1) {
        // 최대 6개 제한
        if (this.pinnedProjects.length >= 6) {
          alert('최대 6개까지 고정할 수 있습니다. 다른 프로젝트를 해제해주세요.');
          return;
        }
        
        // 고정 추가
        this.pinnedProjects.push(projectId);
        alert('프로젝트가 프로필에 고정되었습니다.');
      } else {
        // 고정 해제
        this.pinnedProjects.splice(pinnedIndex, 1);
        alert('프로젝트 고정이 해제되었습니다.');
      }
      
      // 저장
      const currentUser = authManager.getCurrentUser();
      localStorage.setItem(`c-terminal-pinned-projects-${currentUser.id}`, JSON.stringify(this.pinnedProjects));
      
      // UI 업데이트
      this.displayPinnedProjects();
    },
    
    // 프로젝트 설정 열기
    openProjectSettings: function(projectId) {
      // 간단한 알림으로 대체 (실제 구현에서는 설정 모달 필요)
      alert('프로젝트 설정 기능은 아직 구현되지 않았습니다.');
    },
    
    // 프로젝트 필터링
    filterProjects: function() {
      // 프로젝트 목록 가져오기
      const result = projectManager.getUserProjects();
      
      if (!result.success || !result.projects) {
        return;
      }
      
      // 검색어 및 필터 값 가져오기
      const searchInput = document.getElementById('project-search');
      const typeFilter = document.getElementById('project-type-filter');
      const sortSelect = document.getElementById('project-sort');
      
      const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
      const typeValue = typeFilter ? typeFilter.value : 'all';
      const sortBy = sortSelect ? sortSelect.value : 'updated';
      
      // 필터링 및 정렬
      let filteredProjects = [...result.projects];
      
      // 검색어 필터링
      if (searchTerm) {
        filteredProjects = filteredProjects.filter(project => 
          project.title.toLowerCase().includes(searchTerm)
        );
      }
      
      // 유형 필터링
      if (typeValue !== 'all') {
        const isPublic = typeValue === 'public';
        filteredProjects = filteredProjects.filter(project => project.isPublic === isPublic);
      }
      
      // 정렬
      switch (sortBy) {
        case 'updated':
          filteredProjects.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
          break;
        case 'created':
          // 생성일이 없으면 lastModified를 사용
          filteredProjects.sort((a, b) => new Date(b.createdAt || b.lastModified) - new Date(a.createdAt || a.lastModified));
          break;
        case 'name':
          filteredProjects.sort((a, b) => a.title.localeCompare(b.title));
          break;
      }
      
      // 프로젝트 표시 업데이트
      const projectsContainer = document.getElementById('user-projects');
      if (!projectsContainer) return;
      
      projectsContainer.innerHTML = '';
      
      if (filteredProjects.length === 0) {
        projectsContainer.innerHTML = '<p class="empty-message">검색 결과가 없습니다.</p>';
        return;
      }
      
      // 프로젝트 카드 생성 (loadUserProjects와 동일 로직)
      filteredProjects.forEach(project => {
        // 프로젝트 카드 생성 코드 복사
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.innerHTML = `
          <div class="project-preview">
            <!-- 실제 구현에서는 프로젝트 미리보기 이미지 추가 -->
            <div class="project-preview-overlay">
              <button class="project-action-btn" title="프로젝트 핀 고정" data-action="pin" data-project-id="${project.id}">
                <i class="fas fa-thumbtack"></i>
              </button>
              <button class="project-action-btn" title="프로젝트 설정" data-action="settings" data-project-id="${project.id}">
                <i class="fas fa-cog"></i>
              </button>
            </div>
          </div>
          <div class="project-info-card">
            <h3 class="project-title">${securityUtils.escapeHTML(project.title)}</h3>
            <p class="project-description">블록 코딩 프로젝트</p>
            <div class="project-tags">
              <span class="project-tag">${project.isPublic ? '공개' : '비공개'}</span>
            </div>
            <div class="project-meta">
              <span>수정: ${new Date(project.lastModified).toLocaleDateString()}</span>
            </div>
          </div>
        `;
        
        // 프로젝트 카드 클릭 이벤트 (동일 로직)
        projectCard.addEventListener('click', (e) => {
          // 액션 버튼 클릭을 제외하고 프로젝트 열기
          const actionBtn = e.target.closest('.project-action-btn');
          if (actionBtn) {
            e.stopPropagation();
            
            const action = actionBtn.dataset.action;
            const projectId = actionBtn.dataset.projectId;
            
            if (action === 'pin') {
              this.toggleProjectPin(projectId);
            } else if (action === 'settings') {
              this.openProjectSettings(projectId);
            }
            
            return;
          }
          
          // 프로젝트 열기
          projectManager.loadProject(project.id);
          showSection('playground-section');
        });
        
        projectsContainer.appendChild(projectCard);
      });
    },
    
    // 샘플 활동 데이터 생성
    generateSampleActivityData: function() {
      // 실제 구현에서는 사용자의 실제 활동 데이터를 사용해야 함
      // 여기서는 샘플 데이터 생성
      
      // 활동 유형 정의
      const activityTypes = [
        { type: 'project_create', icon: 'fas fa-code-branch', text: '새 프로젝트를 생성했습니다' },
        { type: 'project_update', icon: 'fas fa-edit', text: '프로젝트를 수정했습니다' },
        { type: 'post_create', icon: 'fas fa-comment-alt', text: '새 게시물을 작성했습니다' },
        { type: 'post_like', icon: 'fas fa-heart', text: '게시물에 좋아요를 표시했습니다' },
        { type: 'follow', icon: 'fas fa-user-plus', text: '새 사용자를 팔로우했습니다' }
      ];
      
      // 현재 날짜에서 2개월 전까지의 샘플 활동 생성
      const today = new Date();
      const twoMonthsAgo = new Date(today);
      twoMonthsAgo.setMonth(today.getMonth() - 2);
      
      const activities = [];
      
      // 10개의 샘플 활동 생성
      for (let i = 0; i < 10; i++) {
        // 랜덤 날짜 생성 (2개월 내)
        const activityDate = new Date(twoMonthsAgo.getTime() + Math.random() * (today.getTime() - twoMonthsAgo.getTime()));
        
        // 랜덤 활동 유형 선택
        const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
        
        // 활동 대상 이름 생성
        const targetName = `샘플 ${activityType.type === 'follow' ? '사용자' : '프로젝트'} ${Math.floor(Math.random() * 100 + 1)}`;
        
        // 활동 데이터 생성
        activities.push({
          id: `activity_${Date.now()}_${i}`,
          type: activityType.type,
          icon: activityType.icon,
          text: activityType.text,
          target: targetName,
          date: activityDate
        });
      }
      
      // 날짜순 정렬
      activities.sort((a, b) => b.date - a.date);
      
      this.activityData = activities;
    },
    
    // 활동 타임라인 표시
    displayActivityTimeline: function() {
      const timelineContainer = document.getElementById('activity-timeline');
      if (!timelineContainer) return;
      
      timelineContainer.innerHTML = '';
      
      // 활동 데이터가 없는 경우
      if (!this.activityData || this.activityData.length === 0) {
        timelineContainer.innerHTML = '<p class="empty-message">아직 활동 내역이 없습니다.</p>';
        return;
      }
      
      // 타임라인 항목 생성
      this.activityData.forEach(activity => {
        const activityElement = document.createElement('div');
        activityElement.className = 'timeline-item';
        
        // 날짜 포맷팅
        const dateFormatted = activity.date.toLocaleDateString('ko-KR', {
          year: 'numeric', month: 'long', day: 'numeric'
        });
        
        activityElement.innerHTML = `
          <div class="timeline-icon">
            <i class="${activity.icon}"></i>
          </div>
          <div class="timeline-content">
            <div class="timeline-header">
              <div class="timeline-title">${activity.target}</div>
              <div class="timeline-date">${dateFormatted}</div>
            </div>
            <div class="timeline-body">
              ${activity.text}
            </div>
          </div>
        `;
        
        timelineContainer.appendChild(activityElement);
      });
    },
    
    // 팔로워/팔로잉 목록 표시
    displayFollowLists: function() {
      // 팔로워 목록 컨테이너
      const followersContainer = document.getElementById('followers-list');
      if (followersContainer) {
        followersContainer.innerHTML = '<p class="empty-message">아직 팔로워가 없습니다.</p>';
      }
      
      // 팔로잉 목록 컨테이너
      const followingContainer = document.getElementById('following-list');
      if (followingContainer) {
        followingContainer.innerHTML = '<p class="empty-message">아직 팔로우하는 사용자가 없습니다.</p>';
      }
      
      // 실제 구현에서는 사용자의 팔로워/팔로잉 데이터를 가져와 표시
    },
    
    // 탭 변경 처리
    handleTabChange: function(e) {
      const tabBtn = e.currentTarget;
      const tabName = tabBtn.dataset.tab;
      
      // 모든 탭 버튼 비활성화
      document.querySelectorAll('.profile-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      
      // 선택한 탭 버튼 활성화
      tabBtn.classList.add('active');
      
      // 모든 탭 컨텐츠 숨기기
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      
      // 선택한 탭 컨텐츠 표시
      const tabContent = document.getElementById(`${tabName}-tab`);
      if (tabContent) {
        tabContent.classList.add('active');
      }
    }
  };
  
  // 플레이그라운드 진입 시 프로젝트 로드 로직 수정
  function initPlayground() {
    // 기존 초기화 코드 호출...
    
    // 현재 프로젝트 로드 (저장된 정보 있으면)
    if (projectManager && projectManager.currentProject) {
      document.getElementById('project-title').value = projectManager.currentProject.title;
      document.getElementById('project-status').textContent = '로드됨';
    }
  }
  
  // 사용자 프로필 페이지 로드 함수 연결
  function loadUserProfile() {
    // 새로운 프로필 관리자 사용
    profileManager.loadProfile();
  }
  
  // 사용자 드롭다운 메뉴에서 내 프로필 클릭 이벤트
  document.getElementById('nav-profile').addEventListener('click', (e) => {
    e.preventDefault();
    showSection('profile-section');
    loadUserProfile();
  });
  
  // 프로필 관리자 초기화 (페이지 로드 시)
  document.addEventListener('DOMContentLoaded', () => {
    // 기존 코드 이후에...
    
    // 프로필 관리자 초기화
    profileManager.init();
  });
  
  // 프로필 탭 이벤트 리스너 등록 (기존 이벤트 리스너 대체)
  document.querySelectorAll('.profile-tabs .tab-btn').forEach(tab => {
    tab.addEventListener('click', function() {
      // 활성 탭 설정
      document.querySelectorAll('.profile-tabs .tab-btn').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      // 모든 탭 컨텐츠 숨기기
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      
      // 선택한 탭 컨텐츠 표시
      const tabContent = document.getElementById(`${this.dataset.tab}-tab`);
      if (tabContent) {
        tabContent.classList.add('active');
      }
    });
  });


  // profile-manager.js 파일 맨 마지막에 추가할 코드

// 전역 초기화 상태 플래그 추가
let profileManagerInitialized = false;

// 프로필 매니저 init 함수 확장 - 초기화 상태 플래그 설정
const originalInit = profileManager.init;
profileManager.init = function() {
  originalInit.apply(this, arguments);
  profileManagerInitialized = true;
  console.log('프로필 매니저 초기화 완료');
};

// showSection 함수 확장 - profile-section에 대한 처리 개선
const originalShowSection = window.showSection;
window.showSection = function(sectionId) {
  // 기본 섹션 전환 수행
  originalShowSection(sectionId);
  
  // 프로필 섹션으로 전환 시 특별 처리
  if (sectionId === 'profile-section') {
    if (window.profileManager) {
      // 아직 초기화되지 않았다면 초기화
      if (!profileManagerInitialized) {
        profileManager.init();
      }
      
      // 프로필 로드
      profileManager.loadProfile();
    }
  }
};

// 이미 DOMContentLoaded 이벤트가 발생했는지 확인
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  // 프로필 매니저 초기화
  if (!profileManagerInitialized) {
    profileManager.init();
  }
} else {
  // 페이지 로드 완료 후 실행
  document.addEventListener('DOMContentLoaded', function() {
    // 프로필 매니저 초기화
    if (!profileManagerInitialized) {
      profileManager.init();
    }
  });
}

// 프로필 링크 이벤트 통합 및 재설정
document.addEventListener('DOMContentLoaded', function() {
  const profileNavLink = document.getElementById('nav-profile');
  if (profileNavLink) {
    // 기존 이벤트 리스너 제거 및 새 이벤트 리스너 등록
    profileNavLink.outerHTML = profileNavLink.outerHTML;
    
    // 새로 생성된 요소 다시 선택
    document.getElementById('nav-profile').addEventListener('click', function(e) {
      e.preventDefault();
      window.showSection('profile-section');
    });
  }
});