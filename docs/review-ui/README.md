# 행사 후기 UI 시안 (프런트 레벨)

행사 상세 패널의 **메모 섹션을 후기 섹션으로 교체**한 프로토타입.
백엔드에 후기 API가 없어(`/api/v1/memos`만 존재) 데이터는 컴포넌트 로컬 상태 목업이다.
"후기 달기" → 작성 → 목록에 바로 달리는 흐름까지 동작한다.

## 시안 비교

| 파일 | 시안 | 성격 |
| --- | --- | --- |
| `all-variants.png` | 5개 시안 나란히 | 한눈에 비교 |
| `v1.png` / `v1-writing.png` | v1 미니멀 리스트 | 기존 상세 패널 톤 그대로. 가장 안전 |
| `v2.png` / `v2-writing.png` | v2 카드 + 별점 | 아바타·평균 별점·좋아요로 후기 성격을 강조 |
| `v3.png` / `v3-writing.png` | v3 말풍선 스레드 | 별점 없이 한 줄 후기. 작성 부담 최소 |
| `v4.png` / `v4-writing.png` | v4 요약 + 태그 필터 | 평점 분포·태그 필터. 후기가 쌓인 뒤를 전제 |
| `v5.png` / `v5-writing.png` | v5 타임라인 + 고정 입력바 | 시간순 기록장. 하단 입력바 상시 노출 |

`*-writing.png`은 작성 폼이 열린 상태.

## 실제 앱 적용 화면

| 파일 | 설명 |
| --- | --- |
| `real-detail-panel.png` | 캘린더에서 행사를 열었을 때의 상세 패널 (메모 → 후기로 교체된 상태) |
| `real-write-1-composer.png` | 후기 달기 → 별점·본문·태그 입력 |
| `real-write-2-attached.png` | 등록 직후. 목록 맨 위에 내 후기가 달린다 |

## 구조

```
src/components/feature/review/
├── EventReviews.tsx          # 시안 디스패처. DEFAULT_REVIEW_VARIANT 상수로 채택 시안 결정
├── Stars.tsx                 # 별점 (읽기 전용 / 입력 겸용)
├── reviewMock.ts             # Review 타입, 목업 시드, useMockReviews 훅
└── variants/ReviewsV1~V5.tsx # 시안별 컴포넌트 + CSS 모듈
```

- 상세 패널 연결: `src/components/layout/sidePannel/DetailView.tsx` (기존 `DetailMemo` 제거)
- 시안 비교 페이지: `src/pages/reviewLab/ReviewLab.tsx` → 개발 모드에서 `/review-lab`
  - `/review-lab` 전체 비교 / `?v=3` 단일 시안 / `?v=3&open=1` 작성 폼 열린 상태

## 시안 교체 방법

`src/components/feature/review/EventReviews.tsx`의

```ts
export const DEFAULT_REVIEW_VARIANT: ReviewVariant = 1;
```

숫자만 1~5로 바꾸면 상세 패널에 적용되는 시안이 바뀐다.

## 남은 작업

- `/memo` 페이지와 마이페이지 메모 위젯은 아직 기존 메모 API를 쓴다 (이번 범위 밖)
- 백엔드 후기 API(작성/조회/좋아요/신고) 연동 시 `useMockReviews`만 교체하면 된다
