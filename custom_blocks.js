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
const MATH_BLOCK_COLOR = '#5CA65C';
const STRING_BLOCK_COLOR = '#A65CA6';
const ARRAY_BLOCK_COLOR = '#A6745C';
const TIME_BLOCK_COLOR = '#5C81A6';
const GAME_BLOCK_COLOR = '#FF5252';
const ALGORITHM_BLOCK_COLOR = '#795548';

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
  // 브라우저 prompt 함수 사용 (터미널 내에서 입력 구현과 연동됨)
  return [`await prompt("${prompt}")`, Blockly.JavaScript.ORDER_FUNCTION_CALL];
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
  
  // 비동기 대기 구현
  return `await new Promise(resolve => setTimeout(resolve, ${time}));\n`;
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

/**
 * 새로운 배열 생성 블록
 */
Blockly.Blocks['array_create'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('새 배열 생성');
    this.setOutput(true, 'Array');
    this.setColour(ARRAY_BLOCK_COLOR);
    this.setTooltip('빈 배열을 생성합니다.');
    this.setHelpUrl('');
    this.setMutator(new Blockly.Mutator(['array_create_item']));
    this.itemCount_ = 0;
  },

  mutationToDom: function() {
    const container = Blockly.utils.xml.createElement('mutation');
    container.setAttribute('items', this.itemCount_);
    return container;
  },

  domToMutation: function(xmlElement) {
    this.itemCount_ = parseInt(xmlElement.getAttribute('items'), 10);
    this.updateShape_();
  },

  decompose: function(workspace) {
    const containerBlock = workspace.newBlock('array_create_container');
    containerBlock.initSvg();
    
    let connection = containerBlock.getInput('STACK').connection;
    for (let i = 0; i < this.itemCount_; i++) {
      const itemBlock = workspace.newBlock('array_create_item');
      itemBlock.initSvg();
      connection.connect(itemBlock.previousConnection);
      connection = itemBlock.nextConnection;
    }
    
    return containerBlock;
  },

  compose: function(containerBlock) {
    let itemBlock = containerBlock.getInputTargetBlock('STACK');
    
    const connections = [];
    while (itemBlock) {
      connections.push(itemBlock.valueConnection_);
      itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
    }
    
    this.itemCount_ = connections.length;
    this.updateShape_();
    
    for (let i = 0; i < this.itemCount_; i++) {
      if (connections[i]) {
        this.getInput('ADD' + i).connection.connect(connections[i]);
      }
    }
  },

  saveConnections: function(containerBlock) {
    let itemBlock = containerBlock.getInputTargetBlock('STACK');
    let i = 0;
    while (itemBlock) {
      const input = this.getInput('ADD' + i);
      itemBlock.valueConnection_ = input && input.connection.targetConnection;
      i++;
      itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
    }
  },

  updateShape_: function() {
    if (this.itemCount_ && this.getInput('EMPTY')) {
      this.removeInput('EMPTY');
    } else if (!this.itemCount_ && !this.getInput('EMPTY')) {
      this.appendDummyInput('EMPTY')
          .appendField('빈 배열');
    }
    
    // 기존 입력 제거
    for (let i = 0; this.getInput('ADD' + i); i++) {
      this.removeInput('ADD' + i);
    }
    
    // 새 입력 추가
    for (let i = 0; i < this.itemCount_; i++) {
      const input = this.appendValueInput('ADD' + i)
                      .setAlign(Blockly.ALIGN_RIGHT)
                      .appendField(i + '번 항목');
    }
  }
};

Blockly.Blocks['array_create_container'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('배열 항목 추가');
    this.appendStatementInput('STACK');
    this.setColour(ARRAY_BLOCK_COLOR);
    this.setTooltip('');
    this.setHelpUrl('');
    this.contextMenu = false;
  }
};

Blockly.Blocks['array_create_item'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('항목');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(ARRAY_BLOCK_COLOR);
    this.setTooltip('');
    this.setHelpUrl('');
    this.contextMenu = false;
  }
};

