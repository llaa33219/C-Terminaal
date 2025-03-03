// 터미널 초기화 함수 (별도로 분리하여 initPlayground에서 호출)
function initTerminal() {
    try {
        console.log('터미널 초기화 시도:', typeof Terminal);
        
        // 터미널 초기화
        terminal = new Terminal({
            cursorBlink: true,
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 14,
            theme: {
                background: '#1e1e1e',
                foreground: '#f8f8f8',
                cursor: '#f8f8f8'
            }
        });
        
        const terminalElement = document.getElementById('terminal');
        if (terminalElement) {
            terminal.open(terminalElement);
            terminal.writeln('C-Terminal v1.0');
            terminal.writeln('터미널이 준비되었습니다.');
            terminal.writeln('실행 버튼을 눌러 코드를 실행하세요.');
            terminal.writeln('');
            
            return true;
        }
    } catch (error) {
        console.error('터미널 초기화 오류:', error);
        
        // 가상 터미널 객체 생성 (폴백)
        const terminalElement = document.getElementById('terminal');
        if (terminalElement) {
            terminalElement.innerHTML = '<div style="color: white; padding: 10px; font-family: monospace;">터미널을 초기화할 수 없습니다. 페이지를 새로고침하거나 나중에 다시 시도해주세요.</div>';
        }
        
        // 가상 터미널 객체 제공
        terminal = {
            writeln: function(text) {
                console.log('Terminal output:', text);
                const terminalElement = document.getElementById('terminal');
                if (terminalElement) {
                    const line = document.createElement('div');
                    line.textContent = text;
                    line.style.color = 'white';
                    line.style.fontFamily = 'monospace';
                    line.style.padding = '2px 10px';
                    terminalElement.appendChild(line);
                }
            },
            clear: function() {
                const terminalElement = document.getElementById('terminal');
                if (terminalElement) {
                    terminalElement.innerHTML = '';
                }
            },
            open: function(element) {
                console.log('Opening virtual terminal in element:', element);
            }
        };
        
        // 최소한의 출력 제공
        terminal.writeln('C-Terminal v1.0');
        terminal.writeln('터미널이 준비되었습니다.');
        terminal.writeln('실행 버튼을 눌러 코드를 실행하세요.');
        terminal.writeln('');
    }
    
    return false;
}// 스크립트 로딩을 확인하고 지연 초기화하는 함수
function ensureScriptsLoaded() {
    // XTerm 라이브러리 로딩 확인
    if (typeof Terminal === 'undefined') {
        console.log('XTerm 라이브러리 로딩 중...');
        // 500ms 후에 다시 확인
        setTimeout(ensureScriptsLoaded, 500);
        return;
    }
    
    console.log('모든 스크립트가 로드되었습니다.');
    
    // 네비게이션 페이지 전환 이벤트 추가
    document.getElementById('nav-playground').addEventListener('click', (e) => {
        e.preventDefault();
        showSection('playground-section');
        initPlayground();
    });
    
    document.getElementById('get-started-btn').addEventListener('click', () => {
        showSection('playground-section');
        initPlayground();
    });
}// C-Terminal 애플리케이션 JavaScript

// Blockly 및 터미널 환경 초기화
let workspace;
let terminal;
let currentUser = null;
let currentProject = {
    id: null,
    title: '제목 없는 프로젝트',
    blocks: null,
    isPublic: true,
    lastModified: new Date()
};

// 코드 실행 중 상태
let isRunning = false;

// 로컬 스토리지 키
const STORAGE_KEYS = {
    USER: 'c-terminal-user',
    PROJECT: 'c-terminal-current-project',
    PROJECTS: 'c-terminal-projects',
    COMMUNITY_POSTS: 'c-terminal-community-posts'
};

// R2 버킷 관련 설정
const R2_CONFIG = {
    bucketName: 'c-terminaal-storage', // 사용자가 지정한 버킷 이름
    endpoint: '/api', // _worker.js를 통한 API 엔드포인트
    apiKey: 'c-terminaal-api-key' // API 키 (실제 운영 환경에서는 더 강력한 인증 필요)
};

// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', () => {
    // 네비게이션 핸들러 초기화
    initNavigation();
    
    // 로그인 상태 확인
    checkLoginStatus();
    
    // 모달 핸들러 초기화
    initModals();
    
    // 메인 페이지 초기화
    initHomePage();
});

