// C-Terminaal 프로필 스크립트
// 사용자 프로필 관리, 팔로우, 업적 시스템 등

// 전역 변수
let currentUserId = null;
let currentUserData = null;
let isCurrentUserProfile = false;
let achievementCache = {};

// DOM 요소
const elements = {
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

// 프로필 초기화
async function initProfile() {
    // URL 매개변수 확인 (user 파라미터 존재 시 특정 사용자 프로필 표시)
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user');
    
    if (userId) {
        // 다른 사용자 프로필 로드
        loadUserProfile(userId);
    } else if (firebase.auth().currentUser) {
        // 자신의 프로필 로드
        loadCurrentUserProfile();
    } else {
        // 로그인 유도
        showLoginPrompt();
    }
    
    // 이벤트 리스너
    attachProfileEventListeners();
}

// 이벤트 리스너 등록
function attachProfileEventListeners() {
    // 프로필 탭 전환
    elements.profileTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            const tabName = e.target.dataset.tab;
            if (tabName) {
                activateProfileTab(e.target, tabName);
            }
        });
    });
    
    // 프로필 수정 버튼
    if (elements.editProfileButton) {
        elements.editProfileButton.addEventListener('click', openEditProfileModal);
    }
}

// 현재 사용자 프로필 로드
async function loadCurrentUserProfile() {
    if (!firebase.auth().currentUser) {
        showLoginPrompt();
        return;
    }
    
    currentUserId = firebase.auth().currentUser.uid;
    isCurrentUserProfile = true;
    
    try {
        // 사용자 데이터 로드
        const userDoc = await firebase.firestore().collection('users').doc(currentUserId).get();
        
        if (userDoc.exists) {
            currentUserData = userDoc.data();
            renderUserProfile(currentUserData);
        } else {
            // 사용자 프로필이 없는 경우 생성
            await createUserProfile();
        }
        
        // 사용자 프로젝트, 게시물, 업적 로드
        loadUserContent(currentUserId);
        
        // 팔로우 버튼 대신 프로필 수정 버튼 표시
        toggleProfileActionButton(true);
    } catch (error) {
        console.error('프로필 로드 오류:', error);
        showNotification('프로필을 불러오는 데 실패했습니다: ' + error.message, 'error');
    }
}

// 다른 사용자 프로필 로드
async function loadUserProfile(userId) {
    try {
        currentUserId = userId;
        isCurrentUserProfile = firebase.auth().currentUser && firebase.auth().currentUser.uid === userId;
        
        // 사용자 데이터 로드
        const userDoc = await firebase.firestore().collection('users').doc(userId).get();
        
        if (!userDoc.exists) {
            throw new Error('사용자를 찾을 수 없습니다');
        }
        
        currentUserData = userDoc.data();
        renderUserProfile(currentUserData);
        
        // 사용자 프로젝트, 게시물, 업적 로드
        loadUserContent(userId);
        
        // 프로필 수정 버튼 또는 팔로우 버튼 표시
        toggleProfileActionButton(isCurrentUserProfile);
        
        // 팔로우 상태 확인 및 버튼 업데이트
        if (!isCurrentUserProfile && firebase.auth().currentUser) {
            checkFollowStatus();
        }
    } catch (error) {
        console.error('프로필 로드 오류:', error);
        showNotification('프로필을 불러오는 데 실패했습니다: ' + error.message, 'error');
    }
}

// 사용자 프로필 생성
async function createUserProfile() {
    if (!firebase.auth().currentUser) return;
    
    const user = firebase.auth().currentUser;
    
    try {
        const userData = {
            userId: user.uid,
            username: user.displayName || user.email.split('@')[0],
            email: user.email,
            bio: '',
            avatarUrl: user.photoURL || null,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            followers: 0,
            following: 0,
            projectCount: 0,
            postCount: 0,
            achievements: []
        };
        
        await firebase.firestore().collection('users').doc(user.uid).set(userData);
        
        currentUserData = userData;
        renderUserProfile(userData);
        
        // 첫 로그인 업적 추가
        await addAchievement('first-login');
    } catch (error) {
        console.error('프로필 생성 오류:', error);
        showNotification('프로필을 생성하는 데 실패했습니다: ' + error.message, 'error');
    }
}

