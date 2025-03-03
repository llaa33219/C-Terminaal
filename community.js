// C-Terminaal 커뮤니티 스크립트
// 게시물 작성, 조회, 댓글, 추천 기능

// 전역 변수
let currentPostId = null;
let currentPost = null;
let isPostDetailView = false;
let postCache = {};
let commentCache = {};

// DOM 요소
const elements = {
    postsContainer: document.getElementById('posts-container'),
    postCategorySelect: document.getElementById('post-category'),
    postSearch: document.getElementById('post-search'),
    searchButton: document.getElementById('search-button'),
    newPostButton: document.getElementById('new-post'),
    postForm: document.getElementById('post-form'),
    postTitle: document.getElementById('post-title'),
    postCategory: document.getElementById('post-category-select'),
    postContent: document.getElementById('post-content'),
    postTags: document.getElementById('post-tags'),
    prevPageButton: document.getElementById('prev-page'),
    nextPageButton: document.getElementById('next-page'),
    pageInfo: document.getElementById('page-info')
};

// 초기화
function initCommunity() {
    // URL 매개변수 확인 (post 파라미터 존재 시 게시물 상세 표시)
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('post');
    
    if (postId) {
        openPostDetail(postId);
    } else {
        loadCommunityPosts();
    }
    
    // 이벤트 리스너
    attachCommunityEventListeners();
}

// 이벤트 리스너 등록
function attachCommunityEventListeners() {
    // 카테고리 필터링
    elements.postCategorySelect.addEventListener('change', () => {
        loadCommunityPosts();
    });
    
    // 검색
    elements.searchButton.addEventListener('click', () => {
        loadCommunityPosts();
    });
    
    // 엔터 키로 검색
    elements.postSearch.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            loadCommunityPosts();
        }
    });
    
    // 새 게시물 작성
    elements.newPostButton.addEventListener('click', openNewPostModal);
    
    // 게시물 작성 폼 제출
    elements.postForm.addEventListener('submit', (e) => {
        e.preventDefault();
        submitPost();
    });
    
    // 페이지 네비게이션
    elements.prevPageButton.addEventListener('click', () => navigateCommunityPage(-1));
    elements.nextPageButton.addEventListener('click', () => navigateCommunityPage(1));
}