// 네비게이션 핸들러 초기화
function initNavigation() {
    // 각 네비게이션 링크에 이벤트 리스너 추가
    document.getElementById('nav-home').addEventListener('click', (e) => {
        e.preventDefault();
        showSection('home-section');
    });
    
    document.getElementById('nav-playground').addEventListener('click', (e) => {
        e.preventDefault();
        showSection('playground-section');
        
        // Terminal 존재 여부에 관계없이 플레이그라운드 초기화 시도
        setTimeout(() => {
            try {
                initPlayground();
            } catch (error) {
                console.error('플레이그라운드 초기화 오류:', error);
            }
        }, 100);
    });
    
    document.getElementById('nav-community').addEventListener('click', (e) => {
        e.preventDefault();
        showSection('community-section');
        try {
            loadCommunityPosts();
        } catch (error) {
            console.error('커뮤니티 로드 오류:', error);
        }
    });
    
    document.getElementById('nav-explore').addEventListener('click', (e) => {
        e.preventDefault();
        showSection('explore-section');
        try {
            loadExploreProjects();
        } catch (error) {
            console.error('프로젝트 탐색 오류:', error);
        }
    });
    
    // 시작하기 버튼
    document.getElementById('get-started-btn').addEventListener('click', () => {
        showSection('playground-section');
        // Terminal 존재 여부에 관계없이 플레이그라운드 초기화 시도
        setTimeout(() => {
            try {
                initPlayground();
            } catch (error) {
                console.error('플레이그라운드 초기화 오류:', error);
            }
        }, 100);
    });
    
    // 더 알아보기 버튼
    document.getElementById('learn-more-btn').addEventListener('click', () => {
        // 스크롤을 특징 섹션으로 이동
        document.querySelector('.features').scrollIntoView({ behavior: 'smooth' });
    });
    
    // 사용자 드롭다운 메뉴 토글
    const userAvatar = document.getElementById('user-avatar');
    if (userAvatar) {
        userAvatar.addEventListener('click', toggleUserDropdown);
    }
    
    // 프로필 페이지 이동
    document.getElementById('nav-profile').addEventListener('click', (e) => {
        e.preventDefault();
        showSection('profile-section');
        loadUserProfile();
    });
    
    // 로그아웃 버튼
    document.getElementById('logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
}

// 섹션 표시 함수
function showSection(sectionId) {
    console.log('섹션 전환:', sectionId);
    
    // 모든 섹션 숨기기
    document.querySelectorAll('.section').forEach(section => {
        if (section.style) {
            section.style.display = 'none';
        } else {
            section.setAttribute('style', 'display: none;');
        }
    });
    
    // 선택한 섹션 표시
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        if (selectedSection.style) {
            selectedSection.style.display = '';
        } else {
            selectedSection.setAttribute('style', 'display: block;');
        }
    } else {
        console.error('섹션을 찾을 수 없음:', sectionId);
    }
    
    // 네비게이션 링크 업데이트
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
    });
    
    // 해당하는 네비게이션 링크 활성화
    const navId = sectionId.replace('-section', '');
    const navLink = document.getElementById(`nav-${navId}`);
    if (navLink) {
        navLink.classList.add('active');
    }
}

// 사용자 드롭다운 토글 함수
function toggleUserDropdown() {
    const dropdown = document.querySelector('.user-dropdown');
    dropdown.classList.toggle('hidden');
    
    // 클릭 외부 영역에서 드롭다운 닫기
    function closeDropdown(e) {
        if (!e.target.closest('.user-menu')) {
            dropdown.classList.add('hidden');
            document.removeEventListener('click', closeDropdown);
        }
    }
    
    // 지연 설정으로 현재 클릭이 닫기 이벤트를 발생시키지 않도록 함
    setTimeout(() => {
        document.addEventListener('click', closeDropdown);
    }, 0);
}

// 로그인 상태 확인 함수
function checkLoginStatus() {
    // 로컬 스토리지에서 사용자 정보 가져오기
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
    
    if (savedUser) {
        // 사용자 정보가 있으면 로그인 상태로 설정
        currentUser = JSON.parse(savedUser);
        updateUIForLoggedInUser();
    } else {
        // 로그인되지 않은 상태 UI 업데이트
        updateUIForLoggedOutUser();
    }
}

// 로그인 상태 UI 업데이트
function updateUIForLoggedInUser() {
    // 로그인/회원가입 버튼 숨기기
    document.querySelector('.nav-auth').classList.add('hidden');
    
    // 사용자 메뉴 표시
    document.querySelector('.user-menu').classList.remove('hidden');
    
    // 사용자 아바타 업데이트
    const avatarUrl = currentUser.avatar || 'img/default-avatar.svg';
    document.getElementById('user-avatar').src = avatarUrl;
}

// 로그아웃 상태 UI 업데이트
function updateUIForLoggedOutUser() {
    // 로그인/회원가입 버튼 표시
    document.querySelector('.nav-auth').classList.remove('hidden');
    
    // 사용자 메뉴 숨기기
    document.querySelector('.user-menu').classList.add('hidden');
    
    // 현재 사용자 정보 초기화
    currentUser = null;
}

