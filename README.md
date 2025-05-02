# tidy-up your brain
deploy branch: 🌿dev


배너

0. Getting Started (시작하기)
$ npm start
서비스 링크



1. Project Overview (프로젝트 개요)
프로젝트 이름: 모여봐요 동아리숲!
프로젝트 설명: 전국 대학 동아리 일정관리 및 홍보 커뮤니티


2. Team Members (팀원 및 팀 소개)
이동규	신유승	김나연	이승준
이동규	신유승	김나연	이승준
PL	FE	FE	FE
GitHub	GitHub	GitHub	GitHub


3. Key Features (주요 기능)
회원가입:

회원가입 시 DB에 유저정보가 등록됩니다.
로그인:

사용자 인증 정보를 통해 로그인합니다.
내 동아리 일정관리:

캘린더 UI를 통해 동아리 관련 일정 추가&삭제가 가능합니다.
체크박스를 통해 종료되거나 이미 수행한 일정을 표시할 수 있습니다.
동아리 찾기:

대학 내 동아리를 검색할 수 있습니다.
검색 시 해당 동아리가 업로드한 홍보글이 보여집니다.
동아리 홍보:

홍보글 등록을 통해 동아리를 홍보할 수 있습니다.
동아리 만들기:

새로운 동아리를 만들어 관리할 수 있습니다.
동아리 프로필:

동아리 홍보글에서 동아리 이름(링크)를 클릭하면 해당 동아리 프로필로 이동합니다.
동아리 프로필에서는 동아리 소개, 동아리 활동사진 갤러리, 동아리 홍보글 기록관 등을 볼 수 있습니다.


4. Tasks & Responsibilities (작업 및 역할 분담)
이동규	이동규	
프로젝트 계획 및 관리
팀 리딩 및 커뮤니케이션
커스텀훅 개발
신유승	신유승	
메인 페이지 개발
동아리 만들기 페이지 개발
커스텀훅 개발
김나연	김나연	
홈 페이지 개발
로그인 페이지 개발
동아리 찾기 페이지 개발
동아리 프로필 페이지 개발
커스텀훅 개발
이승준	이승준	
회원가입 페이지 개발
마이 프로필 페이지 개발
커스텀훅 개발


5. Technology Stack (기술 스택)
5.1 Language
HTML5	HTML5
CSS3	CSS3
Javascript	Javascript

5.2 Frotend
React	React	18.3.1
StyledComponents	StyledComponents	6.1.12
MaterialUI	MUI	5.0.0
DayJs	DayJs	1.11.12

5.3 Backend
Firebase	Firebase	10.12.5

5.4 Cooperation
Git	git
Git Kraken	git kraken
Notion	Notion

6. Project Structure (프로젝트 구조)
project/
├── public/
│   ├── index.html           # HTML 템플릿 파일
│   └── favicon.ico          # 아이콘 파일
├── src/
│   ├── assets/              # 이미지, 폰트 등 정적 파일
│   ├── components/          # 재사용 가능한 UI 컴포넌트
│   ├── hooks/               # 커스텀 훅 모음
│   ├── pages/               # 각 페이지별 컴포넌트
│   ├── App.js               # 메인 애플리케이션 컴포넌트
│   ├── index.js             # 엔트리 포인트 파일
│   ├── index.css            # 전역 css 파일
│   ├── firebaseConfig.js    # firebase 인스턴스 초기화 파일
│   package-lock.json    # 정확한 종속성 버전이 기록된 파일로, 일관된 빌드를 보장
│   package.json         # 프로젝트 종속성 및 스크립트 정의
├── .gitignore               # Git 무시 파일 목록
└── README.md                # 프로젝트 개요 및 사용법


7. Development Workflow (개발 워크플로우)
브랜치 전략 (Branch Strategy)
우리의 브랜치 전략은 Git Flow를 기반으로 하며, 다음과 같은 브랜치를 사용합니다.

Main Branch

배포 가능한 상태의 코드를 유지합니다.
모든 배포는 이 브랜치에서 이루어집니다.
{name} Branch

팀원 각자의 개발 브랜치입니다.
모든 기능 개발은 이 브랜치에서 이루어집니다.


8. Coding Convention
문장 종료
// 세미콜론(;)
console.log("Hello World!");

명명 규칙
상수 : 영문 대문자 + 스네이크 케이스
const NAME_ROLE;
변수 & 함수 : 카멜케이스
// state
const [isLoading, setIsLoading] = useState(false);
const [isLoggedIn, setIsLoggedIn] = useState(false);
const [errorMessage, setErrorMessage] = useState('');
const [currentUser, setCurrentUser] = useState(null);

// 배열 - 복수형 이름 사용
const datas = [];

// 정규표현식: 'r'로 시작
const = rName = /.*/;

// 이벤트 핸들러: 'on'으로 시작
const onClick = () => {};
const onChange = () => {};

// 반환 값이 불린인 경우: 'is'로 시작
const isLoading = false;

// Fetch함수: method(get, post, put, del)로 시작
const getEnginList = () => {...}

블록 구문
// 한 줄짜리 블록일 경우라도 {}를 생략하지 않고, 명확히 줄 바꿈 하여 사용한다
// good
if(true){
  return 'hello'
}

// bad
if(true) return 'hello'

함수
함수는 함수 표현식을 사용하며, 화살표 함수를 사용한다.
// Good
const fnName = () => {};

// Bad
function fnName() {};

태그 네이밍
Styled-component태그 생성 시 아래 네이밍 규칙을 준수하여 의미 전달을 명확하게 한다.
태그명이 길어지더라도 의미 전달의 명확성에 목적을 두어 작성한다.
전체 영역: Container
영역의 묶음: {Name}Area
의미없는 태그: <>

<Container>
  <ContentsArea>
    <Contents>...</Contents>
    <Contents>...</Contents>
  </ContentsArea>
</Container>

폴더 네이밍
카멜 케이스를 기본으로 하며, 컴포넌트 폴더일 경우에만 파스칼 케이스로 사용한다.

// 카멜 케이스
camelCase
// 파스칼 케이스
PascalCase

파일 네이밍
컴포넌트일 경우만 .jsx 확장자를 사용한다. (그 외에는 .js)
customHook을 사용하는 경우 : use + 함수명


9. 커밋 컨벤션
기본 구조
type : subject

body 

type 종류
feat : 새로운 기능 추가
fix : 버그 수정
docs : 문서 수정
style : 코드 포맷팅, 세미콜론 누락, 코드 변경이 없는 경우
refactor : 코드 리펙토링
test : 테스트 코드, 리펙토링 테스트 코드 추가
chore : 빌드 업무 수정, 패키지 매니저 수정

커밋 이모지
== 코드 관련
📝	코드 작성
🔥	코드 제거
🔨	코드 리팩토링
💄	UI / style 변경

== 문서&파일
📰	새 파일 생성
🔥	파일 제거
📚	문서 작성

== 버그
🐛	버그 리포트
🚑	버그를 고칠 때

== 기타
🐎	성능 향상
✨	새로운 기능 구현
💡	새로운 아이디어
🚀	배포

커밋 예시
== ex1
✨Feat: "회원 가입 기능 구현"

SMS, 이메일 중복확인 API 개발

== ex2
📚chore: styled-components 라이브러리 설치

UI개발을 위한 라이브러리 styled-components 설치


10. 컨벤션 수행 결과
코드 컨벤션 깃플로우
