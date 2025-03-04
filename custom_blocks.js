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
const ANIMATION_BLOCK_COLOR = '#E91E63';
const CHART_BLOCK_COLOR = '#00BCD4';
const UI_BLOCK_COLOR = '#9C27B0';

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
  
  return code;
};

/**
 * 터미널 클리어 스크린 블록 정의 (고급 버전)
 */
Blockly.Blocks['terminal_clear_screen'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('화면 지우기')
        .appendField(new Blockly.FieldDropdown([
          ['전체 화면', 'all'],
          ['커서부터 화면 끝까지', 'forward'],
          ['화면 시작부터 커서까지', 'backward'],
          ['현재 줄', 'line']
        ]), 'CLEAR_MODE');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(TERMINAL_BLOCK_COLOR);
    this.setTooltip('터미널 화면을 다양한 방식으로 지웁니다.');
    this.setHelpUrl('');
  }
};

Blockly.JavaScript['terminal_clear_screen'] = function(block) {
  const clearMode = block.getFieldValue('CLEAR_MODE');
  
  // 지우기 모드에 따른 코드
  let code;
  switch (clearMode) {
    case 'all':
      code = 'console.log("\\u001b[2J\\u001b[0;0H");\n';
      break;
    case 'forward':
      code = 'console.log("\\u001b[0J");\n';
      break;
    case 'backward':
      code = 'console.log("\\u001b[1J");\n';
      break;
    case 'line':
      code = 'console.log("\\u001b[2K");\n';
      break;
  }
  
  return code;
};

/**
 * 터미널 화면 분할 블록 정의
 */
Blockly.Blocks['terminal_split_screen'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('화면 분할')
        .appendField(new Blockly.FieldDropdown([
          ['가로 2분할', 'horizontal2'],
          ['세로 2분할', 'vertical2'],
          ['4분할', 'quad']
        ]), 'SPLIT_TYPE');
    this.appendValueInput('CONTENT1')
        .setCheck('String')
        .appendField('영역 1 내용');
    this.appendValueInput('CONTENT2')
        .setCheck('String')
        .appendField('영역 2 내용');
    this.appendValueInput('CONTENT3')
        .setCheck('String')
        .appendField('영역 3 내용')
        .setVisible(false);
    this.appendValueInput('CONTENT4')
        .setCheck('String')
        .appendField('영역 4 내용')
        .setVisible(false);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(UI_BLOCK_COLOR);
    this.setTooltip('터미널 화면을 여러 영역으로 분할합니다.');
    this.setHelpUrl('');
    
    // 분할 유형에 따라 입력 필드 표시/숨김 설정
    this.setOnChange(function(changeEvent) {
      if (changeEvent.type === Blockly.Events.BLOCK_CHANGE &&
          changeEvent.name === 'SPLIT_TYPE') {
        const splitType = this.getFieldValue('SPLIT_TYPE');
        
        const show34 = splitType === 'quad';
        this.getInput('CONTENT3').setVisible(show34);
        this.getInput('CONTENT4').setVisible(show34);
        
        // 입력 필드 크기 업데이트
        this.render();
      }
    });
  }
};

Blockly.JavaScript['terminal_split_screen'] = function(block) {
  const splitType = block.getFieldValue('SPLIT_TYPE');
  const content1 = Blockly.JavaScript.valueToCode(block, 'CONTENT1', Blockly.JavaScript.ORDER_NONE) || '""';
  const content2 = Blockly.JavaScript.valueToCode(block, 'CONTENT2', Blockly.JavaScript.ORDER_NONE) || '""';
  const content3 = splitType === 'quad' ? 
      (Blockly.JavaScript.valueToCode(block, 'CONTENT3', Blockly.JavaScript.ORDER_NONE) || '""') : '""';
  const content4 = splitType === 'quad' ? 
      (Blockly.JavaScript.valueToCode(block, 'CONTENT4', Blockly.JavaScript.ORDER_NONE) || '""') : '""';
  
  // 화면 분할 코드
  let code;
  
  switch (splitType) {
    case 'horizontal2':
      code = `
      (function() {
        const topContent = String(${content1});
        const bottomContent = String(${content2});
        
        // 화면 크기 계산
        const width = process.stdout.columns || 80;
        const height = process.stdout.rows || 24;
        const halfHeight = Math.floor(height / 2);
        
        // 분할선 그리기
        const divider = '─'.repeat(width);
        
        // 첫 번째 영역 출력
        const topLines = topContent.split('\\n');
        topLines.forEach((line, index) => {
          if (index < halfHeight - 1) {
            console.log(line);
          }
        });
        
        // 분할선 출력
        console.log(divider);
        
        // 두 번째 영역 출력
        const bottomLines = bottomContent.split('\\n');
        bottomLines.forEach((line, index) => {
          if (index < height - halfHeight - 1) {
            console.log(line);
          }
        });
      })();
      `;
      break;
    
    case 'vertical2':
      code = `
      (function() {
        const leftContent = String(${content1});
        const rightContent = String(${content2});
        
        // 화면 크기 계산
        const width = process.stdout.columns || 80;
        const halfWidth = Math.floor(width / 2) - 1;
        
        // 각 영역 내용을 줄 단위로 분할
        const leftLines = leftContent.split('\\n');
        const rightLines = rightContent.split('\\n');
        const maxLines = Math.max(leftLines.length, rightLines.length);
        
        // 줄별로 좌우 영역 출력
        for (let i = 0; i < maxLines; i++) {
          const leftLine = (i < leftLines.length) ? leftLines[i] : '';
          const rightLine = (i < rightLines.length) ? rightLines[i] : '';
          
          // 너비에 맞춰 자르거나 패딩 추가
          const formattedLeftLine = leftLine.padEnd(halfWidth).substring(0, halfWidth);
          const formattedRightLine = rightLine.substring(0, halfWidth);
          
          console.log(formattedLeftLine + ' │ ' + formattedRightLine);
        }
      })();
      `;
      break;
    
    case 'quad':
      code = `
      (function() {
        const topLeftContent = String(${content1});
        const topRightContent = String(${content2});
        const bottomLeftContent = String(${content3});
        const bottomRightContent = String(${content4});
        
        // 화면 크기 계산
        const width = process.stdout.columns || 80;
        const height = process.stdout.rows || 24;
        const halfWidth = Math.floor(width / 2) - 1;
        const halfHeight = Math.floor(height / 2);
        
        // 각 영역 내용을 줄 단위로 분할
        const topLeftLines = topLeftContent.split('\\n');
        const topRightLines = topRightContent.split('\\n');
        const bottomLeftLines = bottomLeftContent.split('\\n');
        const bottomRightLines = bottomRightContent.split('\\n');
        
        // 상단 영역 출력
        const topMaxLines = Math.max(
          Math.min(topLeftLines.length, halfHeight - 1),
          Math.min(topRightLines.length, halfHeight - 1)
        );
        
        for (let i = 0; i < topMaxLines; i++) {
          const leftLine = (i < topLeftLines.length) ? topLeftLines[i] : '';
          const rightLine = (i < topRightLines.length) ? topRightLines[i] : '';
          
          // 너비에 맞춰 자르거나 패딩 추가
          const formattedLeftLine = leftLine.padEnd(halfWidth).substring(0, halfWidth);
          const formattedRightLine = rightLine.substring(0, halfWidth);
          
          console.log(formattedLeftLine + ' │ ' + formattedRightLine);
        }
        
        // 수평 분할선
        console.log('─'.repeat(halfWidth) + '┼' + '─'.repeat(halfWidth + 1));
        
        // 하단 영역 출력
        const bottomMaxLines = Math.max(
          Math.min(bottomLeftLines.length, halfHeight - 1),
          Math.min(bottomRightLines.length, halfHeight - 1)
        );
        
        for (let i = 0; i < bottomMaxLines; i++) {
          const leftLine = (i < bottomLeftLines.length) ? bottomLeftLines[i] : '';
          const rightLine = (i < bottomRightLines.length) ? bottomRightLines[i] : '';
          
          // 너비에 맞춰 자르거나 패딩 추가
          const formattedLeftLine = leftLine.padEnd(halfWidth).substring(0, halfWidth);
          const formattedRightLine = rightLine.substring(0, halfWidth);
          
          console.log(formattedLeftLine + ' │ ' + formattedRightLine);
        }
      })();
      `;
      break;
  }
  
  return code;
};

