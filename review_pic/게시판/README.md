# 자유게시판 화면

`docs/board/screens/` 15 · 16 · 17 · 18 · 19를 그대로 되살린 것.
후기(`review_pic/desktop`, `review_pic/mobile`)와는 **별개 기능**이다 —
후기는 행사 상세 패널에 붙고, 게시판은 행사와 무관한 글까지 받는다.

촬영 조건은 후기 쪽과 동일: dev 서버 + dev API 실행사, 게시판 데이터는 목업,
로그인은 브라우저 안에서만 스텁.

- `desktop/` — 1440×950, DPR 2
- `mobile/` — iPhone 14 Pro (393×852, DPR 3)

## 진입 경로

| | 진입점 |
|---|---|
| **데스크톱** | 좌측 사이드바 `페이지` 섹션에 **"자유게시판"** 탭 추가 (찜한 행사 · 시간표 아래) |
| **모바일** | `/review` 후기 모아보기 상단에 **`후기 보기` / `게시판` 토글** — 사이드바가 없으므로 |

토글은 `isMobile`(576px)일 때만 렌더한다. 데스크톱에서 `/review`에 들어가도
토글은 안 보이고, 게시판은 사이드바로 간다.

| # | 파일 | 원본 | 설명 |
|---|---|---|---|
| 01 | `01-sidebar-tab.png` / `01-toggle-review.png` | — | 데스크톱: 사이드바가 있는 캘린더 / 모바일: 토글의 후기 쪽 |
| 02 | `02-sidebar-tab-scrolled.png` / `02-toggle-board.png` | — | 데스크톱: **"자유게시판" 탭** / 모바일: **게시판으로 전환된 상태** |
| 03 | `03-board-home.png` | **15** | 게시판 홈 — 검색 + 인기 글 + 다가오는 행사 / 이야기 많은 행사 |
| 04 | `04-board-search.png` | **16** | "멘토" 검색 → `'멘토' 검색 결과` 2건 |
| 05 | `05-post-detail.png` | **17** | 글 상세 (뷰포트) |
| 06 | `06-post-detail-full.png` | **17** | 글 상세 전체 — 브레드크럼 · 태그 · 좋아요/댓글/URL 복사 · 추천순 |
| 07 | `07-comment-typing.png` | — | 댓글 입력 중 (등록 버튼 활성) |
| 08 | `08-comment-added.png` | **18** | 댓글 등록 직후 (3 → 4) |
| 09 | `09-reply-form.png` | — | 대댓글 입력창 (게시판은 1단 대댓글 유지) |
| 10 | `10-post-write-event.png` | **19** | 글쓰기 — 행사 게시판 고정 (`?eventId=768`) |
| 11 | `11-post-write-filled.png` | — | 제목 · 내용 · 태그 · 익명 체크 완료 |
| 12 | `12-post-write-channel.png` | — | 글쓰기 — 주제 채널 선택 (자유 / 팀원구해요 / 질문) |

## 후기와 다른 점

| | 후기 | 게시판 |
|---|---|---|
| 위치 | 행사 상세 패널 | `/board` 독립 페이지 |
| 대상 | 행사 하나 | 행사 글 + 주제 채널 글(자유/팀원구해요/질문) |
| 구성 | 별점 + 본문 | 제목 + 본문 + 태그 |
| 댓글 | 한 단, 대댓글 없음 | **대댓글 1단 유지** (원본 17 그대로) |
| 익명 | 익명1 / 익명2 (행사 단위 번호) | `익명` 단일 표기 (원본 그대로) |

## 구조

```
src/pages/board/
├── BoardHome.tsx      # /board. `BoardFeed`를 export — 모바일 토글이 재사용
├── PostDetail.tsx     # /board/:postId
└── PostWrite.tsx      # /board/write (?eventId= 로 행사 고정)
src/components/feature/board/boardMock.ts   # Post · Comment · Channel, 목업 시드
src/contexts/BoardContext.tsx               # 화면 간 게시판 상태 공유
```

`BoardFeed`는 `hideRail` prop을 받는다. 모바일 후기 페이지 안에서는 사이드 레일을 끄고
목록만 보여준다.

## 재촬영

```
yarn dev
node <scratchpad>/shoot-board.mjs
```
