/**
 * C-Terminal 커스텀 Blockly 테마
 * 블록 디자인을 개선하고 연결부를 더 명확하게 표시합니다.
 */

// 테마 생성 함수
function createCTerminalTheme() {
    // 색상 정의 - 기존 색상을 활용하면서 채도를 약간 높임
    const colors = {
      'logic': '#5C81A6',
      'loops': '#5CA65C',
      'math': '#5CA65C',
      'texts': '#A65CA6',
      'variables': '#A6745C',
      'functions': '#745CA6',
      'terminal': '#333333',
      'styling': '#FF9800',
      'output': '#2196F3',
      'animation': '#E91E63',
      'charts': '#00BCD4',
      'control': '#9C27B0',
      'array': '#D4AC0D',
      'algorithm': '#795548',
      'game': '#FF5252'
    };
  
    // 기본 Blockly 카테고리 색상 재정의
    const categoryStyles = {
      'logic_category': {
        'colour': colors.logic
      },
      'loops_category': {
        'colour': colors.loops
      },
      'math_category': {
        'colour': colors.math
      },
      'text_category': {
        'colour': colors.texts
      },
      'variable_category': {
        'colour': colors.variables
      },
      'procedure_category': {
        'colour': colors.functions
      }
    };
  
    // 블록 스타일 정의 - 보다 선명한 윤곽선과 깔끔한 디자인
    const blockStyles = {
      'logic_blocks': {
        'colourPrimary': colors.logic,
        'colourSecondary': shadeColor(colors.logic, -10),
        'colourTertiary': shadeColor(colors.logic, -20),
        'hat': '' // 모자 모양 없음
      },
      'loop_blocks': {
        'colourPrimary': colors.loops,
        'colourSecondary': shadeColor(colors.loops, -10),
        'colourTertiary': shadeColor(colors.loops, -20),
        'hat': ''
      },
      'math_blocks': {
        'colourPrimary': colors.math,
        'colourSecondary': shadeColor(colors.math, -10),
        'colourTertiary': shadeColor(colors.math, -20),
        'hat': ''
      },
      'text_blocks': {
        'colourPrimary': colors.texts,
        'colourSecondary': shadeColor(colors.texts, -10), 
        'colourTertiary': shadeColor(colors.texts, -20),
        'hat': ''
      },
      'variable_blocks': {
        'colourPrimary': colors.variables,
        'colourSecondary': shadeColor(colors.variables, -10),
        'colourTertiary': shadeColor(colors.variables, -20),
        'hat': ''
      },
      'procedure_blocks': {
        'colourPrimary': colors.functions,
        'colourSecondary': shadeColor(colors.functions, -10),
        'colourTertiary': shadeColor(colors.functions, -20),
        'hat': ''
      },
      'terminal_blocks': {
        'colourPrimary': colors.terminal,
        'colourSecondary': shadeColor(colors.terminal, 10), // 밝게 만들어 대비 생성
        'colourTertiary': shadeColor(colors.terminal, 20),
        'hat': ''
      },
      'styling_blocks': {
        'colourPrimary': colors.styling,
        'colourSecondary': shadeColor(colors.styling, -10),
        'colourTertiary': shadeColor(colors.styling, -20),
        'hat': ''
      },
      'output_blocks': {
        'colourPrimary': colors.output,
        'colourSecondary': shadeColor(colors.output, -10),
        'colourTertiary': shadeColor(colors.output, -20),
        'hat': ''
      },
      'animation_blocks': {
        'colourPrimary': colors.animation,
        'colourSecondary': shadeColor(colors.animation, -10),
        'colourTertiary': shadeColor(colors.animation, -20),
        'hat': ''
      },
      'chart_blocks': {
        'colourPrimary': colors.charts,
        'colourSecondary': shadeColor(colors.charts, -10),
        'colourTertiary': shadeColor(colors.charts, -20),
        'hat': ''
      },
      'array_blocks': {
        'colourPrimary': colors.array,
        'colourSecondary': shadeColor(colors.array, -10),
        'colourTertiary': shadeColor(colors.array, -20),
        'hat': ''
      },
      'algorithm_blocks': {
        'colourPrimary': colors.algorithm,
        'colourSecondary': shadeColor(colors.algorithm, -10),
        'colourTertiary': shadeColor(colors.algorithm, -20),
        'hat': ''
      },
      'game_blocks': {
        'colourPrimary': colors.game,
        'colourSecondary': shadeColor(colors.game, -10),
        'colourTertiary': shadeColor(colors.game, -20),
        'hat': ''
      }
    };
  
    // 색상 음영 계산 유틸리티 함수
    function shadeColor(color, percent) {
      const f = parseInt(color.slice(1), 16);
      const t = percent < 0 ? 0 : 255;
      const p = percent < 0 ? percent * -1 : percent;
      const R = f >> 16;
      const G = (f >> 8) & 0x00FF;
      const B = f & 0x0000FF;
      return '#' + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + 
                    (Math.round((t - G) * p) + G) * 0x100 + 
                    (Math.round((t - B) * p) + B)).toString(16).slice(1);
    }
  
    // 구성요소 스타일 정의
    const componentStyles = {
      'workspaceBackgroundColour': '#f8f9fa',
      'toolboxBackgroundColour': '#ffffff',
      'toolboxForegroundColour': '#333333',
      'flyoutBackgroundColour': '#f5f5f5',
      'flyoutForegroundColour': '#333333',
      'flyoutOpacity': 0.9,
      'scrollbarColour': '#cccccc',
      'scrollbarOpacity': 0.7,
      'insertionMarkerColour': '#0066ff',
      'insertionMarkerOpacity': 0.3,
      'markerColour': '#ff8c1a',
      'cursorColour': '#0066ff'
    };
  
    // 테마 생성 및 반환
    const cTerminalTheme = Blockly.Theme.defineTheme('cTerminal', {
      'base': Blockly.Themes.Classic, // 클래식 테마 기반
      'blockStyles': blockStyles,
      'categoryStyles': categoryStyles,
      'componentStyles': componentStyles,
      'fontStyle': {
        'family': 'Noto Sans KR, sans-serif',
        'weight': 'normal',
        'size': 14
      },
      'startHats': false // 시작 블록에 모자 모양 없음
    });
  
    return cTerminalTheme;
  }
  
  /**
   * Blockly 렌더러 설정을 커스터마이즈하는 함수
   * 블록 모서리, 연결부 등의 모양을 수정합니다.
   */
  function customizeBlocklyRenderer() {
    // Blockly의 기존 렌더러를 확장
    class CTerminalRenderer extends Blockly.geras.Renderer {
      constructor() {
        super();
        this.name = 'c-terminal-renderer';
      }
  
      // 커스텀 상수 제공
      makeConstants_() {
        const constants = super.makeConstants_();
        
        // 블록 모서리 반경 증가 (더 둥근 모서리)
        constants.CORNER_RADIUS = 8;
        
        // 노치(연결부) 설정 수정
        constants.NOTCH_WIDTH = 20; // 노치 너비 증가
        constants.NOTCH_HEIGHT = 10; // 노치 높이 증가
        constants.NOTCH_OFFSET_LEFT = 8; // 노치 오프셋 증가
        
        // 탭(위쪽 연결부) 설정 수정
        constants.TAB_HEIGHT = 12; // 탭 높이 증가
        constants.TAB_WIDTH = 12; // 탭 너비 증가
        
        // 블록 간격 설정
        constants.MEDIUM_PADDING = 12; // 내부 패딩 증가
        constants.STATEMENT_INPUT_PADDING_LEFT = 25; // 명령문 입력 패딩 증가
        
        // 그림자 설정
        constants.ADD_START_HATS = false;
        constants.SHADOW_OFFSET = 2; // 그림자 오프셋 증가
        constants.DROPDOWN_ARROW_PADDING = 8; // 드롭다운 화살표 패딩 증가
        
        return constants;
      }
    }
  
    // 커스텀 렌더러 등록
    Blockly.blockRendering.register('c-terminal-renderer', CTerminalRenderer);
  }
  
  /**
   * 블록 연결부 강조 CSS 추가
   */
  function addBlockConnectionStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      /* 블록 모서리와 그림자 강화 */
      .blocklyPath {
        stroke-width: 1.5px !important;
        filter: drop-shadow(2px 3px 2px rgba(0,0,0,0.2));
      }
      
      /* 연결부 강조 - 탭(위쪽 연결부) */
      .blocklyBlockBackground[transform] {
        transition: filter 0.3s;
      }
      .blocklyBlockBackground[transform]:hover {
        filter: brightness(1.05);
      }
      
      /* 블록 선택 상태 강화 */
      .blocklySelected>.blocklyPath {
        stroke-width: 2.5px !important;
        stroke: #fc3 !important;
      }
      
      /* 연결 가능한 상태 강조 */
      .blocklyHighlightedConnectionPath {
        stroke-width: 3px !important;
        stroke: #fc3 !important;
      }
      
      /* 커넥션 포인트 강조 */
      .blocklyConnectionPoint {
        stroke-width: 2px;
        stroke-linecap: round;
        stroke-opacity: 0.4;
        fill-opacity: 0.4;
      }
      
      /* 드래그 중인 블록 강조 */
      .blocklyDragging>.blocklyPath {
        filter: drop-shadow(5px 5px 5px rgba(0,0,0,0.3));
      }
      
      /* 카테고리 스타일 강화 */
      .blocklyToolboxCategory {
        margin: 4px 0 !important;
        padding: 4px !important;
      }
      
      /* 카테고리 레이블 강화 */
      .blocklyTreeLabel {
        font-weight: 500 !important;
      }
    `;
    
    document.head.appendChild(styleElement);
  }
  
  /**
   * Blockly 테마와 렌더러를 적용하는 함수
   * app.js의 initPlayground 함수에서 Blockly 초기화 시 호출합니다.
   */
  function applyBlocklyCustomization() {
    // 커스텀 렌더러 설정
    customizeBlocklyRenderer();
    
    // 블록 연결부 CSS 스타일 추가
    addBlockConnectionStyles();
    
    // 커스텀 테마 생성
    const cTerminalTheme = createCTerminalTheme();
    
    // 테마와 렌더러 설정을 포함한 Blockly 옵션 반환
    return {
      theme: cTerminalTheme,
      renderer: 'c-terminal-renderer'
    };
  }