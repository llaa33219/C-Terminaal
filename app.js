// C-Terminaal 메인 앱 스크립트
// 주요 앱 초기화 및 네비게이션, 인증 처리

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "c-terminaal.firebaseapp.com",
    projectId: "c-terminaal",
    storageBucket: "c-terminaal.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const r2Config = {
    accountId: "YOUR_CLOUDFLARE_ACCOUNT_ID",
    bucketName: "c-terminaal-storage",
    accessKeyId: "YOUR_R2_ACCESS_KEY_ID",
    secretAccessKey: "YOUR_R2_SECRET_ACCESS_KEY"
};

const state = {
    currentUser: null,
    currentProject: null,
    projectHistory: [],
    isExecuting: false,
    currentPage: 'playground',
    communityPage: 1,
    explorePage: 1,
    totalCommunityPages: 1,
    totalExplorePage: 1,
    posts: [],
    projects: []
};

const dom = {
    navLinks: document.querySelectorAll('nav a'),
    pages: document.querySelectorAll('.page'),
    
    blocklyDiv: document.getElementById('blockly-div'),
    terminalDiv: document.getElementById('terminal'),
    runButton: document.getElementById('run-code'),
    stopButton: document.getElementById('stop-code'),
    saveButton: document.getElementById('save-project'),
    clearTerminalButton: document.getElementById('clear-terminal'),
    newProjectButton: document.getElementById('new-project'),
    projectSelect: document.getElementById('project-select'),
    shareButton: document.getElementById('share-project'),
    
    loginButton: document.getElementById('login-button'),
    userProfile: document.getElementById('user-profile'),
    userAvatar: document.getElementById('user-avatar'),
    username: document.getElementById('username'),
    
    loginModal: document.getElementById('login-modal'),
    registerModal: document.getElementById('register-modal'),
    shareModal: document.getElementById('share-modal'),
    newPostModal: document.getElementById('new-post-modal'),
    allModals: document.querySelectorAll('.modal'),
    closeModalButtons: document.querySelectorAll('.close-modal'),
    
    loginForm: document.getElementById('login-form'),
    registerForm: document.getElementById('register-form'),
    registerLink: document.getElementById('register-link'),
    
    projectTitle: document.getElementById('project-title'),
    projectDescription: document.getElementById('project-description'),
    confirmShareButton: document.getElementById('confirm-share'),
    shareLinks: document.getElementById('share-links'),
    shareUrl: document.getElementById('share-url'),
    copyUrlButton: document.getElementById('copy-url'),
    
    postsContainer: document.getElementById('posts-container'),
    newPostButton: document.getElementById('new-post'),
    postForm: document.getElementById('post-form'),
    postCategorySelect: document.getElementById('post-category'),
    postSearch: document.getElementById('post-search'),
    searchButton: document.getElementById('search-button'),
    prevPageButton: document.getElementById('prev-page'),
    nextPageButton: document.getElementById('next-page'),
    pageInfo: document.getElementById('page-info'),
    
    projectsGrid: document.getElementById('projects-grid'),
    projectSearch: document.getElementById('project-search'),
    projectSearchButton: document.getElementById('project-search-button'),
    sortBy: document.getElementById('sort-by'),
    difficulty: document.getElementById('difficulty'),
    prevProjectsPageButton: document.getElementById('prev-projects-page'),
    nextProjectsPageButton: document.getElementById('next-projects-page'),
    projectsPageInfo: document.getElementById('projects-page-info'),
    
    profileUsername: document.getElementById('profile-username'),
    profileBio: document.getElementById('profile-bio'),
    profileAvatar: document.getElementById('profile-avatar'),
    projectsCount: document.getElementById('projects-count'),
    followersCount: document.getElementById('followers-count'),
    followingCount: document.getElementById('following-count'),
    editProfileButton: document.getElementById('edit-profile'),
    profileTabs: document.querySelectorAll('.tab-button'),
    tabContents: document.querySelectorAll('.tab-content')
};