// 사용자 프로필 렌더링
function renderUserProfile(userData) {
    if (!userData) return;
    
    // 프로필 기본 정보
    if (elements.profileUsername) {
        elements.profileUsername.textContent = userData.username || '사용자';
    }
    
    if (elements.profileBio) {
        elements.profileBio.textContent = userData.bio || '소개가 없습니다';
    }
    
    if (elements.profileAvatar) {
        elements.profileAvatar.src = userData.avatarUrl || 'default-avatar.png';
        elements.profileAvatar.alt = userData.username || '사용자';
    }
    
    // 통계 정보
    if (elements.projectsCount) {
        elements.projectsCount.textContent = userData.projectCount || 0;
    }
    
    if (elements.followersCount) {
        elements.followersCount.textContent = userData.followers || 0;
    }
    
    if (elements.followingCount) {
        elements.followingCount.textContent = userData.following || 0;
    }
}

// 사용자 콘텐츠 로드 (프로젝트, 게시물, 업적)
async function loadUserContent(userId) {
    loadUserProjects(userId);
    loadUserPosts(userId);
    loadUserAchievements(userId);
}

// 사용자 프로젝트 로드
async function loadUserProjects(userId) {
    const projectsGrid = document.querySelector('#user-projects .projects-grid');
    
    if (!projectsGrid) return;
    
    try {
        // 로딩 표시
        projectsGrid.innerHTML = '<div class="loading">프로젝트를 불러오는 중...</div>';
        
        // 프로젝트 조회
        let query = firebase.firestore().collection('projects')
            .where('userId', '==', userId)
            .orderBy('updatedAt', 'desc');
        
        // 자신의 프로필이 아닌 경우 공개 프로젝트만 표시
        if (!isCurrentUserProfile) {
            query = query.where('isPublic', '==', true);
        }
        
        const snapshot = await query.get();
        
        // 결과 처리
        if (snapshot.empty) {
            projectsGrid.innerHTML = '<div class="no-content">프로젝트가 없습니다</div>';
            return;
        }
        
        // 프로젝트 표시
        projectsGrid.innerHTML = '';
        
        snapshot.forEach(doc => {
            const project = { id: doc.id, ...doc.data() };
            renderProjectCard(project, projectsGrid);
        });
        
        // 프로젝트 수 업데이트
        if (elements.projectsCount) {
            elements.projectsCount.textContent = snapshot.size;
        }
        
        // 자신의 프로필인 경우 프로젝트 수 업데이트
        if (isCurrentUserProfile) {
            await firebase.firestore().collection('users').doc(userId).update({
                projectCount: snapshot.size
            });
        }
    } catch (error) {
        console.error('프로젝트 로드 오류:', error);
        projectsGrid.innerHTML = `
            <div class="error">
                <p>프로젝트를 불러오는 데 실패했습니다</p>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// 프로젝트 카드 렌더링
function renderProjectCard(project, container) {
    const projectCard = document.createElement('div');
    projectCard.className = 'project-card';
    projectCard.setAttribute('data-project-id', project.id);
    
    const createdAt = project.createdAt ? new Date(project.createdAt.seconds * 1000).toLocaleDateString() : '알 수 없는 날짜';
    
    const difficultyLabels = {
        'beginner': '초급',
        'intermediate': '중급',
        'advanced': '고급'
    };
    
    const difficultyLabel = difficultyLabels[project.difficulty] || project.difficulty || '기타';
    
    projectCard.innerHTML = `
        <div class="project-thumbnail">
            <img src="${project.thumbnail || 'default-project.png'}" alt="${project.title || '제목 없음'}">
        </div>
        <div class="project-info">
            <h3 class="project-title">${project.title || '제목 없음'}</h3>
            <p class="project-description">${truncateText(project.description || '설명 없음', 100)}</p>
            <div class="project-meta">
                <span class="project-difficulty">난이도: ${difficultyLabel}</span>
                <span class="project-date">작성일: ${createdAt}</span>
                <span class="project-views">조회 ${project.views || 0}</span>
            </div>
            <div class="project-tags">
                ${renderTags(project.tags)}
            </div>
            <div class="project-actions">
                ${
                    isCurrentUserProfile
                    ? `
                    <button class="button small edit-project" data-id="${project.id}">수정</button>
                    <button class="button small danger delete-project" data-id="${project.id}">삭제</button>
                    `
                    : ''
                }
            </div>
        </div>
    `;
    
    // 프로젝트 클릭 이벤트
    projectCard.addEventListener('click', (e) => {
        // 버튼 클릭은 무시
        if (e.target.tagName === 'BUTTON') {
            return;
        }
        
        // 프로젝트 상세 페이지로 이동
        openProjectDetail(project.id);
    });
    
    // 수정 버튼 이벤트
    const editButton = projectCard.querySelector('.edit-project');
    if (editButton) {
        editButton.addEventListener('click', (e) => {
            e.stopPropagation();
            editProject(project.id);
        });
    }
    
    // 삭제 버튼 이벤트
    const deleteButton = projectCard.querySelector('.delete-project');
    if (deleteButton) {
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            confirmDeleteProject(project.id);
        });
    }
    
    container.appendChild(projectCard);
}

// 태그 렌더링
function renderTags(tags) {
    if (!tags || !Array.isArray(tags) || tags.length === 0) {
        return '';
    }
    
    return tags.map(tag => `<span class="tag">${tag}</span>`).join('');
}

// 텍스트 잘라내기
function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// 사용자 게시물 로드
async function loadUserPosts(userId) {
    const postsContainer = document.querySelector('#user-posts .posts-list');
    
    if (!postsContainer) return;
    
    try {
        // 로딩 표시
        postsContainer.innerHTML = '<div class="loading">게시물을 불러오는 중...</div>';
        
        // 게시물 조회
        const snapshot = await firebase.firestore().collection('posts')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();
        
        // 결과 처리
        if (snapshot.empty) {
            postsContainer.innerHTML = '<div class="no-content">게시물이 없습니다</div>';
            return;
        }
        
        // 게시물 표시
        postsContainer.innerHTML = '';
        
        snapshot.forEach(doc => {
            const post = { id: doc.id, ...doc.data() };
            renderPostItem(post, postsContainer);
        });
    } catch (error) {
        console.error('게시물 로드 오류:', error);
        postsContainer.innerHTML = `
            <div class="error">
                <p>게시물을 불러오는 데 실패했습니다</p>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// 게시물 아이템 렌더링
function renderPostItem(post, container) {
    const postItem = document.createElement('div');
    postItem.className = 'post-item';
    postItem.setAttribute('data-post-id', post.id);
    
    const createdAt = post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() : '알 수 없는 날짜';
    
    const categoryLabels = {
        'question': '질문',
        'showcase': '작품 공유',
        'tutorial': '튜토리얼',
        'discussion': '토론'
    };
    
    const categoryLabel = categoryLabels[post.category] || post.category || '기타';
    
    postItem.innerHTML = `
        <div class="post-item-header">
            <h3 class="post-item-title">${post.title || '제목 없음'}</h3>
            <div class="post-item-meta">
                <span class="post-item-category">${categoryLabel}</span>
                <span class="post-item-date">${createdAt}</span>
            </div>
        </div>
        <div class="post-item-content">
            ${truncateText(post.content || '내용 없음', 150)}
        </div>
        <div class="post-item-footer">
            <div class="post-item-stats">
                <span class="post-item-views">조회 ${post.views || 0}</span>
                <span class="post-item-comments">댓글 ${post.commentCount || 0}</span>
                <span class="post-item-likes">좋아요 ${post.likes || 0}</span>
            </div>
            <div class="post-item-actions">
                ${
                    isCurrentUserProfile
                    ? `
                    <button class="button small edit-post" data-id="${post.id}">수정</button>
                    <button class="button small danger delete-post" data-id="${post.id}">삭제</button>
                    `
                    : ''
                }
            </div>
        </div>
    `;
    
    // 게시물 클릭 이벤트
    postItem.addEventListener('click', (e) => {
        // 버튼 클릭은 무시
        if (e.target.tagName === 'BUTTON') {
            return;
        }
        
        // 게시물 상세 페이지로 이동
        openPostDetail(post.id);
    });
    
    // 수정 버튼 이벤트
    const editButton = postItem.querySelector('.edit-post');
    if (editButton) {
        editButton.addEventListener('click', (e) => {
            e.stopPropagation();
            editPost(post.id);
        });
    }
    
    // 삭제 버튼 이벤트
    const deleteButton = postItem.querySelector('.delete-post');
    if (deleteButton) {
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            confirmDeletePost(post.id);
        });
    }
    
    container.appendChild(postItem);
}

