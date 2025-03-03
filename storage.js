// storage.js (R2 버킷 전용 저장소)
// 이 코드는 프로젝트 메타데이터와 콘텐츠를 단일 JSON 파일로 R2 버킷에 저장합니다.
// 다른 기능(예: 프로젝트 목록 조회, 공유 등)은 별도로 구현해야 합니다.

// Cloudflare Workers의 API 엔드포인트
const serviceURL = '/api/storage';

// 프로젝트 ID 생성 (새 프로젝트일 경우)
function generateProjectId() {
  return 'proj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// 프로젝트 저장 (오직 R2 버킷만 사용)
async function saveProject(projectData) {
  if (!firebase.auth().currentUser) {
    showNotification('로그인 후 이용해주세요.', 'error');
    return { success: false, error: 'auth-required' };
  }
  
  try {
    const userId = firebase.auth().currentUser.uid;
    // 기존 프로젝트 ID가 없으면 새 ID 생성
    const projectId = projectData.id || generateProjectId();
    
    // 프로젝트 데이터를 하나의 JSON 객체로 구성 (메타데이터 + 콘텐츠)
    const project = {
      id: projectId,
      title: projectData.title || '제목 없음',
      blocklyXml: projectData.blocklyXml,
      generatedCode: projectData.generatedCode,
      updatedAt: new Date().toISOString()
    };

    // R2에 JSON 파일 업로드 (파일 경로 예시: projects/{userId}/{projectId}.json)
    const response = await uploadToR2(`projects/${userId}/${projectId}.json`, JSON.stringify(project));
    
    if (!response.success) {
      throw new Error('R2 업로드 실패: ' + response.error);
    }
    
    showNotification('프로젝트가 저장되었습니다.', 'success');
    return { success: true, projectId: projectId };
  } catch (error) {
    console.error('프로젝트 저장 오류:', error);
    showNotification('프로젝트 저장 실패: ' + error.message, 'error');
    return { success: false, error: error.message };
  }
}

// 프로젝트 불러오기 (오직 R2 버킷만 사용)
async function loadProject(projectId) {
  try {
    if (!firebase.auth().currentUser) {
      throw new Error('로그인이 필요합니다.');
    }
    const userId = firebase.auth().currentUser.uid;
    const projectContentJson = await downloadFromR2(`projects/${userId}/${projectId}.json`);
    
    if (!projectContentJson) {
      throw new Error('프로젝트 내용을 불러올 수 없습니다.');
    }
    
    const project = JSON.parse(projectContentJson);
    return { success: true, ...project };
  } catch (error) {
    console.error('프로젝트 로드 오류:', error);
    showNotification('프로젝트 로드 실패: ' + error.message, 'error');
    return { success: false, error: error.message };
  }
}

// 프로젝트 삭제 (오직 R2 버킷만 사용)
async function deleteProject(projectId) {
  if (!firebase.auth().currentUser) {
    showNotification('로그인 후 이용해주세요.', 'error');
    return { success: false, error: 'auth-required' };
  }
  
  try {
    const userId = firebase.auth().currentUser.uid;
    const response = await deleteFromR2(`projects/${userId}/${projectId}.json`);
    
    if (!response.success) {
      throw new Error('R2 삭제 실패: ' + response.error);
    }
    
    showNotification('프로젝트가 삭제되었습니다.', 'info');
    return { success: true };
  } catch (error) {
    console.error('프로젝트 삭제 오류:', error);
    showNotification('프로젝트 삭제 실패: ' + error.message, 'error');
    return { success: false, error: error.message };
  }
}

// R2 파일 업로드 함수
async function uploadToR2(path, content) {
  try {
    const idToken = await firebase.auth().currentUser.getIdToken();
    
    const response = await fetch(`${serviceURL}/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({
        filePath: path,
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

// R2 파일 다운로드 함수
async function downloadFromR2(path) {
  try {
    let headers = { 'Content-Type': 'application/json' };
    if (firebase.auth().currentUser) {
      const idToken = await firebase.auth().currentUser.getIdToken();
      headers['Authorization'] = `Bearer ${idToken}`;
    }
    
    const response = await fetch(`${serviceURL}/download`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ filePath: path })
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

// R2 파일 삭제 함수
async function deleteFromR2(path) {
  try {
    const idToken = await firebase.auth().currentUser.getIdToken();
    
    const response = await fetch(`${serviceURL}/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({ filePath: path })
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

// 현재 편집 중인 프로젝트 저장 (편집 인터페이스에서 호출)
async function saveCurrentProject() {
  if (!firebase.auth().currentUser) {
    showNotification('로그인 후 이용해주세요.', 'error');
    return false;
  }
  
  // Blockly 작업 공간 저장
  const blocklyXml = window.blocklyFunctions.saveWorkspace();
  const generatedCode = window.blocklyFunctions.generateCode();
  
  // 프로젝트 제목 가져오기 (있을 경우)
  const projectTitle = document.getElementById('project-title')
    ? document.getElementById('project-title').value
    : '제목 없음';
  
  // 기존 프로젝트 ID (있는 경우)
  const projectId = window.state ? window.state.currentProject : null;
  
  const projectData = {
    id: projectId,
    title: projectTitle,
    blocklyXml: blocklyXml,
    generatedCode: generatedCode
  };
  
  const result = await saveProject(projectData);
  if (result.success && !projectId) {
    if (window.state) {
      window.state.currentProject = result.projectId;
    }
  }
  return result.success;
}

// 프로젝트 불러오기 (편집용)
async function loadProjectForEditing(projectId) {
  if (window.blocklyWorkspace && window.blocklyWorkspace().getAllBlocks().length > 0) {
    if (!confirm('저장되지 않은 변경 사항이 있을 수 있습니다. 계속하시겠습니까?')) {
      return false;
    }
  }
  
  const result = await loadProject(projectId);
  if (!result.success) {
    return false;
  }
  
  if (window.blocklyFunctions && window.blocklyFunctions.loadWorkspace) {
    const loadSuccess = window.blocklyFunctions.loadWorkspace(result.blocklyXml);
    if (!loadSuccess) {
      showNotification('프로젝트 불러오기에 실패했습니다.', 'error');
      return false;
    }
  }
  
  const titleInput = document.getElementById('project-title');
  if (titleInput) {
    titleInput.value = result.title || '제목 없음';
  }
  
  if (window.state) {
    window.state.currentProject = projectId;
  }
  
  const playgroundLink = document.querySelector('nav a[data-page="playground"]');
  if (playgroundLink) {
    playgroundLink.click();
  }
  
  showNotification('프로젝트를 불러왔습니다.', 'success');
  return true;
}

// 새 프로젝트 생성 (편집용)
function createNewProject() {
  if (window.blocklyWorkspace && window.blocklyWorkspace().getAllBlocks().length > 0) {
    if (!confirm('저장되지 않은 변경 사항이 있을 수 있습니다. 계속하시겠습니까?')) {
      return;
    }
  }
  
  if (window.blocklyFunctions && window.blocklyFunctions.newWorkspace) {
    window.blocklyFunctions.newWorkspace();
  }
  
  if (window.state) {
    window.state.currentProject = null;
  }
  
  const titleInput = document.getElementById('project-title');
  if (titleInput) {
    titleInput.value = '제목 없음';
  }
  
  showNotification('새 프로젝트가 생성되었습니다.', 'info');
}

window.storageFunctions = {
  saveCurrentProject,
  loadProjectForEditing,
  createNewProject,
  deleteProject
};