// 게시물 목록 로드
async function loadCommunityPosts() {
    // 게시물 상세 보기 상태에서 뒤로 가기
    if (isPostDetailView) {
        isPostDetailView = false;
    }
    
    // 로딩 표시
    elements.postsContainer.innerHTML = '<div class="loading">게시물을 불러오는 중...</div>';
    
    // 필터 및 검색 값 가져오기
    const category = elements.postCategorySelect.value;
    const searchQuery = elements.postSearch.value.trim();
    const page = window.state ? window.state.communityPage || 1 : 1;
    const postsPerPage = 10;
    
    try {
        // Firestore 쿼리 구성
        let query = firebase.firestore().collection('posts')
            .orderBy('createdAt', 'desc');
        
        // 카테고리 필터링
        if (category && category !== 'all') {
            query = query.where('category', '==', category);
        }
        
        // 검색어 필터링 (제목 또는 내용)
        if (searchQuery) {
            // 간단한 검색 구현 (Firestore는 전체 텍스트 검색을 직접 지원하지 않음)
            // 실제 앱에서는 Algolia 같은 서비스 또는 Cloud Functions를 사용하는 것이 좋음
            query = query.where('titleLower', '>=', searchQuery.toLowerCase())
                         .where('titleLower', '<=', searchQuery.toLowerCase() + '\uf8ff');
        }
        
        // 페이지네이션 구현
        const offset = (page - 1) * postsPerPage;
        query = query.limit(postsPerPage);
        
        // 쿼리 실행
        const snapshot = await query.get();
        
        // 결과 처리
        if (snapshot.empty) {
            elements.postsContainer.innerHTML = `
                <div class="no-content">
                    <p>게시물이 없습니다</p>
                    ${
                        searchQuery || category !== 'all' 
                        ? '<p>검색 조건을 변경해보세요</p>' 
                        : ''
                    }
                </div>
            `;
            return;
        }
        
        // 게시물 표시
        elements.postsContainer.innerHTML = '';
        
        const posts = [];
        snapshot.forEach(doc => {
            const post = { id: doc.id, ...doc.data() };
            posts.push(post);
            renderPostCard(post);
            
            // 캐시에 저장
            postCache[post.id] = post;
        });
        
        // 상태 업데이트
        if (window.state) {
            window.state.posts = posts;
            window.state.totalCommunityPages = Math.ceil(snapshot.size / postsPerPage);
            updateCommunityPagination();
        }
    } catch (error) {
        console.error('게시물 로드 오류:', error);
        elements.postsContainer.innerHTML = `
            <div class="error">
                <p>게시물을 불러오는 데 실패했습니다</p>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// 게시물 카드 렌더링
function renderPostCard(post) {
    const postCard = document.createElement('div');
    postCard.className = 'post-card';
    postCard.setAttribute('data-post-id', post.id);
    
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
    
    // 게시물 클릭 이벤트 등록
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
    
    elements.postsContainer.appendChild(postCard);
}

// 텍스트 자르기 유틸리티
function truncateText(text, maxLength) {
    if (!text) return '';
    
    // 마크다운 태그 기본 제거
    text = text.replace(/\*\*|__|\*|_|~~|`|#|\|/g, '');
    
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// 게시물 상세 보기
async function openPostDetail(postId) {
    try {
        // 로딩 표시
        elements.postsContainer.innerHTML = '<div class="loading">게시물을 불러오는 중...</div>';
        
        // 캐시에서 게시물 확인
        let post = postCache[postId];
        
        // 캐시에 없으면 DB에서 로드
        if (!post) {
            const doc = await firebase.firestore().collection('posts').doc(postId).get();
            
            if (!doc.exists) {
                throw new Error('게시물을 찾을 수 없습니다');
            }
            
            post = { id: doc.id, ...doc.data() };
            postCache[postId] = post;
        }
        
        // URL 업데이트 (브라우저 히스토리에 추가)
        const url = new URL(window.location);
        url.searchParams.set('post', postId);
        window.history.pushState({}, '', url);
        
        // 상태 업데이트
        currentPostId = postId;
        currentPost = post;
        isPostDetailView = true;
        
        // 조회수 증가
        if (firebase.auth().currentUser && firebase.auth().currentUser.uid !== post.userId) {
            firebase.firestore().collection('posts').doc(postId).update({
                views: firebase.firestore.FieldValue.increment(1)
            });
        }
        
        // 게시물 렌더링
        renderPostDetail(post);
        
        // 댓글 로드
        loadComments(postId);
    } catch (error) {
        console.error('게시물 상세 로드 오류:', error);
        elements.postsContainer.innerHTML = `
            <div class="error">
                <p>게시물을 불러오는 데 실패했습니다</p>
                <p>${error.message}</p>
                <button class="button" onclick="loadCommunityPosts()">게시물 목록으로 돌아가기</button>
            </div>
        `;
    }
}

// 게시물 상세 렌더링
function renderPostDetail(post) {
    // 작성자 정보
    const authorName = post.authorName || '알 수 없는 사용자';
    const createdAt = post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() : '알 수 없는 날짜';
    
    // 카테고리 라벨
    const categoryLabels = {
        'question': '질문',
        'showcase': '작품 공유',
        'tutorial': '튜토리얼',
        'discussion': '토론'
    };
    
    const categoryLabel = categoryLabels[post.category] || post.category;
    
    // 마크다운 변환 (Marked 라이브러리 사용)
    const contentHtml = marked.parse(post.content);
    
    // 태그 렌더링
    const tagsHtml = post.tags && post.tags.length 
        ? post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')
        : '';
    
    // 프로젝트 연결 정보
    const projectLinkHtml = post.projectId 
        ? `<div class="post-project-link">
            <h4>연결된 프로젝트</h4>
            <a href="?project=${post.projectId}" class="button small">프로젝트 보기</a>
          </div>`
        : '';
    
    // 게시물 상세 HTML
    const postDetailHtml = `
        <div class="post-detail">
            <div class="post-detail-header">
                <h2 class="post-detail-title">${post.title}</h2>
                <div class="post-detail-meta">
                    <span class="post-detail-category">${categoryLabel}</span>
                    <span class="post-detail-author">작성자: ${authorName}</span>
                    <span class="post-detail-date">작성일: ${createdAt}</span>
                    <span class="post-detail-views">조회수: ${post.views || 0}</span>
                </div>
                ${tagsHtml ? `<div class="post-detail-tags">${tagsHtml}</div>` : ''}
            </div>
            
            <div class="post-detail-content">
                ${contentHtml}
            </div>
            
            ${projectLinkHtml}
            
            <div class="post-detail-actions">
                <button id="like-post-button" class="button">
                    <span class="like-icon">👍</span> 좋아요 <span class="like-count">${post.likes || 0}</span>
                </button>
                ${
                    firebase.auth().currentUser && firebase.auth().currentUser.uid === post.userId
                    ? `
                    <button id="edit-post-button" class="button">수정</button>
                    <button id="delete-post-button" class="button danger">삭제</button>
                    `
                    : ''
                }
                <button id="back-to-posts-button" class="button">목록으로</button>
            </div>
            
            <div class="post-comments-section">
                <h3>댓글 <span id="comment-count">${post.commentCount || 0}</span></h3>
                
                <div id="comment-form-container">
                    ${
                        firebase.auth().currentUser
                        ? `
                        <form id="comment-form">
                            <div class="form-group">
                                <textarea id="comment-content" rows="3" placeholder="댓글을 작성하세요..."></textarea>
                            </div>
                            <button type="submit" class="button primary">댓글 작성</button>
                        </form>
                        `
                        : `
                        <div class="login-to-comment">
                            <p>댓글을 작성하려면 <a href="#" id="login-to-comment-link">로그인</a>하세요.</p>
                        </div>
                        `
                    }
                </div>
                
                <div id="comments-container">
                    <div class="loading">댓글을 불러오는 중...</div>
                </div>
            </div>
        </div>
    `;
    
    // 컨테이너에 렌더링
    elements.postsContainer.innerHTML = postDetailHtml;
    
    // 이벤트 리스너 등록
    attachPostDetailEventListeners(post);
}

// 게시물 상세 이벤트 리스너 등록
function attachPostDetailEventListeners(post) {
    // 뒤로 가기 버튼
    const backButton = document.getElementById('back-to-posts-button');
    if (backButton) {
        backButton.addEventListener('click', () => {
            // URL에서 post 파라미터 제거
            const url = new URL(window.location);
            url.searchParams.delete('post');
            window.history.pushState({}, '', url);
            
            // 게시물 목록 로드
            loadCommunityPosts();
        });
    }
    
    // 좋아요 버튼
    const likeButton = document.getElementById('like-post-button');
    if (likeButton) {
        likeButton.addEventListener('click', () => {
            likePost(post.id);
        });
    }
    
    // 수정 버튼
    const editButton = document.getElementById('edit-post-button');
    if (editButton) {
        editButton.addEventListener('click', () => {
            editPost(post.id);
        });
    }
    
    // 삭제 버튼
    const deleteButton = document.getElementById('delete-post-button');
    if (deleteButton) {
        deleteButton.addEventListener('click', () => {
            confirmDeletePost(post.id);
        });
    }
    
    // 댓글 작성 폼
    const commentForm = document.getElementById('comment-form');
    if (commentForm) {
        commentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            submitComment(post.id);
        });
    }
    
    // 로그인 링크
    const loginLink = document.getElementById('login-to-comment-link');
    if (loginLink) {
        loginLink.addEventListener('click', (e) => {
            e.preventDefault();
            // 로그인 모달 열기
            if (typeof openLoginModal === 'function') {
                openLoginModal();
            }
        });
    }
}

