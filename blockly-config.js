// C-Terminaal 블록리 설정 스크립트
// 블록 코딩 환경 초기화 및 사용자 정의 블록 생성

// 전역 변수
let workspace = null;
let toolbox = null;

// Blockly 초기화
function initBlockly() {
    // 툴박스 정의
    toolbox = {
        "kind": "categoryToolbox",
        "contents": [
            {
                "kind": "category",
                "name": "논리",
                "categorystyle": "logic_category",
                "contents": [
                    {
                        "kind": "block",
                        "type": "controls_if"
                    },
                    {
                        "kind": "block",
                        "type": "logic_compare"
                    },
                    {
                        "kind": "block",
                        "type": "logic_operation"
                    },
                    {
                        "kind": "block",
                        "type": "logic_negate"
                    },
                    {
                        "kind": "block",
                        "type": "logic_boolean"
                    },
                    {
                        "kind": "block",
                        "type": "logic_null"
                    },
                    {
                        "kind": "block",
                        "type": "logic_ternary"
                    }
                ]
            },
            {
                "kind": "category",
                "name": "반복",
                "categorystyle": "loop_category",
                "contents": [
                    {
                        "kind": "block",
                        "type": "controls_repeat_ext"
                    },
                    {
                        "kind": "block",
                        "type": "controls_whileUntil"
                    },
                    {
                        "kind": "block",
                        "type": "controls_for"
                    },
                    {
                        "kind": "block",
                        "type": "controls_forEach"
                    },
                    {
                        "kind": "block",
                        "type": "controls_flow_statements"
                    }
                ]
            },
            {
                "kind": "category",
                "name": "수학",
                "categorystyle": "math_category",
                "contents": [
                    {
                        "kind": "block",
                        "type": "math_number"
                    },
                    {
                        "kind": "block",
                        "type": "math_arithmetic"
                    },
                    {
                        "kind": "block",
                        "type": "math_single"
                    },
                    {
                        "kind": "block",
                        "type": "math_trig"
                    },
                    {
                        "kind": "block",
                        "type": "math_constant"
                    },
                    {
                        "kind": "block",
                        "type": "math_number_property"
                    },
                    {
                        "kind": "block",
                        "type": "math_round"
                    },
                    {
                        "kind": "block",
                        "type": "math_on_list"
                    },
                    {
                        "kind": "block",
                        "type": "math_modulo"
                    },
                    {
                        "kind": "block",
                        "type": "math_constrain"
                    },
                    {
                        "kind": "block",
                        "type": "math_random_int"
                    },
                    {
                        "kind": "block",
                        "type": "math_random_float"
                    }
                ]
            },
            {
                "kind": "category",
                "name": "텍스트",
                "categorystyle": "text_category",
                "contents": [
                    {
                        "kind": "block",
                        "type": "text"
                    },
                    {
                        "kind": "block",
                        "type": "text_join"
                    },
                    {
                        "kind": "block",
                        "type": "text_append"
                    },
                    {
                        "kind": "block",
                        "type": "text_length"
                    },
                    {
                        "kind": "block",
                        "type": "text_isEmpty"
                    },
                    {
                        "kind": "block",
                        "type": "text_indexOf"
                    },
                    {
                        "kind": "block",
                        "type": "text_charAt"
                    },
                    {
                        "kind": "block",
                        "type": "text_getSubstring"
                    },
                    {
                        "kind": "block",
                        "type": "text_changeCase"
                    },
                    {
                        "kind": "block",
                        "type": "text_trim"
                    },
                    {
                        "kind": "block",
                        "type": "text_print"
                    },
                    {
                        "kind": "block",
                        "type": "text_prompt_ext"
                    }
                ]
            },
            {
                "kind": "category",
                "name": "리스트",
                "categorystyle": "list_category",
                "contents": [
                    {
                        "kind": "block",
                        "type": "lists_create_with"
                    },
                    {
                        "kind": "block",
                        "type": "lists_create_empty"
                    },
                    {
                        "kind": "block",
                        "type": "lists_repeat"
                    },
                    {
                        "kind": "block",
                        "type": "lists_length"
                    },
                    {
                        "kind": "block",
                        "type": "lists_isEmpty"
                    },
                    {
                        "kind": "block",
                        "type": "lists_indexOf"
                    },
                    {
                        "kind": "block",
                        "type": "lists_getIndex"
                    },
                    {
                        "kind": "block",
                        "type": "lists_setIndex"
                    },
                    {
                        "kind": "block",
                        "type": "lists_getSublist"
                    },
                    {
                        "kind": "block",
                        "type": "lists_sort"
                    },
                    {
                        "kind": "block",
                        "type": "lists_split"
                    },
                    {
                        "kind": "block",
                        "type": "lists_reverse"
                    }
                ]
            },
            {
                "kind": "category",
                "name": "변수",
                "categorystyle": "variable_category",
                "custom": "VARIABLE"
            },
            {
                "kind": "category",
                "name": "함수",
                "categorystyle": "procedure_category",
                "custom": "PROCEDURE"
            },
            {
                "kind": "category",
                "name": "터미널",
                "colour": "#5C6BC0",
                "contents": [
                    {
                        "kind": "block",
                        "type": "terminal_print"
                    },
                    {
                        "kind": "block",
                        "type": "terminal_input"
                    },
                    {
                        "kind": "block",
                        "type": "terminal_clear"
                    },
                    {
                        "kind": "block",
                        "type": "terminal_set_color"
                    }
                ]
            },
            {
                "kind": "category",
                "name": "고급",
                "colour": "#FFB74D",
                "contents": [
                    {
                        "kind": "block",
                        "type": "terminal_animate"
                    },
                    {
                        "kind": "block",
                        "type": "terminal_draw"
                    },
                    {
                        "kind": "block",
                        "type": "terminal_progress"
                    },
                    {
                        "kind": "block",
                        "type": "terminal_sleep"
                    }
                ]
            }
        ]
    };

    // 워크스페이스 생성
    workspace = Blockly.inject('blockly-div', {
        toolbox: toolbox,
        grid: {
            spacing: 20,
            length: 3,
            colour: '#ccc',
            snap: true
        },
        zoom: {
            controls: true,
            wheel: true,
            startScale: 1.0,
            maxScale: 3,
            minScale: 0.3,
            scaleSpeed: 1.2
        },
        trashcan: true
    });

    // 사용자 정의 블록 등록
    defineCustomBlocks();

    // 최초 실행 블록 추가
    if (workspace.getAllBlocks().length === 0) {
        addStartBlock();
    }

    // 워크스페이스 변경 이벤트 등록
    workspace.addChangeListener(onWorkspaceChange);
}