// 모달 초기화 함수
function initModals() {
    // 모달 열기 버튼 이벤트 리스너
    document.getElementById('login-btn').addEventListener('click', () => openModal('login-modal'));
    document.getElementById('signup-btn').addEventListener('click', () => openModal('signup-modal'));
    
    // 모달 닫기 버튼 이벤트 리스너
    document.querySelectorAll('.close-modal-btn').forEach(btn => {
        btn.addEventListener('click', closeCurrentModal);
    });
    
    // 모달 외부 클릭 시 닫기
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeCurrentModal();
            }
        });
    });
    
    // 로그인/회원가입 전환 이벤트 리스너
    document.getElementById('switch-to-signup').addEventListener('click', (e) => {
        e.preventDefault();
        closeCurrentModal();
        openModal('signup-modal');
    });
    
    document.getElementById('switch-to-login').addEventListener('click', (e) => {
        e.preventDefault();
        closeCurrentModal();
        openModal('login-modal');
    });
    
    // 로그인 제출 이벤트 리스너
    document.getElementById('login-submit-btn').addEventListener('click', handleLogin);
    
    // 회원가입 제출 이벤트 리스너
    document.getElementById('signup-submit-btn').addEventListener('click', handleSignup);
    
    // 공유 모달 관련
    document.getElementById('share-btn').addEventListener('click', () => {
        openShareModal();
    });
    
    document.getElementById('copy-link-btn').addEventListener('click', copyShareLink);
    
    // 프로필 편집 모달 관련
    document.getElementById('edit-profile-btn').addEventListener('click', () => {
        openProfileEditModal();
    });
    
    document.getElementById('save-profile-btn').addEventListener('click', saveProfileChanges);
    
    // 아바타 업로드 관련
    document.getElementById('upload-avatar-btn').addEventListener('click', () => {
        document.getElementById('avatar-upload').click();
    });
    
    document.getElementById('avatar-upload').addEventListener('change', handleAvatarUpload);
    
    // 새 게시물 작성 모달
    document.getElementById('new-post-btn').addEventListener('click', () => {
        openModal('new-post-modal');
    });
    
    document.getElementById('submit-post-btn').addEventListener('click', submitNewPost);
    document.getElementById('cancel-post-btn').addEventListener('click', closeCurrentModal);
}

// 모달 열기 함수
function openModal(modalId) {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.add('hidden');
    });
    
    document.getElementById(modalId).classList.remove('hidden');
}

// 현재 모달 닫기 함수
function closeCurrentModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.add('hidden');
    });
}

// 로그인 처리 함수
function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // 간단한 유효성 검사
    if (!email || !password) {
        alert('이메일과 비밀번호를 입력해주세요.');
        return;
    }
    
    // 실제 구현에서는 서버 인증 로직 추가
    // 데모를 위한 간단한 로그인 처리
    simulateLogin(email);
}

// 테스트용 로그인 시뮬레이션
function simulateLogin(email) {
    // 가상의 사용자 정보 생성
    const user = {
        id: 'user_' + Date.now(),
        username: email.split('@')[0],
        email: email,
        avatar: null,
        bio: '',
        joinDate: new Date(),
        projects: [],
        followers: [],
        following: []
    };
    
    // 사용자 정보 저장
    currentUser = user;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    
    // UI 업데이트
    updateUIForLoggedInUser();
    
    // 모달 닫기
    closeCurrentModal();
    
    // 알림 표시
    alert('로그인되었습니다.');
}

// 회원가입 처리 함수
function handleSignup() {
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    const termsAgreed = document.getElementById('terms-agree').checked;
    
    // 유효성 검사
    if (!username || !email || !password) {
        alert('모든 필드를 입력해주세요.');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
    }
    
    if (!termsAgreed) {
        alert('이용약관에 동의해주세요.');
        return;
    }
    
    // 실제 구현에서는 서버에 회원가입 요청 로직 추가
    // 데모를 위한 간단한 회원가입 처리
    simulateSignup(username, email);
}

// 테스트용 회원가입 시뮬레이션
function simulateSignup(username, email) {
    // 가상의 사용자 정보 생성
    const user = {
        id: 'user_' + Date.now(),
        username: username,
        email: email,
        avatar: null,
        bio: '',
        joinDate: new Date(),
        projects: [],
        followers: [],
        following: []
    };
    
    // 사용자 정보 저장
    currentUser = user;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    
    // UI 업데이트
    updateUIForLoggedInUser();
    
    // 모달 닫기
    closeCurrentModal();
    
    // 알림 표시
    alert('회원가입이 완료되었습니다.');
}

// 로그아웃 함수
function logout() {
    // 로컬 스토리지에서 사용자 정보 제거
    localStorage.removeItem(STORAGE_KEYS.USER);
    
    // 사용자 정보 초기화
    currentUser = null;
    
    // UI 업데이트
    updateUIForLoggedOutUser();
    
    // 홈 페이지로 이동
    showSection('home-section');
    
    // 드롭다운 닫기
    document.querySelector('.user-dropdown').classList.add('hidden');
}

// 홈 페이지 초기화 함수
function initHomePage() {
    // 홈 페이지 관련 초기화 작업
    // 여기서는 특별한 초기화가 필요 없으므로 비워둡니다.
}

