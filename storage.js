// C-Terminaal 스토리지 스크립트
// Cloudflare R2와 Firebase를 활용한 프로젝트 저장 및 불러오기

// 서비스 URL (Cloudflare Workers를 통해 R2 접근)
const serviceURL = '/api/storage';

// 프로젝트 저장
async function saveProject(projectData) {
    if (!firebase.auth().currentUser) {
        showNotification('로그인 후 이용해주세요.', 'error');
        return { success: false, error: 'auth-required' };
    }
    
    try {
        const userId = firebase.auth().currentUser.uid;
        const isNewProject = !projectData.id;
        
        // 프로젝트 메타데이터 준비
        const projectMeta = {
            title: projectData.title || '제목 없음',
            description: projectData.description || '',
            tags: projectData.tags || [],
            difficulty: projectData.difficulty || 'beginner',
            isPublic: projectData.isPublic !== undefined ? projectData.isPublic : false,
            userId: userId,
            authorName: firebase.auth().currentUser.displayName || '알 수 없는 사용자',
            authorAvatar: firebase.auth().currentUser.photoURL || null,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // 새 프로젝트인 경우 생성 시간 추가
        if (isNewProject) {
            projectMeta.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            projectMeta.views = 0;
            projectMeta.likes = 0;
            projectMeta.forks = 0;
        }
        
        // 프로젝트 콘텐츠
        const projectContent = {
            blocklyXml: projectData.blocklyXml,
            generatedCode: projectData.generatedCode,
            version: '1.0'
        };
        
        // Firestore에 메타데이터 저장
        let projectRef;
        if (isNewProject) {
            projectRef = await firebase.firestore().collection('projects').add(projectMeta);
        } else {
            projectRef = firebase.firestore().collection('projects').doc(projectData.id);
            await projectRef.update(projectMeta);
        }
        
        const projectId = projectRef.id;
        
        // R2에 콘텐츠 저장 (Cloudflare Workers API를 통해)
        const response = await uploadToR2(
            `projects/${userId}/${projectId}.json`,
            JSON.stringify(projectContent)
        );
        
        if (!response.success) {
            throw new Error('R2 업로드 실패: ' + response.error);
        }
        
        // 성공 응답
        showNotification('프로젝트가 저장되었습니다.', 'success');
        return {
            success: true,
            projectId: projectId,
            isNewProject: isNewProject
        };
    } catch (error) {
        console.error('프로젝트 저장 오류:', error);
        showNotification('프로젝트 저장 실패: ' + error.message, 'error');
        return { success: false, error: error.message };
    }
}

// 프로젝트 불러오기
async function loadProject(projectId) {
    try {
        // Firestore에서 메타데이터 조회
        const projectDoc = await firebase.firestore().collection('projects').doc(projectId).get();
        
        if (!projectDoc.exists) {
            throw new Error('프로젝트를 찾을 수 없습니다.');
        }
        
        const projectMeta = projectDoc.data();
        const userId = projectMeta.userId;
        const currentUser = firebase.auth().currentUser;
        
        // 권한 확인 (비공개 프로젝트는 소유자만 접근 가능)
        if (!projectMeta.isPublic && (!currentUser || currentUser.uid !== userId)) {
            throw new Error('이 프로젝트를 볼 수 있는 권한이 없습니다.');
        }
        
        // 조회수 증가 (자신의 프로젝트가 아닌 경우)
        if (currentUser && currentUser.uid !== userId) {
            await firebase.firestore().collection('projects').doc(projectId).update({
                views: firebase.firestore.FieldValue.increment(1)
            });
        }
        
        // R2에서 콘텐츠 로드
        const projectContentJson = await downloadFromR2(`projects/${userId}/${projectId}.json`);
        
        if (!projectContentJson) {
            throw new Error('프로젝트 내용을 불러올 수 없습니다.');
        }
        
        const projectContent = JSON.parse(projectContentJson);
        
        // 결과 반환
        return {
            success: true,
            id: projectId,
            ...projectMeta,
            ...projectContent
        };
    } catch (error) {
        console.error('프로젝트 로드 오류:', error);
        showNotification('프로젝트 로드 실패: ' + error.message, 'error');
        return { success: false, error: error.message };
    }
}

// 프로젝트 삭제
async function deleteProject(projectId) {
    if (!firebase.auth().currentUser) {
        showNotification('로그인 후 이용해주세요.', 'error');
        return { success: false, error: 'auth-required' };
    }
    
    try {
        const userId = firebase.auth().currentUser.uid;
        
        // 프로젝트 소유자 확인
        const projectDoc = await firebase.firestore().collection('projects').doc(projectId).get();
        
        if (!projectDoc.exists) {
            throw new Error('프로젝트를 찾을 수 없습니다.');
        }
        
        const projectData = projectDoc.data();
        
        if (projectData.userId !== userId) {
            throw new Error('이 프로젝트를 삭제할 권한이 없습니다.');
        }
        
        // Firestore에서 프로젝트 삭제
        await firebase.firestore().collection('projects').doc(projectId).delete();
        
        // R2에서 콘텐츠 삭제
        await deleteFromR2(`projects/${userId}/${projectId}.json`);
        
        showNotification('프로젝트가 삭제되었습니다.', 'info');
        return { success: true };
    } catch (error) {
        console.error('프로젝트 삭제 오류:', error);
        showNotification('프로젝트 삭제 실패: ' + error.message, 'error');
        return { success: false, error: error.message };
    }
}

// 프로젝트 목록 검색
async function searchProjects(options = {}) {
    try {
        let query = firebase.firestore().collection('projects');
        
        // 공개 프로젝트만 (기본값)
        if (options.onlyPublic !== false) {
            query = query.where('isPublic', '==', true);
        }
        
        // 사용자 ID로 필터링
        if (options.userId) {
            query = query.where('userId', '==', options.userId);
        }
        
        // 난이도 필터링
        if (options.difficulty && options.difficulty !== 'all') {
            query = query.where('difficulty', '==', options.difficulty);
        }
        
        // 태그 필터링
        if (options.tag) {
            query = query.where('tags', 'array-contains', options.tag);
        }
        
        // 정렬
        if (options.orderBy) {
            switch (options.orderBy) {
                case 'popular':
                    query = query.orderBy('views', 'desc');
                    break;
                case 'recent':
                    query = query.orderBy('createdAt', 'desc');
                    break;
                case 'trending':
                    query = query.orderBy('likes', 'desc').orderBy('createdAt', 'desc');
                    break;
                default:
                    query = query.orderBy('createdAt', 'desc');
            }
        } else {
            query = query.orderBy('createdAt', 'desc');
        }
        
        // 페이지네이션
        if (options.limit) {
            query = query.limit(options.limit);
        }
        
        if (options.startAfter) {
            const startAfterDoc = await firebase.firestore().collection('projects').doc(options.startAfter).get();
            if (startAfterDoc.exists) {
                query = query.startAfter(startAfterDoc);
            }
        }
        
        // 쿼리 실행
        const querySnapshot = await query.get();
        
        // 결과 변환
        const projects = [];
        querySnapshot.forEach(doc => {
            projects.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return {
            success: true,
            projects: projects,
            hasMore: projects.length === options.limit
        };
    } catch (error) {
        console.error('프로젝트 검색 오류:', error);
        return { success: false, error: error.message };
    }
}

// 프로젝트 공유하기
async function shareProject(projectId, options = {}) {
    if (!firebase.auth().currentUser) {
        showNotification('로그인 후 이용해주세요.', 'error');
        return { success: false, error: 'auth-required' };
    }
    
    try {
        const userId = firebase.auth().currentUser.uid;
        
        // 프로젝트 소유자 확인
        const projectDoc = await firebase.firestore().collection('projects').doc(projectId).get();
        
        if (!projectDoc.exists) {
            throw new Error('프로젝트를 찾을 수 없습니다.');
        }
        
        const projectData = projectDoc.data();
        
        if (projectData.userId !== userId) {
            throw new Error('이 프로젝트를 공유할 권한이 없습니다.');
        }
        
        // 프로젝트 공개 설정 업데이트
        const updateData = {
            isPublic: options.isPublic !== undefined ? options.isPublic : true
        };
        
        // 추가 필드 업데이트
        if (options.title) updateData.title = options.title;
        if (options.description) updateData.description = options.description;
        if (options.tags) updateData.tags = options.tags;
        if (options.difficulty) updateData.difficulty = options.difficulty;
        
        await firebase.firestore().collection('projects').doc(projectId).update(updateData);
        
        // 공유 URL 생성
        const shareUrl = `${window.location.origin}?project=${projectId}`;
        
        showNotification('프로젝트가 공유되었습니다.', 'success');
        return {
            success: true,
            shareUrl: shareUrl,
            embedCode: `<iframe src="${shareUrl}&embed=true" width="800" height="600" frameborder="0"></iframe>`
        };
    } catch (error) {
        console.error('프로젝트 공유 오류:', error);
        showNotification('프로젝트 공유 실패: ' + error.message, 'error');
        return { success: false, error: error.message };
    }
}

// R2에 파일 업로드 (Cloudflare Workers 사용)
async function uploadToR2(path, content) {
    try {
        // 인증 토큰 가져오기
        const idToken = await firebase.auth().currentUser.getIdToken();
        
        // API 요청
        const response = await fetch(`${serviceURL}/upload`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({
                path: path,
                content: content
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || '업로드 실패');
        }
        
        return { success: true, data };
    } catch (error) {
        console.error('R2 업로드 오류:', error);
        return { success: false, error: error.message };
    }
}

// R2에서 파일 다운로드 (Cloudflare Workers 사용)
async function downloadFromR2(path) {
    try {
        // 인증 토큰 가져오기 (로그인한 경우)
        let headers = {
            'Content-Type': 'application/json'
        };
        
        if (firebase.auth().currentUser) {
            const idToken = await firebase.auth().currentUser.getIdToken();
            headers['Authorization'] = `Bearer ${idToken}`;
        }
        
        // API 요청
        const response = await fetch(`${serviceURL}/download`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ path })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || '다운로드 실패');
        }
        
        return await response.text();
    } catch (error) {
        console.error('R2 다운로드 오류:', error);
        return null;
    }
}

// R2에서 파일 삭제 (Cloudflare Workers 사용)
async function deleteFromR2(path) {
    try {
        // 인증 토큰 가져오기
        const idToken = await firebase.auth().currentUser.getIdToken();
        
        // API 요청
        const response = await fetch(`${serviceURL}/delete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({ path })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || '삭제 실패');
        }
        
        return { success: true };
    } catch (error) {
        console.error('R2 삭제 오류:', error);
        return { success: false, error: error.message };
    }
}

// 현재 편집 중인 프로젝트 저장
async function saveCurrentProject() {
    // 사용자 확인
    if (!firebase.auth().currentUser) {
        showNotification('로그인 후 이용해주세요.', 'error');
        return false;
    }
    
    // 프로젝트 데이터 수집
    const blocklyXml = window.blocklyFunctions.saveWorkspace();
    const generatedCode = window.blocklyFunctions.generateCode();
    
    // 제목 가져오기 (또는 기본값 사용)
    const projectTitle = document.getElementById('project-title') ? 
                         document.getElementById('project-title').value : '제목 없음';
    
    // 현재 프로젝트 ID (있는 경우)
    const projectId = window.state ? window.state.currentProject : null;
    
    // 프로젝트 데이터 구성
    const projectData = {
        id: projectId,
        title: projectTitle,
        blocklyXml: blocklyXml,
        generatedCode: generatedCode
    };
    
    // 프로젝트 저장
    const result = await saveProject(projectData);
    
    // 성공 시 현재 프로젝트 ID 업데이트
    if (result.success && result.isNewProject) {
        if (window.state) {
            window.state.currentProject = result.projectId;
        }
        
        // 프로젝트 선택 드롭다운 업데이트
        if (typeof loadUserProjects === 'function') {
            loadUserProjects();
        }
    }
    
    return result.success;
}

// 저장된 프로젝트 로드
async function loadProjectForEditing(projectId) {
    // 현재 작업 내용 확인
    if (window.blocklyWorkspace && window.blocklyWorkspace().getAllBlocks().length > 0) {
        if (!confirm('저장되지 않은 변경 사항이 있을 수 있습니다. 계속하시겠습니까?')) {
            return false;
        }
    }
    
    // 프로젝트 로드
    const result = await loadProject(projectId);
    
    if (!result.success) {
        return false;
    }
    
    // Blockly 작업 공간 업데이트
    if (window.blocklyFunctions && window.blocklyFunctions.loadWorkspace) {
        const loadSuccess = window.blocklyFunctions.loadWorkspace(result.blocklyXml);
        
        if (!loadSuccess) {
            showNotification('프로젝트 불러오기에 실패했습니다.', 'error');
            return false;
        }
    }
    
    // 프로젝트 제목 업데이트 (있는 경우)
    const titleInput = document.getElementById('project-title');
    if (titleInput) {
        titleInput.value = result.title || '제목 없음';
    }
    
    // 현재 프로젝트 ID 저장
    if (window.state) {
        window.state.currentProject = projectId;
    }
    
    // 플레이그라운드 페이지로 이동
    const playgroundLink = document.querySelector('nav a[data-page="playground"]');
    if (playgroundLink) {
        playgroundLink.click();
    }
    
    showNotification('프로젝트를 불러왔습니다.', 'success');
    return true;
}

// 새 프로젝트 생성
function createNewProject() {
    // 현재 작업 내용 확인
    if (window.blocklyWorkspace && window.blocklyWorkspace().getAllBlocks().length > 0) {
        if (!confirm('저장되지 않은 변경 사항이 있을 수 있습니다. 계속하시겠습니까?')) {
            return;
        }
    }
    
    // Blockly 작업 공간 초기화
    if (window.blocklyFunctions && window.blocklyFunctions.newWorkspace) {
        window.blocklyFunctions.newWorkspace();
    }
    
    // 현재 프로젝트 ID 초기화
    if (window.state) {
        window.state.currentProject = null;
    }
    
    // 프로젝트 제목 초기화 (있는 경우)
    const titleInput = document.getElementById('project-title');
    if (titleInput) {
        titleInput.value = '제목 없음';
    }
    
    showNotification('새 프로젝트가 생성되었습니다.', 'info');
}

// 외부에서 사용할 함수 공개
window.storageFunctions = {
    saveCurrentProject,
    loadProjectForEditing,
    createNewProject,
    deleteProject,
    shareProject,
    searchProjects
};