function initApp() {
    firebase.initializeApp(firebaseConfig);
    firebase.auth().onAuthStateChanged(handleAuthStateChanged);
    registerEventListeners();
    
    if (typeof initBlockly === 'function') {
        initBlockly();
    }
    
    if (typeof initTerminal === 'function') {
        initTerminal();
    }
    
    loadContent('playground');
}

function registerEventListeners() {
    dom.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.dataset.page;
            if (page) {
                activateNavLink(e.target);
                loadContent(page);
            }
        });
    });
    
    dom.runButton.addEventListener('click', runCode);
    dom.stopButton.addEventListener('click', stopExecution);
    dom.saveButton.addEventListener('click', saveProject);
    // 수정: clearTerminal -> terminalClear (터미널.js에 정의되어 있음)
    dom.clearTerminalButton.addEventListener('click', terminalClear);
    dom.newProjectButton.addEventListener('click', createNewProject);
    dom.projectSelect.addEventListener('change', loadSelectedProject);
    dom.shareButton.addEventListener('click', openShareModal);
    
    dom.loginButton.addEventListener('click', openLoginModal);
    dom.loginForm.addEventListener('submit', handleLogin);
    dom.registerForm.addEventListener('submit', handleRegister);
    dom.registerLink.addEventListener('click', showRegisterModal);
    
    dom.closeModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            closeAllModals();
        });
    });
    
    window.addEventListener('click', (e) => {
        dom.allModals.forEach(modal => {
            if (e.target === modal) {
                closeAllModals();
            }
        });
    });
    
    dom.confirmShareButton.addEventListener('click', shareProject);
    dom.copyUrlButton.addEventListener('click', copyShareUrl);
    
    dom.newPostButton.addEventListener('click', openNewPostModal);
    dom.postForm.addEventListener('submit', submitPost);
    dom.postCategorySelect.addEventListener('change', filterPosts);
    dom.searchButton.addEventListener('click', searchPosts);
    dom.prevPageButton.addEventListener('click', () => navigateCommunityPage(-1));
    dom.nextPageButton.addEventListener('click', () => navigateCommunityPage(1));
    
    dom.projectSearchButton.addEventListener('click', searchProjects);
    dom.sortBy.addEventListener('change', filterProjects);
    dom.difficulty.addEventListener('change', filterProjects);
    dom.prevProjectsPageButton.addEventListener('click', () => navigateExplorePage(-1));
    dom.nextProjectsPageButton.addEventListener('click', () => navigateExplorePage(1));
    
    dom.profileTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            const tabName = e.target.dataset.tab;
            if (tabName) {
                activateProfileTab(e.target, tabName);
            }
        });
    });
    
    dom.editProfileButton.addEventListener('click', openEditProfileModal);
}

function handleAuthStateChanged(user) {
    if (user) {
        state.currentUser = user;
        dom.loginButton.classList.add('hidden');
        dom.userProfile.classList.remove('hidden');
        dom.username.textContent = user.displayName || user.email;
        
        if (user.photoURL) {
            dom.userAvatar.src = user.photoURL;
        }
        
        loadUserProjects();
        if (state.currentPage === 'profile') {
            loadProfileData();
        }
    } else {
        state.currentUser = null;
        dom.loginButton.classList.remove('hidden');
        dom.userProfile.classList.add('hidden');
        clearProjectSelect();
    }
}

function openLoginModal() {
    dom.loginModal.style.display = 'flex';
}

function showRegisterModal(e) {
    e.preventDefault();
    dom.loginModal.style.display = 'none';
    dom.registerModal.style.display = 'flex';
}

function closeAllModals() {
    dom.allModals.forEach(modal => {
        modal.style.display = 'none';
    });
    dom.shareLinks.classList.add('hidden');
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            closeAllModals();
            showNotification('로그인 성공!', 'success');
        })
        .catch((error) => {
            console.error('로그인 에러:', error);
            showNotification('로그인 실패: ' + error.message, 'error');
        });
}

