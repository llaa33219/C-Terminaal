// C-Terminaal 프로필 스크립트
// 사용자 프로필 관리, 팔로우, 업적 시스템 등

// 전역 변수
let currentUserId = null;
let currentUserData = null;
let isCurrentUserProfile = false;
let achievementCache = {};

// DOM 요소 (이름 충돌 방지를 위해 profileElements로 변경)
const profileElements = {
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
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user');
    
    if (userId) {
        loadUserProfile(userId);
    } else if (firebase.auth().currentUser) {
        loadCurrentUserProfile();
    } else {
        showLoginPrompt();
    }
    
    attachProfileEventListeners();
}

// 이벤트 리스너 등록
function attachProfileEventListeners() {
    profileElements.profileTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            const tabName = e.target.dataset.tab;
            if (tabName) {
                activateProfileTab(e.target, tabName);
            }
        });
    });
    
    if (profileElements.editProfileButton) {
        profileElements.editProfileButton.addEventListener('click', openEditProfileModal);
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
        const userDoc = await firebase.firestore().collection('users').doc(currentUserId).get();
        
        if (userDoc.exists) {
            currentUserData = userDoc.data();
            renderUserProfile(currentUserData);
        } else {
            await createUserProfile();
        }
        
        loadUserContent(currentUserId);
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
        
        const userDoc = await firebase.firestore().collection('users').doc(userId).get();
        
        if (!userDoc.exists) {
            throw new Error('사용자를 찾을 수 없습니다');
        }
        
        currentUserData = userDoc.data();
        renderUserProfile(currentUserData);
        loadUserContent(userId);
        toggleProfileActionButton(isCurrentUserProfile);
        
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
        await addAchievement('first-login');
    } catch (error) {
        console.error('프로필 생성 오류:', error);
        showNotification('프로필을 생성하는 데 실패했습니다: ' + error.message, 'error');
    }
}

// 사용자 프로필 렌더링
function renderUserProfile(userData) {
    if (!userData) return;
    
    if (profileElements.profileUsername) {
        profileElements.profileUsername.textContent = userData.username || '사용자';
    }
    
    if (profileElements.profileBio) {
        profileElements.profileBio.textContent = userData.bio || '소개가 없습니다';
    }
    
    if (profileElements.profileAvatar) {
        profileElements.profileAvatar.src = userData.avatarUrl || 'default-avatar.png';
        profileElements.profileAvatar.alt = userData.username || '사용자';
    }
    
    if (profileElements.projectsCount) {
        profileElements.projectsCount.textContent = userData.projectCount || 0;
    }
    
    if (profileElements.followersCount) {
        profileElements.followersCount.textContent = userData.followers || 0;
    }
    
    if (profileElements.followingCount) {
        profileElements.followingCount.textContent = userData.following || 0;
    }
}