// 사용자 정의 블록 정의
function defineCustomBlocks() {
    // 터미널 출력 블록
    Blockly.Blocks['terminal_print'] = {
        init: function() {
            this.appendValueInput('TEXT')
                .setCheck(null)
                .appendField('출력');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour('#5C6BC0');
            this.setTooltip('터미널에 텍스트를 출력합니다.');
            this.setHelpUrl('');
        }
    };

    // 터미널 입력 블록
    Blockly.Blocks['terminal_input'] = {
        init: function() {
            this.appendDummyInput()
                .appendField('입력 받기')
                .appendField(new Blockly.FieldTextInput('입력하세요'), 'PROMPT');
            this.setOutput(true, null);
            this.setColour('#5C6BC0');
            this.setTooltip('사용자로부터 입력을 받습니다.');
            this.setHelpUrl('');
        }
    };

    // 터미널 지우기 블록
    Blockly.Blocks['terminal_clear'] = {
        init: function() {
            this.appendDummyInput()
                .appendField('터미널 지우기');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour('#5C6BC0');
            this.setTooltip('터미널 화면을 지웁니다.');
            this.setHelpUrl('');
        }
    };

    // 터미널 색상 설정 블록
    Blockly.Blocks['terminal_set_color'] = {
        init: function() {
            this.appendDummyInput()
                .appendField('텍스트 색상 설정')
                .appendField(new Blockly.FieldDropdown([
                    ['검정', 'black'],
                    ['빨강', 'red'],
                    ['초록', 'green'],
                    ['파랑', 'blue'],
                    ['노랑', 'yellow'],
                    ['보라', 'purple'],
                    ['청록', 'cyan'],
                    ['회색', 'gray'],
                    ['흰색', 'white']
                ]), 'COLOR');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour('#5C6BC0');
            this.setTooltip('터미널 텍스트 색상을 설정합니다.');
            this.setHelpUrl('');
        }
    };

    // 애니메이션 텍스트 블록
    Blockly.Blocks['terminal_animate'] = {
        init: function() {
            this.appendValueInput('TEXT')
                .setCheck('String')
                .appendField('애니메이션 텍스트');
            this.appendValueInput('SPEED')
                .setCheck('Number')
                .appendField('속도');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour('#FFB74D');
            this.setTooltip('애니메이션 효과로 텍스트를 출력합니다.');
            this.setHelpUrl('');
        }
    };

    // 그리기 블록
    Blockly.Blocks['terminal_draw'] = {
        init: function() {
            this.appendDummyInput()
                .appendField('그리기 패턴')
                .appendField(new Blockly.FieldDropdown([
                    ['사각형', 'rectangle'],
                    ['삼각형', 'triangle'],
                    ['원', 'circle'],
                    ['별', 'star']
                ]), 'PATTERN');
            this.appendValueInput('SIZE')
                .setCheck('Number')
                .appendField('크기');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour('#FFB74D');
            this.setTooltip('터미널에 ASCII 아트를 그립니다.');
            this.setHelpUrl('');
        }
    };

    // 진행 막대 블록
    Blockly.Blocks['terminal_progress'] = {
        init: function() {
            this.appendValueInput('PERCENT')
                .setCheck('Number')
                .appendField('진행 막대');
            this.appendDummyInput()
                .appendField('길이')
                .appendField(new Blockly.FieldNumber(20, 5, 50), 'LENGTH');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour('#FFB74D');
            this.setTooltip('터미널에 진행 막대를 표시합니다.');
            this.setHelpUrl('');
        }
    };

    // 대기 블록
    Blockly.Blocks['terminal_sleep'] = {
        init: function() {
            this.appendValueInput('TIME')
                .setCheck('Number')
                .appendField('대기 (밀리초)');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour('#FFB74D');
            this.setTooltip('지정된 시간(밀리초) 동안 실행을 일시 중지합니다.');
            this.setHelpUrl('');
        }
    };

    // 코드 생성 규칙 등록
    registerCodeGenerators();
}