/**
 * ASCII 그래프 출력 블록 정의
 */
Blockly.Blocks['terminal_ascii_graph'] = {
  init: function() {
    this.appendValueInput('DATA')
        .setCheck('Array')
        .appendField('ASCII 그래프')
        .appendField(new Blockly.FieldDropdown([
          ['선 그래프', 'line'],
          ['막대 그래프', 'bar'],
          ['점 그래프', 'scatter']
        ]), 'GRAPH_TYPE');
    this.appendDummyInput()
        .appendField('제목')
        .appendField(new Blockly.FieldTextInput(''), 'TITLE')
        .appendField('너비')
        .appendField(new Blockly.FieldNumber(40, 10, 100), 'WIDTH')
        .appendField('높이')
        .appendField(new Blockly.FieldNumber(10, 5, 30), 'HEIGHT');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(CHART_BLOCK_COLOR);
    this.setTooltip('데이터를 ASCII 문자를 사용한 그래프로 출력합니다.');
    this.setHelpUrl('');
  }
};

Blockly.JavaScript['terminal_ascii_graph'] = function(block) {
  const graphType = block.getFieldValue('GRAPH_TYPE');
  const title = block.getFieldValue('TITLE');
  const width = block.getFieldValue('WIDTH');
  const height = block.getFieldValue('HEIGHT');
  const data = Blockly.JavaScript.valueToCode(block, 'DATA', Blockly.JavaScript.ORDER_NONE) || '[]';
  
  // 그래프 타입에 따른 문자 설정
  let graphChar;
  switch (graphType) {
    case 'line':
      graphChar = `{
        point: '┼',
        horizontal: '─',
        vertical: '│',
        line: '*',
        axis: '┼'
      }`;
      break;
    case 'bar':
      graphChar = `{
        point: '┼',
        horizontal: '─',
        vertical: '│',
        bar: '█',
        axis: '┼'
      }`;
      break;
    case 'scatter':
      graphChar = `{
        point: '┼',
        horizontal: '─',
        vertical: '│',
        dot: '•',
        axis: '┼'
      }`;
      break;
  }
  
  // 그래프 출력 코드
  let graphCode;
  switch (graphType) {
    case 'line':
      graphCode = `
        // 선 그래프 그리기
        const canvas = Array(graphHeight).fill().map(() => Array(graphWidth).fill(' '));
        
        // X축과 Y축 그리기
        for (let x = 0; x < graphWidth; x++) {
          canvas[graphHeight - 1][x] = chars.horizontal;
        }
        for (let y = 0; y < graphHeight; y++) {
          canvas[y][0] = chars.vertical;
        }
        canvas[graphHeight - 1][0] = chars.axis;
        
        // 데이터 포인트 계산 및 그리기
        for (let i = 0; i < graphData.length - 1; i++) {
          if (i >= graphWidth - 1) break;
          
          const x1 = i + 1;
          const y1 = graphHeight - 1 - Math.floor((graphData[i] - minValue) * yScale);
          const x2 = i + 2;
          const y2 = graphHeight - 1 - Math.floor((graphData[i+1] - minValue) * yScale);
          
          // 두 점 사이의 선 그리기 (단순화된 브레젠험 알고리즘)
          const dx = Math.abs(x2 - x1);
          const dy = Math.abs(y2 - y1);
          const sx = (x1 < x2) ? 1 : -1;
          const sy = (y1 < y2) ? 1 : -1;
          let err = dx - dy;
          
          let cx = x1;
          let cy = y1;
          
          while (true) {
            if (cx >= 0 && cx < graphWidth && cy >= 0 && cy < graphHeight) {
              canvas[cy][cx] = chars.line;
            }
            
            if (cx === x2 && cy === y2) break;
            
            const e2 = 2 * err;
            if (e2 > -dy) { err -= dy; cx += sx; }
            if (e2 < dx) { err += dx; cy += sy; }
          }
        }
      `;
      break;
    
    case 'bar':
      graphCode = `
        // 막대 그래프 그리기
        const canvas = Array(graphHeight).fill().map(() => Array(graphWidth).fill(' '));
        
        // X축과 Y축 그리기
        for (let x = 0; x < graphWidth; x++) {
          canvas[graphHeight - 1][x] = chars.horizontal;
        }
        for (let y = 0; y < graphHeight; y++) {
          canvas[y][0] = chars.vertical;
        }
        canvas[graphHeight - 1][0] = chars.axis;
        
        // 막대 그리기
        for (let i = 0; i < graphData.length; i++) {
          if (i >= graphWidth - 1) break;
          
          const x = i + 1;
          const barHeight = Math.floor((graphData[i] - minValue) * yScale);
          
          for (let y = 0; y < barHeight; y++) {
            const canvasY = graphHeight - 1 - y;
            if (canvasY >= 0 && x < graphWidth) {
              canvas[canvasY][x] = chars.bar;
            }
          }
        }
      `;
      break;
    
    case 'scatter':
      graphCode = `
        // 점 그래프 그리기
        const canvas = Array(graphHeight).fill().map(() => Array(graphWidth).fill(' '));
        
        // X축과 Y축 그리기
        for (let x = 0; x < graphWidth; x++) {
          canvas[graphHeight - 1][x] = chars.horizontal;
        }
        for (let y = 0; y < graphHeight; y++) {
          canvas[y][0] = chars.vertical;
        }
        canvas[graphHeight - 1][0] = chars.axis;
        
        // 점 찍기
        for (let i = 0; i < graphData.length; i++) {
          if (i >= graphWidth - 1) break;
          
          const x = i + 1;
          const y = graphHeight - 1 - Math.floor((graphData[i] - minValue) * yScale);
          
          if (y >= 0 && y < graphHeight && x < graphWidth) {
            canvas[y][x] = chars.dot;
          }
        }
      `;
      break;
  }
  
  // 전체 그래프 코드
  const code = `
  (function() {
    const graphTitle = "${title}";
    const graphWidth = ${width};
    const graphHeight = ${height};
    const chars = ${graphChar};
    
    // 데이터 변환 (객체 배열인 경우 값 추출)
    const rawData = ${data};
    const graphData = rawData.map(item => {
      if (typeof item === 'number') return item;
      if (typeof item === 'object' && item !== null && 'value' in item) return item.value;
      return 0;
    });
    
    if (graphData.length === 0) {
      console.log("그래프를 그릴 데이터가 없습니다.");
      return;
    }
    
    // 최대/최소값 찾기
    const maxValue = Math.max(...graphData);
    const minValue = Math.min(...graphData);
    const valueRange = maxValue - minValue;
    
    // Y축 스케일 계산 (가용 높이에 맞춤)
    const yScale = valueRange > 0 ? (graphHeight - 2) / valueRange : 0;
    
    ${graphCode}
    
    // 그래프 제목 출력 (있는 경우)
    if (graphTitle) {
      console.log(graphTitle);
    }
    
    // 캔버스 출력
    for (let y = 0; y < graphHeight; y++) {
      console.log(canvas[y].join(''));
    }
    
    // Y축 값 표시 (최대값, 중간값, 최소값)
    console.log(\`최대: \${maxValue.toFixed(1)}, 최소: \${minValue.toFixed(1)}\`);
  })();
  `;
  
  return code;
};