function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (password !== confirmPassword) {
        showNotification('비밀번호가 일치하지 않습니다.', 'error');
        return;
    }
    
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            return userCredential.user.updateProfile({
                displayName: username
            }).then(() => {
                return firebase.firestore().collection('users').doc(userCredential.user.uid).set({
                    username: username,
                    email: email,
                    bio: '',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    followers: 0,
                    following: 0
                });
            });
        })
        .then(() => {
            closeAllModals();
            showNotification('회원가입 성공!', 'success');
        })
        .catch((error) => {
            console.error('회원가입 에러:', error);
            showNotification('회원가입 실패: ' + error.message, 'error');
        });
}

function handleLogout() {
    firebase.auth().signOut()
        .then(() => {
            showNotification('로그아웃되었습니다.', 'info');
        })
        .catch((error) => {
            console.error('로그아웃 에러:', error);
            showNotification('로그아웃 실패: ' + error.message, 'error');
        });
}

function loadContent(pageName) {
    state.currentPage = pageName;
    
    dom.pages.forEach(page => {
        if (page.id === pageName + '-page') {
            page.classList.add('active');
        } else {
            page.classList.remove('active');
        }
    });
    
    switch (pageName) {
        case 'playground':
            break;
        case 'community':
            loadCommunityPosts();
            break;
        case 'explore':
            loadExploreProjects();
            break;
        case 'profile':
            loadProfileData();
            break;
    }
}

function activateNavLink(linkElement) {
    dom.navLinks.forEach(link => {
        link.classList.remove('active');
    });
    linkElement.classList.add('active');
}