// 댓글 로드
async function loadComments(postId) {
    const commentsContainer = document.getElementById('comments-container');
    
    if (!commentsContainer) return;
    
    try {
        // 로딩 표시
        commentsContainer.innerHTML = '<div class="loading">댓글을 불러오는 중...</div>';
        
        // 댓글 조회
        const snapshot = await firebase.firestore().collection('posts')
            .doc(postId)
            .collection('comments')
            .orderBy('createdAt', 'asc')
            .get();
        
        // 결과 처리
        if (snapshot.empty) {
            commentsContainer.innerHTML = '<div class="no-comments">아직 댓글이 없습니다.</div>';
            return;
        }
        
        // 댓글 표시
        commentsContainer.innerHTML = '';
        
        snapshot.forEach(doc => {
            const comment = { id: doc.id, ...doc.data() };
            renderComment(comment, commentsContainer);
            
            // 캐시에 저장
            commentCache[comment.id] = comment;
        });
    } catch (error) {
        console.error('댓글 로드 오류:', error);
        commentsContainer.innerHTML = `
            <div class="error">
                <p>댓글을 불러오는 데 실패했습니다</p>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// 댓글 렌더링
function renderComment(comment, container) {
    const commentElement = document.createElement('div');
    commentElement.className = 'comment';
    commentElement.setAttribute('data-comment-id', comment.id);
    
    const authorName = comment.authorName || '알 수 없는 사용자';
    const createdAt = comment.createdAt ? new Date(comment.createdAt.seconds * 1000).toLocaleString() : '알 수 없는 날짜';
    
    commentElement.innerHTML = `
        <div class="comment-header">
            <div class="comment-author">
                <img src="${comment.authorAvatar || 'default-avatar.png'}" alt="${authorName}" class="comment-avatar">
                <span class="comment-author-name">${authorName}</span>
            </div>
            <div class="comment-date">${createdAt}</div>
        </div>
        <div class="comment-content">${comment.content}</div>
        <div class="comment-actions">
            ${
                firebase.auth().currentUser && firebase.auth().currentUser.uid === comment.userId
                ? `
                <button class="comment-delete-button button small danger">삭제</button>
                `
                : ''
            }
        </div>
    `;
    
    // 댓글 삭제 버튼 이벤트 리스너
    const deleteButton = commentElement.querySelector('.comment-delete-button');
    if (deleteButton) {
        deleteButton.addEventListener('click', () => {
            deleteComment(currentPostId, comment.id);
        });
    }
    
    container.appendChild(commentElement);
}

// 댓글 작성
async function submitComment(postId) {
    if (!firebase.auth().currentUser) {
        showNotification('로그인 후 이용해주세요.', 'error');
        return;
    }
    
    const commentContent = document.getElementById('comment-content');
    
    if (!commentContent || !commentContent.value.trim()) {
        showNotification('댓글 내용을 입력해주세요.', 'error');
        return;
    }
    
    try {
        const userId = firebase.auth().currentUser.uid;
        const user = firebase.auth().currentUser;
        
        // 댓글 데이터
        const commentData = {
            content: commentContent.value.trim(),
            userId: userId,
            authorName: user.displayName || user.email,
            authorAvatar: user.photoURL || null,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // 댓글 저장
        const commentRef = await firebase.firestore().collection('posts')
            .doc(postId)
            .collection('comments')
            .add(commentData);
        
        // 게시물 댓글 수 증가
        await firebase.firestore().collection('posts')
            .doc(postId)
            .update({
                commentCount: firebase.firestore.FieldValue.increment(1)
            });
        
        // 입력 필드 초기화
        commentContent.value = '';
        
        // 댓글 수 업데이트
        const commentCountElement = document.getElementById('comment-count');
        if (commentCountElement) {
            const currentCount = parseInt(commentCountElement.textContent) || 0;
            commentCountElement.textContent = currentCount + 1;
        }
        
        // 새 댓글 추가 (저장 후 자동으로 표시)
        const commentsContainer = document.getElementById('comments-container');
        if (commentsContainer) {
            // 댓글이 없다는 메시지 삭제
            const noCommentsElement = commentsContainer.querySelector('.no-comments');
            if (noCommentsElement) {
                commentsContainer.removeChild(noCommentsElement);
            }
            
            // 새 댓글 렌더링
            const comment = {
                id: commentRef.id,
                ...commentData,
                createdAt: { seconds: Date.now() / 1000 } // 임시 타임스탬프 (즉시 표시용)
            };
            renderComment(comment, commentsContainer);
        }
        
        showNotification('댓글이 작성되었습니다.', 'success');
    } catch (error) {
        console.error('댓글 작성 오류:', error);
        showNotification('댓글 작성에 실패했습니다: ' + error.message, 'error');
    }
}

// 댓글 삭제
async function deleteComment(postId, commentId) {
    if (!firebase.auth().currentUser) {
        showNotification('로그인 후 이용해주세요.', 'error');
        return;
    }
    
    if (!confirm('댓글을 삭제하시겠습니까?')) {
        return;
    }
    
    try {
        // 댓글 삭제
        await firebase.firestore().collection('posts')
            .doc(postId)
            .collection('comments')
            .doc(commentId)
            .delete();
        
        // 게시물 댓글 수 감소
        await firebase.firestore().collection('posts')
            .doc(postId)
            .update({
                commentCount: firebase.firestore.FieldValue.increment(-1)
            });
        
        // 댓글 수 업데이트
        const commentCountElement = document.getElementById('comment-count');
        if (commentCountElement) {
            const currentCount = parseInt(commentCountElement.textContent) || 0;
            commentCountElement.textContent = Math.max(0, currentCount - 1);
        }
        
        // 댓글 요소 제거
        const commentElement = document.querySelector(`.comment[data-comment-id="${commentId}"]`);
        if (commentElement) {
            commentElement.remove();
        }
        
        // 댓글이 없는 경우 메시지 표시
        const commentsContainer = document.getElementById('comments-container');
        if (commentsContainer && commentsContainer.childElementCount === 0) {
            commentsContainer.innerHTML = '<div class="no-comments">아직 댓글이 없습니다.</div>';
        }
        
        showNotification('댓글이 삭제되었습니다.', 'info');
    } catch (error) {
        console.error('댓글 삭제 오류:', error);
        showNotification('댓글 삭제에 실패했습니다: ' + error.message, 'error');
    }
}

// 게시물 좋아요
async function likePost(postId) {
    if (!firebase.auth().currentUser) {
        showNotification('로그인 후 이용해주세요.', 'error');
        return;
    }
    
    try {
        const userId = firebase.auth().currentUser.uid;
        
        // 좋아요 상태 확인
        const likeRef = firebase.firestore().collection('posts')
            .doc(postId)
            .collection('likes')
            .doc(userId);
        
        const likeDoc = await likeRef.get();
        
        if (likeDoc.exists) {
            // 이미 좋아요를 눌렀으면 취소
            await likeRef.delete();
            
            // 게시물 좋아요 수 감소
            await firebase.firestore().collection('posts')
                .doc(postId)
                .update({
                    likes: firebase.firestore.FieldValue.increment(-1)
                });
            
            // UI 업데이트
            const likeCountElement = document.querySelector('.like-count');
            if (likeCountElement) {
                const currentCount = parseInt(likeCountElement.textContent) || 0;
                likeCountElement.textContent = Math.max(0, currentCount - 1);
            }
            
            const likeButton = document.getElementById('like-post-button');
            if (likeButton) {
                likeButton.classList.remove('liked');
            }
            
            showNotification('좋아요가 취소되었습니다.', 'info');
        } else {
            // 좋아요 추가
            await likeRef.set({
                userId: userId,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // 게시물 좋아요 수 증가
            await firebase.firestore().collection('posts')
                .doc(postId)
                .update({
                    likes: firebase.firestore.FieldValue.increment(1)
                });
            
            // UI 업데이트
            const likeCountElement = document.querySelector('.like-count');
            if (likeCountElement) {
                const currentCount = parseInt(likeCountElement.textContent) || 0;
                likeCountElement.textContent = currentCount + 1;
            }
            
            const likeButton = document.getElementById('like-post-button');
            if (likeButton) {
                likeButton.classList.add('liked');
            }
            
            showNotification('좋아요를 눌렀습니다.', 'success');
        }
    } catch (error) {
        console.error('좋아요 처리 오류:', error);
        showNotification('좋아요 처리에 실패했습니다: ' + error.message, 'error');
    }
}

// 새 게시물 작성 모달 열기
function openNewPostModal() {
    if (!firebase.auth().currentUser) {
        showNotification('로그인 후 이용해주세요.', 'error');
        return;
    }
    
    // 폼 초기화
    elements.postTitle.value = '';
    elements.postCategory.value = 'question';
    elements.postContent.value = '';
    elements.postTags.value = '';
    
    // 모달 표시
    const newPostModal = document.getElementById('new-post-modal');
    if (newPostModal) {
        newPostModal.style.display = 'flex';
    }
    
    // 사용자 프로젝트 로드 (프로젝트 연결 드롭다운)
    loadUserProjectsForPostForm();
}

// 게시물 작성 폼에 사용자 프로젝트 로드
async function loadUserProjectsForPostForm() {
    if (!firebase.auth().currentUser) return;
    
    const projectLinkSelect = document.getElementById('project-link');
    
    if (!projectLinkSelect) return;
    
    try {
        // 프로젝트 목록 조회
        const snapshot = await firebase.firestore().collection('projects')
            .where('userId', '==', firebase.auth().currentUser.uid)
            .orderBy('updatedAt', 'desc')
            .get();
        
        // 드롭다운 초기화
        projectLinkSelect.innerHTML = '<option value="">프로젝트 선택...</option>';
        
        // 프로젝트 추가
        snapshot.forEach(doc => {
            const project = doc.data();
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = project.title;
            projectLinkSelect.appendChild(option);
        });
    } catch (error) {
        console.error('프로젝트 로드 오류:', error);
    }
}

// 게시물 제출
async function submitPost() {
    if (!firebase.auth().currentUser) {
        showNotification('로그인 후 이용해주세요.', 'error');
        return;
    }
    
    const title = elements.postTitle.value.trim();
    const category = elements.postCategory.value;
    const content = elements.postContent.value.trim();
    const tagsInput = elements.postTags.value.trim();
    
    // 유효성 검사
    if (!title) {
        showNotification('제목을 입력해주세요.', 'error');
        return;
    }
    
    if (!content) {
        showNotification('내용을 입력해주세요.', 'error');
        return;
    }
    
    // 태그 처리
    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    
    try {
        const userId = firebase.auth().currentUser.uid;
        const user = firebase.auth().currentUser;
        
        // 연결할 프로젝트 ID (있는 경우)
        const projectLinkSelect = document.getElementById('project-link');
        const projectId = projectLinkSelect && projectLinkSelect.value ? projectLinkSelect.value : null;
        
        // 게시물 데이터
        const postData = {
            title: title,
            titleLower: title.toLowerCase(), // 검색을 위한 소문자 변환
            content: content,
            category: category,
            tags: tags,
            userId: userId,
            authorName: user.displayName || user.email,
            authorAvatar: user.photoURL || null,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            views: 0,
            likes: 0,
            commentCount: 0
        };
        
        // 프로젝트 연결 (있는 경우)
        if (projectId) {
            postData.projectId = projectId;
            
            // 프로젝트 정보 조회 및 연결
            const projectDoc = await firebase.firestore().collection('projects').doc(projectId).get();
            if (projectDoc.exists) {
                const projectData = projectDoc.data();
                postData.projectTitle = projectData.title;
            }
        }
        
        // 게시물 저장
        const postRef = await firebase.firestore().collection('posts').add(postData);
        
        // 모달 닫기
        const newPostModal = document.getElementById('new-post-modal');
        if (newPostModal) {
            newPostModal.style.display = 'none';
        }
        
        // 게시물 상세 페이지로 이동
        openPostDetail(postRef.id);
        
        showNotification('게시물이 작성되었습니다.', 'success');
    } catch (error) {
        console.error('게시물 작성 오류:', error);
        showNotification('게시물 작성에 실패했습니다: ' + error.message, 'error');
    }
}

// 게시물 수정 폼 열기
async function editPost(postId) {
    if (!firebase.auth().currentUser) {
        showNotification('로그인 후 이용해주세요.', 'error');
        return;
    }
    
    try {
        // 게시물 데이터 로드
        let post = postCache[postId];
        
        if (!post) {
            const doc = await firebase.firestore().collection('posts').doc(postId).get();
            
            if (!doc.exists) {
                throw new Error('게시물을 찾을 수 없습니다');
            }
            
            post = { id: doc.id, ...doc.data() };
        }
        
        // 작성자 확인
        if (post.userId !== firebase.auth().currentUser.uid) {
            showNotification('자신의 게시물만 수정할 수 있습니다.', 'error');
            return;
        }
        
        // 폼 초기화
        elements.postTitle.value = post.title || '';
        elements.postCategory.value = post.category || 'question';
        elements.postContent.value = post.content || '';
        elements.postTags.value = post.tags ? post.tags.join(', ') : '';
        
        // 모달 표시
        const newPostModal = document.getElementById('new-post-modal');
        if (newPostModal) {
            // 모달 제목 변경
            const modalTitle = newPostModal.querySelector('h2');
            if (modalTitle) {
                modalTitle.textContent = '게시물 수정';
            }
            
            // 제출 버튼 텍스트 변경
            const submitButton = newPostModal.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.textContent = '수정하기';
            }
            
            // 게시물 ID 저장 (데이터 속성)
            const form = document.getElementById('post-form');
            if (form) {
                form.setAttribute('data-edit-post-id', postId);
            }
            
            newPostModal.style.display = 'flex';
        }
        
        // 사용자 프로젝트 로드 (프로젝트 연결 드롭다운)
        await loadUserProjectsForPostForm();
        
        // 연결된 프로젝트 선택 (있는 경우)
        if (post.projectId) {
            const projectLinkSelect = document.getElementById('project-link');
            if (projectLinkSelect) {
                projectLinkSelect.value = post.projectId;
            }
        }
    } catch (error) {
        console.error('게시물 수정 폼 오류:', error);
        showNotification('게시물 수정 폼을 불러오는 데 실패했습니다: ' + error.message, 'error');
    }
}

// 게시물 삭제 확인
function confirmDeletePost(postId) {
    if (!firebase.auth().currentUser) {
        showNotification('로그인 후 이용해주세요.', 'error');
        return;
    }
    
    if (confirm('정말로 이 게시물을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
        deletePost(postId);
    }
}

// 게시물 삭제
async function deletePost(postId) {
    try {
        // 게시물 소유자 확인
        const doc = await firebase.firestore().collection('posts').doc(postId).get();
        
        if (!doc.exists) {
            throw new Error('게시물을 찾을 수 없습니다');
        }
        
        const post = doc.data();
        
        if (post.userId !== firebase.auth().currentUser.uid) {
            showNotification('자신의 게시물만 삭제할 수 있습니다.', 'error');
            return;
        }
        
        // 댓글 삭제
        const commentsSnapshot = await firebase.firestore().collection('posts')
            .doc(postId)
            .collection('comments')
            .get();
        
        const batch = firebase.firestore().batch();
        
        commentsSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        
        // 좋아요 삭제
        const likesSnapshot = await firebase.firestore().collection('posts')
            .doc(postId)
            .collection('likes')
            .get();
        
        likesSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        
        // 일괄 작업 실행
        await batch.commit();
        
        // 게시물 삭제
        await firebase.firestore().collection('posts').doc(postId).delete();
        
        // 게시물 목록으로 이동
        loadCommunityPosts();
        
        // URL에서 post 파라미터 제거
        const url = new URL(window.location);
        url.searchParams.delete('post');
        window.history.pushState({}, '', url);
        
        showNotification('게시물이 삭제되었습니다.', 'info');
    } catch (error) {
        console.error('게시물 삭제 오류:', error);
        showNotification('게시물 삭제에 실패했습니다: ' + error.message, 'error');
    }
}

// 커뮤니티 페이지 네비게이션
function navigateCommunityPage(direction) {
    if (!window.state) return;
    
    const newPage = window.state.communityPage + direction;
    
    if (newPage < 1 || newPage > window.state.totalCommunityPages) {
        return;
    }
    
    window.state.communityPage = newPage;
    updateCommunityPagination();
    loadCommunityPosts();
}

// 커뮤니티 페이지네이션 업데이트
function updateCommunityPagination() {
    if (!window.state) return;
    
    const pageInfo = document.getElementById('page-info');
    if (pageInfo) {
        pageInfo.textContent = `${window.state.communityPage} / ${window.state.totalCommunityPages}`;
    }
    
    // 이전 버튼 비활성화 여부
    const prevButton = document.getElementById('prev-page');
    if (prevButton) {
        prevButton.disabled = window.state.communityPage <= 1;
    }
    
    // 다음 버튼 비활성화 여부
    const nextButton = document.getElementById('next-page');
    if (nextButton) {
        nextButton.disabled = window.state.communityPage >= window.state.totalCommunityPages;
    }
}

// 초기화 함수 등록
window.initCommunity = initCommunity;

// 외부에서 사용할 함수 공개
window.communityFunctions = {
    loadCommunityPosts,
    openPostDetail,
    submitPost,
    editPost,
    deletePost,
    submitComment,
    deleteComment,
    likePost
};