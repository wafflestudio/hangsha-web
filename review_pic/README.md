# 행사 후기 (v2) 적용 화면

`docs/review-ui/v2.png` · `v2-writing.png` 시안을 실제 앱에 적용한 뒤 촬영.
게시판(board) 기능은 걷어내고 그 자리를 후기가 대체했다.

촬영 조건: dev 서버(`yarn dev`) + dev API 실행사 데이터, 후기 데이터는 목업.
로그인은 브라우저 안에서만 흉내냈다(`auth/refresh` · `users/me` 라우트 스텁) —
dev 서버에 계정을 만들지 않았다. 튜토리얼 오버레이는 `localStorage.tutorialState`로 껐다.

- `desktop/` — 1440×950, DPR 2
- `mobile/` — iPhone 14 Pro (393×852, DPR 3)

| # | 파일 | 설명 |
|---|---|---|
| 01 | `01-detail-reviews.png` | 상세 패널 전체 — **메모 자리가 후기 섹션으로 교체됨** (`/main?panel=detail&eventId=809`) |
| 02 | `02-review-section.png` | **후기 섹션. `v2.png` 대응** |
| 03 | `03-composer-open.png` | "후기 달기" → **작성 폼. `v2-writing.png` 대응** |
| 04 | `04-composer-filled.png` | 별점 4 · 본문 입력 (등록 버튼 활성) |
| 05 | `05-composer-anonymous.png` | **"익명으로 남기기" 체크** |
| 06 | `06-submitted-anonymous.png` | 등록 직후 — 맨 위에 **익명2**로 달림 (실명이었으면 "나") |
| 07 | `07-comments-open.png` | **"댓글 N" 펼침 — 입력창이 목록 위. 익명 번호 · 작성자 배지** |
| 08 | `08-comment-anonymous.png` | **댓글도 익명 체크 가능** |
| 09 | `09-comment-submitted.png` | 댓글 등록 직후 — 목록 맨 아래에 한 단으로 쌓임 |
| 10 | `10-review-empty.png` | 후기 0건인 행사의 빈 상태 |
| 11 | `11-my-reviews.png` | **내 후기 목록 (`/review`) — 옛 메모 모음 페이지 자리.** 익명/공개 배지 |
| 12 | `12-mypage-widget.png` | **마이페이지 "후기 보기" 위젯 — 옛 "내 메모 목록" 위젯 자리** |
| 13 | `13-bottom-nav.png` | (모바일 전용) 하단 탭 세 번째가 "행사 후기" → `/review` |

## 익명 규칙

- 후기 · 댓글 **각각** 쓸 때마다 익명 체크를 고른다. 한 번 정하면 그 글에만 적용.
- 익명 번호는 **행사 하나 전체**에서 통일한다. 후기별로 따로 매기면 같은 화면에
  서로 다른 사람이 둘 다 "익명1"로 찍힌다.
- 오래된 글부터 번호를 주므로 새 글이 올라와도 기존 번호가 밀리지 않는다.
- 같은 사람이 익명으로 여러 번 쓰면 계속 같은 번호 (`authorKey` 기준). 아바타는 회색 "익"으로 통일.
- 후기 작성자가 자기 후기에 댓글을 달면 `작성자` 배지가 붙는다. 익명이어도 붙는다.

## 댓글 구조 — 한 단만

```
후기 A
├─ 댓글 1
├─ 댓글 2
├─ 댓글 3
└─ 댓글 4
```

**대댓글은 없다.** 댓글 1에 다시 댓글을 달 수 없고, 모든 댓글이 후기 바로 아래
한 단에 평평하게 쌓인다. `ReviewComment`에 `parentId` 자체가 없어 구조적으로 막혀 있다.

입력창은 **목록 위**에 둔다 — 후기 작성 폼이 후기 목록 위에 오는 것과 같은 배치.

## 바뀐 것

| 자리 | 이전 (게시판) | 지금 (후기) |
|---|---|---|
| 상세 패널 | `EventBoardEntry` (게시판 진입점) | `EventReviews` — 평균 별점 + 카드 + 댓글 |
| 모음 페이지 | `/my/activity` 내 활동 | `/review` 내 후기 목록 |
| 마이페이지 위젯 | "내 활동" | **"후기 보기"** |
| 하단 탭 3번째 | "게시판" → `/board` | **"행사 후기" → `/review`** |
| 구 경로 | `/memo` → `/my/activity` | `/memo` → `/review` |

## 구조

```
src/components/feature/review/
├── EventReviews.tsx        # 상세 패널 후기 섹션 (v2 카드 + 별점 + 익명)
├── ReviewComments.tsx      # 댓글 목록 (한 단, 대댓글 없음)
├── MyReviewWidget.tsx      # 마이페이지 "후기 보기" 위젯
├── Stars.tsx               # 별점 (읽기 전용 / 입력 겸용)
├── avatarColor.ts          # 아바타 색. 익명은 회색으로 통일
└── reviewMock.ts           # Review · ReviewComment 타입, 목업 시드, 익명 번호 계산
src/contexts/ReviewContext.tsx   # 화면 간 후기 상태 공유
src/pages/review/MyReviews.tsx   # /review 내 후기 목록
```

후기 한 건은 **별점 + 본문**뿐이다. v2 시안에 있던 태그 칩(실습중심·초보환영·정보많음)은 뺐다.

목업 후기는 dev 실행사 809 · 768 · 841에 붙어 있어 캘린더에서 그 행사를 열면 바로 보인다.
백엔드 후기 API가 생기면 `useMockReviews`만 교체하면 된다.
`reviewMock.ts`의 `ME` 상수가 로그인 사용자 자리 — 연동 시 `AuthProvider`의 `user`로 바꾼다.

## 재촬영

```
yarn dev
node <scratchpad>/shoot.mjs
```
