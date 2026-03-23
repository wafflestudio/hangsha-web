# 행샤(Hangsha): 교내 행사 캘린더 서비스

[<img width="250" height="115" alt="image" src="https://github.com/user-attachments/assets/046b4994-764e-40fd-9684-3d7d9dc11d76" />
](https://hangsha.site/
)

## 기획 의도
[서울대 비교과관리시스템](https://extra.snu.ac.kr/)에 대해 알고 계셨나요?  
교내 곳곳에서 열리는 특강, 공연, 공모전, 토론회 등 각종 비교과 행사 정보를 볼 수 있는 사이트입니다.  
그러나 정보 접근을 위해 서울대 로그인 및 인증이 필요하며, 사용성이 떨어짐에 따라 실제 서울대 학생들의 이용 정도 또한 낮다는 한계가 있습니다.

이에 따라 저희는 **행샤**를 통해, **직관적인 캘린더 UI**로 **개인화**된 행사 확인 서비스를 제공하고자 합니다.

## 핵심 기능
### 1. 캘린더
- 보다 더 직관적인 월/주/일 별 캘린더 UI
- 행사 상세 정보 조회 및 실제 신청 링크 이동
- 제목 및 다양한 조건 필터링을 통한 검색

### 2. 개인화
- 소셜 로그인 + 아이디/비밀번호 로그인
- 회원가입 온보딩 시 관심 행사 카테고리 설정
- 제외 키워드 설정 (해당 키워드 포함 행사는 캘린더에서 숨김)
- 관심 행사 북마크 및 마이페이지에서 북마크 모아보기

### 3. 시간표
- 내 시간표 생성 및 저장
- 주별 뷰에서 시간표와 겹치지 않는 행사 확인 가능
- (확장 가능성) SNUTT 연동으로 시간표 자동 불러오기

### 4. 후기
- 행사별 개인 후기(메모) 작성 가능
- 태그로 작성한 메모 분류 가능

## 팀원
| 이름 | Github ID | 분야 |
|-|-|-|
| 허서연(PM) | @h-seo-n | Frontend, PM, UI/UX Design |
| 김하람 | @haram831 | Frontend, UI/UX Design |
| 김도향 | @D-hyang | Backend |
| 이승현 | @subir-sh | Backend, Data Scraping |
| 정혜인 | @aystoe | Backend |


## Tech Stack

| Category | Tools |
|----------|-------|
| Framework | React 19, TypeScript |
| Routing | React Router DOM 7 |
| Build | Vite 7 |
| HTTP | Axios |
| Date Handling | date-fns |
| Linting & Formatting | Biome |
| Unused Code Detection | Knip |
| Deployment | AWS S3 + CloudFront |

<br />
<hr />

## Getting Started

### Prerequisites

- **Node.js** ≥ 24 (see [CI config](.github/workflows/ci.yml))
- **Yarn** package manager

### Installation

```bash
git clone https://github.com/wafflestudio/23-5-team1-web.git
cd 23-5-team1-web
yarn install
```

### Development

```bash
yarn dev
```

This starts the Vite dev server with hot module replacement. The dev server proxies `/api` requests to the backend automatically (configured in `vite.config.ts`).

### Environment Variables

Create a `.env.development` file (one is already included) or set these variables for production builds:

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Base path for API requests (default: `/api/v1`) |
| `VITE_KAKAO_REST_API_KEY` | Kakao OAuth API key |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `VITE_NAVER_CLIENT_ID` | Naver OAuth client ID |
| `VITE_KAKAO_REDIRECT_URI` | Kakao OAuth callback URL |
| `VITE_GOOGLE_REDIRECT_URI` | Google OAuth callback URL |
| `VITE_NAVER_REDIRECT_URI` | Naver OAuth callback URL |
| `VITE_REST_REQUEST_URL` | Production API endpoint |

### Build for Production

```bash
yarn build
```

The output is written to `dist/` and can be served as static files.

## Project Structure

```
src/
├── api/          # API service layer (auth, events, users, timetables)
├── contexts/     # React Context providers for global state
├── pages/        # Page components (auth, calendar, timetable, search, etc.)
├── router/       # Route definitions
├── widgets/      # Reusable UI components
├── util/         # Shared types, constants, and helpers
└── styles/       # CSS modules
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `yarn dev` | Start dev server with hot reload |
| `yarn build` | Type-check and build for production |
| `yarn preview` | Preview the production build locally |
| `yarn lint` | Run Biome linter |
| `yarn check:format` | Check code formatting |
| `yarn check:unused` | Detect unused exports with Knip |
| `yarn check-all` | Run all checks (lint + unused code) |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes and ensure `yarn check-all` passes
4. Open a pull request using the [PR template](.github/PULL_REQUEST_TEMPLATE.md)

## Getting Help

- Open an [issue](https://github.com/wafflestudio/23-5-team1-web/issues) using one of the provided [issue templates](.github/ISSUE_TEMPLATE)
- Reach out to the team via [Waffle Studio](https://github.com/wafflestudio)

## Maintainers

Built and maintained by **Waffle Studio 23.5 Team 1**.