// 플레이그라운드 초기화 함수
function initPlayground() {
    // 이미 초기화된 경우 건너뛰기
    if (workspace && terminal) {
        return;
    }
    
    // 블록 도구 상자 설정
    const toolbox = {
        kind: 'categoryToolbox',
        contents: [
            {
                kind: 'category',
                name: '로직',
                colour: '#5C81A6',
                contents: [
                    {
                        kind: 'block',
                        type: 'controls_if'
                    },
                    {
                        kind: 'block',
                        type: 'controls_repeat_ext'
                    },
                    {
                        kind: 'block',
                        type: 'logic_compare'
                    },
                    {
                        kind: 'block',
                        type: 'logic_operation'
                    },
                    {
                        kind: 'block',
                        type: 'logic_boolean'
                    }
                ]
            },
            {
                kind: 'category',
                name: '수학',
                colour: '#5CA65C',
                contents: [
                    {
                        kind: 'block',
                        type: 'math_number'
                    },
                    {
                        kind: 'block',
                        type: 'math_arithmetic'
                    },
                    {
                        kind: 'block',
                        type: 'math_random_int'
                    }
                ]
            },
            {
                kind: 'category',
                name: '텍스트',
                colour: '#A65CA6',
                contents: [
                    {
                        kind: 'block',
                        type: 'text'
                    },
                    {
                        kind: 'block',
                        type: 'text_print'
                    },
                    {
                        kind: 'block',
                        type: 'text_join'
                    }
                ]
            },
            {
                kind: 'category',
                name: '변수',
                colour: '#A6745C',
                custom: 'VARIABLE'
            },
            {
                kind: 'category',
                name: '함수',
                colour: '#745CA6',
                custom: 'PROCEDURE'
            }
        ]
    };
    
    try {
        // Blockly 초기화
        workspace = Blockly.inject('blockly-container', {
            toolbox: toolbox,
            scrollbars: true,
            horizontalLayout: false,
            trashcan: true,
            zoom: {
                controls: true,
                wheel: true,
                startScale: 1.0,
                maxScale: 3,
                minScale: 0.3,
                scaleSpeed: 1.2
            },
            grid: {
                spacing: 20,
                length: 3,
                colour: '#ccc',
                snap: true
            }
        });
        
        // 저장된 프로젝트 불러오기
        loadCurrentProject();
        
        // 터미널 초기화
        initTerminal();
        
        // 실행 버튼 이벤트 리스너
        document.getElementById('run-btn').addEventListener('click', runCode);
        
        // 저장 버튼 이벤트 리스너
        document.getElementById('save-btn').addEventListener('click', saveProject);
        
        // 프로젝트 제목 변경 이벤트 리스너
        document.getElementById('project-title').addEventListener('change', updateProjectTitle);
        
        // 터미널 지우기 버튼 이벤트 리스너
        document.getElementById('clear-terminal-btn').addEventListener('click', clearTerminal);
    } catch (error) {
        console.error('플레이그라운드 초기화 오류:', error);
        const blocklyContainer = document.getElementById('blockly-container');
        if (blocklyContainer) {
            blocklyContainer.innerHTML = '<div style="padding: 20px; color: #333;">Blockly를 초기화할 수 없습니다. 페이지를 새로고침하거나 나중에 다시 시도해주세요.</div>';
        }
    }
}

// 코드 실행 함수
function runCode() {
    // 이미 실행 중인 경우 중단
    if (isRunning) {
        return;
    }
    
    // 실행 중 상태로 변경
    isRunning = true;
    document.getElementById('run-btn').innerHTML = '<i class="fas fa-spinner fa-spin"></i> 실행 중...';
    
    // 터미널 지우기
    clearTerminal();
    
    // Blockly에서 JavaScript 코드 생성
    const code = Blockly.JavaScript.workspaceToCode(workspace);
    
    // 코드 실행 준비 (터미널 출력용 함수 오버라이드)
    const originalConsoleLog = console.log;
    console.log = function() {
        const args = Array.from(arguments);
        terminal.writeln(args.join(' '));
    };
    
    // 안전한 코드 실행을 위한 래퍼 함수
    try {
        // 코드 실행
        eval(code);
        terminal.writeln('\n프로그램이 성공적으로 실행되었습니다.');
    } catch (error) {
        terminal.writeln(`\n오류 발생: ${error.message}`);
    } finally {
        // console.log 복원
        console.log = originalConsoleLog;
        
        // 실행 완료 상태로 변경
        isRunning = false;
        document.getElementById('run-btn').innerHTML = '<i class="fas fa-play"></i> 실행';
    }
}

// 터미널 지우기 함수
function clearTerminal() {
    terminal.clear();
}

// 프로젝트 제목 업데이트 함수
function updateProjectTitle() {
    currentProject.title = document.getElementById('project-title').value;
    updateProjectStatus('변경됨');
}

// 프로젝트 상태 업데이트 함수
function updateProjectStatus(status) {
    document.getElementById('project-status').textContent = status;
}