// JavaScript 코드 생성 규칙 등록
function registerCodeGenerators() {
    // 터미널 출력
    Blockly.JavaScript['terminal_print'] = function(block) {
        const text = Blockly.JavaScript.valueToCode(block, 'TEXT', Blockly.JavaScript.ORDER_ATOMIC) || "''";
        return `terminalPrint(${text});\n`;
    };

    // 터미널 입력
    Blockly.JavaScript['terminal_input'] = function(block) {
        const prompt = block.getFieldValue('PROMPT');
        return [`terminalInput("${prompt}")`, Blockly.JavaScript.ORDER_FUNCTION_CALL];
    };

    // 터미널 지우기
    Blockly.JavaScript['terminal_clear'] = function(block) {
        return 'terminalClear();\n';
    };

    // 터미널 색상 설정
    Blockly.JavaScript['terminal_set_color'] = function(block) {
        const color = block.getFieldValue('COLOR');
        return `terminalSetColor("${color}");\n`;
    };

    // 애니메이션 텍스트
    Blockly.JavaScript['terminal_animate'] = function(block) {
        const text = Blockly.JavaScript.valueToCode(block, 'TEXT', Blockly.JavaScript.ORDER_ATOMIC) || "''";
        const speed = Blockly.JavaScript.valueToCode(block, 'SPEED', Blockly.JavaScript.ORDER_ATOMIC) || '50';
        return `terminalAnimate(${text}, ${speed});\n`;
    };

    // 그리기
    Blockly.JavaScript['terminal_draw'] = function(block) {
        const pattern = block.getFieldValue('PATTERN');
        const size = Blockly.JavaScript.valueToCode(block, 'SIZE', Blockly.JavaScript.ORDER_ATOMIC) || '5';
        return `terminalDraw("${pattern}", ${size});\n`;
    };

    // 진행 막대
    Blockly.JavaScript['terminal_progress'] = function(block) {
        const percent = Blockly.JavaScript.valueToCode(block, 'PERCENT', Blockly.JavaScript.ORDER_ATOMIC) || '0';
        const length = block.getFieldValue('LENGTH');
        return `terminalProgress(${percent}, ${length});\n`;
    };

    // 대기
    Blockly.JavaScript['terminal_sleep'] = function(block) {
        const time = Blockly.JavaScript.valueToCode(block, 'TIME', Blockly.JavaScript.ORDER_ATOMIC) || '1000';
        return `await terminalSleep(${time});\n`;
    };
}

