// 사용자 인증 관리 시스템

// 기본적인 인젝션 방지 유틸리티 함수
const securityUtils = {
    // HTML 태그와 특수 문자를 이스케이프
    escapeHTML: function(text) {
      if (!text) return '';
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    },
    
    // 입력값 검증 (기본 유효성 검사)
    validateInput: function(input, type) {
      if (!input) return false;
      
      switch(type) {
        case 'email':
          // 간단한 이메일 형식 검사
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
        case 'username':
          // 영문, 숫자, 언더스코어만 허용, 3-20자
          return /^[a-zA-Z0-9_]{3,20}$/.test(input);
        case 'password':
          // 최소 6자 이상
          return input.length >= 6;
        default:
          return true;
      }
    },
    
    // SQL 인젝션 방지를 위한 기본 필터링 (실제로는 서버에서 처리해야 함)
    sanitizeSQLInput: function(input) {
      if (!input) return '';
      return input
        .replace(/'/g, "''")
        .replace(/;/g, '')
        .replace(/--/g, '')
        .replace(/\/\*/g, '')
        .replace(/\*\//g, '');
    }
  };
  
  // 사용자 인증 관리 모듈
  const authManager = {
    // 현재 로그인된 사용자
    currentUser: null,
    
    // 스토리지 키
    STORAGE_KEYS: {
      USER: 'c-terminal-user',
      USERS: 'c-terminal-users', // 등록된 모든 사용자 정보 (간단한 DB 역할)
      PROJECT: 'c-terminal-current-project',
      PROJECTS: 'c-terminal-projects',
      COMMUNITY_POSTS: 'c-terminal-community-posts'
    },
    
    // 초기화
    init: function() {
      this.loadCurrentUser();
      this.initializeUserStore();
    },
    
    // 사용자 스토어 초기화 (처음 실행 시)
    initializeUserStore: function() {
      if (!localStorage.getItem(this.STORAGE_KEYS.USERS)) {
        localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify([]));
      }
    },
    
    // 현재 사용자 로드
    loadCurrentUser: function() {
      try {
        const savedUser = localStorage.getItem(this.STORAGE_KEYS.USER);
        if (savedUser) {
          this.currentUser = JSON.parse(savedUser);
          console.log('사용자 로드됨:', this.currentUser.username);
        }
      } catch (error) {
        console.error('사용자 로드 실패:', error);
        this.currentUser = null;
      }
    },
    
    // 로그인
    login: function(email, password) {
      // 이메일 유효성 검사
      if (!securityUtils.validateInput(email, 'email')) {
        return { success: false, message: '유효한 이메일 주소를 입력하세요.' };
      }
      
      // 비밀번호 유효성 검사
      if (!password || password.trim() === '') {
        return { success: false, message: '비밀번호를 입력하세요.' };
      }
      
      try {
        // 저장된 사용자 목록 가져오기
        const users = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.USERS) || '[]');
        
        // 사용자 찾기
        const user = users.find(u => u.email === email);
        
        if (!user) {
          return { success: false, message: '등록되지 않은 이메일입니다.' };
        }
        
        // 비밀번호 확인 (실제로는 해시 비교 필요)
        if (user.password !== password) {
          return { success: false, message: '비밀번호가 일치하지 않습니다.' };
        }
        
        // 로그인 성공 - 비밀번호 제외하고 저장
        const { password: _, ...userInfo } = user;
        this.currentUser = userInfo;
        localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(userInfo));
        
        return { success: true, user: userInfo };
      } catch (error) {
        console.error('로그인 오류:', error);
        return { success: false, message: '로그인 처리 중 오류가 발생했습니다.' };
      }
    },
    
    // 회원가입
    register: function(username, email, password) {
      // 입력값 유효성 검사
      if (!securityUtils.validateInput(username, 'username')) {
        return { success: false, message: '유효한 사용자 이름을 입력하세요 (영문, 숫자, _, 3-20자).' };
      }
      
      if (!securityUtils.validateInput(email, 'email')) {
        return { success: false, message: '유효한 이메일 주소를 입력하세요.' };
      }
      
      if (!securityUtils.validateInput(password, 'password')) {
        return { success: false, message: '비밀번호는 최소 6자 이상이어야 합니다.' };
      }
      
      try {
        // 저장된 사용자 목록 가져오기
        let users = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.USERS) || '[]');
        
        // 이메일 중복 확인
        if (users.some(u => u.email === email)) {
          return { success: false, message: '이미 사용 중인 이메일입니다.' };
        }
        
        // 사용자 이름 중복 확인
        if (users.some(u => u.username === username)) {
          return { success: false, message: '이미 사용 중인 사용자 이름입니다.' };
        }
        
        // 새 사용자 생성
        const newUser = {
          id: 'user_' + Date.now(),
          username: securityUtils.escapeHTML(username),
          email: email,
          password: password, // 실제로는 해시 처리 필요
          avatar: null,
          bio: '',
          joinDate: new Date(),
          projects: [],
          followers: [],
          following: []
        };
        
        // 사용자 목록에 추가
        users.push(newUser);
        localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));
        
        // 로그인 처리 - 비밀번호 제외하고 저장
        const { password: _, ...userInfo } = newUser;
        this.currentUser = userInfo;
        localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(userInfo));
        
        return { success: true, user: userInfo };
      } catch (error) {
        console.error('회원가입 오류:', error);
        return { success: false, message: '회원가입 처리 중 오류가 발생했습니다.' };
      }
    },
    
    // 로그아웃
    logout: function() {
      this.currentUser = null;
      localStorage.removeItem(this.STORAGE_KEYS.USER);
      return { success: true };
    },
    
    // 현재 사용자 가져오기
    getCurrentUser: function() {
      return this.currentUser;
    },
    
    // 로그인 상태 확인
    isLoggedIn: function() {
      return this.currentUser !== null;
    },
    
    // 사용자 프로필 업데이트
    updateProfile: function(userData) {
      if (!this.currentUser) {
        return { success: false, message: '로그인이 필요합니다.' };
      }
      
      try {
        // 저장된 사용자 목록 가져오기
        let users = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.USERS) || '[]');
        
        // 현재 사용자 찾기
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);
        
        if (userIndex === -1) {
          return { success: false, message: '사용자 정보를 찾을 수 없습니다.' };
        }
        
        // 업데이트 불가능한 필드 제외
        const { id, email, password, joinDate, ...updatableFields } = userData;
        
        // 기존 사용자 정보와 병합
        const updatedUser = { 
          ...users[userIndex], 
          ...updatableFields,
          // 사용자 이름과 자기소개는 HTML 이스케이프 처리
          username: updatableFields.username ? securityUtils.escapeHTML(updatableFields.username) : users[userIndex].username,
          bio: updatableFields.bio ? securityUtils.escapeHTML(updatableFields.bio) : users[userIndex].bio
        };
        
        // 사용자 목록 업데이트
        users[userIndex] = updatedUser;
        localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));
        
        // 현재 사용자 정보 업데이트 (비밀번호 제외)
        const { password: _, ...userInfo } = updatedUser;
        this.currentUser = userInfo;
        localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(userInfo));
        
        return { success: true, user: userInfo };
      } catch (error) {
        console.error('프로필 업데이트 오류:', error);
        return { success: false, message: '프로필 업데이트 중 오류가 발생했습니다.' };
      }
    }
  };
  
  // 커뮤니티 관리 모듈 - 업그레이드 버전 (R2 버킷 연동)