Blockly.JavaScript['array_create'] = function(block) {
  const elements = [];
  for (let i = 0; i < block.itemCount_; i++) {
    const value = Blockly.JavaScript.valueToCode(block, 'ADD' + i, Blockly.JavaScript.ORDER_COMMA) || 'null';
    elements.push(value);
  }
  
  const code = '[' + elements.join(', ') + ']';
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

/**
 * 배열 항목 가져오기 블록
 */
Blockly.Blocks['array_get_item'] = {
  init: function() {
    this.appendValueInput('ARRAY')
        .setCheck('Array')
        .appendField('배열');
    this.appendValueInput('INDEX')
        .setCheck('Number')
        .appendField('의 인덱스');
    this.appendDummyInput()
        .appendField('항목 가져오기');
    this.setOutput(true, null);
    this.setInputsInline(true);
    this.setColour(ARRAY_BLOCK_COLOR);
    this.setTooltip('배열에서 지정된 인덱스의 항목을 가져옵니다.');
    this.setHelpUrl('');
  }
};

Blockly.JavaScript['array_get_item'] = function(block) {
  const array = Blockly.JavaScript.valueToCode(block, 'ARRAY', Blockly.JavaScript.ORDER_MEMBER) || '[]';
  const index = Blockly.JavaScript.valueToCode(block, 'INDEX', Blockly.JavaScript.ORDER_MEMBER) || '0';
  
  const code = `${array}[${index}]`;
  return [code, Blockly.JavaScript.ORDER_MEMBER];
};

/**
 * 배열 항목 설정 블록
 */
Blockly.Blocks['array_set_item'] = {
  init: function() {
    this.appendValueInput('ARRAY')
        .setCheck('Array')
        .appendField('배열');
    this.appendValueInput('INDEX')
        .setCheck('Number')
        .appendField('의 인덱스');
    this.appendValueInput('ITEM')
        .appendField('에 값');
    this.appendDummyInput()
        .appendField('저장');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(ARRAY_BLOCK_COLOR);
    this.setTooltip('배열의 지정된 인덱스에 값을 저장합니다.');
    this.setHelpUrl('');
  }
};

Blockly.JavaScript['array_set_item'] = function(block) {
  const array = Blockly.JavaScript.valueToCode(block, 'ARRAY', Blockly.JavaScript.ORDER_MEMBER) || '[]';
  const index = Blockly.JavaScript.valueToCode(block, 'INDEX', Blockly.JavaScript.ORDER_MEMBER) || '0';
  const item = Blockly.JavaScript.valueToCode(block, 'ITEM', Blockly.JavaScript.ORDER_ASSIGNMENT) || 'null';
  
  return `${array}[${index}] = ${item};\n`;
};

/**
 * 배열 길이 블록
 */
Blockly.Blocks['array_length'] = {
  init: function() {
    this.appendValueInput('ARRAY')
        .setCheck('Array')
        .appendField('배열');
    this.appendDummyInput()
        .appendField('의 길이');
    this.setOutput(true, 'Number');
    this.setInputsInline(true);
    this.setColour(ARRAY_BLOCK_COLOR);
    this.setTooltip('배열의 길이(항목 수)를 가져옵니다.');
    this.setHelpUrl('');
  }
};

Blockly.JavaScript['array_length'] = function(block) {
  const array = Blockly.JavaScript.valueToCode(block, 'ARRAY', Blockly.JavaScript.ORDER_MEMBER) || '[]';
  
  const code = `${array}.length`;
  return [code, Blockly.JavaScript.ORDER_MEMBER];
};

/**
 * 문자열 연결 블록
 */
Blockly.Blocks['string_concat'] = {
  init: function() {
    this.appendValueInput('STRING1')
        .setCheck('String')
        .appendField('문자열');
    this.appendValueInput('STRING2')
        .setCheck('String')
        .appendField('과(와)');
    this.appendDummyInput()
        .appendField('연결하기');
    this.setOutput(true, 'String');
    this.setInputsInline(true);
    this.setColour(STRING_BLOCK_COLOR);
    this.setTooltip('두 문자열을 연결합니다.');
    this.setHelpUrl('');
  }
};

Blockly.JavaScript['string_concat'] = function(block) {
  const string1 = Blockly.JavaScript.valueToCode(block, 'STRING1', Blockly.JavaScript.ORDER_ADDITION) || '""';
  const string2 = Blockly.JavaScript.valueToCode(block, 'STRING2', Blockly.JavaScript.ORDER_ADDITION) || '""';
  
  const code = `${string1} + ${string2}`;
  return [code, Blockly.JavaScript.ORDER_ADDITION];
};

/**
 * 문자열 자르기 블록
 */
Blockly.Blocks['string_substring'] = {
  init: function() {
    this.appendValueInput('STRING')
        .setCheck('String')
        .appendField('문자열');
    this.appendValueInput('START')
        .setCheck('Number')
        .appendField('의 위치');
    this.appendValueInput('END')
        .setCheck('Number')
        .appendField('부터 위치');
    this.appendDummyInput()
        .appendField('까지 자르기');
    this.setOutput(true, 'String');
    this.setInputsInline(true);
    this.setColour(STRING_BLOCK_COLOR);
    this.setTooltip('문자열의 지정된 위치에서 다른 위치까지 부분 문자열을 가져옵니다.');
    this.setHelpUrl('');
  }
};

Blockly.JavaScript['string_substring'] = function(block) {
  const string = Blockly.JavaScript.valueToCode(block, 'STRING', Blockly.JavaScript.ORDER_MEMBER) || '""';
  const start = Blockly.JavaScript.valueToCode(block, 'START', Blockly.JavaScript.ORDER_NONE) || '0';
  const end = Blockly.JavaScript.valueToCode(block, 'END', Blockly.JavaScript.ORDER_NONE) || '0';
  
  const code = `${string}.substring(${start}, ${end})`;
  return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

/**
 * 문자열 분할 블록
 */
Blockly.Blocks['string_split'] = {
  init: function() {
    this.appendValueInput('STRING')
        .setCheck('String')
        .appendField('문자열');
    this.appendValueInput('DELIMITER')
        .setCheck('String')
        .appendField('을(를) 구분자');
    this.appendDummyInput()
        .appendField('로 분할');
    this.setOutput(true, 'Array');
    this.setInputsInline(true);
    this.setColour(STRING_BLOCK_COLOR);
    this.setTooltip('문자열을 지정된 구분자로 분할하여 배열로 반환합니다.');
    this.setHelpUrl('');
  }
};

Blockly.JavaScript['string_split'] = function(block) {
  const string = Blockly.JavaScript.valueToCode(block, 'STRING', Blockly.JavaScript.ORDER_MEMBER) || '""';
  const delimiter = Blockly.JavaScript.valueToCode(block, 'DELIMITER', Blockly.JavaScript.ORDER_NONE) || '","';
  
  const code = `${string}.split(${delimiter})`;
  return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

/**
 * 현재 시간 블록
 */
Blockly.Blocks['time_current'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('현재 시간')
        .appendField(new Blockly.FieldDropdown([
          ['전체', 'full'],
          ['년', 'year'],
          ['월', 'month'],
          ['일', 'day'],
          ['시', 'hour'],
          ['분', 'minute'],
          ['초', 'second']
        ]), 'PART');
    this.setOutput(true, null);
    this.setColour(TIME_BLOCK_COLOR);
    this.setTooltip('현재 시간 또는 날짜의 특정 부분을 가져옵니다.');
    this.setHelpUrl('');
  }
};

Blockly.JavaScript['time_current'] = function(block) {
  const part = block.getFieldValue('PART');
  
  let code;
  switch (part) {
    case 'full':
      code = 'new Date().toString()';
      break;
    case 'year':
      code = 'new Date().getFullYear()';
      break;
    case 'month':
      code = '(new Date().getMonth() + 1)'; // JavaScript month is 0-indexed
      break;
    case 'day':
      code = 'new Date().getDate()';
      break;
    case 'hour':
      code = 'new Date().getHours()';
      break;
    case 'minute':
      code = 'new Date().getMinutes()';
      break;
    case 'second':
      code = 'new Date().getSeconds()';
      break;
    default:
      code = 'new Date().toString()';
  }
  
  return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

/**
 * 난수 생성 블록
 */
Blockly.Blocks['math_random_float_advanced'] = {
  init: function() {
    this.appendValueInput('MIN')
        .setCheck('Number')
        .appendField('최소값');
    this.appendValueInput('MAX')
        .setCheck('Number')
        .appendField('부터 최대값');
    this.appendDummyInput()
        .appendField('사이의 실수 난수');
    this.setOutput(true, 'Number');
    this.setInputsInline(true);
    this.setColour(MATH_BLOCK_COLOR);
    this.setTooltip('지정된 최소값과 최대값 사이의 실수 난수를 생성합니다.');
    this.setHelpUrl('');
  }
};

Blockly.JavaScript['math_random_float_advanced'] = function(block) {
  const min = Blockly.JavaScript.valueToCode(block, 'MIN', Blockly.JavaScript.ORDER_COMMA) || '0';
  const max = Blockly.JavaScript.valueToCode(block, 'MAX', Blockly.JavaScript.ORDER_COMMA) || '1';
  
  const code = `(Math.random() * (${max} - ${min}) + ${min})`;
  return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

/**
 * 수학 함수 블록
 */
Blockly.Blocks['math_function'] = {
  init: function() {
    this.appendValueInput('NUMBER')
        .setCheck('Number')
        .appendField('수학 함수')
        .appendField(new Blockly.FieldDropdown([
          ['절대값', 'abs'],
          ['제곱근', 'sqrt'],
          ['제곱', 'pow2'],
          ['세제곱', 'pow3'],
          ['sin', 'sin'],
          ['cos', 'cos'],
          ['tan', 'tan'],
          ['log', 'log'],
          ['반올림', 'round'],
          ['올림', 'ceil'],
          ['내림', 'floor']
        ]), 'FUNCTION');
    this.setOutput(true, 'Number');
    this.setColour(MATH_BLOCK_COLOR);
    this.setTooltip('선택한, 수학 함수를 적용합니다.');
    this.setHelpUrl('');
  }
};

Blockly.JavaScript['math_function'] = function(block) {
  const func = block.getFieldValue('FUNCTION');
  const number = Blockly.JavaScript.valueToCode(block, 'NUMBER', Blockly.JavaScript.ORDER_NONE) || '0';
  
  let code;
  switch (func) {
    case 'abs':
      code = `Math.abs(${number})`;
      break;
    case 'sqrt':
      code = `Math.sqrt(${number})`;
      break;
    case 'pow2':
      code = `Math.pow(${number}, 2)`;
      break;
    case 'pow3':
      code = `Math.pow(${number}, 3)`;
      break;
    case 'sin':
      code = `Math.sin(${number})`;
      break;
    case 'cos':
      code = `Math.cos(${number})`;
      break;
    case 'tan':
      code = `Math.tan(${number})`;
      break;
    case 'log':
      code = `Math.log(${number})`;
      break;
    case 'round':
      code = `Math.round(${number})`;
      break;
    case 'ceil':
      code = `Math.ceil(${number})`;
      break;
    case 'floor':
      code = `Math.floor(${number})`;
      break;
    default:
      code = number;
  }
  
  return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

/**
 * 게임 난이도 블록
 */
Blockly.Blocks['game_difficulty'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('게임 난이도 설정')
        .appendField(new Blockly.FieldDropdown([
          ['쉬움', 'easy'],
          ['보통', 'medium'],
          ['어려움', 'hard']
        ]), 'DIFFICULTY');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(GAME_BLOCK_COLOR);
    this.setTooltip('게임의 난이도를 설정합니다.');
    this.setHelpUrl('');
  }
};

Blockly.JavaScript['game_difficulty'] = function(block) {
  const difficulty = block.getFieldValue('DIFFICULTY');
  
  // 난이도에 따른 게임 변수 설정
  let code = 'let gameDifficulty = "' + difficulty + '";\n';
  
  switch (difficulty) {
    case 'easy':
      code += 'let maxAttempts = 10;\n';
      code += 'let timeLimit = 60;\n';
      break;
    case 'medium':
      code += 'let maxAttempts = 7;\n';
      code += 'let timeLimit = 45;\n';
      break;
    case 'hard':
      code += 'let maxAttempts = 5;\n';
      code += 'let timeLimit = 30;\n';
      break;
  }
  
  return code;
};

/**
 * 점수 관리 블록
 */
Blockly.Blocks['game_score'] = {
  init: function() {
    this.appendValueInput('SCORE')
        .setCheck('Number')
        .appendField('점수')
        .appendField(new Blockly.FieldDropdown([
          ['추가', 'add'],
          ['감소', 'subtract'],
          ['설정', 'set']
        ]), 'ACTION');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(GAME_BLOCK_COLOR);
    this.setTooltip('게임 점수를 관리합니다.');
    this.setHelpUrl('');
  }
};

Blockly.JavaScript['game_score'] = function(block) {
  const action = block.getFieldValue('ACTION');
  const score = Blockly.JavaScript.valueToCode(block, 'SCORE', Blockly.JavaScript.ORDER_NONE) || '0';
  
  // 점수 초기화 확인
  let code = 'if (typeof gameScore === "undefined") {\n';
  code += '  gameScore = 0;\n';
  code += '}\n\n';
  
  // 점수 조작
  switch (action) {
    case 'add':
      code += `gameScore += ${score};\n`;
      break;
    case 'subtract':
      code += `gameScore = Math.max(0, gameScore - ${score});\n`;
      break;
    case 'set':
      code += `gameScore = ${score};\n`;
      break;
  }
  
  code += 'console.log("현재 점수: " + gameScore);\n';
  
  return code;
};

/**
 * 배열 정렬 블록
 */
Blockly.Blocks['algorithm_sort_array'] = {
  init: function() {
    this.appendValueInput('ARRAY')
        .setCheck('Array')
        .appendField('배열');
    this.appendDummyInput()
        .appendField('정렬')
        .appendField(new Blockly.FieldDropdown([
          ['오름차순', 'ascending'],
          ['내림차순', 'descending']
        ]), 'ORDER');
    this.setOutput(true, 'Array');
    this.setColour(ALGORITHM_BLOCK_COLOR);
    this.setTooltip('배열을 오름차순 또는 내림차순으로 정렬합니다.');
    this.setHelpUrl('');
  }
};

Blockly.JavaScript['algorithm_sort_array'] = function(block) {
  const array = Blockly.JavaScript.valueToCode(block, 'ARRAY', Blockly.JavaScript.ORDER_MEMBER) || '[]';
  const order = block.getFieldValue('ORDER');
  
  let code;
  switch (order) {
    case 'ascending':
      code = `[...${array}].sort((a, b) => a - b)`;
      break;
    case 'descending':
      code = `[...${array}].sort((a, b) => b - a)`;
      break;
  }
  
  return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

/**
 * 배열 검색 블록
 */
Blockly.Blocks['algorithm_search_array'] = {
  init: function() {
    this.appendValueInput('ARRAY')
        .setCheck('Array')
        .appendField('배열에서');
    this.appendValueInput('ITEM')
        .appendField('값');
    this.appendDummyInput()
        .appendField('찾기')
        .appendField(new Blockly.FieldDropdown([
          ['첫 번째 위치', 'indexOf'],
          ['마지막 위치', 'lastIndexOf'],
          ['모든 위치', 'findAll']
        ]), 'SEARCH_TYPE');
    this.setOutput(true, null);
    this.setColour(ALGORITHM_BLOCK_COLOR);
    this.setTooltip('배열에서 특정 값을 검색합니다.');
    this.setHelpUrl('');
  }
};

Blockly.JavaScript['algorithm_search_array'] = function(block) {
  const array = Blockly.JavaScript.valueToCode(block, 'ARRAY', Blockly.JavaScript.ORDER_MEMBER) || '[]';
  const item = Blockly.JavaScript.valueToCode(block, 'ITEM', Blockly.JavaScript.ORDER_NONE) || 'null';
  const searchType = block.getFieldValue('SEARCH_TYPE');
  
  let code;
  switch (searchType) {
    case 'indexOf':
      code = `${array}.indexOf(${item})`;
      break;
    case 'lastIndexOf':
      code = `${array}.lastIndexOf(${item})`;
      break;
    case 'findAll':
      code = `
        (function(arr, val) {
          const indexes = [];
          let idx = arr.indexOf(val);
          while (idx !== -1) {
            indexes.push(idx);
            idx = arr.indexOf(val, idx + 1);
          }
          return indexes;
        })(${array}, ${item})
      `;
      break;
  }
  
  return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
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
  
  // 배열 카테고리
  const arrayCategory = {
    kind: 'category',
    name: '배열',
    colour: ARRAY_BLOCK_COLOR,
    contents: [
      { kind: 'block', type: 'array_create' },
      { kind: 'block', type: 'array_get_item' },
      { kind: 'block', type: 'array_set_item' },
      { kind: 'block', type: 'array_length' }
    ]
  };
  
  // 문자열 카테고리
  const stringCategory = {
    kind: 'category',
    name: '문자열',
    colour: STRING_BLOCK_COLOR,
    contents: [
      { kind: 'block', type: 'string_concat' },
      { kind: 'block', type: 'string_substring' },
      { kind: 'block', type: 'string_split' }
    ]
  };
  
  // 수학 고급 카테고리
  const mathAdvancedCategory = {
    kind: 'category',
    name: '고급 수학',
    colour: MATH_BLOCK_COLOR,
    contents: [
      { kind: 'block', type: 'math_random_float_advanced' },
      { kind: 'block', type: 'math_function' }
    ]
  };
  
  // 시간 카테고리
  const timeCategory = {
    kind: 'category',
    name: '시간',
    colour: TIME_BLOCK_COLOR,
    contents: [
      { kind: 'block', type: 'time_current' },
      { kind: 'block', type: 'terminal_wait' }
    ]
  };
  
  // 게임 카테고리
  const gameCategory = {
    kind: 'category',
    name: '게임',
    colour: GAME_BLOCK_COLOR,
    contents: [
      { kind: 'block', type: 'game_difficulty' },
      { kind: 'block', type: 'game_score' }
    ]
  };
  
  // 알고리즘 카테고리
  const algorithmCategory = {
    kind: 'category',
    name: '알고리즘',
    colour: ALGORITHM_BLOCK_COLOR,
    contents: [
      { kind: 'block', type: 'algorithm_sort_array' },
      { kind: 'block', type: 'algorithm_search_array' }
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
          effectsCategory,
          arrayCategory,
          stringCategory,
          mathAdvancedCategory,
          timeCategory,
          gameCategory,
          algorithmCategory
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