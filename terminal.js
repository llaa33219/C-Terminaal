// C-Terminaal 터미널 스크립트
// 터미널 출력 및 입력 처리, 코드 실행

// 전역 변수
let terminal = null;
let isExecuting = false;
let executionContext = null;
let currentTextColor = 'white';
let terminalHistory = [];
let historyIndex = 0;
let inputCallback = null;
let inputPromise = null;
let inputBuffer = '';
let executionTimeout = null;

// ASCII 아트 패턴
const asciiPatterns = {
    rectangle: (size) => {
        let result = '';
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size * 2; j++) {
                if (i === 0 || i === size - 1 || j === 0 || j === size * 2 - 1) {
                    result += '#';
                } else {
                    result += ' ';
                }
            }
            result += '\n';
        }
        return result;
    },
    triangle: (size) => {
        let result = '';
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size - i - 1; j++) {
                result += ' ';
            }
            for (let j = 0; j < 2 * i + 1; j++) {
                result += '#';
            }
            result += '\n';
        }
        return result;
    },
    circle: (size) => {
        // 간단한 ASCII 원 그리기
        let result = '';
        const radius = size / 2;
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const distance = Math.sqrt(Math.pow(i - radius, 2) + Math.pow(j - radius, 2));
                if (Math.abs(distance - radius) < 0.5) {
                    result += 'O';
                } else {
                    result += ' ';
                }
            }
            result += '\n';
        }
        return result;
    },
    star: (size) => {
        let result = '';
        const mid = Math.floor(size / 2);
        
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (i === mid || j === mid || 
                    i === j || i === size - j - 1) {
                    result += '*';
                } else {
                    result += ' ';
                }
            }
            result += '\n';
        }
        return result;
    }
};

// 터미널 초기화
function initTerminal() {
    // xterm.js 터미널 인스턴스 생성
    terminal = new Terminal({
        cursorBlink: true,
        theme: {
            background: '#1e1e1e',
            foreground: '#f0f0f0'
        },
        fontSize: 14,
        fontFamily: 'Consolas, "Courier New", monospace',
        convertEol: true,
        scrollback: 500
    });

    // 터미널 DOM에 연결
    terminal.open(document.getElementById('terminal'));
    
    // 터미널 시작 메시지
    terminal.writeln('\x1b[37m터미널이 준비되었습니다. 블록을 조합하고 실행 버튼을 클릭하세요!\x1b[0m');
    terminal.writeln('');
    
    // 키 입력 이벤트 설정
    terminal.onData((data) => {
        handleTerminalInput(data);
    });
}

// 터미널 입력 처리
function handleTerminalInput(data) {
    if (!inputCallback) return;
    
    // Enter 키 처리
    if (data === '\r') {
        terminal.writeln('');
        const input = inputBuffer;
        inputBuffer = '';
        
        // 입력 콜백 호출
        resolveInput(input);
        return;
    }
    
    // Backspace 처리
    if (data === '\x7f') {
        if (inputBuffer.length > 0) {
            inputBuffer = inputBuffer.slice(0, -1);
            // 한 글자 지우기
            terminal.write('\b \b');
        }
        return;
    }
    
    // 일반 문자 입력
    if (data.length === 1 && data >= ' ' && data <= '~') {
        inputBuffer += data;
        terminal.write(data);
    }
}

// 입력 요청 해결
function resolveInput(input) {
    if (inputCallback) {
        const callback = inputCallback;
        inputCallback = null;
        callback(input);
    }
    
    if (inputPromise) {
        const resolve = inputPromise.resolve;
        inputPromise = null;
        resolve(input);
    }
}

// 터미널 텍스트 출력
function terminalPrint(text) {
    if (!terminal) return;
    
    const formattedText = String(text);
    terminal.writeln(`\x1b[${getColorCode(currentTextColor)}m${formattedText}\x1b[0m`);
    
    return formattedText;
}

// 터미널 에러 출력
function terminalPrintError(text) {
    if (!terminal) return;
    
    const savedColor = currentTextColor;
    terminalSetColor('red');
    terminal.writeln(`\x1b[31m${text}\x1b[0m`);
    currentTextColor = savedColor;
}

// 터미널 성공 출력
function terminalPrintSuccess(text) {
    if (!terminal) return;
    
    const savedColor = currentTextColor;
    terminalSetColor('green');
    terminal.writeln(`\x1b[32m${text}\x1b[0m`);
    currentTextColor = savedColor;
}

// 터미널 색상 설정
function terminalSetColor(color) {
    currentTextColor = color;
    return color;
}

// 색상 코드 변환
function getColorCode(color) {
    const colorCodes = {
        'black': '30',
        'red': '31',
        'green': '32',
        'yellow': '33',
        'blue': '34',
        'purple': '35',
        'cyan': '36',
        'white': '37',
        'gray': '90'
    };
    
    return colorCodes[color] || '37'; // 기본값은 흰색
}

// 터미널 지우기
function terminalClear() {
    if (!terminal) return;
    
    terminal.clear();
}

