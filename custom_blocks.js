/**
 * C-Terminal 커스텀 블록 정의
 * 터미널 기반 출력에 특화된 블록 세트를 제공합니다.
 */

// 블록 색상 테마
const TERMINAL_BLOCK_COLOR = '#333333';
const INPUT_BLOCK_COLOR = '#4CAF50';
const OUTPUT_BLOCK_COLOR = '#2196F3';
const STYLING_BLOCK_COLOR = '#FF9800';
const CONTROL_BLOCK_COLOR = '#9C27B0';

/**
 * 터미널 출력 블록 정의
 */
Blockly.Blocks['terminal_print'] = {
  init: function() {
    this.appendValueInput('TEXT')
        .setCheck(null)
        .appendField('터미널에 출력');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(OUTPUT_BLOCK_COLOR);
    this.setTooltip('텍스트를 터미널에 출력합니다.');
    this.setHelpUrl('');
  }
};

Blockly.JavaScript['terminal_print'] = function(block) {
  const value = Blockly.JavaScript.valueToCode(block, 'TEXT', Blockly.JavaScript.ORDER_ATOMIC) || '""';
  return `console.log(${value});\n`;
};

/**
 * 줄바꿈 없는 출력 블록 정의
 */
Blockly.Blocks['terminal_print_inline'] = {
  init: function() {
    this.appendValueInput('TEXT')
        .setCheck(null)
        .appendField('줄바꿈 없이 출력');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(OUTPUT_BLOCK_COLOR);
    this.setTooltip('텍스트를 터미널에 출력하되 줄바꿈을 하지 않습니다.');
    this.setHelpUrl('');
  }
};

Blockly.JavaScript['terminal_print_inline'] = function(block) {
  const value = Blockly.JavaScript.valueToCode(block, 'TEXT', Blockly.JavaScript.ORDER_ATOMIC) || '""';
  // 실제 구현에서는 terminal.write 메서드를 직접 사용하지만, 
  // 데모 버전에서는 console.log로 대체
  return `process.stdout.write(${value});\n`;
};

/**
 * 터미널 지우기 블록 정의
 */
Blockly.Blocks['terminal_clear'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('터미널 지우기');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(TERMINAL_BLOCK_COLOR);
    this.setTooltip('터미널 화면을 지웁니다.');
    this.setHelpUrl('');
  }
};

Blockly.JavaScript['terminal_clear'] = function(block) {
  return 'console.log("\\x1Bc");\n';
};

/**
 * 터미널 사용자 입력 블록 정의
 */
Blockly.Blocks['terminal_input'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('사용자 입력 받기')
        .appendField(new Blockly.FieldTextInput('입력하세요:'), 'PROMPT');
    this.setOutput(true, null);
    this.setColour(INPUT_BLOCK_COLOR);
    this.setTooltip('사용자로부터 텍스트 입력을 받습니다.');
    this.setHelpUrl('');
  }
};