function activateProfileTab(tabElement, tabName) {
    dom.profileTabs.forEach(tab => {
        tab.classList.remove('active');
    });
    tabElement.classList.add('active');
    
    dom.tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    document.getElementById(tabName).classList.add('active');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function loadUserProjects() {
    if (!state.currentUser) return;
    
    clearProjectSelect();
    
    firebase.firestore().collection('projects')
        .where('userId', '==', state.currentUser.uid)
        .orderBy('updatedAt', 'desc')
        .get()
        .then((querySnapshot) => {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = '내 프로젝트 선택...';
            dom.projectSelect.appendChild(option);
            
            querySnapshot.forEach((doc) => {
                const project = doc.data();
                const option = document.createElement('option');
                option.value = doc.id;
                option.textContent = project.title;
                dom.projectSelect.appendChild(option);
            });
        })
        .catch((error) => {
            console.error('프로젝트 로드 에러:', error);
            showNotification('프로젝트 로드 실패', 'error');
        });
}

function clearProjectSelect() {
    dom.projectSelect.innerHTML = '';
}

function loadCommunityPosts() {
    dom.postsContainer.innerHTML = '<div class="loading">게시물을 불러오는 중...</div>';
    
    firebase.firestore().collection('posts')
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get()
        .then((querySnapshot) => {
            dom.postsContainer.innerHTML = '';
            
            if (querySnapshot.empty) {
                dom.postsContainer.innerHTML = '<div class="no-content">게시물이 없습니다.</div>';
                return;
            }
            
            state.posts = [];
            querySnapshot.forEach((doc) => {
                const post = { id: doc.id, ...doc.data() };
                state.posts.push(post);
                renderPostCard(post);
            });
            
            state.totalCommunityPages = 5;
            updateCommunityPagination();
        })
        .catch((error) => {
            console.error('게시물 로드 에러:', error);
            dom.postsContainer.innerHTML = '<div class="error">게시물을 불러오는 데 실패했습니다.</div>';
        });
}

function renderPostCard(post) {
    const postCard = document.createElement('div');
    postCard.className = 'post-card';
    
    const authorName = post.authorName || '알 수 없는 사용자';
    const createdAt = post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() : '알 수 없는 날짜';
    
    const categoryLabels = {
        'question': '질문',
        'showcase': '작품 공유',
        'tutorial': '튜토리얼',
        'discussion': '토론'
    };
    
    const categoryLabel = categoryLabels[post.category] || post.category;
    
    postCard.innerHTML = `
        <div class="post-header">
            <h3 class="post-title"><a href="#" data-post-id="${post.id}">${post.title}</a></h3>
        </div>
        <div class="post-meta">
            <div class="post-category">${categoryLabel}</div>
            <div class="post-author">작성자: ${authorName}</div>
            <div class="post-date">작성일: ${createdAt}</div>
        </div>
        <div class="post-preview">${truncateText(post.content, 150)}</div>
        <div class="post-footer">
            <div class="post-stats">
                <div class="post-views">조회 ${post.views || 0}</div>
                <div class="post-comments">댓글 ${post.commentCount || 0}</div>
                <div class="post-likes">좋아요 ${post.likes || 0}</div>
            </div>
            <a href="#" class="post-read-more" data-post-id="${post.id}">더 보기</a>
        </div>
    `;
    
    const titleLink = postCard.querySelector('.post-title a');
    const readMoreLink = postCard.querySelector('.post-read-more');
    
    titleLink.addEventListener('click', (e) => {
        e.preventDefault();
        openPostDetail(post.id);
    });
    
    readMoreLink.addEventListener('click', (e) => {
        e.preventDefault();
        openPostDetail(post.id);
    });
    
    dom.postsContainer.appendChild(postCard);
}

function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function navigateCommunityPage(direction) {
    const newPage = state.communityPage + direction;
    
    if (newPage < 1 || newPage > state.totalCommunityPages) {
        return;
    }
    
    state.communityPage = newPage;
    updateCommunityPagination();
    loadCommunityPosts();
}

function updateCommunityPagination() {
    dom.pageInfo.textContent = `${state.communityPage} / ${state.totalCommunityPages}`;
    
    if (state.communityPage <= 1) {
        dom.prevPageButton.disabled = true;
    } else {
        dom.prevPageButton.disabled = false;
    }
    
    if (state.communityPage >= state.totalCommunityPages) {
        dom.nextPageButton.disabled = true;
    } else {
        dom.nextPageButton.disabled = false;
    }
}

function loadExploreProjects() {
    dom.projectsGrid.innerHTML = '<div class="loading">프로젝트를 불러오는 중...</div>';
    
    firebase.firestore().collection('projects')
        .where('isPublic', '==', true)
        .orderBy('createdAt', 'desc')
        .limit(12)
        .get()
        .then((querySnapshot) => {
            dom.projectsGrid.innerHTML = '';
            
            if (querySnapshot.empty) {
                dom.projectsGrid.innerHTML = '<div class="no-content">프로젝트가 없습니다.</div>';
                return;
            }
            
            state.projects = [];
            querySnapshot.forEach((doc) => {
                const project = { id: doc.id, ...doc.data() };
                state.projects.push(project);
                renderProjectCard(project);
            });
            
            state.totalExplorePage = 8;
            updateExplorePagination();
        })
        .catch((error) => {
            console.error('프로젝트 로드 에러:', error);
            dom.projectsGrid.innerHTML = '<div class="error">프로젝트를 불러오는 데 실패했습니다.</div>';
        });
}

function renderProjectCard(project) {
    const projectCard = document.createElement('div');
    projectCard.className = 'project-card';
    
    const authorName = project.authorName || '알 수 없는 사용자';
    const createdAt = project.createdAt ? new Date(project.createdAt.seconds * 1000).toLocaleDateString() : '알 수 없는 날짜';
    
    const difficultyLabels = {
        'beginner': '초급',
        'intermediate': '중급',
        'advanced': '고급'
    };
    
    const difficultyLabel = difficultyLabels[project.difficulty] || '기타';
    
    projectCard.innerHTML = `
        <div class="project-thumbnail">
            <img src="${project.thumbnail || 'default-project.png'}" alt="${project.title}">
        </div>
        <div class="project-info">
            <h3 class="project-title">${project.title}</h3>
            <div class="project-author">
                <img src="${project.authorAvatar || 'default-avatar.png'}" alt="${authorName}">
                <span>${authorName}</span>
            </div>
            <p class="project-description">${truncateText(project.description, 100)}</p>
            <div class="project-meta">
                <span>난이도: ${difficultyLabel}</span>
                <span>조회 ${project.views || 0}</span>
            </div>
            <div class="project-tags">
                ${renderTags(project.tags)}
            </div>
        </div>
    `;
    
    projectCard.addEventListener('click', () => {
        openProjectDetail(project.id);
    });
    
    dom.projectsGrid.appendChild(projectCard);
}

function renderTags(tags) {
    if (!tags || !Array.isArray(tags) || tags.length === 0) {
        return '';
    }
    return tags.map(tag => `<span class="tag">${tag}</span>`).join('');
}

function navigateExplorePage(direction) {
    const newPage = state.explorePage + direction;
    
    if (newPage < 1 || newPage > state.totalExplorePage) {
        return;
    }
    
    state.explorePage = newPage;
    updateExplorePagination();
    loadExploreProjects();
}

function updateExplorePagination() {
    dom.projectsPageInfo.textContent = `${state.explorePage} / ${state.totalExplorePage}`;
    
    if (state.explorePage <= 1) {
        dom.prevProjectsPageButton.disabled = true;
    } else {
        dom.prevProjectsPageButton.disabled = false;
    }
    
    if (state.explorePage >= state.totalExplorePage) {
        dom.nextProjectsPageButton.disabled = true;
    } else {
        dom.nextProjectsPageButton.disabled = false;
    }
}

function loadProfileData() {
    if (!state.currentUser) {
        return;
    }
    
    const userId = state.currentUser.uid;
    
    firebase.firestore().collection('users').doc(userId).get()
        .then((doc) => {
            if (doc.exists) {
                const userData = doc.data();
                dom.profileUsername.textContent = userData.username || state.currentUser.displayName || '사용자';
                dom.profileBio.textContent = userData.bio || '소개가 없습니다.';
                
                if (state.currentUser.photoURL) {
                    dom.profileAvatar.src = state.currentUser.photoURL;
                }
                
                dom.followersCount.textContent = userData.followers || 0;
                dom.followingCount.textContent = userData.following || 0;
                
                firebase.firestore().collection('projects')
                    .where('userId', '==', userId)
                    .get()
                    .then((querySnapshot) => {
                        dom.projectsCount.textContent = querySnapshot.size;
                        loadUserProjectsTab(querySnapshot);
                    });
                
                loadUserPostsTab(userId);
                loadUserAchievementsTab(userId);
            }
        })
        .catch((error) => {
            console.error('사용자 정보 로드 에러:', error);
            showNotification('사용자 정보를 불러오는 데 실패했습니다.', 'error');
        });
}

function loadUserProjectsTab(querySnapshot) {
    const projectsGrid = document.querySelector('#user-projects .projects-grid');
    projectsGrid.innerHTML = '';
    
    if (querySnapshot.empty) {
        projectsGrid.innerHTML = '<div class="no-content">프로젝트가 없습니다.</div>';
        return;
    }
    
    querySnapshot.forEach((doc) => {
        const project = { id: doc.id, ...doc.data() };
        
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        
        const createdAt = project.createdAt ? new Date(project.createdAt.seconds * 1000).toLocaleDateString() : '알 수 없는 날짜';
        
        projectCard.innerHTML = `
            <div class="project-thumbnail">
                <img src="${project.thumbnail || 'default-project.png'}" alt="${project.title}">
            </div>
            <div class="project-info">
                <h3 class="project-title">${project.title}</h3>
                <p class="project-description">${truncateText(project.description || '설명 없음', 100)}</p>
                <div class="project-meta">
                    <span>작성일: ${createdAt}</span>
                    <span>조회 ${project.views || 0}</span>
                </div>
                <div class="project-actions">
                    <button class="button small edit-project" data-id="${project.id}">수정</button>
                    <button class="button small delete-project" data-id="${project.id}">삭제</button>
                </div>
            </div>
        `;
        
        const editButton = projectCard.querySelector('.edit-project');
        const deleteButton = projectCard.querySelector('.delete-project');
        
        editButton.addEventListener('click', (e) => {
            e.stopPropagation();
            loadProjectForEditing(project.id);
        });
        
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            confirmDeleteProject(project.id, project.title);
        });
        
        projectCard.addEventListener('click', () => {
            loadProjectForEditing(project.id);
        });
        
        projectsGrid.appendChild(projectCard);
    });
}