// 터미널 입력 요청
function terminalInput(promptText) {
    if (!terminal) return Promise.resolve('');
    
    terminal.write(`\x1b[${getColorCode(currentTextColor)}m${promptText}: \x1b[0m`);
    
    inputBuffer = '';
    return new Promise((resolve) => {
        inputCallback = resolve;
        inputPromise = { resolve };
    });
}

// 애니메이션 텍스트 출력
async function terminalAnimate(text, speed) {
    if (!terminal) return;
    
    const chars = String(text);
    for (let i = 0; i < chars.length; i++) {
        terminal.write(`\x1b[${getColorCode(currentTextColor)}m${chars[i]}\x1b[0m`);
        await terminalSleep(speed);
    }
    terminal.writeln('');
}

// 지정된 시간 대기
function terminalSleep(ms) {
    return new Promise(resolve => {
        const timeout = setTimeout(resolve, ms);
        
        // 실행 중지 시 정리할 수 있도록 현재 타임아웃 저장
        if (executionTimeout) {
            clearTimeout(executionTimeout);
        }
        
        executionTimeout = timeout;
    });
}

// ASCII 아트 그리기
function terminalDraw(pattern, size) {
    if (!terminal) return;
    
    size = Math.min(Math.max(1, size), 20); // 크기 제한
    
    const drawFunction = asciiPatterns[pattern] || asciiPatterns.rectangle;
    const art = drawFunction(size);
    
    terminal.writeln(`\x1b[${getColorCode(currentTextColor)}m${art}\x1b[0m`);
}

// 진행 막대 표시
function terminalProgress(percent, length) {
    if (!terminal) return;
    
    percent = Math.min(Math.max(0, percent), 100); // 퍼센트 범위 제한
    length = Math.min(Math.max(5, length), 50); // 길이 제한
    
    const filledLength = Math.floor(length * percent / 100);
    const emptyLength = length - filledLength;
    
    const filledBar = '='.repeat(filledLength);
    const emptyBar = ' '.repeat(emptyLength);
    const percentText = percent.toFixed(1) + '%';
    
    terminal.writeln(`\x1b[${getColorCode(currentTextColor)}m[${filledBar}${emptyBar}] ${percentText}\x1b[0m`);
}

// 코드 실행
async function runCode() {
    if (isExecuting) {
        terminalPrintError('이미 코드가 실행 중입니다. 현재 실행을 중지하려면 "정지" 버튼을 클릭하세요.');
        return;
    }
    
    // UI 업데이트
    const runButton = document.getElementById('run-code');
    const stopButton = document.getElementById('stop-code');
    
    runButton.disabled = true;
    stopButton.disabled = false;
    
    isExecuting = true;
    
    // 터미널 준비
    terminalClear();
    terminalPrint('프로그램 실행 중...');
    terminalPrint('-'.repeat(40));
    
    try {
        // Blockly에서 코드 생성
        const code = window.blocklyFunctions.generateCode();
        
        // 실행 컨텍스트 생성
        const contextFunctions = {
            terminalPrint,
            terminalPrintError,
            terminalPrintSuccess,
            terminalInput,
            terminalClear,
            terminalSetColor,
            terminalAnimate,
            terminalDraw,
            terminalProgress,
            terminalSleep
        };
        
        // 동적으로 코드 실행
        executionContext = new Function(...Object.keys(contextFunctions), `return ${code}`)(...Object.values(contextFunctions));
        
        // 실행 완료 대기
        await executionContext;
    } catch (error) {
        terminalPrintError(`실행 오류: ${error.message}`);
        console.error('코드 실행 오류:', error);
    } finally {
        // 실행 상태 및 UI 초기화
        isExecuting = false;
        runButton.disabled = false;
        stopButton.disabled = true;
        inputCallback = null;
        
        if (executionTimeout) {
            clearTimeout(executionTimeout);
            executionTimeout = null;
        }
    }
}

// 코드 실행 중지
function terminateExecution() {
    if (!isExecuting) return;
    
    // 입력 콜백이 있으면 해제
    if (inputCallback) {
        resolveInput('[실행 중지됨]');
    }
    
    // 타임아웃 정리
    if (executionTimeout) {
        clearTimeout(executionTimeout);
        executionTimeout = null;
    }
    
    // 상태 초기화
    executionContext = null;
    isExecuting = false;
    
    // UI 업데이트
    const runButton = document.getElementById('run-code');
    const stopButton = document.getElementById('stop-code');
    
    runButton.disabled = false;
    stopButton.disabled = true;
    
    terminalPrintError('사용자에 의해 실행이 중지되었습니다.');
}

// 외부에서 사용할 함수 공개
window.terminalFunctions = {
    runCode,
    terminateExecution,
    terminalClear
};

// Terminal 관련 함수를 window에 노출 (blockly-config.js에서 사용)
window.terminalPrint = terminalPrint;
window.terminalPrintError = terminalPrintError;
window.terminalInput = terminalInput;
window.terminalClear = terminalClear;
window.terminalSetColor = terminalSetColor;
window.terminalAnimate = terminalAnimate;
window.terminalDraw = terminalDraw;
window.terminalProgress = terminalProgress;
window.terminalSleep = terminalSleep;
window.terminateExecution = terminateExecution;