Blockly.JavaScript['terminal_input'] = function(block) {
  const prompt = block.getFieldValue('PROMPT');
  // 실제 터미널 환경에서는 입력을 기다리는 로직이 필요하지만
  // 데모 버전에서는 단순화된 프롬프트 형태로 구현
  return [`prompt("${prompt}")`, Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

/**
 * 터미널 텍스트 색상 지정 블록 정의
 */
Blockly.Blocks['terminal_text_color'] = {
  init: function() {
    this.appendValueInput('TEXT')
        .setCheck(null)
        .appendField('색상')
        .appendField(new Blockly.FieldDropdown([
          ['검정', 'black'],
          ['빨강', 'red'],
          ['초록', 'green'],
          ['노랑', 'yellow'],
          ['파랑', 'blue'],
          ['마젠타', 'magenta'],
          ['시안', 'cyan'],
          ['흰색', 'white']
        ]), 'COLOR')
        .appendField('텍스트');
    this.setOutput(true, 'String');
    this.setColour(STYLING_BLOCK_COLOR);
    this.setTooltip('터미널에 표시할 텍스트의 색상을 지정합니다.');
    this.setHelpUrl('');
  }
};

Blockly.JavaScript['terminal_text_color'] = function(block) {
  const color = block.getFieldValue('COLOR');
  const text = Blockly.JavaScript.valueToCode(block, 'TEXT', Blockly.JavaScript.ORDER_ATOMIC) || '""';
  
  // ANSI 색상 코드 매핑
  const colorCodes = {
    'black': '\\u001b[30m',
    'red': '\\u001b[31m',
    'green': '\\u001b[32m',
    'yellow': '\\u001b[33m',
    'blue': '\\u001b[34m',
    'magenta': '\\u001b[35m',
    'cyan': '\\u001b[36m',
    'white': '\\u001b[37m'
  };
  
  // 색상 지정 후 리셋 코드 추가
  return [`"${colorCodes[color]}" + ${text} + "\\u001b[0m"`, Blockly.JavaScript.ORDER_ADDITION];
};

/**
 * 터미널 텍스트 스타일 지정 블록 정의
 */
Blockly.Blocks['terminal_text_style'] = {
  init: function() {
    this.appendValueInput('TEXT')
        .setCheck(null)
        .appendField('스타일')
        .appendField(new Blockly.FieldDropdown([
          ['보통', 'normal'],
          ['굵게', 'bold'],
          ['기울임', 'italic'],
          ['밑줄', 'underline']
        ]), 'STYLE')
        .appendField('텍스트');
    this.setOutput(true, 'String');
    this.setColour(STYLING_BLOCK_COLOR);
    this.setTooltip('터미널에 표시할 텍스트의 스타일을 지정합니다.');
    this.setHelpUrl('');
  }
};

Blockly.JavaScript['terminal_text_style'] = function(block) {
  const style = block.getFieldValue('STYLE');
  const text = Blockly.JavaScript.valueToCode(block, 'TEXT', Blockly.JavaScript.ORDER_ATOMIC) || '""';
  
  // ANSI 스타일 코드 매핑
  const styleCodes = {
    'normal': '',
    'bold': '\\u001b[1m',
    'italic': '\\u001b[3m',
    'underline': '\\u001b[4m'
  };
  
  // 스타일 없음이면 그대로 반환
  if (style === 'normal') {
    return [text, Blockly.JavaScript.ORDER_NONE];
  }
  
  // 스타일 지정 후 리셋 코드 추가
  return [`"${styleCodes[style]}" + ${text} + "\\u001b[0m"`, Blockly.JavaScript.ORDER_ADDITION];
};

/**
 * 터미널 커서 위치 지정 블록 정의
 */
Blockly.Blocks['terminal_cursor_position'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('커서 이동')
        .appendField('X')
        .appendField(new Blockly.FieldNumber(0, 0, 999), 'X')
        .appendField('Y')
        .appendField(new Blockly.FieldNumber(0, 0, 999), 'Y');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(TERMINAL_BLOCK_COLOR);
    this.setTooltip('터미널 커서의 위치를 지정합니다.');
    this.setHelpUrl('');
  }
};

Blockly.JavaScript['terminal_cursor_position'] = function(block) {
  const x = block.getFieldValue('X');
  const y = block.getFieldValue('Y');
  return `console.log("\\u001b[${y};${x}H");\n`;
};

/**
 * 진행 표시줄 표시 블록 정의
 */
Blockly.Blocks['terminal_progress_bar'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('진행 표시줄')
        .appendField('진행률')
        .appendField(new Blockly.FieldNumber(50, 0, 100), 'PERCENT')
        .appendField('%')
        .appendField('너비')
        .appendField(new Blockly.FieldNumber(20, 1, 100), 'WIDTH');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(OUTPUT_BLOCK_COLOR);
    this.setTooltip('터미널에 진행 표시줄을 표시합니다.');
    this.setHelpUrl('');
  }
};

Blockly.JavaScript['terminal_progress_bar'] = function(block) {
  const percent = block.getFieldValue('PERCENT');
  const width = block.getFieldValue('WIDTH');
  
  // 진행 표시줄 생성 로직
  return `
  (function() {
    const percent = ${percent};
    const width = ${width};
    const filledWidth = Math.floor(width * percent / 100);
    const emptyWidth = width - filledWidth;
    
    let bar = '[';
    bar += '='.repeat(filledWidth);
    if (filledWidth < width) {
      bar += '>';
      bar += ' '.repeat(emptyWidth - 1);
    }
    bar += '] ' + percent + '%';
    
    console.log(bar);
  })();
  `;
};

/**
 * 대기 블록 정의 (밀리초 단위)
 */
Blockly.Blocks['terminal_wait'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('대기')
        .appendField(new Blockly.FieldNumber(1000, 0), 'TIME')
        .appendField('밀리초');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(CONTROL_BLOCK_COLOR);
    this.setTooltip('지정된 시간(밀리초) 동안 대기합니다.');
    this.setHelpUrl('');
  }
};