const communityManager = {
  // R2 버킷 API 설정
  API_CONFIG: {
    endpoint: '/api',
    apiKey: 'c-terminaal-api-key'  // 실제 환경에서는 더 안전한 키 생성 필요
  },
  
  // 로컬 캐시
  _postCache: null,
  _lastFetch: null,
  
  // 게시물 생성
  createPost: async function(title, content, projectId = null) {
    // 로그인 확인
    if (!authManager.isLoggedIn()) {
      return { success: false, message: '게시물을 작성하려면 로그인이 필요합니다.' };
    }
    
    // 입력값 검증
    if (!title || title.trim() === '') {
      return { success: false, message: '제목을 입력하세요.' };
    }
    
    if (!content || content.trim() === '') {
      return { success: false, message: '내용을 입력하세요.' };
    }
    
    try {
      // 현재 사용자 정보
      const currentUser = authManager.getCurrentUser();
      
      // 게시물 데이터 준비
      const postData = {
        title: securityUtils.escapeHTML(title),
        content: securityUtils.escapeHTML(content),
        author: {
          id: currentUser.id,
          username: currentUser.username,
          avatar: currentUser.avatar
        },
        projectId: projectId
      };
      
      // R2 API로 게시물 생성 요청
      const response = await fetch(`${this.API_CONFIG.endpoint}/community/posts/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Custom-Auth': this.API_CONFIG.apiKey
        },
        body: JSON.stringify(postData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, message: errorData.error || '게시물 작성 중 오류가 발생했습니다.' };
      }
      
      const post = await response.json();
      
      // 캐시 무효화
      this._postCache = null;
      
      return { success: true, post };
    } catch (error) {
      console.error('게시물 작성 오류:', error);
      return { success: false, message: '게시물 작성 중 오류가 발생했습니다.' };
    }
  },
  
  // 게시물 목록 가져오기
  getPosts: async function(sortType = 'new', page = 1, limit = 20, useCache = true) {
    try {
      // 캐시 사용 (30초 동안)
      const now = Date.now();
      if (useCache && this._postCache && this._lastFetch && now - this._lastFetch < 30000) {
        // 캐시된 포스트를 정렬하여 반환
        const posts = [...this._postCache];
        this._sortPosts(posts, sortType);
        return { success: true, posts };
      }
      
      // R2 API로 게시물 목록 요청
      const response = await fetch(`${this.API_CONFIG.endpoint}/community/posts/list?sort=${sortType}&page=${page}&limit=${limit}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, message: errorData.error || '게시물 목록을 불러오는 중 오류가 발생했습니다.' };
      }
      
      const data = await response.json();
      
      // 캐시 업데이트
      this._postCache = data.posts;
      this._lastFetch = now;
      
      return { success: true, posts: data.posts, pagination: {
        currentPage: data.page,
        totalPages: data.totalPages,
        totalItems: data.total
      }};
    } catch (error) {
      console.error('게시물 목록 로드 오류:', error);
      
      // 네트워크 오류 시 로컬 스토리지 폴백 (오프라인 상태를 위한 대체 방안)
      const fallbackPosts = this._getFallbackPosts();
      
      if (fallbackPosts.length > 0) {
        this._sortPosts(fallbackPosts, sortType);
        return { success: true, posts: fallbackPosts, isOffline: true };
      }
      
      return { success: false, message: '게시물 목록을 불러오는 중 오류가 발생했습니다.' };
    }
  },
  
  // 로컬 스토리지에서 폴백 포스트 가져오기 (오프라인 용)
  _getFallbackPosts: function() {
    try {
      const storedPosts = localStorage.getItem('c-terminal-community-posts');
      return storedPosts ? JSON.parse(storedPosts) : [];
    } catch (e) {
      return [];
    }
  },
  
  // 포스트 정렬 헬퍼 함수
  _sortPosts: function(posts, sortType) {
    switch (sortType) {
      case 'hot':
        posts.sort((a, b) => b.likes - a.likes);
        break;
      case 'new':
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'top':
        posts.sort((a, b) => (b.comments || 0) - (a.comments || 0));
        break;
    }
    return posts;
  },
  
  // Modified getPost function to better handle API failures
  // Add this to auth-system.js, replacing the existing getPost function in the communityManager object

  getPost: async function(postId) {
    try {
      // First try to fetch from API if online
      if (window.navigator.onLine) {
        try {
          // Note: corrected API URL format - removed extra 'a' in terminaal
          const response = await fetch(`${this.API_CONFIG.endpoint}/community/posts/${postId}`);
          
          if (response.ok) {
            const post = await response.json();
            return { success: true, post };
          }
        } catch (apiError) {
          console.log('API fetch failed, falling back to local storage', apiError);
          // Continue to local fallback if API fails
        }
      }
      
      // Fallback to local storage data
      console.log('Using local storage fallback for post:', postId);
      const storedPosts = localStorage.getItem(STORAGE_KEYS.COMMUNITY_POSTS);
      
      if (storedPosts) {
        const posts = JSON.parse(storedPosts);
        const post = posts.find(p => p.id === postId);
        
        if (post) {
          // Create a commentList array if it doesn't exist
          if (!post.commentList) {
            post.commentList = [];
          }
          
          return { success: true, post };
        }
      }
      
      return { success: false, message: '게시물을 찾을 수 없습니다.' };
    } catch (error) {
      console.error('게시물 로드 오류:', error);
      return { success: false, message: '게시물을 불러오는 중 오류가 발생했습니다.' };
    }
  },
  
  // 게시물 좋아요
  likePost: async function(postId) {
    // 로그인 확인
    if (!authManager.isLoggedIn()) {
      return { success: false, message: '좋아요를 남기려면 로그인이 필요합니다.' };
    }
    
    try {
      // 현재 사용자 정보
      const currentUser = authManager.getCurrentUser();
      
      // R2 API로 좋아요 요청
      const response = await fetch(`${this.API_CONFIG.endpoint}/community/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Custom-Auth': this.API_CONFIG.apiKey
        },
        body: JSON.stringify({ userId: currentUser.id })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, message: errorData.error || '좋아요 처리 중 오류가 발생했습니다.' };
      }
      
      const result = await response.json();
      
      // 캐시 업데이트 (있는 경우)
      if (this._postCache) {
        const postIndex = this._postCache.findIndex(p => p.id === postId);
        if (postIndex !== -1) {
          this._postCache[postIndex].likes = result.likes;
        }
      }
      
      return { success: true, likes: result.likes };
    } catch (error) {
      console.error('게시물 좋아요 오류:', error);
      return { success: false, message: '좋아요 처리 중 오류가 발생했습니다.' };
    }
  },
  
  // 댓글 작성
  addComment: async function(postId, content) {
    // 로그인 확인
    if (!authManager.isLoggedIn()) {
      return { success: false, message: '댓글을 작성하려면 로그인이 필요합니다.' };
    }
    
    // 입력값 검증
    if (!content || content.trim() === '') {
      return { success: false, message: '댓글 내용을 입력하세요.' };
    }
    
    try {
      // 현재 사용자 정보
      const currentUser = authManager.getCurrentUser();
      
      // 댓글 데이터 준비
      const commentData = {
        content: securityUtils.escapeHTML(content),
        author: {
          id: currentUser.id,
          username: currentUser.username,
          avatar: currentUser.avatar
        }
      };
      
      // R2 API로 댓글 작성 요청
      const response = await fetch(`${this.API_CONFIG.endpoint}/community/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Custom-Auth': this.API_CONFIG.apiKey
        },
        body: JSON.stringify(commentData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, message: errorData.error || '댓글 작성 중 오류가 발생했습니다.' };
      }
      
      const comment = await response.json();
      
      // 캐시 업데이트 (있는 경우)
      if (this._postCache) {
        const postIndex = this._postCache.findIndex(p => p.id === postId);
        if (postIndex !== -1) {
          this._postCache[postIndex].comments = (this._postCache[postIndex].comments || 0) + 1;
        }
      }
      
      return { success: true, comment };
    } catch (error) {
      console.error('댓글 작성 오류:', error);
      return { success: false, message: '댓글 작성 중 오류가 발생했습니다.' };
    }
  },
  
  // 사용자별 게시물 가져오기
  getUserPosts: async function(userId) {
    try {
      if (!userId) {
        return { success: false, message: '사용자 ID가 필요합니다.' };
      }
      
      // R2 API로 사용자 게시물 요청
      const response = await fetch(`${this.API_CONFIG.endpoint}/community/posts/user?userId=${userId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, message: errorData.error || '사용자 게시물을 불러오는 중 오류가 발생했습니다.' };
      }
      
      const data = await response.json();
      return { success: true, posts: data.posts };
    } catch (error) {
      console.error('사용자 게시물 로드 오류:', error);
      return { success: false, message: '사용자 게시물을 불러오는 중 오류가 발생했습니다.' };
    }
  },
  
  // 초기 데이터 준비 (첫 실행 시)
  initializePostsIndex: async function() {
    try {
      // 기존 로컬 스토리지 데이터 가져오기
      const storedPosts = localStorage.getItem('c-terminal-community-posts');
      
      if (storedPosts) {
        const posts = JSON.parse(storedPosts);
        
        // 이미 데이터가 R2에 있는지 확인
        const response = await fetch(`${this.API_CONFIG.endpoint}/community/posts/list?limit=1`);
        
        if (response.ok) {
          const data = await response.json();
          
          // R2에 데이터가 없고 로컬에 데이터가 있으면 마이그레이션
          if (data.total === 0 && posts.length > 0) {
            console.log('로컬 스토리지 게시물을 R2로 마이그레이션합니다...');
            
            // 각 포스트를 R2에 저장
            for (const post of posts) {
              await this.createPost(post.title, post.content, post.projectId);
            }
            
            console.log('마이그레이션 완료!');
          }
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error('커뮤니티 초기화 오류:', error);
      return { success: false, message: '커뮤니티 초기화 중 오류가 발생했습니다.' };
    }
  },
  
  // 정기적인 데이터 폴백 저장 (오프라인 지원용)
  scheduleLocalBackup: function() {
    const backupInterval = 5 * 60 * 1000; // 5분마다
    
    const runBackup = async () => {
      try {
        // 최신 포스트 목록 가져오기
        const result = await this.getPosts('new', 1, 50, false);
        
        if (result.success) {
          // 로컬 스토리지에 백업
          localStorage.setItem('c-terminal-community-posts', JSON.stringify(result.posts));
          console.log('커뮤니티 데이터 로컬 백업 완료');
        }
      } catch (error) {
        console.error('로컬 백업 오류:', error);
      }
    };
    
    // 초기 백업 실행
    runBackup();
    
    // 정기적인 백업 일정 설정
    setInterval(runBackup, backupInterval);
  }
};
  
  // 프로젝트 관리 모듈
  const projectManager = {
    // 스토리지 키
    STORAGE_KEYS: {
      CURRENT: 'c-terminal-current-project',
      ALL: 'c-terminal-projects'
    },
    
    // 현재 프로젝트
    currentProject: null,
    
    // 초기화
    init: function() {
      this.loadCurrentProject();
    },
    
    // 현재 프로젝트 로드
    loadCurrentProject: function() {
      try {
        const savedProject = localStorage.getItem(this.STORAGE_KEYS.CURRENT);
        if (savedProject) {
          this.currentProject = JSON.parse(savedProject);
        } else {
          // 기본 프로젝트 생성
          this.currentProject = {
            id: null,
            title: '제목 없는 프로젝트',
            blocks: null,
            isPublic: true,
            lastModified: new Date()
          };
        }
      } catch (error) {
        console.error('프로젝트 로드 실패:', error);
        this.currentProject = {
          id: null,
          title: '제목 없는 프로젝트',
          blocks: null,
          isPublic: true,
          lastModified: new Date()
        };
      }
    },
    
    // 현재 프로젝트 저장
    saveCurrentProject: function(blocks) {
      // 로그인 확인 (선택적)
      const isLoggedIn = authManager.isLoggedIn();
      
      try {
        // 프로젝트 ID가 없으면 생성
        if (!this.currentProject.id) {
          this.currentProject.id = 'project_' + Date.now();
        }
        
        // 블록 데이터 업데이트
        this.currentProject.blocks = blocks;
        this.currentProject.lastModified = new Date();
        
        // 로컬 스토리지에 저장
        localStorage.setItem(this.STORAGE_KEYS.CURRENT, JSON.stringify(this.currentProject));
        
        // 로그인한 경우 사용자의 프로젝트 목록에 추가
        if (isLoggedIn) {
          const currentUser = authManager.getCurrentUser();
          let allProjects = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.ALL) || '[]');
          
          // 이미 존재하는 프로젝트인지 확인
          const existingIndex = allProjects.findIndex(p => p.id === this.currentProject.id);
          
          // 프로젝트에 소유자 정보 추가
          const projectWithOwner = {
            ...this.currentProject,
            ownerId: currentUser.id,
            ownerName: currentUser.username
          };
          
          if (existingIndex >= 0) {
            // 기존 프로젝트 업데이트
            allProjects[existingIndex] = projectWithOwner;
          } else {
            // 새 프로젝트 추가
            allProjects.push(projectWithOwner);
          }
          
          // 저장
          localStorage.setItem(this.STORAGE_KEYS.ALL, JSON.stringify(allProjects));
        }
        
        return { success: true, project: this.currentProject };
      } catch (error) {
        console.error('프로젝트 저장 오류:', error);
        return { success: false, message: '프로젝트 저장 중 오류가 발생했습니다.' };
      }
    },
    
    // 프로젝트 제목 업데이트
    updateTitle: function(title) {
      try {
        // 타이틀 이스케이프 처리
        this.currentProject.title = securityUtils.escapeHTML(title);
        // 변경 사항 저장
        localStorage.setItem(this.STORAGE_KEYS.CURRENT, JSON.stringify(this.currentProject));
        return { success: true };
      } catch (error) {
        console.error('프로젝트 제목 업데이트 오류:', error);
        return { success: false, message: '프로젝트 제목 업데이트 중 오류가 발생했습니다.' };
      }
    },
    
    // 특정 프로젝트 로드
    loadProject: function(projectId) {
      try {
        // 모든 프로젝트 가져오기
        const allProjects = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.ALL) || '[]');
        
        // 프로젝트 찾기
        const project = allProjects.find(p => p.id === projectId);
        
        if (!project) {
          return { success: false, message: '프로젝트를 찾을 수 없습니다.' };
        }
        
        // 현재 프로젝트로 설정
        this.currentProject = project;
        localStorage.setItem(this.STORAGE_KEYS.CURRENT, JSON.stringify(project));
        
        return { success: true, project };
      } catch (error) {
        console.error('프로젝트 로드 오류:', error);
        return { success: false, message: '프로젝트 로드 중 오류가 발생했습니다.' };
      }
    },
    
    // 사용자의 프로젝트 목록 가져오기
    getUserProjects: function(userId = null) {
      try {
        // 로그인 확인
        const isLoggedIn = authManager.isLoggedIn();
        
        if (!isLoggedIn && !userId) {
          return { success: false, message: '로그인이 필요하거나 사용자 ID를 지정해야 합니다.' };
        }
        
        // 사용자 ID 가져오기
        const targetUserId = userId || authManager.getCurrentUser().id;
        
        // 모든 프로젝트 가져오기
        const allProjects = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.ALL) || '[]');
        
        // 사용자의 프로젝트 필터링
        const userProjects = allProjects.filter(p => p.ownerId === targetUserId);
        
        return { success: true, projects: userProjects };
      } catch (error) {
        console.error('사용자 프로젝트 로드 오류:', error);
        return { success: false, message: '프로젝트 목록을 불러오는 중 오류가 발생했습니다.' };
      }
    },
    
    // 공개 프로젝트 목록 가져오기
    getPublicProjects: function(sortBy = 'newest') {
      try {
        // 모든 프로젝트 가져오기
        const allProjects = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.ALL) || '[]');
        
        // 공개 프로젝트 필터링
        let publicProjects = allProjects.filter(p => p.isPublic);
        
        // 정렬
        switch (sortBy) {
          case 'newest':
            publicProjects.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
            break;
          case 'oldest':
            publicProjects.sort((a, b) => new Date(a.lastModified) - new Date(b.lastModified));
            break;
          case 'name':
            publicProjects.sort((a, b) => a.title.localeCompare(b.title));
            break;
        }
        
        return { success: true, projects: publicProjects };
      } catch (error) {
        console.error('공개 프로젝트 로드 오류:', error);
        return { success: false, message: '프로젝트 목록을 불러오는 중 오류가 발생했습니다.' };
      }
    },
    
    // 프로젝트 공개 설정 변경
    togglePublic: function(isPublic) {
      try {
        // 현재 프로젝트가 있는지 확인
        if (!this.currentProject || !this.currentProject.id) {
          return { success: false, message: '먼저 프로젝트를 저장해주세요.' };
        }
        
        // 공개 설정 변경
        this.currentProject.isPublic = isPublic;
        
        // 로컬 스토리지에 저장
        localStorage.setItem(this.STORAGE_KEYS.CURRENT, JSON.stringify(this.currentProject));
        
        // 모든 프로젝트 목록에서도 업데이트
        let allProjects = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.ALL) || '[]');
        const projectIndex = allProjects.findIndex(p => p.id === this.currentProject.id);
        
        if (projectIndex >= 0) {
          allProjects[projectIndex].isPublic = isPublic;
          localStorage.setItem(this.STORAGE_KEYS.ALL, JSON.stringify(allProjects));
        }
        
        return { success: true };
      } catch (error) {
        console.error('프로젝트 공개 설정 변경 오류:', error);
        return { success: false, message: '프로젝트 공개 설정을 변경하는 중 오류가 발생했습니다.' };
      }
    }
  };
  
  // UI 이벤트 핸들러 모듈 - 기존 함수를 대체
  const uiHandlers = {
    // 로그인 모달 이벤트 핸들러
    handleLogin: function() {
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      
      const result = authManager.login(email, password);
      
      if (result.success) {
        // UI 업데이트
        this.updateUIForLoggedInUser();
        
        // 모달 닫기
        this.closeCurrentModal();
        
        // 알림 표시
        alert('로그인되었습니다.');
      } else {
        alert(result.message);
      }
    },
    
    // 회원가입 모달 이벤트 핸들러
    handleSignup: function() {
      const username = document.getElementById('signup-username').value;
      const email = document.getElementById('signup-email').value;
      const password = document.getElementById('signup-password').value;
      const confirmPassword = document.getElementById('signup-confirm-password').value;
      const termsAgreed = document.getElementById('terms-agree').checked;
      
      // 비밀번호 일치 확인
      if (password !== confirmPassword) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
      }
      
      // 약관 동의 확인
      if (!termsAgreed) {
        alert('이용약관에 동의해주세요.');
        return;
      }
      
      const result = authManager.register(username, email, password);
      
      if (result.success) {
        // UI 업데이트
        this.updateUIForLoggedInUser();
        
        // 모달 닫기
        this.closeCurrentModal();
        
        // 알림 표시
        alert('회원가입이 완료되었습니다.');
      } else {
        alert(result.message);
      }
    },
    
    // 로그아웃 이벤트 핸들러
    handleLogout: function() {
      authManager.logout();
      
      // UI 업데이트
      this.updateUIForLoggedOutUser();
      
      // 홈 페이지로 이동
      showSection('home-section');
      
      // 드롭다운 닫기
      document.querySelector('.user-dropdown').classList.add('hidden');
    },
    
    // 로그인 상태 UI 업데이트
    updateUIForLoggedInUser: function() {
      // 로그인/회원가입 버튼 숨기기
      const navAuth = document.querySelector('.nav-auth');
      if (navAuth) {
        navAuth.style.display = 'none';
      }
      
      // 사용자 메뉴 표시
      const userMenu = document.querySelector('.user-menu');
      if (userMenu) {
        userMenu.style.display = 'flex';
      }
      
      // 사용자 아바타 업데이트
      const currentUser = authManager.getCurrentUser();
      const avatarUrl = currentUser.avatar || 'img/default-avatar.svg';
      const userAvatar = document.getElementById('user-avatar');
      if (userAvatar) {
        userAvatar.src = avatarUrl;
      }
    },
    
    // 로그아웃 상태 UI 업데이트
    updateUIForLoggedOutUser: function() {
      // 로그인/회원가입 버튼 표시
      const navAuth = document.querySelector('.nav-auth');
      if (navAuth) {
        navAuth.style.display = 'flex';
      }
      
      // 사용자 메뉴 숨기기
      const userMenu = document.querySelector('.user-menu');
      if (userMenu) {
        userMenu.style.display = 'none';
      }
    },
    
    // 모달 열기
    openModal: function(modalId) {
      // 모든 모달 숨기기
      document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
      });
      
      // 선택한 모달 표시
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.style.display = 'flex';
      }
    },
    
    // 현재 모달 닫기
    closeCurrentModal: function() {
      document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
      });
    },
    
    // 커뮤니티 게시물 작성
    submitNewPost: function() {
      const title = document.getElementById('post-title').value;
      const content = document.getElementById('post-content').value;
      const attachProject = document.getElementById('attach-project').checked;
      
      // 현재 프로젝트 ID (프로젝트 첨부 옵션 선택 시)
      const projectId = attachProject ? projectManager.currentProject.id : null;
      
      // 게시물 작성
      const result = communityManager.createPost(title, content, projectId);
      
      if (result.success) {
        // 모달 닫기
        this.closeCurrentModal();
        
        // 폼 초기화
        document.getElementById('post-title').value = '';
        document.getElementById('post-content').value = '';
        document.getElementById('attach-project').checked = false;
        
        // 게시물 목록 새로고침
        this.loadCommunityPosts();
        
        alert('게시물이 성공적으로 작성되었습니다.');
      } else {
        alert(result.message);
      }
    },
    
    // 커뮤니티 게시물 로드 및 표시
    loadCommunityPosts: function(tabType = 'hot') {
      const postsContainer = document.getElementById('posts-container');
      if (!postsContainer) return;
      
      postsContainer.innerHTML = '';
      
      // 게시물 가져오기
      const result = communityManager.getPosts(tabType);
      
      if (!result.success) {
        postsContainer.innerHTML = `<p class="empty-message">게시물을 불러오는 중 오류가 발생했습니다.</p>`;
        return;
      }
      
      const posts = result.posts;
      
      // 게시물이 없는 경우
      if (posts.length === 0) {
        postsContainer.innerHTML = `<p class="empty-message">아직 게시물이 없습니다. 첫 번째 게시물을 작성해보세요!</p>`;
        return;
      }
      
      // 게시물 표시
      posts.forEach(post => {
        // 게시물 카드 HTML 생성 (기존 코드와 동일)
        const postCard = document.createElement('div');
        postCard.className = 'post-card';
        
        // 게시물 내용을 마크다운으로 변환 (링크, 강조 등 지원)
        const postContent = typeof marked !== 'undefined' ? marked.parse(post.content) : post.content;
        
        // 게시물 HTML 구성
        postCard.innerHTML = `
          <div class="post-header">
            <div class="post-author">
              <img src="${post.author.avatar || 'img/default-avatar.svg'}" alt="작성자 아바타" class="post-author-avatar">
              <span class="post-author-name">${post.author.username}</span>
            </div>
            <span class="post-date">${new Date(post.date).toLocaleDateString()}</span>
          </div>
          <h3 class="post-title">${post.title}</h3>
          <div class="post-content">${postContent}</div>
          ${post.projectId ? `<div class="post-project-link"><a href="#" data-project-id="${post.projectId}">첨부된 프로젝트 보기</a></div>` : ''}
          <div class="post-footer">
            <div class="post-stats">
              <div class="post-stat">
                <i class="far fa-thumbs-up"></i>
                <span>${post.likes || 0}</span>
              </div>
              <div class="post-stat">
                <i class="far fa-comment"></i>
                <span>${post.comments?.length || 0}</span>
              </div>
            </div>
            <div class="post-actions">
              <button class="btn btn-small post-like-btn" data-post-id="${post.id}">
                <i class="far fa-thumbs-up"></i> 좋아요
              </button>
              <button class="btn btn-small post-comment-btn" data-post-id="${post.id}">
                <i class="far fa-comment"></i> 댓글
              </button>
            </div>
          </div>
        `;
        
        // 이벤트 리스너 등록
        this.attachPostEventListeners(postCard, post);
        
        // 컨테이너에 게시물 추가
        postsContainer.appendChild(postCard);
      });
    },
    
    // 게시물 카드에 이벤트 리스너 연결
    attachPostEventListeners: function(postCard, post) {
      // 프로젝트 링크 클릭 이벤트
      const projectLink = postCard.querySelector('.post-project-link a');
      if (projectLink) {
        projectLink.addEventListener('click', (e) => {
          e.preventDefault();
          const projectId = projectLink.dataset.projectId;
          const result = projectManager.loadProject(projectId);
          
          if (result.success) {
            showSection('playground-section');
            // 필요한 경우 Blockly 작업공간 초기화 추가
          } else {
            alert(result.message);
          }
        });
      }
      
      // 좋아요 버튼 클릭 이벤트
      const likeBtn = postCard.querySelector('.post-like-btn');
      if (likeBtn) {
        likeBtn.addEventListener('click', () => {
          const result = communityManager.likePost(post.id);
          
          if (result.success) {
            // 좋아요 수 업데이트
            const likeCount = likeBtn.previousElementSibling.querySelector('span');
            likeCount.textContent = result.post.likes;
          } else {
            alert(result.message);
          }
        });
      }
      
      // 댓글 버튼 클릭 이벤트
      const commentBtn = postCard.querySelector('.post-comment-btn');
      if (commentBtn) {
        commentBtn.addEventListener('click', () => {
          // 댓글 UI 표시 로직 추가 (간단한 프롬프트로 대체)
          if (authManager.isLoggedIn()) {
            const commentText = prompt('댓글을 입력하세요:');
            if (commentText) {
              const result = communityManager.addComment(post.id, commentText);
              
              if (result.success) {
                alert('댓글이 작성되었습니다.');
                // 현재 탭 유형 가져와서 게시물 목록 새로고침
                const activeTab = document.querySelector('.community-tabs .tab-btn.active');
                if (activeTab) {
                  this.loadCommunityPosts(activeTab.dataset.tab);
                }
              } else {
                alert(result.message);
              }
            }
          } else {
            alert('댓글을 작성하려면 로그인이 필요합니다.');
          }
        });
      }
    },
    
    // 프로젝트 저장 이벤트 핸들러
    saveProject: function() {
      // Blockly 워크스페이스 데이터 가져오기
      const blocks = Blockly ? Blockly.serialization.workspaces.save(workspace) : null;
      
      // 프로젝트 저장
      const result = projectManager.saveCurrentProject(blocks);
      
      if (result.success) {
        // 상태 업데이트
        document.getElementById('project-status').textContent = '저장됨';
        alert('프로젝트가 저장되었습니다.');
      } else {
        alert(result.message);
      }
    },
    
    // 프로젝트 제목 변경 이벤트 핸들러
    updateProjectTitle: function() {
      const title = document.getElementById('project-title').value;
      const result = projectManager.updateTitle(title);
      
      if (result.success) {
        document.getElementById('project-status').textContent = '변경됨';
      }
    },
    
    // 프로젝트 공유 모달 열기
    openShareModal: function() {
      // 저장되지 않은 프로젝트라면 먼저 저장
      if (document.getElementById('project-status').textContent !== '저장됨') {
        this.saveProject();
      }
      
      const currentProject = projectManager.currentProject;
      
      // 가상의 공유 링크 생성
      const shareLink = `https://c-terminal.pages.dev/projects/${currentProject.id}`;
      document.getElementById('share-link').value = shareLink;
      
      // 공개 설정 체크박스 상태 설정
      document.getElementById('public-project').checked = currentProject.isPublic;
      
      // 모달 열기
      this.openModal('share-modal');
    },
    
    // 공유 링크 복사
    copyShareLink: function() {
      const shareLink = document.getElementById('share-link');
      shareLink.select();
      document.execCommand('copy');
      
      // 복사 확인 표시
      const copyBtn = document.getElementById('copy-link-btn');
      const originalHtml = copyBtn.innerHTML;
      copyBtn.innerHTML = '<i class="fas fa-check"></i> 복사됨';
      
      // 일정 시간 후 원래 상태로 복원
      setTimeout(() => {
        copyBtn.innerHTML = originalHtml;
      }, 2000);
    },
    
    // 프로젝트 공개 설정 변경
    toggleProjectPublic: function() {
      const isPublic = document.getElementById('public-project').checked;
      projectManager.togglePublic(isPublic);
    },
    
    // 사용자 프로필 로드
    loadUserProfile: function() {
      if (!authManager.isLoggedIn()) {
        showSection('home-section');
        alert('프로필을 보려면 먼저 로그인하세요.');
        return;
      }
      
      const currentUser = authManager.getCurrentUser();
      
      // 프로필 정보 설정
      document.getElementById('profile-username').textContent = currentUser.username;
      document.getElementById('profile-bio').textContent = currentUser.bio || '자기소개가 없습니다.';
      document.getElementById('profile-avatar-img').src = currentUser.avatar || 'img/default-avatar.svg';
      
      // 사용자 프로젝트 목록 가져오기
      const result = projectManager.getUserProjects();
      
      if (result.success) {
        // 프로젝트 카운트 설정
        document.getElementById('projects-count').textContent = result.projects.length;
        
        // 사용자 프로젝트 로드
        this.displayUserProjects(result.projects);
      }
      
      // 팔로워 및 팔로잉 카운트 설정 (데모에서는 0)
      document.getElementById('followers-count').textContent = currentUser.followers?.length || 0;
      document.getElementById('following-count').textContent = currentUser.following?.length || 0;
    },
    
    // 사용자 프로젝트 표시
    displayUserProjects: function(projects) {
      const projectsContainer = document.getElementById('user-projects');
      if (!projectsContainer) return;
      
      projectsContainer.innerHTML = '';
      
      if (projects.length === 0) {
        projectsContainer.innerHTML = '<p class="empty-message">아직 프로젝트가 없습니다. 플레이그라운드에서 새 프로젝트를 만들어보세요!</p>';
        return;
      }
      
      // 프로젝트 카드 생성
      projects.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.innerHTML = `
          <div class="project-preview">
            <!-- 실제 구현에서는 프로젝트 미리보기 이미지 추가 -->
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
        
        // 프로젝트 카드 클릭 이벤트
        projectCard.addEventListener('click', () => {
          const result = projectManager.loadProject(project.id);
          
          if (result.success) {
            showSection('playground-section');
            // 필요한 경우 Blockly 작업공간 초기화 추가
          } else {
            alert(result.message);
          }
        });
        
        projectsContainer.appendChild(projectCard);
      });
    }
  };
  
  // 애플리케이션 초기화 함수
  function initializeApp() {
    // 인증 관리자 초기화
    authManager.init();
    
    // 프로젝트 관리자 초기화
    projectManager.init();
    
    // 이벤트 리스너 등록 (DOM 로드 후 실행됨)
    document.addEventListener('DOMContentLoaded', () => {
      // 로그인/회원가입 이벤트 리스너 연결
      const loginSubmitBtn = document.getElementById('login-submit-btn');
      if (loginSubmitBtn) {
        loginSubmitBtn.addEventListener('click', uiHandlers.handleLogin.bind(uiHandlers));
      }
      
      const signupSubmitBtn = document.getElementById('signup-submit-btn');
      if (signupSubmitBtn) {
        signupSubmitBtn.addEventListener('click', uiHandlers.handleSignup.bind(uiHandlers));
      }
      
      const logoutBtn = document.getElementById('logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', uiHandlers.handleLogout.bind(uiHandlers));
      }
      
      // 모달 열기 버튼 이벤트 리스너
      const loginBtn = document.getElementById('login-btn');
      if (loginBtn) {
        loginBtn.addEventListener('click', () => uiHandlers.openModal('login-modal'));
      }
      
      const signupBtn = document.getElementById('signup-btn');
      if (signupBtn) {
        signupBtn.addEventListener('click', () => uiHandlers.openModal('signup-modal'));
      }
      
      // 프로젝트 관련 이벤트 리스너
      const saveBtn = document.getElementById('save-btn');
      if (saveBtn) {
        saveBtn.addEventListener('click', uiHandlers.saveProject.bind(uiHandlers));
      }
      
      const projectTitle = document.getElementById('project-title');
      if (projectTitle) {
        projectTitle.addEventListener('change', uiHandlers.updateProjectTitle.bind(uiHandlers));
      }
      
      const shareBtn = document.getElementById('share-btn');
      if (shareBtn) {
        shareBtn.addEventListener('click', uiHandlers.openShareModal.bind(uiHandlers));
      }
      
      const copyLinkBtn = document.getElementById('copy-link-btn');
      if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', uiHandlers.copyShareLink.bind(uiHandlers));
      }
      
      const publicProjectToggle = document.getElementById('public-project');
      if (publicProjectToggle) {
        publicProjectToggle.addEventListener('change', uiHandlers.toggleProjectPublic.bind(uiHandlers));
      }
      
      // 커뮤니티 관련 이벤트 리스너
      const submitPostBtn = document.getElementById('submit-post-btn');
      if (submitPostBtn) {
        submitPostBtn.addEventListener('click', uiHandlers.submitNewPost.bind(uiHandlers));
      }
      
      // 커뮤니티 탭 이벤트 리스너
      document.querySelectorAll('.community-tabs .tab-btn').forEach(tab => {
        tab.addEventListener('click', () => {
          // 활성 탭 설정
          document.querySelectorAll('.community-tabs .tab-btn').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          
          // 선택한 탭에 따라 다른 정렬 방식으로 게시물 로드
          const tabType = tab.dataset.tab;
          uiHandlers.loadCommunityPosts(tabType);
        });
      });
      
      // 초기 UI 상태 설정
      const isLoggedIn = authManager.isLoggedIn();
      if (isLoggedIn) {
        uiHandlers.updateUIForLoggedInUser();
      } else {
        uiHandlers.updateUIForLoggedOutUser();
      }
    });
  }
  
  // 애플리케이션 초기화 실행
  initializeApp();