// 프로젝트 저장 함수
function saveProject() {
    // 프로젝트 데이터 수집
    currentProject.blocks = Blockly.serialization.workspaces.save(workspace);
    currentProject.lastModified = new Date();
    
    // 프로젝트 ID가 없으면 생성
    if (!currentProject.id) {
        currentProject.id = 'project_' + Date.now();
    }
    
    // 로컬 스토리지에 저장
    localStorage.setItem(STORAGE_KEYS.PROJECT, JSON.stringify(currentProject));
    
    // 사용자가 로그인한 경우 프로젝트 목록에 추가
    if (currentUser) {
        // 기존 프로젝트 목록 가져오기
        let userProjects = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS)) || [];
        
        // 이미 있는 프로젝트인지 확인
        const existingIndex = userProjects.findIndex(p => p.id === currentProject.id);
        
        if (existingIndex >= 0) {
            // 기존 프로젝트 업데이트
            userProjects[existingIndex] = currentProject;
        } else {
            // 새 프로젝트 추가
            userProjects.push(currentProject);
        }
        
        // 로컬 스토리지에 프로젝트 목록 저장
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(userProjects));
        
        // 실제 구현에서는 여기에 R2 버킷에 저장하는 로직 추가
    }
    
    // 상태 업데이트
    updateProjectStatus('저장됨');
}

// 현재 프로젝트 불러오기 함수
function loadCurrentProject() {
    // 로컬 스토리지에서 프로젝트 불러오기
    const savedProject = localStorage.getItem(STORAGE_KEYS.PROJECT);
    
    if (savedProject) {
        currentProject = JSON.parse(savedProject);
        
        // 프로젝트 제목 설정
        document.getElementById('project-title').value = currentProject.title;
        
        // 블록 불러오기
        if (currentProject.blocks) {
            Blockly.serialization.workspaces.load(currentProject.blocks, workspace);
        }
    }
}

// 공유 모달 열기 함수
function openShareModal() {
    // 저장되지 않은 프로젝트라면 먼저 저장
    if (document.getElementById('project-status').textContent !== '저장됨') {
        saveProject();
    }
    
    // 가상의 공유 링크 생성
    const shareLink = `https://c-terminal.pages.dev/projects/${currentProject.id}`;
    document.getElementById('share-link').value = shareLink;
    
    // 공개 설정 체크박스 상태 설정
    document.getElementById('public-project').checked = currentProject.isPublic;
    
    // 모달 열기
    openModal('share-modal');
}

// 공유 링크 복사 함수
function copyShareLink() {
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
}

// 사용자 프로필 로드 함수
function loadUserProfile() {
    if (!currentUser) {
        showSection('home-section');
        alert('프로필을 보려면 먼저 로그인하세요.');
        return;
    }
    
    // 프로필 정보 설정
    document.getElementById('profile-username').textContent = currentUser.username;
    document.getElementById('profile-bio').textContent = currentUser.bio || '자기소개가 없습니다.';
    document.getElementById('profile-avatar-img').src = currentUser.avatar || 'img/default-avatar.svg';
    
    // 프로젝트 카운트 설정
    const userProjects = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS)) || [];
    document.getElementById('projects-count').textContent = userProjects.length;
    
    // 팔로워 및 팔로잉 카운트 설정
    document.getElementById('followers-count').textContent = currentUser.followers?.length || 0;
    document.getElementById('following-count').textContent = currentUser.following?.length || 0;
    
    // 사용자 프로젝트 로드
    loadUserProjects();
}

// 사용자 프로젝트 로드 함수
function loadUserProjects() {
    const projectsContainer = document.getElementById('user-projects');
    projectsContainer.innerHTML = ''; // 기존 항목 지우기
    
    // 로컬 스토리지에서 프로젝트 목록 가져오기
    const userProjects = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS)) || [];
    
    if (userProjects.length === 0) {
        projectsContainer.innerHTML = '<p class="empty-message">아직 프로젝트가 없습니다. 플레이그라운드에서 새 프로젝트를 만들어보세요!</p>';
        return;
    }
    
    // 프로젝트 카드 생성
    userProjects.forEach(project => {
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
            loadProject(project.id);
        });
        
        projectsContainer.appendChild(projectCard);
    });
}

// 특정 프로젝트 로드 함수
function loadProject(projectId) {
    // 프로젝트 목록에서 해당 ID의 프로젝트 찾기
    const userProjects = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS)) || [];
    const project = userProjects.find(p => p.id === projectId);
    
    if (!project) {
        alert('프로젝트를 찾을 수 없습니다.');
        return;
    }
    
    // 현재 프로젝트 설정
    currentProject = project;
    localStorage.setItem(STORAGE_KEYS.PROJECT, JSON.stringify(currentProject));
    
    // 플레이그라운드로 이동
    showSection('playground-section');
    
    // UI 업데이트
    document.getElementById('project-title').value = currentProject.title;
    updateProjectStatus('로드됨');
    
    // 블록 불러오기
    if (currentProject.blocks) {
        // 기존 블록 지우기
        workspace.clear();
        
        // 저장된 블록 불러오기
        Blockly.serialization.workspaces.load(currentProject.blocks, workspace);
    }
}

