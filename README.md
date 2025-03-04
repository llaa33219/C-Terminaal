# C-Terminal

C-Terminal은 블록 코딩과 터미널 기반 출력을 결합한 혁신적인 코딩 교육 플랫폼입니다. 초보자들이 쉽게 프로그래밍을 배울 수 있도록 직관적인 블록 인터페이스를 제공하면서, 실제 프로그래밍 환경과 유사한 터미널 출력 경험을 제공합니다.

![C-Terminal 로고](img/logo.svg)

## 주요 기능

- **블록 코딩**: 직관적인 드래그 앤 드롭 방식의 블록 코딩 환경
- **터미널 출력**: 코드 실행 결과를 터미널 스타일로 표시
- **커뮤니티**: 레딧 스타일의 커뮤니티 게시판으로 프로젝트와 아이디어 공유
- **프로필**: GitHub 스타일의 사용자 프로필 및 프로젝트 관리
- **프로젝트 공유**: 스크래치 스타일의 프로젝트 공유 및 탐색 기능

## 시작하기

1. 웹사이트에 접속합니다: [https://c-terminal.pages.dev](https://c-terminal.pages.dev)
2. 회원가입 또는 로그인합니다.
3. "플레이그라운드" 섹션에서 블록을 드래그 앤 드롭하여 코드를 작성합니다.
4. "실행" 버튼을 클릭하여 터미널에서 결과를 확인합니다.
5. "저장" 버튼을 클릭하여 프로젝트를 저장합니다.
6. "공유" 버튼을 클릭하여 다른 사용자와 프로젝트를 공유할 수 있습니다.

## 특별한 블록

C-Terminal은 표준 Blockly 블록 외에도 터미널에 최적화된 특별한 블록을 제공합니다:

- **터미널 출력**: 텍스트를 터미널에 출력
- **줄바꿈 없는 출력**: 줄바꿈 없이 텍스트 출력
- **터미널 지우기**: 터미널 화면 지우기
- **텍스트 색상**: 다양한 색상으로 텍스트 출력
- **텍스트 스타일**: 굵게, 기울임, 밑줄 등 스타일 적용
- **진행 표시줄**: 시각적인 진행 표시줄 생성
- **아스키 아트**: 다양한 아스키 아트 표시

## 로컬에서 실행하기

프로젝트를 로컬에서 실행하려면:

1. 이 저장소를 클론합니다:
   ```
   git clone https://github.com/yourusername/c-terminal.git
   ```

2. index.html 파일을 웹 브라우저에서 엽니다.

또는 [VS Code의 Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) 확장 프로그램을 사용하여 로컬 개발 서버를 실행할 수 있습니다.

## 기술 스택

- **프론트엔드**: HTML, CSS, JavaScript
- **UI 라이브러리**: 순수 CSS 컴포넌트
- **블록 코딩**: [Google Blockly](https://developers.google.com/blockly)
- **터미널 에뮬레이션**: [Xterm.js](https://xtermjs.org/)
- **마크다운 파서**: [Marked.js](https://marked.js.org/)
- **호스팅**: Cloudflare Pages
- **스토리지**: Cloudflare R2 버킷

## 개발자를 위한 정보

프로젝트 구조는 다음과 같습니다:

```
C-Terminal/
├── index.html         # 메인 페이지
├── styles.css         # 전체 스타일
├── app.js             # 메인 애플리케이션 로직
├── custom_blocks.js   # Blockly 커스텀 블록 정의
├── _worker.js
├── _headers
└── img/               # 이미지 파일 디렉토리
    ├── logo.svg
    ├── default-avatar.svg
    └── hero-image.svg
```

커스텀 블록을 추가하거나 수정하려면 `custom_blocks.js` 파일을 편집하면 됩니다.

## 기여하기

1. 이 저장소를 포크합니다.
2. 새 기능 브랜치를 생성합니다: `git checkout -b my-new-feature`
3. 변경사항을 커밋합니다: `git commit -am 'Add some feature'`
4. 브랜치를 푸시합니다: `git push origin my-new-feature`
5. Pull Request를 제출합니다.

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 LICENSE 파일을 참조하세요.

## 연락처

질문이나 피드백이 있으시면 [이메일 주소]로 연락하거나 이슈를 등록해주세요.