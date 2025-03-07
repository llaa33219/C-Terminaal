// 커뮤니티 UI 핸들러 - 향상된 기능
const communityUI = {
    // 현재 로드된 페이지 및 정렬 상태
    currentPage: 1,
    currentSort: 'hot',
    totalPages: 1,
    isLoading: false,
    pollingInterval: null,
    
    // 커뮤니티 페이지 초기화
    init: function() {
      // 게시물 목록 로드
      this.loadPosts();
      
      // 탭 이벤트 리스너 등록
      document.querySelectorAll('.community-tabs .tab-btn').forEach(tab => {
        tab.addEventListener('click', () => {
          // 탭 클래스 변경
          document.querySelectorAll('.community-tabs .tab-btn').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          
          // 정렬 유형 저장
          this.currentSort = tab.dataset.tab;
          this.currentPage = 1;
          
          // 게시물 다시 로드
          this.loadPosts();
        });
      });
      
      // 검색 버튼 이벤트
      const searchBtn = document.getElementById('search-btn');
      if (searchBtn) {
        searchBtn.addEventListener('click', () => {
          this.searchPosts();
        });
      }
      
      // 엔터 키로 검색
      const searchInput = document.getElementById('community-search');
      if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            this.searchPosts();
          }
        });
      }
      
      // 새 게시물 버튼 이벤트
      const newPostBtn = document.getElementById('new-post-btn');
      if (newPostBtn) {
        newPostBtn.addEventListener('click', () => this.openNewPostModal());
      }
      
      // 게시물 제출 버튼 이벤트
      const submitPostBtn = document.getElementById('submit-post-btn');
      if (submitPostBtn) {
        submitPostBtn.addEventListener('click', () => this.submitNewPost());
      }
      
      // 처음 진입 시 데이터 마이그레이션 (로컬스토리지 -> R2)
      communityManager.initializePostsIndex().then(result => {
        if (result.success) {
          console.log('커뮤니티 초기화 완료');
        }
      });
      
      // 실시간 업데이트 시작
      this.startPolling();
      
      // 오프라인 지원을 위한 로컬 백업 일정 설정
      communityManager.scheduleLocalBackup();
    },
    
    // 게시물 목록 로드
    loadPosts: async function() {
      if (this.isLoading) return;
      
      this.isLoading = true;
      this.showLoadingState();
      
      try {
        const result = await communityManager.getPosts(this.currentSort, this.currentPage);
        
        if (result.success) {
          // UI 업데이트
          this.displayPosts(result.posts);
          
          // 페이지네이션 정보 업데이트
          if (result.pagination) {
            this.totalPages = result.pagination.totalPages;
            this.updatePagination();
          }
          
          // 오프라인 상태 표시
          if (result.isOffline) {
            this.showOfflineNotice();
          } else {
            this.hideOfflineNotice();
          }
        } else {
          this.showError(result.message);
        }
      } catch (error) {
        console.error('게시물 로드 오류:', error);
        this.showError('게시물을 불러오는 중 오류가 발생했습니다.');
      } finally {
        this.isLoading = false;
        this.hideLoadingState();
      }
    },
    
    // 게시물 검색
    searchPosts: function() {
      const searchTerm = document.getElementById('community-search').value.trim();
      
      if (!searchTerm) {
        // 검색어가 없으면 모든 게시물 표시
        this.currentPage = 1;
        this.loadPosts();
        return;
      }
      
      // 검색어를 사용하여 게시물 필터링 (클라이언트 측)
      this.isLoading = true;
      this.showLoadingState();
      
      communityManager.getPosts(this.currentSort, 1, 100, false)
        .then(result => {
          if (result.success) {
            // 검색어로 필터링
            const filteredPosts = result.posts.filter(post => 
              post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              post.author.username.toLowerCase().includes(searchTerm.toLowerCase())
            );
            
            // 검색 결과 표시
            this.displayPosts(filteredPosts);
            document.getElementById('posts-container').insertAdjacentHTML('beforebegin', 
              `<div class="search-results-info">검색 결과: ${filteredPosts.length}개의 게시물</div>`
            );
          } else {
            this.showError(result.message);
          }
        })
        .catch(error => {
          console.error('검색 오류:', error);
          this.showError('검색 중 오류가 발생했습니다.');
        })
        .finally(() => {
          this.isLoading = false;
          this.hideLoadingState();
        });
    },
    
    // 게시물 표시
    displayPosts: function(posts) {
      const container = document.getElementById('posts-container');
      
      // 검색 결과 정보 제거
      const searchInfo = document.querySelector('.search-results-info');
      if (searchInfo) {
        searchInfo.remove();
      }
      
      // 컨테이너 초기화
      container.innerHTML = '';
      
      // 게시물이 없는 경우
      if (!posts || posts.length === 0) {
        container.innerHTML = `
          <div class="empty-message">
            <i class="fas fa-comment-slash"></i>
            <p>게시물이 없습니다. 첫 번째 게시물을 작성해보세요!</p>
          </div>
        `;
        return;
      }
      
      // 각 게시물 렌더링
      posts.forEach(post => {
        // 날짜 포맷팅
        const postDate = new Date(post.date);
        const formattedDate = postDate.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        // 게시물 콘텐츠 (미리보기)
        let content = post.content || '';
        if (content.length > 200) {
          content = content.substring(0, 200) + '...';
        }
        
        // 마크다운 변환 (있는 경우)
        try {
          content = typeof marked !== 'undefined' ? marked.parse(content) : content;
        } catch (e) {
          // 마크다운 변환 오류 시 원문 사용
        }
        
        // 게시물 카드 생성
        const postCard = document.createElement('div');
        postCard.className = 'post-card';
        postCard.dataset.postId = post.id;
        
        postCard.innerHTML = `
          <div class="post-header">
            <div class="post-author">
              <img src="${post.author.avatar || 'img/default-avatar.svg'}" alt="작성자 아바타" class="post-author-avatar">
              <span class="post-author-name">${post.author.username}</span>
            </div>
            <span class="post-date">${formattedDate}</span>
          </div>
          <h3 class="post-title">${post.title}</h3>
          <div class="post-content">${content}</div>
          ${post.projectId ? `<div class="post-project-link"><a href="#" data-project-id="${post.projectId}">첨부된 프로젝트 보기</a></div>` : ''}
          <div class="post-footer">
            <div class="post-stats">
              <div class="post-stat">
                <i class="far fa-thumbs-up"></i>
                <span class="post-likes-count">${post.likes || 0}</span>
              </div>
              <div class="post-stat">
                <i class="far fa-comment"></i>
                <span class="post-comments-count">${post.comments || 0}</span>
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
        this.attachPostEventListeners(postCard);
        
        // 컨테이너에 추가
        container.appendChild(postCard);
      });
      
      // 페이지네이션 업데이트
      this.updatePagination();
    },
    
    // 게시물 카드에 이벤트 리스너 등록
    attachPostEventListeners: function(postCard) {
      // 게시물 클릭 이벤트 (게시물 상세 보기)
      postCard.addEventListener('click', (e) => {
        // 버튼이나 링크 클릭은 무시
        if (e.target.closest('button') || e.target.closest('a')) {
          return;
        }
        
        const postId = postCard.dataset.postId;
        this.viewPostDetail(postId);
      });
      
      // 프로젝트 링크 클릭 이벤트
      const projectLink = postCard.querySelector('.post-project-link a');
      if (projectLink) {
        projectLink.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          const projectId = projectLink.dataset.projectId;
          this.openProject(projectId);
        });
      }
      
      // 좋아요 버튼 클릭 이벤트
      const likeBtn = postCard.querySelector('.post-like-btn');
      if (likeBtn) {
        likeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          const postId = likeBtn.dataset.postId;
          this.likePost(postId, postCard);
        });
      }
      
      // 댓글 버튼 클릭 이벤트
      const commentBtn = postCard.querySelector('.post-comment-btn');
      if (commentBtn) {
        commentBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          const postId = commentBtn.dataset.postId;
          this.viewPostDetail(postId, true);
        });
      }
    },
    
    // 게시물 좋아요
    likePost: async function(postId, postCard) {
      // 로그인 확인
      if (!authManager.isLoggedIn()) {
        alert('좋아요를 남기려면 로그인이 필요합니다.');
        return;
      }
      
      try {
        // 좋아요 버튼 비활성화
        const likeBtn = postCard.querySelector('.post-like-btn');
        likeBtn.disabled = true;
        
        // 좋아요 API 호출
        const result = await communityManager.likePost(postId);
        
        if (result.success) {
          // 좋아요 카운트 업데이트
          const likesCount = postCard.querySelector('.post-likes-count');
          likesCount.textContent = result.likes;
          
          // 좋아요 버튼 스타일 변경
          likeBtn.classList.add('liked');
          likeBtn.innerHTML = '<i class="fas fa-thumbs-up"></i> 좋아요됨';
        } else {
          alert(result.message);
        }
      } catch (error) {
        console.error('좋아요 오류:', error);
        alert('좋아요 처리 중 오류가 발생했습니다.');
      } finally {
        // 버튼 재활성화
        const likeBtn = postCard.querySelector('.post-like-btn');
        likeBtn.disabled = false;
      }
    },
    
    // Modified viewPostDetail function with better error handling
    // Replace this in community-ui.js

    viewPostDetail: async function(postId, focusComments = false) {
        try {
        // Show loading state
        this.showLoadingState();
        
        // Load post data
        const result = await communityManager.getPost(postId);
        
        if (!result.success) {
            // Handle error gracefully - show error message and allow retry
            const errorMsg = result.message || '게시물을 불러오는 중 오류가 발생했습니다.';
            
            this.hideLoadingState();
            
            // Create a simple error dialog
            const dialogHtml = `
            <div id="error-dialog" style="position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); 
                background:white; padding:20px; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.15); 
                z-index:1000; max-width:90%; width:400px; text-align:center;">
                <h3 style="margin-bottom:15px; color:#dc3545;">오류 발생</h3>
                <p style="margin-bottom:20px;">${errorMsg}</p>
                <div style="display:flex; justify-content:center; gap:10px;">
                <button id="retry-post-btn" class="btn btn-primary">다시 시도</button>
                <button id="cancel-post-btn" class="btn btn-outline">취소</button>
                </div>
            </div>
            `;
            
            // Add to document
            const dialogContainer = document.createElement('div');
            dialogContainer.innerHTML = dialogHtml;
            document.body.appendChild(dialogContainer);
            
            // Add event listeners
            document.getElementById('retry-post-btn').addEventListener('click', () => {
            document.body.removeChild(dialogContainer);
            this.viewPostDetail(postId, focusComments);
            });
            
            document.getElementById('cancel-post-btn').addEventListener('click', () => {
            document.body.removeChild(dialogContainer);
            });
            
            return;
        }
        
        const post = result.post;
        
        // Create or update the modal
        this.openPostDetailModal(post, focusComments);
        } catch (error) {
        console.error('게시물 상세 로드 오류:', error);
        this.showError('게시물을 불러오는 중 오류가 발생했습니다.');
        } finally {
        this.hideLoadingState();
        }
    },
    
    // 게시물 상세 모달 열기
    openPostDetailModal: function(post, focusComments = false) {
      // 이미 열려있는 모달이 있으면 닫기
      document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
      });
      
      // 모달 HTML 생성
      const modalHtml = `
        <div id="post-detail-modal" class="modal" style="display:flex;">
          <div class="modal-content post-detail-modal-content">
            <div class="modal-header">
              <h3>게시물</h3>
              <button class="close-modal-btn">×</button>
            </div>
            <div class="modal-body">
              <div class="post-detail">
                <div class="post-header">
                  <div class="post-author">
                    <img src="${post.author.avatar || 'img/default-avatar.svg'}" alt="작성자 아바타" class="post-author-avatar">
                    <div class="author-info">
                      <span class="post-author-name">${post.author.username}</span>
                      <span class="post-date">${new Date(post.date).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</span>
                    </div>
                  </div>
                  <div class="post-actions-dropdown">
                    <button class="btn btn-icon post-actions-btn">
                      <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <div class="post-actions-menu hidden">
                      <a href="#" class="share-post">공유하기</a>
                      ${post.author.id === (authManager.getCurrentUser()?.id || '') ? `
                        <a href="#" class="edit-post">수정하기</a>
                        <a href="#" class="delete-post">삭제하기</a>
                      ` : ''}
                      <a href="#" class="report-post">신고하기</a>
                    </div>
                  </div>
                </div>
                <h2 class="post-title">${post.title}</h2>
                <div class="post-content">${typeof marked !== 'undefined' ? marked.parse(post.content) : post.content}</div>
                ${post.projectId ? `
                  <div class="post-project-link">
                    <a href="#" data-project-id="${post.projectId}" class="btn btn-outline">
                      <i class="fas fa-code-branch"></i> 첨부된 프로젝트 보기
                    </a>
                  </div>
                ` : ''}
                <div class="post-stats-bar">
                  <div class="post-stat">
                    <i class="far fa-thumbs-up"></i>
                    <span class="post-likes-count">${post.likes || 0}</span>
                  </div>
                  <div class="post-stat">
                    <i class="far fa-comment"></i>
                    <span class="post-comments-count">${post.commentList?.length || 0}</span>
                  </div>
                  <button class="btn btn-small post-like-btn" data-post-id="${post.id}">
                    <i class="far fa-thumbs-up"></i> 좋아요
                  </button>
                </div>
              </div>
              <div class="post-comments">
                <h3>댓글 <span class="comment-count">${post.commentList?.length || 0}</span></h3>
                ${authManager.isLoggedIn() ? `
                  <div class="comment-form">
                    <textarea id="comment-text" placeholder="댓글을 입력하세요..." class="full-width"></textarea>
                    <button id="submit-comment-btn" class="btn btn-primary" data-post-id="${post.id}">댓글 작성</button>
                  </div>
                ` : `
                  <div class="login-to-comment">
                    <p>댓글을 작성하려면 <a href="#" id="comment-login-btn">로그인</a>이 필요합니다.</p>
                  </div>
                `}
                <div class="comments-list">
                  ${post.commentList && post.commentList.length > 0 ? post.commentList.map(comment => `
                    <div class="comment-item">
                      <div class="comment-author">
                        <img src="${comment.author.avatar || 'img/default-avatar.svg'}" alt="댓글 작성자" class="comment-author-avatar">
                        <div class="comment-author-info">
                          <span class="comment-author-name">${comment.author.username}</span>
                          <span class="comment-date">${new Date(comment.date).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}</span>
                        </div>
                      </div>
                      <div class="comment-content">${comment.content}</div>
                    </div>
                  `).join('') : `
                    <div class="empty-comments">
                      <p>아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!</p>
                    </div>
                  `}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      
      // 모달 추가
      document.body.insertAdjacentHTML('beforeend', modalHtml);
      
      // 모달 이벤트 리스너 등록
      const modal = document.getElementById('post-detail-modal');
      
      // 닫기 버튼
      modal.querySelector('.close-modal-btn').addEventListener('click', () => {
        modal.remove();
      });
      
      // 모달 외부 클릭 시 닫기
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.remove();
        }
      });
      
      // 좋아요 버튼
      const likeBtn = modal.querySelector('.post-like-btn');
      likeBtn.addEventListener('click', async () => {
        // 로그인 확인
        if (!authManager.isLoggedIn()) {
          alert('좋아요를 남기려면 로그인이 필요합니다.');
          return;
        }
        
        try {
          likeBtn.disabled = true;
          
          // 좋아요 API 호출
          const result = await communityManager.likePost(post.id);
          
          if (result.success) {
            // 좋아요 카운트 업데이트
            modal.querySelector('.post-likes-count').textContent = result.likes;
            
            // 목록의 좋아요 카운트도 업데이트
            const listItem = document.querySelector(`.post-card[data-post-id="${post.id}"]`);
            if (listItem) {
              listItem.querySelector('.post-likes-count').textContent = result.likes;
            }
            
            // 좋아요 버튼 스타일 변경
            likeBtn.classList.add('liked');
            likeBtn.innerHTML = '<i class="fas fa-thumbs-up"></i> 좋아요됨';
          } else {
            alert(result.message);
          }
        } catch (error) {
          console.error('좋아요 오류:', error);
          alert('좋아요 처리 중 오류가 발생했습니다.');
        } finally {
          likeBtn.disabled = false;
        }
      });
      
      // 프로젝트 링크 클릭
      const projectLink = modal.querySelector('.post-project-link a');
      if (projectLink) {
        projectLink.addEventListener('click', (e) => {
          e.preventDefault();
          
          const projectId = projectLink.dataset.projectId;
          this.openProject(projectId);
          modal.remove();
        });
      }
      
      // 댓글 작성 버튼
      const submitCommentBtn = modal.querySelector('#submit-comment-btn');
      if (submitCommentBtn) {
        submitCommentBtn.addEventListener('click', async () => {
          const commentText = modal.querySelector('#comment-text').value.trim();
          
          if (!commentText) {
            alert('댓글 내용을 입력하세요.');
            return;
          }
          
          try {
            submitCommentBtn.disabled = true;
            
            // 댓글 API 호출
            const result = await communityManager.addComment(post.id, commentText);
            
            if (result.success) {
              // 텍스트영역 초기화
              modal.querySelector('#comment-text').value = '';
              
              // 새 댓글 추가
              const commentsList = modal.querySelector('.comments-list');
              const emptyComments = commentsList.querySelector('.empty-comments');
              
              if (emptyComments) {
                commentsList.innerHTML = '';
              }
              
              const newComment = document.createElement('div');
              newComment.className = 'comment-item';
              
              const currentUser = authManager.getCurrentUser();
              newComment.innerHTML = `
                <div class="comment-author">
                  <img src="${currentUser.avatar || 'img/default-avatar.svg'}" alt="댓글 작성자" class="comment-author-avatar">
                  <div class="comment-author-info">
                    <span class="comment-author-name">${currentUser.username}</span>
                    <span class="comment-date">방금 전</span>
                  </div>
                </div>
                <div class="comment-content">${result.comment.content}</div>
              `;
              
              commentsList.appendChild(newComment);
              
              // 댓글 수 업데이트
              const commentCount = parseInt(modal.querySelector('.comment-count').textContent) + 1;
              modal.querySelector('.comment-count').textContent = commentCount;
              modal.querySelector('.post-comments-count').textContent = commentCount;
              
              // 목록의 댓글 카운트도 업데이트
              const listItem = document.querySelector(`.post-card[data-post-id="${post.id}"]`);
              if (listItem) {
                listItem.querySelector('.post-comments-count').textContent = commentCount;
              }
            } else {
              alert(result.message);
            }
          } catch (error) {
            console.error('댓글 작성 오류:', error);
            alert('댓글 작성 중 오류가 발생했습니다.');
          } finally {
            submitCommentBtn.disabled = false;
          }
        });
      }
      
      // 로그인하여 댓글 작성 버튼
      const commentLoginBtn = modal.querySelector('#comment-login-btn');
      if (commentLoginBtn) {
        commentLoginBtn.addEventListener('click', (e) => {
          e.preventDefault();
          modal.remove();
          openModal('login-modal');
        });
      }
      
      // 액션 드롭다운
      const actionsBtn = modal.querySelector('.post-actions-btn');
      if (actionsBtn) {
        actionsBtn.addEventListener('click', (e) => {
          e.preventDefault();
          const menu = modal.querySelector('.post-actions-menu');
          menu.classList.toggle('hidden');
          
          // 외부 클릭 시 닫기
          const closeMenu = (event) => {
            if (!menu.contains(event.target) && event.target !== actionsBtn) {
              menu.classList.add('hidden');
              document.removeEventListener('click', closeMenu);
            }
          };
          
          // 이벤트 전파 방지
          setTimeout(() => {
            document.addEventListener('click', closeMenu);
          }, 0);
        });
        
        // 공유하기
        const shareLink = modal.querySelector('.share-post');
        if (shareLink) {
          shareLink.addEventListener('click', (e) => {
            e.preventDefault();
            
            // 공유 URL 생성
            const shareUrl = `${window.location.origin}?post=${post.id}`;
            
            // 클립보드에 복사
            navigator.clipboard.writeText(shareUrl)
              .then(() => {
                alert('게시물 링크가 클립보드에 복사되었습니다.');
              })
              .catch(err => {
                console.error('클립보드 복사 오류:', err);
                prompt('다음 링크를 복사하세요:', shareUrl);
              });
            
            modal.querySelector('.post-actions-menu').classList.add('hidden');
          });
        }
        
        // 수정하기 (작성자만 가능)
        const editLink = modal.querySelector('.edit-post');
        if (editLink) {
          editLink.addEventListener('click', (e) => {
            e.preventDefault();
            alert('게시물 수정 기능은 준비 중입니다.');
            modal.querySelector('.post-actions-menu').classList.add('hidden');
          });
        }
        
        // 삭제하기 (작성자만 가능)
        const deleteLink = modal.querySelector('.delete-post');
        if (deleteLink) {
          deleteLink.addEventListener('click', (e) => {
            e.preventDefault();
            
            if (confirm('정말로 이 게시물을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
              alert('게시물 삭제 기능은 준비 중입니다.');
            }
            
            modal.querySelector('.post-actions-menu').classList.add('hidden');
          });
        }
        
        // 신고하기
        const reportLink = modal.querySelector('.report-post');
        if (reportLink) {
          reportLink.addEventListener('click', (e) => {
            e.preventDefault();
            alert('게시물 신고 기능은 준비 중입니다.');
            modal.querySelector('.post-actions-menu').classList.add('hidden');
          });
        }
      }
      
      // 댓글 영역으로 스크롤
      if (focusComments) {
        setTimeout(() => {
          modal.querySelector('.post-comments').scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    },
    
    // 프로젝트 열기
    openProject: function(projectId) {
      // 프로젝트 매니저로 프로젝트 로드
      const result = projectManager.loadProject(projectId);
      
      if (result.success) {
        // 플레이그라운드 섹션으로 이동
        showSection('playground-section');
        
        // 필요한 경우 Blockly 작업공간 초기화 추가
        if (window.initPlayground) {
          setTimeout(() => {
            initPlayground();
          }, 100);
        }
      } else {
        alert(result.message || '프로젝트를 열 수 없습니다.');
      }
    },
    
    // 새 게시물 모달 열기
    openNewPostModal: function() {
      // 로그인 확인
      if (!authManager.isLoggedIn()) {
        alert('게시물을 작성하려면 로그인이 필요합니다.');
        openModal('login-modal');
        return;
      }
      
      // 폼 초기화
      document.getElementById('post-title').value = '';
      document.getElementById('post-content').value = '';
      
      // 현재 프로젝트가 있는지 확인
      const hasProject = projectManager.currentProject && projectManager.currentProject.id;
      
      // 프로젝트 첨부 체크박스 설정
      const attachProjectCheck = document.getElementById('attach-project');
      if (attachProjectCheck) {
        attachProjectCheck.checked = false;
        attachProjectCheck.disabled = !hasProject;
        
        // 프로젝트가 없으면 도움말 표시
        const attachProjectLabel = attachProjectCheck.parentElement;
        
        if (!hasProject) {
          attachProjectLabel.title = '현재 열려있는 프로젝트가 없습니다.';
          attachProjectLabel.classList.add('disabled');
        } else {
          attachProjectLabel.title = '';
          attachProjectLabel.classList.remove('disabled');
          
          // 프로젝트 정보 표시
          const projectInfoSpan = document.createElement('span');
          projectInfoSpan.className = 'project-info-hint';
          projectInfoSpan.textContent = `(${projectManager.currentProject.title})`;
          attachProjectLabel.appendChild(projectInfoSpan);
        }
      }
      
      // 모달 열기
      openModal('new-post-modal');
    },
    
    // 새 게시물 작성
    submitNewPost: async function() {
      // 로그인 확인
      if (!authManager.isLoggedIn()) {
        alert('게시물을 작성하려면 로그인이 필요합니다.');
        return;
      }
      
      // 입력값 가져오기
      const title = document.getElementById('post-title').value.trim();
      const content = document.getElementById('post-content').value.trim();
      const attachProject = document.getElementById('attach-project').checked;
      
      // 유효성 검사
      if (!title) {
        alert('제목을 입력해주세요.');
        return;
      }
      
      if (!content) {
        alert('내용을 입력해주세요.');
        return;
      }
      
      // 현재 프로젝트 ID (프로젝트 첨부 옵션 선택 시)
      const projectId = attachProject && projectManager.currentProject ? 
                        projectManager.currentProject.id : null;
      
      try {
        // 제출 버튼 비활성화
        const submitBtn = document.getElementById('submit-post-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = '게시 중...';
        
        // 게시물 API 호출
        const result = await communityManager.createPost(title, content, projectId);
        
        if (result.success) {
          // 모달 닫기
          closeCurrentModal();
          
          // 게시물 목록 새로고침
          this.currentPage = 1;
          this.currentSort = 'new'; // 새 글 모드로 변경
          
          // 탭 UI 업데이트
          document.querySelectorAll('.community-tabs .tab-btn').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tab === 'new') {
              tab.classList.add('active');
            }
          });
          
          await this.loadPosts();
          
          // 성공 메시지
          this.showSuccessMessage('게시물이 성공적으로 작성되었습니다.');
        } else {
          alert(result.message);
        }
      } catch (error) {
        console.error('게시물 작성 오류:', error);
        alert('게시물 작성 중 오류가 발생했습니다.');
      } finally {
        // 버튼 상태 복원
        const submitBtn = document.getElementById('submit-post-btn');
        submitBtn.disabled = false;
        submitBtn.textContent = '게시';
      }
    },
    
    // 업데이트 폴링 시작
    startPolling: function() {
      // 기존 폴링 중지
      this.stopPolling();
      
      // 60초마다 업데이트 확인
      this.pollingInterval = setInterval(() => {
        // 현재 페이지가 커뮤니티 섹션인 경우에만 업데이트
        if (document.getElementById('community-section').style.display !== 'none') {
          // 캐시를 무시하고 새로운 데이터 가져오기
          communityManager.getPosts(this.currentSort, this.currentPage, 20, false)
            .then(result => {
              if (result.success) {
                // UI 업데이트 (이미 로드된 것과 다른 경우에만)
                const currentPosts = document.querySelectorAll('.post-card');
                
                // 포스트 수가 다르거나 최신 포스트 ID가 다른 경우 새로고침
                if (currentPosts.length !== result.posts.length || 
                    (currentPosts.length > 0 && result.posts.length > 0 && 
                     currentPosts[0].dataset.postId !== result.posts[0].id)) {
                  this.displayPosts(result.posts);
                }
                
                // 또는 각 포스트의 좋아요/댓글 수만 업데이트
                else {
                  result.posts.forEach(post => {
                    const postCard = document.querySelector(`.post-card[data-post-id="${post.id}"]`);
                    if (postCard) {
                      // 좋아요 수 업데이트
                      const likesCount = postCard.querySelector('.post-likes-count');
                      if (likesCount && parseInt(likesCount.textContent) !== post.likes) {
                        likesCount.textContent = post.likes || 0;
                      }
                      
                      // 댓글 수 업데이트
                      const commentsCount = postCard.querySelector('.post-comments-count');
                      if (commentsCount && parseInt(commentsCount.textContent) !== post.comments) {
                        commentsCount.textContent = post.comments || 0;
                      }
                    }
                  });
                }
              }
            })
            .catch(error => {
              console.error('업데이트 폴링 오류:', error);
            });
        }
      }, 60000); // 60초
    },
    
    // 업데이트 폴링 중지
    stopPolling: function() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
      }
    },
    
    // 페이지네이션 업데이트
    updatePagination: function() {
      // 향후 확장: 페이지네이션 UI 추가
    },
    
    // 로딩 상태 표시
    showLoadingState: function() {
      // 로딩 오버레이 생성
      const overlay = document.createElement('div');
      overlay.className = 'loading-overlay';
      overlay.innerHTML = '<div class="loading-spinner"></div>';
      
      const container = document.getElementById('posts-container') || document.body;
      container.appendChild(overlay);
    },
    
    // 로딩 상태 숨기기
    hideLoadingState: function() {
      const overlay = document.querySelector('.loading-overlay');
      if (overlay) {
        overlay.remove();
      }
    },
    
    // 성공 메시지 표시
    showSuccessMessage: function(message) {
      // 성공 메시지 요소 생성
      const messageElement = document.createElement('div');
      messageElement.className = 'success-message';
      messageElement.textContent = message;
      
      // 메시지 추가
      const container = document.getElementById('community-section');
      container.appendChild(messageElement);
      
      // 자동으로 사라지게 설정
      setTimeout(() => {
        messageElement.classList.add('fadeout');
        setTimeout(() => {
          messageElement.remove();
        }, 500);
      }, 3000);
    },
    
    // 오류 메시지 표시
    showError: function(message) {
      // 오류 메시지 요소 생성
      const errorElement = document.createElement('div');
      errorElement.className = 'error-message';
      errorElement.textContent = message;
      
      // 메시지 추가
      const container = document.getElementById('posts-container') || document.body;
      container.appendChild(errorElement);
      
      // 자동으로 사라지게 설정
      setTimeout(() => {
        errorElement.classList.add('fadeout');
        setTimeout(() => {
          errorElement.remove();
        }, 500);
      }, 5000);
    },
    
    // 오프라인 상태 알림 표시
    showOfflineNotice: function() {
      // 이미 존재하는 경우 표시하지 않음
      if (document.querySelector('.offline-notice')) {
        return;
      }
      
      // 오프라인 알림 요소 생성
      const noticeElement = document.createElement('div');
      noticeElement.className = 'offline-notice';
      noticeElement.innerHTML = `
        <i class="fas fa-wifi-slash"></i>
        <span>오프라인 모드: 저장된 데이터를 표시합니다.</span>
      `;
      
      // 알림 추가
      const container = document.getElementById('community-section');
      container.insertBefore(noticeElement, container.firstChild);
    },
    
    // 오프라인 상태 알림 숨기기
    hideOfflineNotice: function() {
      const notice = document.querySelector('.offline-notice');
      if (notice) {
        notice.remove();
      }
    }
  };
  
  // 커뮤니티 페이지 로드 함수 - 기존 함수 대체 (app.js에서 사용)
  function loadCommunityPosts() {
    // 커뮤니티 UI 초기화
    communityUI.init();
  }
  
  // 커뮤니티 CSS 추가 (동적 스타일 주입)
  const addCommunityStyles = () => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      /* 커뮤니티 향상 스타일 */
      .post-card {
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      
      .post-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
      }
      
      .post-like-btn.liked {
        background-color: var(--primary-light);
        color: white;
      }
      
      .loading-overlay {
        position: absolute;
        inset: 0;
        background-color: rgba(255, 255, 255, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
      }
      
      .loading-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid var(--border-color);
        border-top: 3px solid var(--primary-color);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .success-message {
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: var(--success-color);
        color: white;
        padding: 12px 20px;
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-md);
        z-index: 1000;
        animation: fadeIn 0.3s ease-out;
      }
      
      .error-message {
        background-color: var(--danger-color);
        color: white;
        padding: 12px 20px;
        margin: 10px 0;
        border-radius: var(--radius-md);
        animation: fadeIn 0.3s ease-out;
      }
      
      .success-message.fadeout,
      .error-message.fadeout {
        opacity: 0;
        transition: opacity 0.5s;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .offline-notice {
        background-color: var(--warning-color);
        color: #333;
        padding: 10px 16px;
        margin-bottom: 20px;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .search-results-info {
        margin-bottom: 20px;
        padding: 8px 16px;
        background-color: var(--tertiary-bg);
        border-radius: var(--radius-md);
        font-size: var(--font-size-sm);
      }
      
      .empty-message {
        text-align: center;
        padding: 40px 20px;
        color: var(--secondary-text);
      }
      
      .empty-message i {
        font-size: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
      }
      
      /* 게시물 상세 모달 스타일 */
      .post-detail-modal-content {
        max-width: 800px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
      }
      
      .post-detail {
        margin-bottom: 30px;
      }
      
      .post-detail .post-header {
        margin-bottom: 20px;
      }
      
      .post-detail .post-author {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      
      .post-detail .author-info {
        display: flex;
        flex-direction: column;
      }
      
      .post-detail .post-author-name {
        font-weight: 600;
      }
      
      .post-detail .post-date {
        font-size: var(--font-size-xs);
        color: var(--secondary-text);
      }
      
      .post-detail .post-title {
        font-size: 24px;
        margin-bottom: 16px;
      }
      
      .post-detail .post-content {
        font-size: var(--font-size-md);
        line-height: 1.6;
        margin-bottom: 24px;
      }
      
      .post-detail .post-content img {
        max-width: 100%;
        height: auto;
        margin: 10px 0;
      }
      
      .post-detail .post-content pre,
      .post-detail .post-content code {
        background-color: var(--tertiary-bg);
        padding: 2px 6px;
        border-radius: var(--radius-sm);
        font-family: var(--font-mono);
        font-size: 90%;
      }
      
      .post-detail .post-content pre {
        padding: 16px;
        overflow-x: auto;
        margin: 16px 0;
      }
      
      .post-detail .post-content blockquote {
        border-left: 4px solid var(--primary-light);
        padding-left: 16px;
        color: var(--secondary-text);
        margin: 16px 0;
      }
      
      .post-detail .post-project-link {
        margin: 20px 0;
      }
      
      .post-detail .post-stats-bar {
        display: flex;
        align-items: center;
        padding: 12px 0;
        border-top: 1px solid var(--border-color);
        border-bottom: 1px solid var(--border-color);
        margin: 24px 0;
      }
      
      .post-detail .post-stat {
        margin-right: 24px;
      }
      
      .post-detail .post-like-btn {
        margin-left: auto;
      }
      
      .post-actions-dropdown {
        position: relative;
      }
      
      .post-actions-btn {
        background: none;
        border: none;
        font-size: var(--font-size-md);
        cursor: pointer;
        padding: 4px 8px;
      }
      
      .post-actions-menu {
        position: absolute;
        right: 0;
        top: 100%;
        background-color: var(--background-color);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-md);
        padding: 8px 0;
        min-width: 150px;
        z-index: 10;
      }
      
      .post-actions-menu a {
        display: block;
        padding: 8px 16px;
        color: var(--text-color);
        text-decoration: none;
      }
      
      .post-actions-menu a:hover {
        background-color: var(--tertiary-bg);
      }
      
      .post-actions-menu a.delete-post {
        color: var(--danger-color);
      }
      
      /* 댓글 영역 스타일 */
      .post-comments h3 {
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .post-comments .comment-count {
        font-size: var(--font-size-sm);
        background-color: var(--tertiary-bg);
        padding: 2px 6px;
        border-radius: 10px;
      }
      
      .comment-form {
        margin-bottom: 24px;
      }
      
      .comment-form textarea {
        margin-bottom: 12px;
        min-height: 80px;
      }
      
      .login-to-comment {
        margin-bottom: 24px;
        padding: 16px;
        background-color: var(--tertiary-bg);
        border-radius: var(--radius-md);
        text-align: center;
      }
      
      .comments-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      
      .comment-item {
        padding: 16px;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        background-color: var(--background-color);
      }
      
      .comment-author {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
      }
      
      .comment-author-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
      }
      
      .comment-author-info {
        display: flex;
        flex-direction: column;
      }
      
      .comment-author-name {
        font-weight: 600;
      }
      
      .comment-date {
        font-size: var(--font-size-xs);
        color: var(--secondary-text);
      }
      
      .empty-comments {
        padding: 24px;
        text-align: center;
        color: var(--secondary-text);
      }
    `;
    
    document.head.appendChild(styleElement);
  };
  
  // URL 쿼리 파라미터 처리 (게시물 직접 공유 링크 지원)
  const handleUrlPostParam = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('post');
    
    if (postId) {
      // 커뮤니티 페이지로 이동
      showSection('community-section');
      
      // 게시물 상세 보기
      setTimeout(() => {
        communityUI.viewPostDetail(postId);
        
        // URL에서 파라미터 제거 (히스토리 상태 변경)
        const url = new URL(window.location);
        url.searchParams.delete('post');
        window.history.replaceState({}, '', url);
      }, 500);
    }
  };
  
  // 페이지 로드 시 실행
  document.addEventListener('DOMContentLoaded', () => {
    // 커뮤니티 스타일 추가
    addCommunityStyles();
    
    // URL 파라미터 처리
    handleUrlPostParam();
  });