/**
 * 터미널 코드 하이라이트 블록 정의
 */
Blockly.Blocks['terminal_code_highlight'] = {
  init: function() {
    this.appendValueInput('CODE')
        .setCheck('String')
        .appendField('코드 하이라이트')
        .appendField(new Blockly.FieldDropdown([
          ['JavaScript', 'javascript'],
          ['HTML', 'html'],
          ['CSS', 'css'],
          ['Python', 'python'],
          ['Java', 'java'],
          ['C/C++', 'c']
        ]), 'LANGUAGE');
    this.appendDummyInput()
        .appendField('줄 번호 표시')
        .appendField(new Blockly.FieldCheckbox('TRUE'), 'SHOW_LINE_NUMBERS');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(OUTPUT_BLOCK_COLOR);
    this.setTooltip('터미널에 문법 강조 표시된 코드를 출력합니다.');
    this.setHelpUrl('');
  }
};

Blockly.JavaScript['terminal_code_highlight'] = function(block) {
  const language = block.getFieldValue('LANGUAGE');
  const showLineNumbers = block.getFieldValue('SHOW_LINE_NUMBERS') === 'TRUE';
  const code = Blockly.JavaScript.valueToCode(block, 'CODE', Blockly.JavaScript.ORDER_NONE) || '""';
  
  // 언어별 토큰화 및 색상 정의 (간단한 버전)
  const languagePatterns = {
    javascript: `{
      keywords: ["function", "return", "var", "let", "const", "if", "else", "for", "while", "do", "switch", "case", "break", "continue", "new", "try", "catch", "finally", "throw", "class", "extends", "super", "import", "export", "from", "as", "async", "await"],
      keywordColor: "\\u001b[33m", // yellow
      strings: /"[^"]*"|'[^']*'/g,
      stringColor: "\\u001b[32m", // green
      numbers: /\\b\\d+\\.?\\d*\\b/g,
      numberColor: "\\u001b[36m", // cyan
      comments: /\\/\\/.*|\\/*[^*]*\\*+(?:[^\\/*][^*]*\\*+)*\\//g,
      commentColor: "\\u001b[90m", // gray
      functions: /\\b[A-Za-z_$][A-Za-z0-9_$]*(?=\\s*\\()/g,
      functionColor: "\\u001b[34m", // blue
      operators: /[+\\-*/%=&|^~<>!?:]/g,
      operatorColor: "\\u001b[35m" // magenta
    }`,
    html: `{
      keywords: ["html", "head", "body", "div", "span", "p", "a", "img", "script", "style", "link", "meta", "title", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "table", "tr", "td", "th"],
      keywordColor: "\\u001b[36m", // cyan
      strings: /"[^"]*"|'[^']*'/g,
      stringColor: "\\u001b[32m", // green
      tags: /<\\/?(\\w+)(\\s+[^>]*)?>/g,
      tagColor: "\\u001b[34m", // blue
      attributes: /\\b(\\w+)=/g,
      attributeColor: "\\u001b[33m", // yellow
      comments: /<!--[\\s\\S]*?-->/g,
      commentColor: "\\u001b[90m" // gray
    }`,
    css: `{
      keywords: ["body", "div", "span", "p", "a", "img", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "table"],
      keywordColor: "\\u001b[34m", // blue
      properties: /[\\w-]+(?=\\s*:)/g,
      propertyColor: "\\u001b[36m", // cyan
      values: /:[^;]+/g,
      valueColor: "\\u001b[32m", // green
      selectors: /[.#]?[\\w-]+(?=[\\s{,])/g,
      selectorColor: "\\u001b[33m", // yellow
      comments: /\\/\\*[\\s\\S]*?\\*\\//g,
      commentColor: "\\u001b[90m" // gray
    }`,
    python: `{
      keywords: ["def", "return", "if", "elif", "else", "for", "while", "break", "continue", "try", "except", "finally", "class", "import", "from", "as", "with", "pass", "raise", "in", "is", "not", "and", "or", "True", "False", "None"],
      keywordColor: "\\u001b[33m", // yellow
      strings: /"[^"]*"|'[^']*'/g,
      stringColor: "\\u001b[32m", // green
      numbers: /\\b\\d+\\.?\\d*\\b/g,
      numberColor: "\\u001b[36m", // cyan
      comments: /#.*/g,
      commentColor: "\\u001b[90m", // gray
      functions: /\\b[A-Za-z_][A-Za-z0-9_]*(?=\\s*\\()/g,
      functionColor: "\\u001b[34m", // blue
      decorators: /@[A-Za-z0-9_.]+/g,
      decoratorColor: "\\u001b[35m" // magenta
    }`,
    java: `{
      keywords: ["public", "private", "protected", "class", "interface", "enum", "extends", "implements", "new", "this", "super", "return", "if", "else", "for", "while", "do", "switch", "case", "break", "continue", "try", "catch", "finally", "throw", "throws", "static", "final", "void", "int", "boolean", "String"],
      keywordColor: "\\u001b[33m", // yellow
      strings: /"[^"]*"/g,
      stringColor: "\\u001b[32m", // green
      numbers: /\\b\\d+\\.?\\d*\\b/g,
      numberColor: "\\u001b[36m", // cyan
      comments: /\\/\\/.*|\\/*[^*]*\\*+(?:[^\\/*][^*]*\\*+)*\\//g,
      commentColor: "\\u001b[90m", // gray
      annotations: /@[A-Za-z0-9_]+/g,
      annotationColor: "\\u001b[35m" // magenta
    }`,
    c: `{
      keywords: ["int", "char", "float", "double", "void", "long", "short", "signed", "unsigned", "struct", "union", "enum", "typedef", "const", "static", "extern", "return", "if", "else", "for", "while", "do", "switch", "case", "break", "continue", "goto", "sizeof"],
      keywordColor: "\\u001b[33m", // yellow
      strings: /"[^"]*"/g,
      stringColor: "\\u001b[32m", // green
      numbers: /\\b\\d+\\.?\\d*\\b/g,
      numberColor: "\\u001b[36m", // cyan
      comments: /\\/\\/.*|\\/*[^*]*\\*+(?:[^\\/*][^*]*\\*+)*\\//g,
      commentColor: "\\u001b[90m", // gray
      preprocessor: /#\\w+/g,
      preprocessorColor: "\\u001b[35m" // magenta
    }`
  };
  
  // 코드 하이라이트 로직
  const highlightCode = `
  (function() {
    const sourceCode = ${code};
    const language = "${language}";
    const showLineNumbers = ${showLineNumbers};
    const languagePatterns = ${languagePatterns[language]};
    const resetColor = "\\u001b[0m";
    
    // 줄 번호 너비 계산
    const lines = sourceCode.split('\\n');
    const lineNumberWidth = lines.length.toString().length + 1;
    
    // 각 줄 처리
    lines.forEach((line, index) => {
      let highlightedLine = line;
      let lineNumber = '';
      
      // 줄 번호 표시
      if (showLineNumbers) {
        const lineNum = (index + 1).toString().padStart(lineNumberWidth, ' ');
        lineNumber = \`\\u001b[90m\${lineNum} │ \${resetColor}\`;
      }
      
      // 언어별 하이라이트 로직
      if (language === "javascript" || language === "java" || language === "c" || language === "python") {
        // 키워드 하이라이트
        languagePatterns.keywords.forEach(keyword => {
          const regex = new RegExp(\`\\\\b\${keyword}\\\\b\`, 'g');
          highlightedLine = highlightedLine.replace(regex, \`\${languagePatterns.keywordColor}\${keyword}\${resetColor}\`);
        });
        
        // 문자열 하이라이트
        highlightedLine = highlightedLine.replace(languagePatterns.strings, match => 
          \`\${languagePatterns.stringColor}\${match}\${resetColor}\`
        );
        
        // 숫자 하이라이트
        highlightedLine = highlightedLine.replace(languagePatterns.numbers, match => 
          \`\${languagePatterns.numberColor}\${match}\${resetColor}\`
        );
        
        // 주석 하이라이트
        highlightedLine = highlightedLine.replace(languagePatterns.comments, match => 
          \`\${languagePatterns.commentColor}\${match}\${resetColor}\`
        );
        
        // 함수 호출 하이라이트
        if (languagePatterns.functions) {
          highlightedLine = highlightedLine.replace(languagePatterns.functions, match => 
            \`\${languagePatterns.functionColor}\${match}\${resetColor}\`
          );
        }
        
        // 기타 언어별 특수 패턴 처리
        if (language === "python" && languagePatterns.decorators) {
          highlightedLine = highlightedLine.replace(languagePatterns.decorators, match => 
            \`\${languagePatterns.decoratorColor}\${match}\${resetColor}\`
          );
        }
        
        if (language === "java" && languagePatterns.annotations) {
          highlightedLine = highlightedLine.replace(languagePatterns.annotations, match => 
            \`\${languagePatterns.annotationColor}\${match}\${resetColor}\`
          );
        }
        
        if (language === "c" && languagePatterns.preprocessor) {
          highlightedLine = highlightedLine.replace(languagePatterns.preprocessor, match => 
            \`\${languagePatterns.preprocessorColor}\${match}\${resetColor}\`
          );
        }
        
      } else if (language === "html") {
        // HTML 태그 하이라이트
        highlightedLine = highlightedLine.replace(languagePatterns.tags, match => 
          \`\${languagePatterns.tagColor}\${match}\${resetColor}\`
        );
        
        // 속성 하이라이트
        highlightedLine = highlightedLine.replace(languagePatterns.attributes, match => 
          \`\${languagePatterns.attributeColor}\${match}\${resetColor}\`
        );
        
        // 문자열 하이라이트
        highlightedLine = highlightedLine.replace(languagePatterns.strings, match => 
          \`\${languagePatterns.stringColor}\${match}\${resetColor}\`
        );
        
        // 주석 하이라이트
        highlightedLine = highlightedLine.replace(languagePatterns.comments, match => 
          \`\${languagePatterns.commentColor}\${match}\${resetColor}\`
        );
        
      } else if (language === "css") {
        // 선택자 하이라이트
        highlightedLine = highlightedLine.replace(languagePatterns.selectors, match => 
          \`\${languagePatterns.selectorColor}\${match}\${resetColor}\`
        );
        
        // 속성 하이라이트
        highlightedLine = highlightedLine.replace(languagePatterns.properties, match => 
          \`\${languagePatterns.propertyColor}\${match}\${resetColor}\`
        );
        
        // 값 하이라이트
        highlightedLine = highlightedLine.replace(languagePatterns.values, match => 
          \`\${languagePatterns.valueColor}\${match}\${resetColor}\`
        );
        
        // 주석 하이라이트
        highlightedLine = highlightedLine.replace(languagePatterns.comments, match => 
          \`\${languagePatterns.commentColor}\${match}\${resetColor}\`
        );
      }
      
      // 처리된 줄 출력
      console.log(lineNumber + highlightedLine);
    });
    
    console.log(resetColor); // 색상 리셋
  })();
  `;
  
  return highlightCode;
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
    
    // 고급 출력 카테고리
    const advancedOutputCategory = {
        kind: 'category',
        name: '고급 출력',
        colour: OUTPUT_BLOCK_COLOR,
        contents: [
            { kind: 'block', type: 'terminal_table' },
            { kind: 'block', type: 'terminal_box' },
            { kind: 'block', type: 'terminal_notification_box' },
            { kind: 'block', type: 'terminal_code_highlight' }
        ]
    };
    
    // 애니메이션 및 효과 카테고리
    const animationCategory = {
        kind: 'category',
        name: '애니메이션',
        colour: ANIMATION_BLOCK_COLOR,
        contents: [
            { kind: 'block', type: 'terminal_animated_text' },
            { kind: 'block', type: 'terminal_spinner' },
            { kind: 'block', type: 'terminal_progress_bar' },
            { kind: 'block', type: 'terminal_ascii_art' }
        ]
    };
    
    // 차트 및 그래프 카테고리
    const chartCategory = {
        kind: 'category',
        name: '차트/그래프',
        colour: CHART_BLOCK_COLOR,
        contents: [
            { kind: 'block', type: 'terminal_histogram' },
            { kind: 'block', type: 'terminal_ascii_graph' }
        ]
    };
    
    // 화면 제어 카테고리
    const screenControlCategory = {
        kind: 'category',
        name: '화면 제어',
        colour: UI_BLOCK_COLOR,
        contents: [
            { kind: 'block', type: 'terminal_clear_screen' },
            { kind: 'block', type: 'terminal_split_screen' }
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
                    advancedOutputCategory,
                    animationCategory,
                    chartCategory,
                    screenControlCategory,
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

/**
 * 테이블 출력 블록 정의
 */
Blockly.Blocks['terminal_table'] = {
  init: function() {
    this.appendValueInput('ROWS')
        .setCheck('Array')
        .appendField('테이블 데이터');
    this.appendDummyInput()
        .appendField('열 너비')
        .appendField(new Blockly.FieldNumber(10, 1, 50), 'COLUMN_WIDTH')
        .appendField('테두리 스타일')
        .appendField(new Blockly.FieldDropdown([
          ['단일선', 'single'],
          ['이중선', 'double'],
          ['굵은선', 'bold'],
          ['점선', 'dashed'],
          ['없음', 'none']
        ]), 'BORDER_STYLE');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(OUTPUT_BLOCK_COLOR);
    this.setTooltip('데이터를 테이블 형식으로 출력합니다.');
    this.setHelpUrl('');
  }
};

Blockly.JavaScript['terminal_table'] = function(block) {
  const rows = Blockly.JavaScript.valueToCode(block, 'ROWS', Blockly.JavaScript.ORDER_NONE) || '[]';
  const columnWidth = block.getFieldValue('COLUMN_WIDTH');
  const borderStyle = block.getFieldValue('BORDER_STYLE');
  
  // 테두리 스타일에 따른 문자 설정
  let chars;
  switch (borderStyle) {
    case 'single':
      chars = `{
        topLeft: '┌', topRight: '┐', bottomLeft: '└', bottomRight: '┘',
        horizontal: '─', vertical: '│', cross: '┼',
        leftT: '├', rightT: '┤', topT: '┬', bottomT: '┴'
      }`;
      break;
    case 'double':
      chars = `{
        topLeft: '╔', topRight: '╗', bottomLeft: '╚', bottomRight: '╝',
        horizontal: '═', vertical: '║', cross: '╬',
        leftT: '╠', rightT: '╣', topT: '╦', bottomT: '╩'
      }`;
      break;
    case 'bold':
      chars = `{
        topLeft: '┏', topRight: '┓', bottomLeft: '┗', bottomRight: '┛',
        horizontal: '━', vertical: '┃', cross: '╋',
        leftT: '┣', rightT: '┫', topT: '┳', bottomT: '┻'
      }`;
      break;
    case 'dashed':
      chars = `{
        topLeft: '+', topRight: '+', bottomLeft: '+', bottomRight: '+',
        horizontal: '-', vertical: '|', cross: '+',
        leftT: '+', rightT: '+', topT: '+', bottomT: '+'
      }`;
      break;
    case 'none':
      chars = `{
        topLeft: '', topRight: '', bottomLeft: '', bottomRight: '',
        horizontal: ' ', vertical: ' ', cross: ' ',
        leftT: '', rightT: '', topT: '', bottomT: ''
      }`;
      break;
  }
  
  // 테이블 그리기 코드
  const code = `
  (function() {
    const tableData = ${rows};
    const colWidth = ${columnWidth};
    const border = ${chars};
    
    // 테이블 최대 열 수 계산
    let maxCols = 0;
    for (const row of tableData) {
      if (Array.isArray(row) && row.length > maxCols) {
        maxCols = row.length;
      }
    }
    
    if (maxCols === 0) {
      console.log("테이블에 표시할 데이터가 없습니다.");
      return;
    }
    
    // 테이블 셀 형식화 함수
    function formatCell(value, width) {
      value = String(value || '');
      if (value.length > width) {
        return value.substring(0, width - 3) + '...';
      }
      return value.padEnd(width);
    }
    
    // 헤더 행 여부 (첫 번째 행을 헤더로 처리)
    const hasHeader = tableData.length > 1;
    
    // 테이블 상단 테두리 그리기
    let line = border.topLeft;
    for (let i = 0; i < maxCols; i++) {
      line += border.horizontal.repeat(colWidth);
      line += (i < maxCols - 1) ? border.topT : border.topRight;
    }
    console.log(line);
    
    // 데이터 행 그리기
    tableData.forEach((row, rowIndex) => {
      if (!Array.isArray(row)) {
        row = [row]; // 배열이 아닌 경우 단일 값으로 처리
      }
      
      // 셀 내용 행 그리기
      let dataLine = border.vertical;
      for (let i = 0; i < maxCols; i++) {
        const value = i < row.length ? row[i] : '';
        dataLine += formatCell(value, colWidth);
        dataLine += border.vertical;
      }
      console.log(dataLine);
      
      // 헤더와 데이터를 구분하는 행 또는 행 구분선 그리기
      if ((hasHeader && rowIndex === 0) || rowIndex < tableData.length - 1) {
        let separator = border.leftT;
        for (let i = 0; i < maxCols; i++) {
          separator += border.horizontal.repeat(colWidth);
          separator += (i < maxCols - 1) ? border.cross : border.rightT;
        }
        console.log(separator);
      }
    });
    
    // 테이블 하단 테두리 그리기
    let bottom = border.bottomLeft;
    for (let i = 0; i < maxCols; i++) {
      bottom += border.horizontal.repeat(colWidth);
      bottom += (i < maxCols - 1) ? border.bottomT : border.bottomRight;
    }
    console.log(bottom);
  })();
  `;
  
  return code;
};

/**
 * 박스 그리기 블록 정의
 */
Blockly.Blocks['terminal_box'] = {
  init: function() {
    this.appendValueInput('TEXT')
        .setCheck('String')
        .appendField('박스 안에 텍스트');
    this.appendDummyInput()
        .appendField('너비')
        .appendField(new Blockly.FieldNumber(20, 4, 100), 'WIDTH')
        .appendField('스타일')
        .appendField(new Blockly.FieldDropdown([
          ['단일선', 'single'],
          ['이중선', 'double'],
          ['굵은선', 'bold'],
          ['둥근모서리', 'rounded'],
          ['점선', 'dashed']
        ]), 'STYLE')
        .appendField('정렬')
        .appendField(new Blockly.FieldDropdown([
          ['왼쪽', 'left'],
          ['가운데', 'center'],
          ['오른쪽', 'right']
        ]), 'ALIGN');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(OUTPUT_BLOCK_COLOR);
    this.setTooltip('텍스트를 박스 안에 출력합니다.');
    this.setHelpUrl('');
  }
};

Blockly.JavaScript['terminal_box'] = function(block) {
  const text = Blockly.JavaScript.valueToCode(block, 'TEXT', Blockly.JavaScript.ORDER_NONE) || '""';
  const width = block.getFieldValue('WIDTH');
  const style = block.getFieldValue('STYLE');
  const align = block.getFieldValue('ALIGN');
  
  // 박스 스타일에 따른 문자 설정
  let chars;
  switch (style) {
    case 'single':
      chars = `{
        topLeft: '┌', topRight: '┐', bottomLeft: '└', bottomRight: '┘',
        horizontal: '─', vertical: '│'
      }`;
      break;
    case 'double':
      chars = `{
        topLeft: '╔', topRight: '╗', bottomLeft: '╚', bottomRight: '╝',
        horizontal: '═', vertical: '║'
      }`;
      break;
    case 'bold':
      chars = `{
        topLeft: '┏', topRight: '┓', bottomLeft: '┗', bottomRight: '┛',
        horizontal: '━', vertical: '┃'
      }`;
      break;
    case 'rounded':
      chars = `{
        topLeft: '╭', topRight: '╮', bottomLeft: '╰', bottomRight: '╯',
        horizontal: '─', vertical: '│'
      }`;
      break;
    case 'dashed':
      chars = `{
        topLeft: '+', topRight: '+', bottomLeft: '+', bottomRight: '+',
        horizontal: '-', vertical: '|'
      }`;
      break;
  }
  
  // 박스 그리기 코드
  const code = `
  (function() {
    const boxText = ${text};
    const boxWidth = ${width};
    const boxAlign = "${align}";
    const boxChars = ${chars};
    
    // 텍스트를 여러 줄로 나누기
    const textLines = String(boxText).split('\\n');
    
    // 내부 너비 (테두리 제외)
    const innerWidth = boxWidth - 2;
    
    // 각 줄의 정렬 처리
    function alignLine(line) {
      if (line.length > innerWidth) {
        return line.substring(0, innerWidth);
      }
      
      switch (boxAlign) {
        case 'left':
          return line.padEnd(innerWidth);
        case 'center':
          const leftPad = Math.floor((innerWidth - line.length) / 2);
          return ' '.repeat(leftPad) + line + ' '.repeat(innerWidth - line.length - leftPad);
        case 'right':
          return line.padStart(innerWidth);
      }
    }
    
    // 상단 테두리
    console.log(boxChars.topLeft + boxChars.horizontal.repeat(innerWidth) + boxChars.topRight);
    
    // 내용
    textLines.forEach(line => {
      console.log(boxChars.vertical + alignLine(line) + boxChars.vertical);
    });
    
    // 하단 테두리
    console.log(boxChars.bottomLeft + boxChars.horizontal.repeat(innerWidth) + boxChars.bottomRight);
  })();
  `;
  
  return code;
};

/**
 * 애니메이션 텍스트 블록 정의
 */
Blockly.Blocks['terminal_animated_text'] = {
  init: function() {
    this.appendValueInput('TEXT')
        .setCheck('String')
        .appendField('애니메이션 텍스트');
    this.appendDummyInput()
        .appendField('유형')
        .appendField(new Blockly.FieldDropdown([
          ['타이핑', 'typing'],
          ['페이드인', 'fadeIn'],
          ['블링크', 'blink'],
          ['슬라이드인', 'slideIn'],
          ['레인보우', 'rainbow']
        ]), 'ANIMATION_TYPE')
        .appendField('속도')
        .appendField(new Blockly.FieldNumber(100, 10, 1000), 'SPEED');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(ANIMATION_BLOCK_COLOR);
    this.setTooltip('텍스트를 애니메이션 효과와 함께 출력합니다.');
    this.setHelpUrl('');
  }
};

Blockly.JavaScript['terminal_animated_text'] = function(block) {
  const text = Blockly.JavaScript.valueToCode(block, 'TEXT', Blockly.JavaScript.ORDER_NONE) || '""';
  const animationType = block.getFieldValue('ANIMATION_TYPE');
  const speed = block.getFieldValue('SPEED');
  
  // 애니메이션 유형에 따른 코드 생성
  let animationCode;
  switch (animationType) {
    case 'typing':
      animationCode = `
        // 타이핑 효과
        for (let i = 0; i <= fullText.length; i++) {
          await new Promise(resolve => setTimeout(resolve, animationSpeed));
          process.stdout.write('\\r' + ' '.repeat(fullText.length) + '\\r' + fullText.substring(0, i));
        }
        console.log(''); // 줄바꿈 추가
      `;
      break;
    case 'fadeIn':
      animationCode = `
        // 페이드인 효과 (밝기 변화)
        const fadeColors = [
          '\\u001b[90m', // 회색
          '\\u001b[37m', // 밝은 회색
          '\\u001b[97m'  // 흰색
        ];
        
        for (let i = 0; i < fadeColors.length; i++) {
          await new Promise(resolve => setTimeout(resolve, animationSpeed * 2));
          process.stdout.write('\\r' + fadeColors[i] + fullText + '\\u001b[0m');
        }
        console.log(''); // 줄바꿈 추가
      `;
      break;
    case 'blink':
      animationCode = `
        // 블링크 효과
        for (let i = 0; i < 3; i++) {
          await new Promise(resolve => setTimeout(resolve, animationSpeed));
          process.stdout.write('\\r' + fullText);
          await new Promise(resolve => setTimeout(resolve, animationSpeed));
          process.stdout.write('\\r' + ' '.repeat(fullText.length));
        }
        process.stdout.write('\\r' + fullText);
        console.log(''); // 줄바꿈 추가
      `;
      break;
    case 'slideIn':
      animationCode = `
        // 슬라이드인 효과
        const width = Math.max(fullText.length, process.stdout.columns || 80);
        for (let i = 0; i < width; i++) {
          await new Promise(resolve => setTimeout(resolve, animationSpeed / 2));
          const position = width - i - 1;
          const visiblePart = fullText.substring(0, Math.max(0, i - (width - fullText.length)));
          process.stdout.write('\\r' + ' '.repeat(position) + visiblePart);
        }
        console.log(''); // 줄바꿈 추가
      `;
      break;
    case 'rainbow':
      animationCode = `
        // 레인보우 효과 (다양한 색상 순환)
        const rainbowColors = [
          '\\u001b[31m', // 빨강
          '\\u001b[33m', // 노랑
          '\\u001b[32m', // 초록
          '\\u001b[36m', // 시안
          '\\u001b[34m', // 파랑
          '\\u001b[35m'  // 마젠타
        ];
        
        for (let i = 0; i < rainbowColors.length; i++) {
          await new Promise(resolve => setTimeout(resolve, animationSpeed));
          process.stdout.write('\\r' + rainbowColors[i] + fullText + '\\u001b[0m');
        }
        console.log(''); // 줄바꿈 추가
      `;
      break;
  }
  
  // 전체 코드 생성
  const code = `
  (async function() {
    const fullText = String(${text});
    const animationSpeed = ${speed};
    
    ${animationCode}
  })();
  `;
  
  return code;
};

/**
 * 알림 박스 블록 정의
 */
Blockly.Blocks['terminal_notification_box'] = {
  init: function() {
    this.appendValueInput('MESSAGE')
        .setCheck('String')
        .appendField('알림 박스')
        .appendField(new Blockly.FieldDropdown([
          ['정보', 'info'],
          ['성공', 'success'],
          ['경고', 'warning'],
          ['오류', 'error'],
          ['팁', 'tip']
        ]), 'NOTIFICATION_TYPE');
    this.appendDummyInput()
        .appendField('제목')
        .appendField(new Blockly.FieldTextInput(''), 'TITLE');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(OUTPUT_BLOCK_COLOR);
    this.setTooltip('다양한 유형의 알림 박스를 표시합니다.');
    this.setHelpUrl('');
  }
};

Blockly.JavaScript['terminal_notification_box'] = function(block) {
  const notificationType = block.getFieldValue('NOTIFICATION_TYPE');
  const title = block.getFieldValue('TITLE') || '';
  const message = Blockly.JavaScript.valueToCode(block, 'MESSAGE', Blockly.JavaScript.ORDER_NONE) || '""';
  
  // 알림 유형에 따른 설정
  let colorCode, icon;
  switch (notificationType) {
    case 'info':
      colorCode = '\\u001b[34m'; // 파랑
      icon = 'ℹ️';
      break;
    case 'success':
      colorCode = '\\u001b[32m'; // 초록
      icon = '✅';
      break;
    case 'warning':
      colorCode = '\\u001b[33m'; // 노랑
      icon = '⚠️';
      break;
    case 'error':
      colorCode = '\\u001b[31m'; // 빨강
      icon = '❌';
      break;
    case 'tip':
      colorCode = '\\u001b[36m'; // 시안
      icon = '💡';
      break;
  }
  
  // 알림 박스 코드
  const code = `
  (function() {
    const boxMessage = String(${message});
    const boxTitle = "${title}";
    const icon = "${icon}";
    const color = "${colorCode}";
    const reset = "\\u001b[0m";
    
    // 텍스트를 줄로 나누기
    const messageLines = boxMessage.split('\\n');
    
    // 박스의 최대 너비 계산
    let maxWidth = Math.max(
      boxTitle.length + 4, // 제목 길이 + 여백
      ...messageLines.map(line => line.length)
    );
    maxWidth = Math.min(maxWidth, 80); // 최대 80자로 제한
    
    // 상단 테두리
    console.log(color + '┌' + '─'.repeat(maxWidth + 2) + '┐' + reset);
    
    // 제목 표시 (있는 경우)
    if (boxTitle) {
      console.log(color + '│ ' + reset + icon + ' ' + color + boxTitle + reset + ' '.repeat(maxWidth - boxTitle.length) + color + ' │' + reset);
      console.log(color + '├' + '─'.repeat(maxWidth + 2) + '┤' + reset);
    }
    
    // 메시지 내용
    messageLines.forEach(line => {
      // 너무 긴 줄은 잘라서 표시
      if (line.length > maxWidth) {
        line = line.substring(0, maxWidth - 3) + '...';
      }
      console.log(color + '│ ' + reset + line + ' '.repeat(maxWidth - line.length) + color + ' │' + reset);
    });
    
    // 하단 테두리
    console.log(color + '└' + '─'.repeat(maxWidth + 2) + '┘' + reset);
  })();
  `;
  
  return code;
};

/**
 * 스피너/로딩 표시 블록 정의
 */
Blockly.Blocks['terminal_spinner'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('스피너 표시')
        .appendField(new Blockly.FieldDropdown([
          ['기본', 'default'],
          ['점', 'dots'],
          ['시계', 'clock'],
          ['원형', 'circle'],
          ['막대', 'bar']
        ]), 'SPINNER_TYPE')
        .appendField('메시지')
        .appendField(new Blockly.FieldTextInput('로딩 중...'), 'MESSAGE')
        .appendField('지속 시간')
        .appendField(new Blockly.FieldNumber(3, 0.1, 60), 'DURATION')
        .appendField('초');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(ANIMATION_BLOCK_COLOR);
    this.setTooltip('터미널에 로딩 스피너를 표시합니다.');
    this.setHelpUrl('');
  }
};

Blockly.JavaScript['terminal_spinner'] = function(block) {
  const spinnerType = block.getFieldValue('SPINNER_TYPE');
  const message = block.getFieldValue('MESSAGE') || '로딩 중...';
  const duration = block.getFieldValue('DURATION');
  
  // 스피너 유형에 따른 프레임 설정
  let frames;
  switch (spinnerType) {
    case 'default':
      frames = `['-', '\\\\', '|', '/']`;
      break;
    case 'dots':
      frames = `['.  ', '.. ', '...', '   ']`;
      break;
    case 'clock':
      frames = `['🕛', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚']`;
      break;
    case 'circle':
      frames = `['◜', '◠', '◝', '◞', '◡', '◟']`;
      break;
    case 'bar':
      frames = `['[=   ]', '[==  ]', '[=== ]', '[====]', '[ ===]', '[  ==]', '[   =]', '[    ]']`;
      break;
  }
  
  // 스피너 애니메이션 코드
  const code = `
  (async function() {
    const message = "${message}";
    const frames = ${frames};
    const duration = ${duration}; // 초
    const frameTime = 100; // 프레임 간격 (ms)
    let frameIndex = 0;
    
    // 종료 시간 계산
    const endTime = Date.now() + (duration * 1000);
    
    // 스피너 애니메이션 시작
    const interval = setInterval(() => {
      const frame = frames[frameIndex];
      process.stdout.write(\`\\r\${frame} \${message}\`);
      
      // 다음 프레임
      frameIndex = (frameIndex + 1) % frames.length;
    }, frameTime);
    
    // 지정된 시간이 경과할 때까지 대기
    await new Promise(resolve => {
      const check = () => {
        if (Date.now() >= endTime) {
          resolve();
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
    
    // 애니메이션 중지 및 라인 정리
    clearInterval(interval);
    process.stdout.write(\`\\r\${' '.repeat(message.length + 10)}\\r\`);
    
    console.log('완료!');
  })();
  `;
  
  return code;
};

/**
 * 히스토그램 출력 블록 정의
 */
Blockly.Blocks['terminal_histogram'] = {
  init: function() {
    this.appendValueInput('DATA')
        .setCheck('Array')
        .appendField('히스토그램 데이터');
    this.appendDummyInput()
        .appendField('막대 문자')
        .appendField(new Blockly.FieldDropdown([
          ['█', 'block'],
          ['■', 'square'],
          ['▓', 'shade1'],
          ['▒', 'shade2'],
          ['▪', 'small'],
          ['#', 'hash'],
          ['*', 'star']
        ]), 'BAR_CHAR')
        .appendField('색상')
        .appendField(new Blockly.FieldDropdown([
          ['기본', 'default'],
          ['빨강', 'red'],
          ['초록', 'green'],
          ['노랑', 'yellow'],
          ['파랑', 'blue'],
          ['마젠타', 'magenta'],
          ['시안', 'cyan']
        ]), 'COLOR')
        .appendField('높이')
        .appendField(new Blockly.FieldNumber(10, 1, 50), 'HEIGHT');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(CHART_BLOCK_COLOR);
    this.setTooltip('터미널에 히스토그램을 출력합니다.');
    this.setHelpUrl('');
  }
};

Blockly.JavaScript['terminal_histogram'] = function(block) {
  const data = Blockly.JavaScript.valueToCode(block, 'DATA', Blockly.JavaScript.ORDER_NONE) || '[]';
  const barChar = block.getFieldValue('BAR_CHAR');
  const color = block.getFieldValue('COLOR');
  const height = block.getFieldValue('HEIGHT');
  
  // 색상 코드
  let colorCode;
  switch (color) {
    case 'red':
      colorCode = '\\u001b[31m';
      break;
    case 'green':
      colorCode = '\\u001b[32m';
      break;
    case 'yellow':
      colorCode = '\\u001b[33m';
      break;
    case 'blue':
      colorCode = '\\u001b[34m';
      break;
    case 'magenta':
      colorCode = '\\u001b[35m';
      break;
    case 'cyan':
      colorCode = '\\u001b[36m';
      break;
    default:
      colorCode = '';
  }
  
  // 히스토그램 출력 코드
  const code = `
  (function() {
    const chartData = ${data};
    const barChar = "${barChar}";
    const maxHeight = ${height};
    const colorStart = "${colorCode}";
    const colorEnd = colorStart ? "\\u001b[0m" : "";
    
    if (!Array.isArray(chartData) || chartData.length === 0) {
      console.log("히스토그램에 표시할 데이터가 없습니다.");
      return;
    }
    
    // 데이터에서 숫자만 필터링
    const numericData = chartData.map(item => {
      if (typeof item === 'number') return item;
      if (typeof item === 'object' && item !== null && 'value' in item) return item.value;
      return 0;
    });
    
    // 최대값 찾기
    const maxValue = Math.max(...numericData);
    
    // 각 값의 비율 계산하여 히스토그램 높이 결정
    const bars = numericData.map(value => {
      const ratio = maxValue > 0 ? value / maxValue : 0;
      const barHeight = Math.max(1, Math.round(ratio * maxHeight));
      return {
        value,
        height: barHeight
      };
    });
    
    // 히스토그램 출력 (위에서 아래로)
    for (let h = maxHeight; h > 0; h--) {
      let line = '';
      for (const bar of bars) {
        line += (bar.height >= h) ? colorStart + barChar + colorEnd : ' ';
      }
      console.log(line);
    }
    
    // 축 그리기
    console.log('-'.repeat(bars.length));
    
    // 각 값 표시 (선택적으로 라벨 표시 가능)
    let values = '';
    for (let i = 0; i < bars.length; i++) {
      const value = bars[i].value.toString();
      values += value.charAt(0); // 첫 글자만 표시
    }
    console.log(values);
  })();
  `;
};