// 사용자 콘텐츠 로드
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
        projectsGrid.innerHTML = '<div class="loading">프로젝트를 불러오는 중...</div>';
        
        let query = firebase.firestore().collection('projects')
            .where('userId', '==', userId)
            .orderBy('updatedAt', 'desc');
        
        if (!isCurrentUserProfile) {
            query = query.where('isPublic', '==', true);
        }
        
        const snapshot = await query.get();
        
        if (snapshot.empty) {
            projectsGrid.innerHTML = '<div class="no-content">프로젝트가 없습니다</div>';
            return;
        }
        
        projectsGrid.innerHTML = '';
        snapshot.forEach(doc => {
            const project = { id: doc.id, ...doc.data() };
            renderProjectCard(project, projectsGrid);
        });
        
        if (profileElements.projectsCount) {
            profileElements.projectsCount.textContent = snapshot.size;
        }
        
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
    
    projectCard.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            return;
        }
        openProjectDetail(project.id);
    });
    
    const editButton = projectCard.querySelector('.edit-project');
    if (editButton) {
        editButton.addEventListener('click', (e) => {
            e.stopPropagation();
            editProject(project.id);
        });
    }
    
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
        postsContainer.innerHTML = '<div class="loading">게시물을 불러오는 중...</div>';
        
        const snapshot = await firebase.firestore().collection('posts')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();
        
        if (snapshot.empty) {
            postsContainer.innerHTML = '<div class="no-content">게시물이 없습니다</div>';
            return;
        }
        
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
    
    postItem.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            return;
        }
        openPostDetail(post.id);
    });
    
    const editButton = postItem.querySelector('.edit-post');
    if (editButton) {
        editButton.addEventListener('click', (e) => {
            e.stopPropagation();
            editPost(post.id);
        });
    }
    
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
        achievementsGrid.innerHTML = '<div class="loading">업적을 불러오는 중...</div>';
        
        const achievementsData = await getAchievementsData();
        
        const userDoc = await firebase.firestore().collection('users').doc(userId).get();
        if (!userDoc.exists) {
            throw new Error('사용자를 찾을 수 없습니다');
        }
        
        const userData = userDoc.data();
        const userAchievements = userData.achievements || [];
        
        achievementsGrid.innerHTML = '';
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
    if (Object.keys(achievementCache).length > 0) {
        return achievementCache;
    }
    
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
    
    achievementCache = achievements;
    return achievements;
}