function loadUserPostsTab(userId) {
    const postsList = document.querySelector('#user-posts .posts-list');
    postsList.innerHTML = '';
    
    firebase.firestore().collection('posts')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                postsList.innerHTML = '<div class="no-content">게시물이 없습니다.</div>';
                return;
            }
            
            querySnapshot.forEach((doc) => {
                const post = { id: doc.id, ...doc.data() };
                
                const postItem = document.createElement('div');
                postItem.className = 'post-item';
                
                const createdAt = post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() : '알 수 없는 날짜';
                
                postItem.innerHTML = `
                    <div class="post-item-header">
                        <h3 class="post-item-title">${post.title}</h3>
                        <div class="post-item-meta">
                            <span class="post-item-date">${createdAt}</span>
                            <span class="post-item-category">${post.category}</span>
                        </div>
                    </div>
                    <div class="post-item-content">
                        ${truncateText(post.content, 150)}
                    </div>
                    <div class="post-item-footer">
                        <div class="post-item-stats">
                            <span>조회 ${post.views || 0}</span>
                            <span>댓글 ${post.commentCount || 0}</span>
                            <span>좋아요 ${post.likes || 0}</span>
                        </div>
                        <div class="post-item-actions">
                            <button class="button small edit-post" data-id="${post.id}">수정</button>
                            <button class="button small delete-post" data-id="${post.id}">삭제</button>
                        </div>
                    </div>
                `;
                
                const editButton = postItem.querySelector('.edit-post');
                const deleteButton = postItem.querySelector('.delete-post');
                
                editButton.addEventListener('click', () => {
                    editPost(post.id);
                });
                
                deleteButton.addEventListener('click', () => {
                    confirmDeletePost(post.id, post.title);
                });
                
                postsList.appendChild(postItem);
            });
        })
        .catch((error) => {
            console.error('게시물 로드 에러:', error);
            postsList.innerHTML = '<div class="error">게시물을 불러오는 데 실패했습니다.</div>';
        });
}