// 프로필 편집 모달 열기 함수
function openProfileEditModal() {
    if (!currentUser) return;
    
    // 현재 프로필 정보로 필드 채우기
    document.getElementById('edit-username').value = currentUser.username;
    document.getElementById('edit-bio').value = currentUser.bio || '';
    document.getElementById('avatar-preview').src = currentUser.avatar || 'img/default-avatar.svg';
    
    // 모달 열기
    openModal('edit-profile-modal');
}

// 프로필 변경사항 저장 함수
function saveProfileChanges() {
    if (!currentUser) return;
    
    // 입력값 가져오기
    const newUsername = document.getElementById('edit-username').value;
    const newBio = document.getElementById('edit-bio').value;
    
    // 기본 유효성 검사
    if (!newUsername) {
        alert('사용자 이름은 필수입니다.');
        return;
    }
    
    // 사용자 정보 업데이트
    currentUser.username = newUsername;
    currentUser.bio = newBio;
    
    // 로컬 스토리지에 저장
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
    
    // 모달 닫기
    closeCurrentModal();
    
    // 프로필 페이지 새로고침
    loadUserProfile();
    
    // 알림 표시
    alert('프로필이 업데이트되었습니다.');
}

// 아바타 업로드 처리 함수
function handleAvatarUpload(event) {
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
    reader.onload = function(e) {
        // 이미지 미리보기 업데이트
        document.getElementById('avatar-preview').src = e.target.result;
        
        // 실제 구현에서는 여기에 R2 버킷에 업로드하는 로직 추가
        
        // 사용자 아바타 URL 업데이트 (데모용으로 Data URL 사용)
        currentUser.avatar = e.target.result;
    };
    reader.readAsDataURL(file);
}

// 커뮤니티 게시물 로드 함수
function loadCommunityPosts() {
    const postsContainer = document.getElementById('posts-container');
    postsContainer.innerHTML = ''; // 기존 게시물 지우기
    
    // 커뮤니티 탭 이벤트 리스너
    document.querySelectorAll('.community-tabs .tab-btn').forEach(tab => {
        tab.addEventListener('click', () => {
            // 활성 탭 설정
            document.querySelectorAll('.community-tabs .tab-btn').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // 선택한 탭에 따라 다른 정렬 방식으로 게시물 로드
            const tabType = tab.dataset.tab;
            loadPostsByType(tabType);
        });
    });
    
    // 기본적으로 '인기' 탭 게시물 로드
    loadPostsByType('hot');
}

// 탭 유형별 게시물 로드 함수
function loadPostsByType(tabType) {
    const postsContainer = document.getElementById('posts-container');
    postsContainer.innerHTML = ''; // 기존 게시물 지우기
    
    // 로컬 스토리지에서 게시물 가져오기
    let posts = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMMUNITY_POSTS)) || [];
    
    // 탭 유형에 따라 정렬
    switch (tabType) {
        case 'hot':
            // 인기순 (좋아요 수 기준)
            posts.sort((a, b) => (b.likes || 0) - (a.likes || 0));
            break;
        case 'new':
            // 최신순
            posts.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'top':
            // 화제순 (댓글 수 기준)
            posts.sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0));
            break;
    }
    
    // 게시물이 없는 경우
    if (posts.length === 0) {
        postsContainer.innerHTML = '<p class="empty-message">아직 게시물이 없습니다. 첫 번째 게시물을 작성해보세요!</p>';
        return;
    }
    
    // 게시물 카드 생성
    posts.forEach(post => {
        const postCard = document.createElement('div');
        postCard.className = 'post-card';
        
        // 게시물 내용을 마크다운으로 변환 (링크, 강조 등 지원)
        const postContent = marked.parse(post.content);
        
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
        
        // 프로젝트 링크 클릭 이벤트
        const projectLink = postCard.querySelector('.post-project-link a');
        if (projectLink) {
            projectLink.addEventListener('click', (e) => {
                e.preventDefault();
                loadProject(projectLink.dataset.projectId);
            });
        }
        
        // 좋아요 버튼 클릭 이벤트
        const likeBtn = postCard.querySelector('.post-like-btn');
        likeBtn.addEventListener('click', () => {
            likePost(post.id);
        });
        
        // 댓글 버튼 클릭 이벤트
        const commentBtn = postCard.querySelector('.post-comment-btn');
        commentBtn.addEventListener('click', () => {
            // 여기에 댓글 기능 구현 (데모에서는 생략)
            alert('댓글 기능은 데모 버전에서 지원하지 않습니다.');
        });
        
        postsContainer.appendChild(postCard);
    });
}