// 사용자 업적 로드
async function loadUserAchievements(userId) {
    const achievementsGrid = document.querySelector('#user-achievements .achievements-grid');
    
    if (!achievementsGrid) return;
    
    try {
        // 로딩 표시
        achievementsGrid.innerHTML = '<div class="loading">업적을 불러오는 중...</div>';
        
        // 업적 데이터 로드
        const achievementsData = await getAchievementsData();
        
        // 사용자 업적 로드
        const userDoc = await firebase.firestore().collection('users').doc(userId).get();
        
        if (!userDoc.exists) {
            throw new Error('사용자를 찾을 수 없습니다');
        }
        
        const userData = userDoc.data();
        const userAchievements = userData.achievements || [];
        
        // 업적 표시
        achievementsGrid.innerHTML = '';
        
        // 모든 업적 표시 (획득 여부 표시)
        Object.keys(achievementsData).forEach(achievementId => {
            const achievement = achievementsData[achievementId];
            const achieved = userAchievements.includes(achievementId);
            
            renderAchievementCard(achievementId, achievement, achieved, achievementsGrid);
        });
    } catch (error) {
        console.error('업적 로드 오류:', error);
        achievementsGrid.innerHTML = `
            <div class="error">
                <p>업적을 불러오는 데 실패했습니다</p>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// 모든 업적 데이터 가져오기
async function getAchievementsData() {
    // 캐시 확인
    if (Object.keys(achievementCache).length > 0) {
        return achievementCache;
    }
    
    // 예시 업적 데이터 (실제 애플리케이션에서는 Firestore에서 로드)
    const achievements = {
        'first-login': {
            title: '환영합니다!',
            description: '첫 로그인 완료',
            icon: '👋',
            hidden: false
        },
        'first-project': {
            title: '첫 프로젝트',
            description: '첫 번째 프로젝트를 생성했습니다',
            icon: '🏆',
            hidden: false
        },
        'project-master': {
            title: '프로젝트 마스터',
            description: '10개 이상의 프로젝트를 생성했습니다',
            icon: '🔥',
            hidden: false
        },
        'social-butterfly': {
            title: '소셜 버터플라이',
            description: '5명 이상의 사용자를 팔로우했습니다',
            icon: '🦋',
            hidden: false
        },
        'community-helper': {
            title: '커뮤니티 헬퍼',
            description: '5개 이상의 게시물에 댓글을 달았습니다',
            icon: '👥',
            hidden: false
        },
        'popular-project': {
            title: '인기 프로젝트',
            description: '100회 이상 조회된 프로젝트를 보유했습니다',
            icon: '⭐',
            hidden: false
        },
        'coding-streak': {
            title: '코딩 스트릭',
            description: '7일 연속으로 프로젝트를 수정했습니다',
            icon: '📅',
            hidden: false
        },
        'hidden-achievement': {
            title: '숨겨진 업적',
            description: '특별한 작업을 완료했습니다',
            icon: '🎁',
            hidden: true
        }
    };
    
    // 캐시에 저장
    achievementCache = achievements;
    
    return achievements;
}

// 업적 카드 렌더링
function renderAchievementCard(achievementId, achievement, achieved, container) {
    // 숨겨진 업적이면서 획득하지 않은 경우 표시하지 않음
    if (achievement.hidden && !achieved) {
        return;
    }
    
    const achievementCard = document.createElement('div');
    achievementCard.className = `achievement-card ${achieved ? 'achieved' : 'locked'}`;
    achievementCard.setAttribute('data-achievement-id', achievementId);
    
    achievementCard.innerHTML = `
        <div class="achievement-icon">${achievement.icon}</div>
        <h3 class="achievement-title">${achievement.title}</h3>
        <p class="achievement-description">${achievement.description}</p>
        <div class="achievement-status">${achieved ? '달성' : '미달성'}</div>
    `;
    
    container.appendChild(achievementCard);
}

// 업적 추가
async function addAchievement(achievementId) {
    if (!firebase.auth().currentUser) return false;
    
    try {
        const userId = firebase.auth().currentUser.uid;
        
        // 업적 데이터 확인
        const achievementsData = await getAchievementsData();
        
        if (!achievementsData[achievementId]) {
            console.error('존재하지 않는 업적:', achievementId);
            return false;
        }
        
        // 사용자 데이터 로드
        const userDoc = await firebase.firestore().collection('users').doc(userId).get();
        
        if (!userDoc.exists) {
            console.error('사용자를 찾을 수 없음:', userId);
            return false;
        }
        
        const userData = userDoc.data();
        const userAchievements = userData.achievements || [];
        
        // 이미 획득한 업적인지 확인
        if (userAchievements.includes(achievementId)) {
            return false;
        }
        
        // 업적 추가
        userAchievements.push(achievementId);
        
        // 사용자 문서 업데이트
        await firebase.firestore().collection('users').doc(userId).update({
            achievements: userAchievements
        });
        
        // 알림 표시
        const achievement = achievementsData[achievementId];
        showNotification(`🎉 새 업적 획득: ${achievement.title}`, 'success');
        
        return true;
    } catch (error) {
        console.error('업적 추가 오류:', error);
        return false;
    }
}

// 팔로우 상태 확인
async function checkFollowStatus() {
    if (!firebase.auth().currentUser || !currentUserId) return;
    
    try {
        const userId = firebase.auth().currentUser.uid;
        
        // 이미 팔로우 중인지 확인
        const followDoc = await firebase.firestore().collection('follows')
            .where('followerId', '==', userId)
            .where('followingId', '==', currentUserId)
            .get();
        
        const followButton = document.getElementById('follow-button');
        
        if (!followButton) return;
        
        if (!followDoc.empty) {
            // 이미 팔로우 중
            followButton.textContent = '팔로우 취소';
            followButton.classList.add('following');
        } else {
            // 팔로우 중이 아님
            followButton.textContent = '팔로우';
            followButton.classList.remove('following');
        }
    } catch (error) {
        console.error('팔로우 상태 확인 오류:', error);
    }
}

// 팔로우 또는 팔로우 취소
async function toggleFollow() {
    if (!firebase.auth().currentUser || !currentUserId) {
        showNotification('로그인 후 이용해주세요.', 'error');
        return;
    }
    
    try {
        const userId = firebase.auth().currentUser.uid;
        
        // 자기 자신을 팔로우할 수 없음
        if (userId === currentUserId) {
            showNotification('자기 자신을 팔로우할 수 없습니다.', 'error');
            return;
        }
        
        // 이미 팔로우 중인지 확인
        const followQuery = firebase.firestore().collection('follows')
            .where('followerId', '==', userId)
            .where('followingId', '==', currentUserId);
        
        const followDoc = await followQuery.get();
        
        if (!followDoc.empty) {
            // 팔로우 취소
            const batch = firebase.firestore().batch();
            
            // 팔로우 문서 삭제
            followDoc.forEach(doc => {
                batch.delete(doc.ref);
            });
            
            // 팔로워 수 감소
            batch.update(
                firebase.firestore().collection('users').doc(currentUserId),
                { followers: firebase.firestore.FieldValue.increment(-1) }
            );
            
            // 팔로잉 수 감소
            batch.update(
                firebase.firestore().collection('users').doc(userId),
                { following: firebase.firestore.FieldValue.increment(-1) }
            );
            
            await batch.commit();
            
            // 버튼 업데이트
            const followButton = document.getElementById('follow-button');
            if (followButton) {
                followButton.textContent = '팔로우';
                followButton.classList.remove('following');
            }
            
            // 팔로워 수 UI 업데이트
            const followersCount = document.getElementById('followers-count');
            if (followersCount) {
                const count = parseInt(followersCount.textContent) || 0;
                followersCount.textContent = Math.max(0, count - 1);
            }
            
            showNotification('팔로우를 취소했습니다.', 'info');
        } else {
            // 팔로우 추가
            const batch = firebase.firestore().batch();
            
            // 팔로우 문서 생성
            const followRef = firebase.firestore().collection('follows').doc();
            batch.set(followRef, {
                followerId: userId,
                followingId: currentUserId,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // 팔로워 수 증가
            batch.update(
                firebase.firestore().collection('users').doc(currentUserId),
                { followers: firebase.firestore.FieldValue.increment(1) }
            );
            
            // 팔로잉 수 증가
            batch.update(
                firebase.firestore().collection('users').doc(userId),
                { following: firebase.firestore.FieldValue.increment(1) }
            );
            
            await batch.commit();
            
            // 버튼 업데이트
            const followButton = document.getElementById('follow-button');
            if (followButton) {
                followButton.textContent = '팔로우 취소';
                followButton.classList.add('following');
            }
            
            // 팔로워 수 UI 업데이트
            const followersCount = document.getElementById('followers-count');
            if (followersCount) {
                const count = parseInt(followersCount.textContent) || 0;
                followersCount.textContent = count + 1;
            }
            
            showNotification('팔로우했습니다.', 'success');
            
            // 소셜 버터플라이 업적 확인
            checkSocialButterflyAchievement();
        }
    } catch (error) {
        console.error('팔로우 토글 오류:', error);
        showNotification('팔로우 처리에 실패했습니다: ' + error.message, 'error');
    }
}

// 소셜 버터플라이 업적 확인
async function checkSocialButterflyAchievement() {
    if (!firebase.auth().currentUser) return;
    
    try {
        const userId = firebase.auth().currentUser.uid;
        
        // 팔로잉 수 확인
        const userDoc = await firebase.firestore().collection('users').doc(userId).get();
        
        if (!userDoc.exists) return;
        
        const userData = userDoc.data();
        
        if (userData.following >= 5) {
            // 업적 추가
            addAchievement('social-butterfly');
        }
    } catch (error) {
        console.error('업적 확인 오류:', error);
    }
}

// 프로필 수정 모달 열기
function openEditProfileModal() {
    if (!firebase.auth().currentUser || !isCurrentUserProfile) {
        showNotification('자신의 프로필만 수정할 수 있습니다.', 'error');
        return;
    }
    
    // 모달 HTML 생성
    const modalHTML = `
        <div id="edit-profile-modal" class="modal">
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>프로필 수정</h2>
                <form id="edit-profile-form">
                    <div class="form-group">
                        <label for="profile-username-input">사용자명</label>
                        <input type="text" id="profile-username-input" value="${currentUserData.username || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="profile-bio-input">소개</label>
                        <textarea id="profile-bio-input" rows="3">${currentUserData.bio || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="profile-avatar-url">프로필 이미지 URL</label>
                        <input type="text" id="profile-avatar-url" value="${currentUserData.avatarUrl || ''}">
                        <p class="form-help">이미지 URL을 입력하거나 비워두세요</p>
                    </div>
                    <button type="submit" class="button primary">저장</button>
                </form>
            </div>
        </div>
    `;
    
    // 모달 추가
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer.firstChild);
    
    // 모달 엘리먼트
    const modal = document.getElementById('edit-profile-modal');
    const closeButton = modal.querySelector('.close-modal');
    const form = document.getElementById('edit-profile-form');
    
    // 모달 표시
    modal.style.display = 'flex';
    
    // 닫기 버튼 이벤트
    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.removeChild(modal);
    });
    
    // 폼 제출 이벤트
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await updateUserProfile();
        modal.style.display = 'none';
        document.body.removeChild(modal);
    });
    
    // 모달 외부 클릭 시 닫기
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.removeChild(modal);
        }
    });
}

// 사용자 프로필 업데이트
async function updateUserProfile() {
    if (!firebase.auth().currentUser) {
        showNotification('로그인 후 이용해주세요.', 'error');
        return;
    }
    
    try {
        const userId = firebase.auth().currentUser.uid;
        
        // 입력값 가져오기
        const username = document.getElementById('profile-username-input').value.trim();
        const bio = document.getElementById('profile-bio-input').value.trim();
        const avatarUrl = document.getElementById('profile-avatar-url').value.trim();
        
        // 유효성 검사
        if (!username) {
            showNotification('사용자명을 입력해주세요.', 'error');
            return;
        }
        
        // 프로필 데이터
        const profileData = {
            username: username,
            bio: bio,
            avatarUrl: avatarUrl,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Firebase 인증 표시 이름 업데이트
        await firebase.auth().currentUser.updateProfile({
            displayName: username,
            photoURL: avatarUrl || null
        });
        
        // Firestore 사용자 데이터 업데이트
        await firebase.firestore().collection('users').doc(userId).update(profileData);
        
        // 로컬 상태 업데이트
        currentUserData = { ...currentUserData, ...profileData };
        
        // UI 업데이트
        renderUserProfile(currentUserData);
        
        showNotification('프로필이 업데이트되었습니다.', 'success');
    } catch (error) {
        console.error('프로필 업데이트 오류:', error);
        showNotification('프로필 업데이트에 실패했습니다: ' + error.message, 'error');
    }
}

// 프로필 수정 또는 팔로우 버튼 토글
function toggleProfileActionButton(isOwnProfile) {
    const actionContainer = document.querySelector('.profile-header');
    
    if (!actionContainer) return;
    
    const existingButton = document.getElementById('edit-profile');
    const existingFollowButton = document.getElementById('follow-button');
    
    // 기존 버튼 제거
    if (existingFollowButton) {
        existingFollowButton.remove();
    }
    
    if (isOwnProfile) {
        // 자신의 프로필인 경우 - 수정 버튼
        if (!existingButton) {
            const button = document.createElement('button');
            button.id = 'edit-profile';
            button.className = 'button';
            button.textContent = '프로필 수정';
            button.addEventListener('click', openEditProfileModal);
            
            actionContainer.appendChild(button);
        }
    } else if (firebase.auth().currentUser) {
        // 다른 사용자 프로필 - 팔로우 버튼
        const followButton = document.createElement('button');
        followButton.id = 'follow-button';
        followButton.className = 'button';
        followButton.textContent = '팔로우';
        followButton.addEventListener('click', toggleFollow);
        
        if (existingButton) {
            actionContainer.replaceChild(followButton, existingButton);
        } else {
            actionContainer.appendChild(followButton);
        }
    }
}

// 프로필 탭 활성화
function activateProfileTab(tabElement, tabName) {
    // 모든 탭 비활성화
    document.querySelectorAll('.tab-button').forEach(tab => {
        tab.classList.remove('active');
    });
    tabElement.classList.add('active');
    
    // 모든 탭 콘텐츠 숨기기
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // 선택한 탭 콘텐츠 표시
    const contentElement = document.getElementById(tabName);
    if (contentElement) {
        contentElement.classList.add('active');
    }
}

// 로그인 유도 메시지
function showLoginPrompt() {
    const container = document.querySelector('.profile-container');
    
    if (!container) return;
    
    container.innerHTML = `
        <div class="login-prompt">
            <h2>로그인이 필요합니다</h2>
            <p>프로필 기능을 이용하려면 로그인해주세요.</p>
            <button id="login-prompt-button" class="button primary">로그인</button>
        </div>
    `;
    
    const loginButton = document.getElementById('login-prompt-button');
    
    if (loginButton) {
        loginButton.addEventListener('click', () => {
            if (typeof openLoginModal === 'function') {
                openLoginModal();
            }
        });
    }
}

// 프로젝트 수정
function editProject(projectId) {
    if (typeof window.storageFunctions === 'object' && 
        typeof window.storageFunctions.loadProjectForEditing === 'function') {
        window.storageFunctions.loadProjectForEditing(projectId);
    } else {
        showNotification('프로젝트 편집 기능을 사용할 수 없습니다.', 'error');
    }
}

// 프로젝트 삭제 확인
function confirmDeleteProject(projectId) {
    if (confirm('정말로 이 프로젝트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
        deleteProject(projectId);
    }
}

// 프로젝트 삭제
async function deleteProject(projectId) {
    if (typeof window.storageFunctions === 'object' && 
        typeof window.storageFunctions.deleteProject === 'function') {
        
        const result = await window.storageFunctions.deleteProject(projectId);
        
        if (result.success) {
            // UI에서 프로젝트 카드 제거
            const projectCard = document.querySelector(`.project-card[data-project-id="${projectId}"]`);
            if (projectCard) {
                projectCard.remove();
            }
            
            // 프로젝트 수 업데이트
            const projectsCount = document.getElementById('projects-count');
            if (projectsCount) {
                const count = parseInt(projectsCount.textContent) || 0;
                projectsCount.textContent = Math.max(0, count - 1);
            }
            
            // 프로젝트가 없는 경우 메시지 표시
            const projectsGrid = document.querySelector('#user-projects .projects-grid');
            if (projectsGrid && projectsGrid.childElementCount === 0) {
                projectsGrid.innerHTML = '<div class="no-content">프로젝트가 없습니다</div>';
            }
        }
    } else {
        showNotification('프로젝트 삭제 기능을 사용할 수 없습니다.', 'error');
    }
}

// 게시물 수정
function editPost(postId) {
    if (typeof window.communityFunctions === 'object' && 
        typeof window.communityFunctions.editPost === 'function') {
        window.communityFunctions.editPost(postId);
    } else {
        showNotification('게시물 수정 기능을 사용할 수 없습니다.', 'error');
    }
}

// 게시물 삭제 확인
function confirmDeletePost(postId) {
    if (confirm('정말로 이 게시물을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
        deletePost(postId);
    }
}

// 게시물 삭제
async function deletePost(postId) {
    if (typeof window.communityFunctions === 'object' && 
        typeof window.communityFunctions.deletePost === 'function') {
        
        await window.communityFunctions.deletePost(postId);
        
        // UI에서 게시물 아이템 제거
        const postItem = document.querySelector(`.post-item[data-post-id="${postId}"]`);
        if (postItem) {
            postItem.remove();
        }
        
        // 게시물이 없는 경우 메시지 표시
        const postsContainer = document.querySelector('#user-posts .posts-list');
        if (postsContainer && postsContainer.childElementCount === 0) {
            postsContainer.innerHTML = '<div class="no-content">게시물이 없습니다</div>';
        }
    } else {
        showNotification('게시물 삭제 기능을 사용할 수 없습니다.', 'error');
    }
}

// 프로젝트 상세 페이지 열기
function openProjectDetail(projectId) {
    // 프로젝트 매개변수가 있는 URL로 이동
    window.location.href = `?project=${projectId}`;
}

// 게시물 상세 페이지 열기
function openPostDetail(postId) {
    if (typeof window.communityFunctions === 'object' && 
        typeof window.communityFunctions.openPostDetail === 'function') {
        
        // 커뮤니티 페이지로 이동
        const communityLink = document.querySelector('nav a[data-page="community"]');
        if (communityLink) {
            communityLink.click();
        }
        
        // 게시물 상세 페이지 열기
        window.communityFunctions.openPostDetail(postId);
    } else {
        // 직접 URL로 이동
        window.location.href = `?post=${postId}`;
    }
}

// 초기화 함수 등록
window.initProfile = initProfile;

// 외부에서 사용할 함수 공개
window.profileFunctions = {
    loadUserProfile,
    toggleFollow,
    addAchievement,
    openEditProfileModal,
    updateUserProfile
};