Blockly.JavaScript['terminal_wait'] = function(block) {
  const time = block.getFieldValue('TIME');
  
  // JavaScript에서는 동기적 대기가 어려우므로 setTimeout과 함께 간소화된 버전 제공
  return `
  // 동기적 대기 구현 (실제 터미널 환경에서는 다른 방식 필요)
  const start = Date.now();
  while (Date.now() - start < ${time}) {
    // 대기 중
  }
  `;
};

/**
 * 터미널 아스키 아트 블록 정의
 */
Blockly.Blocks['terminal_ascii_art'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('아스키 아트')
        .appendField(new Blockly.FieldDropdown([
          ['웃는 얼굴', 'smile'],
          ['슬픈 얼굴', 'sad'],
          ['하트', 'heart'],
          ['별', 'star'],
          ['체크마크', 'check']
        ]), 'ART');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(OUTPUT_BLOCK_COLOR);
    this.setTooltip('선택한 아스키 아트를 터미널에 표시합니다.');
    this.setHelpUrl('');
  }
};

Blockly.JavaScript['terminal_ascii_art'] = function(block) {
  const art = block.getFieldValue('ART');
  
  // 아스키 아트 매핑
  const arts = {
    'smile': `
  console.log("  ,-----,  ");
  console.log(" (  o o  ) ");
  console.log("(   \\\\_/   )");
  console.log(" \`----- ' ");
    `,
    'sad': `
  console.log("  ,-----,  ");
  console.log(" (  o o  ) ");
  console.log("(   /\\\\_\\\\   )");
  console.log(" \`----- ' ");
    `,
    'heart': `
  console.log(" /\\\\ /\\\\ ");
  console.log("( \\\\V/ )");
  console.log(" \\\\   / ");
  console.log("  \\\\ /  ");
  console.log("   V   ");
    `,
    'star': `
  console.log("    *    ");
  console.log("   ***   ");
  console.log("*********");
  console.log(" ******* ");
  console.log("  *****  ");
  console.log("    *    ");
    `,
    'check': `
  console.log("      *    ");
  console.log("     **    ");
  console.log("    ***    ");
  console.log("*  ****    ");
  console.log("** ***     ");
  console.log(" ****      ");
  console.log("  **       ");
    `
  };
  
  return arts[art];
};

// 추가 도구상자 카테고리를 위한 블록 등록
function registerTerminalBlocks() {
  // 터미널 카테고리 등록
  const terminalCategory = {
    kind: 'category',
    name: '터미널',
    colour: TERMINAL_BLOCK_COLOR,
    contents: [
      { kind: 'block', type: 'terminal_print' },
      { kind: 'block', type: 'terminal_print_inline' },
      { kind: 'block', type: 'terminal_clear' },
      { kind: 'block', type: 'terminal_input' },
      { kind: 'block', type: 'terminal_cursor_position' },
      { kind: 'block', type: 'terminal_wait' }
    ]
  };
  
  // 텍스트 스타일링 카테고리 등록
  const stylingCategory = {
    kind: 'category',
    name: '텍스트 스타일',
    colour: STYLING_BLOCK_COLOR,
    contents: [
      { kind: 'block', type: 'terminal_text_color' },
      { kind: 'block', type: 'terminal_text_style' }
    ]
  };
  
  // 터미널 효과 카테고리 등록
  const effectsCategory = {
    kind: 'category',
    name: '특수 효과',
    colour: OUTPUT_BLOCK_COLOR,
    contents: [
      { kind: 'block', type: 'terminal_progress_bar' },
      { kind: 'block', type: 'terminal_ascii_art' }
    ]
  };
  
  // 도구상자에 카테고리 추가
  function addTerminalCategories(workspace) {
    const toolbox = workspace.getToolbox();
    if (toolbox) {
      const toolboxDef = toolbox.getToolboxDef();
      
      // 기존 카테고리에 새 카테고리 추가
      const newToolboxDef = {
        ...toolboxDef,
        contents: [
          ...toolboxDef.contents,
          terminalCategory,
          stylingCategory,
          effectsCategory
        ]
      };
      
      // 도구상자 새로고침
      workspace.updateToolbox(newToolboxDef);
    }
  }
  
  // Blockly 워크스페이스가 초기화된 후 카테고리 추가
  if (window.workspace) {
    addTerminalCategories(window.workspace);
  } else {
    // Blockly가 로드된 후 실행
    document.addEventListener('blocklyLoaded', function() {
      if (window.workspace) {
        addTerminalCategories(window.workspace);
      }
    });
  }
}

// 페이지 로드 시 블록 등록
if (typeof window !== 'undefined') {
  window.addEventListener('load', registerTerminalBlocks);
}