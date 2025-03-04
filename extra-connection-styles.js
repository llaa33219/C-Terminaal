/**
 * 블록 연결부를 더 명확하게 표시하기 위한 추가 CSS와 JavaScript
 * 이 코드는 applyBlocklyCustomization 함수의 마지막에 추가하거나
 * 별도의 함수로 호출할 수 있습니다.
 */

// 블록 연결부 강화를 위한 추가 스타일과 이벤트 핸들러
function enhanceBlockConnections() {
    // 블록 연결부 강조를 위한 추가 CSS
    const connectionStyleElement = document.createElement('style');
    connectionStyleElement.textContent = `
      /* 블록 연결 지점 표시 강화 */
      .blocklyPath {
        stroke-width: 2px !important;
      }
      
      /* 블록 상단 연결부 (탭) 강조 - 상단 들어가는 부분 */
      .blocklyBlockCanvas g[data-shapes*="next"] > path.blocklyPath {
        filter: drop-shadow(0px -2px 1px rgba(0,0,0,0.1));
      }
      
      /* 블록 하단 연결부 (노치) 강조 - 하단 나오는 부분 */
      .blocklyBlockCanvas g[data-shapes*="previous"] > path.blocklyPath {
        filter: drop-shadow(0px 2px 1px rgba(0,0,0,0.1));
      }
      
      /* 연결 가능 상태 강화 */
      .blocklyHighlightedConnectionPath {
        stroke: #ff9900 !important;
        stroke-width: 3px !important;
        fill: none;
      }
      
      /* 연결 중인 블록 강조 */
      .blocklyDragging > .blocklyPath {
        stroke-width: 2.5px !important;
        filter: drop-shadow(3px 3px 3px rgba(0,0,0,0.3));
      }
      
      /* 블록 그림자 강화로 입체감 증가 */
      .blocklySelected > .blocklyPath {
        filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.2));
        stroke-width: 3px !important;
      }
      
      /* 블록 테두리에 살짝 어두운 외곽선 추가 */
      .blocklyBlockCanvas .blocklyPath {
        stroke: rgba(0,0,0,0.2);
      }
      
      /* 드래그 중인 블록의 플레이스홀더 스타일 */
      .blocklyDragSurface .blocklyBlockCanvas {
        filter: drop-shadow(5px 5px 5px rgba(0,0,0,0.3));
      }
      
      /* 연결 가능한 위치 강조 */
      .blocklyConnectionIndicator {
        fill: #ff9900;
        stroke: #ff7700;
        stroke-width: 2px;
      }
    `;
    document.head.appendChild(connectionStyleElement);
    
    // Blockly 이벤트 리스너를 통한 동적 강조 효과
    if (workspace) {
      // 블록을 드래그하기 시작할 때 이벤트
      workspace.addChangeListener(function(event) {
        if (event.type === Blockly.Events.BLOCK_DRAG) {
          if (event.isStart) {
            // 드래그 시작 시 효과 적용
            highlightConnections(true);
          } else {
            // 드래그 종료 시 효과 제거
            highlightConnections(false);
          }
        }
      });
      
      // 커넥션 하이라이트 함수
      function highlightConnections(shouldHighlight) {
        const blocks = workspace.getAllBlocks(false);
        
        blocks.forEach(function(block) {
          // 모든 연결부에 강조 클래스 추가/제거
          const connections = [];
          
          // 이전 연결부 (위)
          if (block.previousConnection) {
            connections.push(block.previousConnection);
          }
          
          // 다음 연결부 (아래)
          if (block.nextConnection) {
            connections.push(block.nextConnection);
          }
          
          // 출력 연결부 (값 블록)
          if (block.outputConnection) {
            connections.push(block.outputConnection);
          }
          
          // 입력 연결부들
          block.inputList.forEach(function(input) {
            if (input.connection) {
              connections.push(input.connection);
            }
          });
          
          // 연결부 강조 표시
          connections.forEach(function(connection) {
            if (connection.targetConnection) {
              // 이미 연결된 상태
              const svgPath = connection.getSVGRoot();
              if (svgPath) {
                if (shouldHighlight) {
                  svgPath.classList.add('blocklyConnectedPath');
                } else {
                  svgPath.classList.remove('blocklyConnectedPath');
                }
              }
            }
          });
        });
      }
    }
  }
  
  /**
   * Blockly 블록 모양을 더 둥글고 연결부가 확실하게 보이도록 수정
   */
  function customizeBlockGeometry() {
    if (typeof Blockly !== 'undefined' && Blockly.BlockSvg) {
      // 원래 함수 저장
      const originalDrawValueInput = Blockly.BlockSvg.prototype.drawValueInput_;
      const originalDrawStatementInput = Blockly.BlockSvg.prototype.drawStatementInput_;
      
      // 값 입력 부분(puzzle 모양 연결부) 커스터마이즈
      Blockly.BlockSvg.prototype.drawValueInput_ = function(input) {
        // 원래 함수 호출
        const result = originalDrawValueInput.call(this, input);
        
        // SVG 요소에 강조 클래스 추가
        if (input.connection && input.connection.getSVGRoot()) {
          const svgPath = input.connection.getSVGRoot();
          svgPath.classList.add('blocklyEnhancedInput');
        }
        
        return result;
      };
      
      // 명령문 입력 부분(C 모양 연결부) 커스터마이즈
      Blockly.BlockSvg.prototype.drawStatementInput_ = function(input) {
        // 원래 함수 호출
        const result = originalDrawStatementInput.call(this, input);
        
        // SVG 요소에 강조 클래스 추가
        if (input.connection && input.connection.getSVGRoot()) {
          const svgPath = input.connection.getSVGRoot();
          svgPath.classList.add('blocklyEnhancedStatement');
        }
        
        return result;
      };
    }
  }
  
  /**
   * 블록 레이아웃 변경 함수
   * 이 함수는 initPlayground 초기화 완료 후 호출해야 합니다.
   */
  function improveBlockVisuals() {
    // 블록 연결부 강화
    enhanceBlockConnections();
    
    // 블록 모양 커스터마이즈
    customizeBlockGeometry();
    
    // 추가적인 CSS 스타일 (연결부를 더 명확하게 보이게 하는 스타일)
    const extraStyles = document.createElement('style');
    extraStyles.textContent = `
      /* 블록 내부 패딩 증가로 더 읽기 쉽게 */
      .blocklyEditableText {
        padding: 0 4px !important;
      }
      
      /* 텍스트 필드 스타일 향상 */
      .blocklyText {
        font-size: 14px !important;
        font-weight: 500 !important;
      }
      
      /* 블록 연결부 표시 강화 */
      .blocklyPath[data-connection-indicator="true"] {
        stroke-width: 3px !important;
      }
      
      /* 블록 사이 간격 시각화 - 약간의 구분선 */
      .blocklyBlockCanvas g[data-block-type] + g[data-block-type] {
        margin-top: 2px;
      }
      
      /* 블록 내부 필드 간격 조정 */
      .blocklyEditableText rect {
        rx: 4px;
        ry: 4px;
      }
      
      /* 입력 필드 스타일 향상 */
      .blocklyHtmlInput {
        border-radius: 4px !important;
        border: 1px solid #bbb !important;
        font-family: 'Noto Sans KR', sans-serif !important;
      }
    `;
    document.head.appendChild(extraStyles);
    
    // 블록 레이아웃 업데이트
    if (workspace) {
      workspace.render();
    }
  }