// 게시물 좋아요 함수
function likePost(postId) {
    if (!currentUser) {
        alert('좋아요를 남기려면 로그인이 필요합니다.');
        return;
    }
    
    // 로컬 스토리지에서 게시물 가져오기
    let posts = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMMUNITY_POSTS)) || [];
    
    // 게시물 찾기
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) return;
    
    // 좋아요 수 증가
    posts[postIndex].likes = (posts[postIndex].likes || 0) + 1;
    
    // 로컬 스토리지에 저장
    localStorage.setItem(STORAGE_KEYS.COMMUNITY_POSTS, JSON.stringify(posts));
    
    // UI 업데이트 (현재 열려있는 탭 유형 확인)
    const activeTab = document.querySelector('.community-tabs .tab-btn.active');
    if (activeTab) {
        loadPostsByType(activeTab.dataset.tab);
    }
}

// 새 게시물 작성 함수
function submitNewPost() {
    if (!currentUser) {
        alert('게시물을 작성하려면 로그인이 필요합니다.');
        closeCurrentModal();
        return;
    }
    
    // 입력값 가져오기
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;
    const attachProject = document.getElementById('attach-project').checked;
    
    // 유효성 검사
    if (!title || !content) {
        alert('제목과 내용은 필수입니다.');
        return;
    }
    
    // 새 게시물 객체 생성
    const newPost = {
        id: 'post_' + Date.now(),
        title: title,
        content: content,
        author: {
            id: currentUser.id,
            username: currentUser.username,
            avatar: currentUser.avatar
        },
        date: new Date(),
        likes: 0,
        comments: [],
        projectId: attachProject ? currentProject.id : null
    };
    
    // 로컬 스토리지에서 기존 게시물 가져오기
    let posts = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMMUNITY_POSTS)) || [];
    
    // 새 게시물 추가
    posts.push(newPost);
    
    // 로컬 스토리지에 저장
    localStorage.setItem(STORAGE_KEYS.COMMUNITY_POSTS, JSON.stringify(posts));
    
    // 모달 닫기
    closeCurrentModal();
    
    // 폼 초기화
    document.getElementById('post-title').value = '';
    document.getElementById('post-content').value = '';
    document.getElementById('attach-project').checked = false;
    
    // 게시물 목록 새로고침
    loadCommunityPosts();
    
    // 알림 표시
    alert('게시물이 성공적으로 작성되었습니다.');
}

// 탐색 페이지 프로젝트 로드 함수
function loadExploreProjects() {
    const projectsContainer = document.getElementById('explore-projects');
    projectsContainer.innerHTML = ''; // 기존 프로젝트 지우기
    
    // 필터 및 검색 이벤트 리스너
    document.getElementById('explore-search-btn').addEventListener('click', filterExploreProjects);
    document.getElementById('category-filter').addEventListener('change', filterExploreProjects);
    document.getElementById('sort-filter').addEventListener('change', filterExploreProjects);
    
    // 예제 프로젝트 데이터 (실제 구현에서는 R2 버킷에서 가져옴)
    const demoProjects = generateDemoProjects();
    
    // 프로젝트 카드 생성
    displayExploreProjects(demoProjects);
}

// 탐색 페이지 프로젝트 필터링 함수
function filterExploreProjects() {
    // 필터 값 가져오기
    const searchTerm = document.getElementById('explore-search').value.toLowerCase();
    const categoryFilter = document.getElementById('category-filter').value;
    const sortFilter = document.getElementById('sort-filter').value;
    
    // 예제 프로젝트 데이터
    let projects = generateDemoProjects();
    
    // 검색어로 필터링
    if (searchTerm) {
        projects = projects.filter(project => 
            project.title.toLowerCase().includes(searchTerm) || 
            project.description.toLowerCase().includes(searchTerm)
        );
    }
    
    // 카테고리로 필터링
    if (categoryFilter !== 'all') {
        projects = projects.filter(project => project.category === categoryFilter);
    }
    
    // 정렬
    switch (sortFilter) {
        case 'popular':
            projects.sort((a, b) => b.likes - a.likes);
            break;
        case 'newest':
            projects.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'trending':
            projects.sort((a, b) => b.views - a.views);
            break;
    }
    
    // 필터링된 프로젝트 표시
    displayExploreProjects(projects);
}