// 업적 카드 렌더링
function renderAchievementCard(achievementId, achievement, achieved, container) {
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
        const achievementsData = await getAchievementsData();
        
        if (!achievementsData[achievementId]) {
            console.error('존재하지 않는 업적:', achievementId);
            return false;
        }
        
        const userDoc = await firebase.firestore().collection('users').doc(userId).get();
        if (!userDoc.exists) {
            console.error('사용자를 찾을 수 없음:', userId);
            return false;
        }
        
        const userData = userDoc.data();
        const userAchievements = userData.achievements || [];
        
        if (userAchievements.includes(achievementId)) {
            return false;
        }
        
        userAchievements.push(achievementId);
        
        await firebase.firestore().collection('users').doc(userId).update({
            achievements: userAchievements
        });
        
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
        
        const followDoc = await firebase.firestore().collection('follows')
            .where('followerId', '==', userId)
            .where('followingId', '==', currentUserId)
            .get();
        
        const followButton = document.getElementById('follow-button');
        
        if (!followButton) return;
        
        if (!followDoc.empty) {
            followButton.textContent = '팔로우 취소';
            followButton.classList.add('following');
        } else {
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
        if (userId === currentUserId) {
            showNotification('자기 자신을 팔로우할 수 없습니다.', 'error');
            return;
        }
        
        const followQuery = firebase.firestore().collection('follows')
            .where('followerId', '==', userId)
            .where('followingId', '==', currentUserId);
        
        const followDoc = await followQuery.get();
        
        if (!followDoc.empty) {
            const batch = firebase.firestore().batch();
            followDoc.forEach(doc => {
                batch.delete(doc.ref);
            });
            batch.update(
                firebase.firestore().collection('users').doc(currentUserId),
                { followers: firebase.firestore.FieldValue.increment(-1) }
            );
            batch.update(
                firebase.firestore().collection('users').doc(userId),
                { following: firebase.firestore.FieldValue.increment(-1) }
            );
            await batch.commit();
            
            const followButton = document.getElementById('follow-button');
            if (followButton) {
                followButton.textContent = '팔로우';
                followButton.classList.remove('following');
            }
            
            const followersCount = document.getElementById('followers-count');
            if (followersCount) {
                const count = parseInt(followersCount.textContent) || 0;
                followersCount.textContent = Math.max(0, count - 1);
            }
            
            showNotification('팔로우를 취소했습니다.', 'info');
        } else {
            const batch = firebase.firestore().batch();
            const followRef = firebase.firestore().collection('follows').doc();
            batch.set(followRef, {
                followerId: userId,
                followingId: currentUserId,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            batch.update(
                firebase.firestore().collection('users').doc(currentUserId),
                { followers: firebase.firestore.FieldValue.increment(1) }
            );
            batch.update(
                firebase.firestore().collection('users').doc(userId),
                { following: firebase.firestore.FieldValue.increment(1) }
            );
            await batch.commit();
            
            const followButton = document.getElementById('follow-button');
            if (followButton) {
                followButton.textContent = '팔로우 취소';
                followButton.classList.add('following');
            }
            
            const followersCount = document.getElementById('followers-count');
            if (followersCount) {
                const count = parseInt(followersCount.textContent) || 0;
                followersCount.textContent = count + 1;
            }
            
            showNotification('팔로우했습니다.', 'success');
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
        const userDoc = await firebase.firestore().collection('users').doc(userId).get();
        if (!userDoc.exists) return;
        const userData = userDoc.data();
        if (userData.following >= 5) {
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
    
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer.firstChild);
    
    const modal = document.getElementById('edit-profile-modal');
    const closeButton = modal.querySelector('.close-modal');
    const form = document.getElementById('edit-profile-form');
    
    modal.style.display = 'flex';
    
    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.removeChild(modal);
    });
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await updateUserProfile();
        modal.style.display = 'none';
        document.body.removeChild(modal);
    });
    
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
        const username = document.getElementById('profile-username-input').value.trim();
        const bio = document.getElementById('profile-bio-input').value.trim();
        const avatarUrl = document.getElementById('profile-avatar-url').value.trim();
        
        if (!username) {
            showNotification('사용자명을 입력해주세요.', 'error');
            return;
        }
        
        const profileData = {
            username: username,
            bio: bio,
            avatarUrl: avatarUrl,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await firebase.auth().currentUser.updateProfile({
            displayName: username,
            photoURL: avatarUrl || null
        });
        
        await firebase.firestore().collection('users').doc(userId).update(profileData);
        currentUserData = { ...currentUserData, ...profileData };
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
    
    if (existingFollowButton) {
        existingFollowButton.remove();
    }
    
    if (isOwnProfile) {
        if (!existingButton) {
            const button = document.createElement('button');
            button.id = 'edit-profile';
            button.className = 'button';
            button.textContent = '프로필 수정';
            button.addEventListener('click', openEditProfileModal);
            actionContainer.appendChild(button);
        }
    } else if (firebase.auth().currentUser) {
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
    document.querySelectorAll('.tab-button').forEach(tab => {
        tab.classList.remove('active');
    });
    tabElement.classList.add('active');
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
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
            const projectCard = document.querySelector(`.project-card[data-project-id="${projectId}"]`);
            if (projectCard) {
                projectCard.remove();
            }
            
            const projectsCount = document.getElementById('projects-count');
            if (projectsCount) {
                const count = parseInt(projectsCount.textContent) || 0;
                projectsCount.textContent = Math.max(0, count - 1);
            }
            
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
        
        const postItem = document.querySelector(`.post-item[data-post-id="${postId}"]`);
        if (postItem) {
            postItem.remove();
        }
        
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
    window.location.href = `?project=${projectId}`;
}

// 게시물 상세 페이지 열기
function openPostDetail(postId) {
    if (typeof window.communityFunctions === 'object' && 
        typeof window.communityFunctions.openPostDetail === 'function') {
        
        const communityLink = document.querySelector('nav a[data-page="community"]');
        if (communityLink) {
            communityLink.click();
        }
        
        window.communityFunctions.openPostDetail(postId);
    } else {
        window.location.href = `?post=${postId}`;
    }
}

// 초기화 함수 등록
window.initProfile = initProfile;
window.profileFunctions = {
    loadUserProfile,
    toggleFollow,
    addAchievement,
    openEditProfileModal,
    updateUserProfile
};
