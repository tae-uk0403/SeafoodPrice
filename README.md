# 🐟 수산물 시세 조회 앱

앱에서 접속하기 쉽도록 설계된 수산물 시세 조회 애플리케이션입니다.

## 📱 주요 기능

- **오늘의 시세 대시보드**: 한 눈에 볼 수 있는 주요 어종 시세 정보
- **어종별 상세 시세**: 개별 어종의 시세 변화 및 상세 정보
- **모바일 친화적 UI**: 앱에서 접속하기 편한 반응형 디자인
- **실시간 데이터**: PostgreSQL DB에서 실시간 시세 정보 조회

## 🏗️ 프로젝트 구조

```
fish/
├── src/                    # React 프론트엔드
│   ├── components/
│   │   ├── Dashboard.js    # 메인 대시보드 (오늘의 시세)
│   │   ├── Dashboard.css
│   │   ├── FishPricePage.js # 어종별 상세 시세
│   │   └── FishPricePage.css
│   ├── App.js
│   └── index.js
├── server/                 # Express 백엔드
│   ├── server.js          # API 서버
│   └── package.json
└── package.json
```

## 🚀 실행 방법

### 1. 프론트엔드 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm start
```

### 2. 백엔드 실행

```bash
# 서버 디렉토리로 이동
cd server

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

## 📊 데이터베이스 설정

현재 PostgreSQL 데이터베이스에 연결되어 있습니다:

- **호스트**: 203.252.xxx.xxx
- **데이터베이스**: fish
- **사용자**: ntw
- **포트**: 5432

## 🔌 API 엔드포인트

### 오늘의 시세 조회
```
GET /api/today-prices
```

### 어종별 시세 조회
```
GET /api/fish-prices/:fishName?days=7
```

### 어종 목록 조회
```
GET /api/fish-list
```

### 날짜별 시세 조회
```
GET /api/prices-by-date/:date
```

## 📱 화면 구성

### 1. 메인 대시보드 (/)
- 오늘의 주요 어종 시세 요약
- 가격 변화 트렌드 표시
- 어종별 가격 비교 차트
- 어종별 상세 시세 페이지로 이동 버튼

### 2. 어종별 상세 시세 (/fish-prices)
- 선택한 어종의 시세 변화 그래프
- 상세 시세 내역 테이블
- 대시보드로 돌아가기 버튼

## 🎨 UI 특징

- **모바일 최적화**: 앱에서 접속하기 편한 터치 친화적 디자인
- **반응형 레이아웃**: 다양한 화면 크기에 대응
- **직관적인 네비게이션**: 명확한 페이지 이동 구조
- **시각적 피드백**: 가격 변화를 색상과 아이콘으로 표시

## 🔧 기술 스택

### 프론트엔드
- React 18
- React Router
- Recharts (차트 라이브러리)
- CSS3 (모바일 친화적 스타일링)

### 백엔드
- Node.js
- Express.js
- PostgreSQL
- pg (PostgreSQL 클라이언트)

## 📝 개발 노트

- API 서버가 실행되지 않을 경우 샘플 데이터로 동작
- 모든 API 호출에 에러 핸들링 구현
- 모바일 터치 인터페이스 최적화
- 데이터베이스 연결 실패 시 graceful fallback 