// 탐색 페이지 프로젝트 표시 함수
function displayExploreProjects(projects) {
    const projectsContainer = document.getElementById('explore-projects');
    projectsContainer.innerHTML = ''; // 기존 프로젝트 지우기
    
    // 프로젝트가 없는 경우
    if (projects.length === 0) {
        projectsContainer.innerHTML = '<p class="empty-message">검색 결과가 없습니다.</p>';
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
                <p class="project-description">${project.description}</p>
                <div class="project-meta">
                    <span>작성자: ${project.author}</span>
                    <span>좋아요: ${project.likes}</span>
                </div>
            </div>
        `;
        
        // 프로젝트 카드 클릭 이벤트 (데모 버전에서는 기능 제한)
        projectCard.addEventListener('click', () => {
            alert('데모 버전에서는 커뮤니티 프로젝트를 열 수 없습니다.');
        });
        
        projectsContainer.appendChild(projectCard);
    });
    
    // 페이지네이션 업데이트
    document.getElementById('page-info').textContent = '1 / 1';
    document.getElementById('prev-page').disabled = true;
    document.getElementById('next-page').disabled = true;
}

// 데모 프로젝트 생성 함수
function generateDemoProjects() {
    return [
        {
            id: 'demo_1',
            title: '숫자 맞추기 게임',
            description: '1부터 100까지의 숫자를 맞추는 간단한 게임입니다.',
            author: 'user123',
            category: 'games',
            date: new Date(2023, 5, 15),
            likes: 42,
            views: 156
        },
        {
            id: 'demo_2',
            title: '도형 그리기 도구',
            description: '다양한 도형을 그리고 조합할 수 있는 도구입니다.',
            author: 'artist98',
            category: 'art',
            date: new Date(2023, 6, 22),
            likes: 31,
            views: 98
        },
        {
            id: 'demo_3',
            title: '간단한 계산기',
            description: '기본적인 사칙연산을 수행하는 계산기입니다.',
            author: 'coder42',
            category: 'tools',
            date: new Date(2023, 7, 5),
            likes: 25,
            views: 87
        },
        {
            id: 'demo_4',
            title: '단어 퀴즈',
            description: '다양한 주제의 단어를 맞추는 퀴즈 게임입니다.',
            author: 'teacher77',
            category: 'education',
            date: new Date(2023, 7, 12),
            likes: 38,
            views: 142
        },
        {
            id: 'demo_5',
            title: '음악 만들기',
            description: '간단한 멜로디를 만들고 재생할 수 있는 프로젝트입니다.',
            author: 'musician55',
            category: 'art',
            date: new Date(2023, 8, 3),
            likes: 47,
            views: 201
        },
        {
            id: 'demo_6',
            title: '미로 찾기',
            description: '자동으로 미로를 생성하고 해결하는 알고리즘 데모입니다.',
            author: 'algo_master',
            category: 'games',
            date: new Date(2023, 8, 18),
            likes: 53,
            views: 189
        }
    ];
}

// R2 버킷 관련 함수들 (실제 구현용)

// 파일 업로드 함수 (Cloudflare R2 연동)
async function uploadToR2(file, path) {
    try {
        // 파일 타입 확인
        const contentType = file.type || 'application/octet-stream';
        
        // API 엔드포인트로 PUT 요청
        const response = await fetch(`${R2_CONFIG.endpoint}/${path}`, {
            method: 'PUT',
            headers: {
                'Content-Type': contentType,
                'Authorization': `Bearer ${R2_CONFIG.apiKey}`,
                'X-Custom-Auth': R2_CONFIG.apiKey
            },
            body: file
        });
        
        // 응답 확인
        if (!response.ok) {
            throw new Error(`업로드 실패: ${response.status} ${response.statusText}`);
        }
        
        console.log(`R2 업로드 성공: ${path}`);
        // 파일 URL 반환
        return `${R2_CONFIG.endpoint}/${path}`;
    } catch (error) {
        console.error('R2 업로드 오류:', error);
        alert(`파일 업로드 중 오류가 발생했습니다: ${error.message}`);
        return null;
    }
}

// 파일 다운로드 함수 (Cloudflare R2 연동)
async function downloadFromR2(path) {
    try {
        // API 엔드포인트로 GET 요청
        const response = await fetch(`${R2_CONFIG.endpoint}/${path}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${R2_CONFIG.apiKey}`,
                'X-Custom-Auth': R2_CONFIG.apiKey
            }
        });
        
        // 응답 확인
        if (!response.ok) {
            throw new Error(`다운로드 실패: ${response.status} ${response.statusText}`);
        }
        
        console.log(`R2 다운로드 성공: ${path}`);
        // 응답 데이터 반환
        return await response.blob();
    } catch (error) {
        console.error('R2 다운로드 오류:', error);
        alert(`파일 다운로드 중 오류가 발생했습니다: ${error.message}`);
        return null;
    }
}

// R2 파일 목록 조회 함수
async function listFilesFromR2(prefix = '') {
    try {
        // API 엔드포인트로 POST 요청 (list 작업)
        const response = await fetch(`${R2_CONFIG.endpoint}/list?prefix=${prefix}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${R2_CONFIG.apiKey}`,
                'X-Custom-Auth': R2_CONFIG.apiKey
            }
        });
        
        // 응답 확인
        if (!response.ok) {
            throw new Error(`목록 조회 실패: ${response.status} ${response.statusText}`);
        }
        
        // 파일 목록 데이터 반환
        const data = await response.json();
        console.log(`R2 파일 목록 조회 성공: ${prefix}`, data);
        return data;
    } catch (error) {
        console.error('R2 파일 목록 조회 오류:', error);
        alert(`파일 목록 조회 중 오류가 발생했습니다: ${error.message}`);
        return { objects: [], delimitedPrefixes: [] };
    }
}