function loadUserAchievementsTab(userId) {
    const achievementsGrid = document.querySelector('#user-achievements .achievements-grid');
    achievementsGrid.innerHTML = '';
    
    const achievements = [
        {
            id: 'first-project',
            title: '첫 프로젝트',
            description: '첫 번째 프로젝트를 생성했습니다.',
            icon: '🏆',
            achieved: true
        },
        {
            id: 'code-master',
            title: '코드 마스터',
            description: '10개 이상의 프로젝트를 생성했습니다.',
            icon: '🔥',
            achieved: false
        },
        {
            id: 'community-helper',
            title: '커뮤니티 헬퍼',
            description: '5개 이상의 게시물에 댓글을 달았습니다.',
            icon: '👥',
            achieved: true
        },
        {
            id: 'popular-project',
            title: '인기 프로젝트',
            description: '100회 이상 조회된 프로젝트를 보유했습니다.',
            icon: '⭐',
            achieved: false
        }
    ];
    
    achievements.forEach((achievement) => {
        const achievementCard = document.createElement('div');
        achievementCard.className = `achievement-card ${achievement.achieved ? 'achieved' : 'locked'}`;
        
        achievementCard.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <h3 class="achievement-title">${achievement.title}</h3>
            <p class="achievement-description">${achievement.description}</p>
            <div class="achievement-status">${achievement.achieved ? '달성' : '미달성'}</div>
        `;
        
        achievementsGrid.appendChild(achievementCard);
    });
}

document.addEventListener('DOMContentLoaded', initProfile);