// 시작 블록 추가
function addStartBlock() {
    const startBlock = workspace.newBlock('terminal_print');
    startBlock.initSvg();
    startBlock.render();
    
    // 값 블록 추가
    const textBlock = workspace.newBlock('text');
    textBlock.setFieldValue('안녕하세요! C-Terminaal에 오신 것을 환영합니다!', 'TEXT');
    textBlock.initSvg();
    textBlock.render();
    
    // 블록 연결
    const connection = startBlock.getInput('TEXT').connection;
    connection.connect(textBlock.outputConnection);
    
    // 블록 위치 조정
    startBlock.moveBy(50, 50);
}

// 작업 영역 변경 이벤트 핸들러
function onWorkspaceChange(event) {
    // 변경 이벤트에 따른 필요한 처리를 여기에 추가
    if (event.type === Blockly.Events.BLOCK_CREATE ||
        event.type === Blockly.Events.BLOCK_DELETE ||
        event.type === Blockly.Events.BLOCK_CHANGE ||
        event.type === Blockly.Events.BLOCK_MOVE) {
        
        // 코드 생성 및 표시 기능은 실행 시점에만 처리
    }
}

// Blockly -> JavaScript 코드 변환
function generateCode() {
    // 비동기 함수를 사용할 수 있도록 async 함수로 감싸기
    const code = `
    (async function() {
        try {
            ${Blockly.JavaScript.workspaceToCode(workspace)}
            terminalPrint("프로그램이 정상적으로 종료되었습니다.");
        } catch (error) {
            terminalPrintError("오류 발생: " + error.message);
        }
    })();
    `;
    
    return code;
}

// 블록 작업 공간 저장
function saveWorkspace() {
    const xml = Blockly.Xml.workspaceToDom(workspace);
    const xmlText = Blockly.Xml.domToText(xml);
    return xmlText;
}

// 블록 작업 공간 불러오기
function loadWorkspace(xmlText) {
    try {
        workspace.clear();
        const xml = Blockly.Xml.textToDom(xmlText);
        Blockly.Xml.domToWorkspace(xml, workspace);
        return true;
    } catch (error) {
        console.error('작업 공간 로드 에러:', error);
        return false;
    }
}

// 현재 프로젝트 새로 만들기
function newWorkspace() {
    workspace.clear();
    addStartBlock();
}

// 코드 실행 중지
function stopExecution() {
    // 터미널에서 처리
    if (typeof terminateExecution === 'function') {
        terminateExecution();
    }
}

// 외부에서 사용할 함수 공개
window.blocklyFunctions = {
    generateCode,
    saveWorkspace,
    loadWorkspace,
    newWorkspace,
    stopExecution
};

// Blockly 전역화 (다른 모듈에서 접근 가능하도록)
window.blocklyWorkspace = function() {
    return workspace;
};