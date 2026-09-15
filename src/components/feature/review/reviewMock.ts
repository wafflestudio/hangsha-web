import { useCallback, useMemo, useState } from "react";

/**
 * 프런트 레벨 프로토타입용 후기 모델.
 * 백엔드에 후기 API가 없어(`/api/v1/memos`만 존재) 화면/인터랙션만 먼저 검증한다.
 * 연동 시 이 파일의 훅만 교체하면 된다.
 */

/** 작성자 공통 필드. 익명 여부와 무관하게 동일인은 authorKey가 같다. */
interface Authored {
	/** 실명 표기용. 익명 글이면 화면에 쓰지 않는다. */
	author: string;
	isAnonymous: boolean;
	/** 익명 번호를 매길 때 동일인을 묶는 키. 실제 연동 시 userId. */
	authorKey: string;
	isMine: boolean;
}

export interface Review extends Authored {
	id: number;
	eventId: number;
	eventTitle: string;
	rating: number;
	content: string;
	createdAt: Date;
	likeCount: number;
	isLiked: boolean;
}

/**
 * 후기에 달리는 댓글. **대댓글은 없다** — 모든 댓글이 후기 바로 아래
 * 한 단에 평평하게 쌓인다. 댓글에 다시 댓글을 달 수 없다.
 */
export interface ReviewComment extends Authored {
	id: number;
	reviewId: number;
	content: string;
	createdAt: Date;
	likeCount: number;
	isLiked: boolean;
}

interface ReviewDraft {
	rating: number;
	content: string;
	isAnonymous: boolean;
}

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const ago = (ms: number) => new Date(Date.now() - ms);

/** 로그인 사용자 자리. 연동 시 AuthProvider의 user로 교체한다. */
const ME = { author: "나", authorKey: "me" };

/**
 * 목업 후기가 붙는 행사. dev 서버의 실제 행사 id를 사용해
 * 캘린더에서 그 행사를 열면 후기가 보이도록 맞춰뒀다.
 */
const MOCK_EVENT_TITLES: Record<number, string> = {
	809: "캠퍼스 멘토링 프로그램(CMP) 40기(2026학년도 2학기) 멘티",
	768: "2026 서울대학교 동문창업네트워크(SAEN) 개최 안내",
	841: "샤로수길 플로깅 with 중앙환경동아리 씨알",
};

const SEED_REVIEWS: Review[] = [
	{
		id: 1,
		eventId: 809,
		eventTitle: MOCK_EVENT_TITLES[809],
		author: "감자밭관리인",
		authorKey: "u1",
		isAnonymous: false,
		isMine: false,
		rating: 5,
		content:
			"생각보다 실습 비중이 높아서 좋았어요. 사전 지식 없이 가도 따라갈 수 있고, 끝나고 멘토님께 개인 피드백까지 받았습니다.",
		createdAt: ago(2 * DAY),
		likeCount: 12,
		isLiked: false,
	},
	{
		id: 2,
		eventId: 809,
		eventTitle: MOCK_EVENT_TITLES[809],
		author: "서울대붕어빵",
		authorKey: "u2",
		isAnonymous: true,
		isMine: false,
		rating: 4,
		content:
			"내용은 알찬데 3시간 내내 앉아 있어야 해서 조금 힘들었어요. 간식 챙겨가면 좋습니다.",
		createdAt: ago(6 * DAY),
		likeCount: 4,
		isLiked: true,
	},
	{
		id: 3,
		eventId: 768,
		eventTitle: MOCK_EVENT_TITLES[768],
		author: ME.author,
		authorKey: ME.authorKey,
		isAnonymous: false,
		isMine: true,
		rating: 4,
		content:
			"창업 준비 중인 선배들이랑 얘기할 수 있어서 좋았어요. 명함 챙겨가는 걸 추천합니다.",
		createdAt: ago(9 * DAY),
		likeCount: 6,
		isLiked: false,
	},
	{
		id: 4,
		eventId: 768,
		eventTitle: MOCK_EVENT_TITLES[768],
		author: "관악산다람쥐",
		authorKey: "u3",
		isAnonymous: false,
		isMine: false,
		rating: 3,
		content:
			"프로그램 자체는 괜찮은데 사람이 너무 많아서 정작 얘기는 몇 명이랑밖에 못 했습니다.",
		createdAt: ago(11 * DAY),
		likeCount: 2,
		isLiked: false,
	},
	{
		id: 5,
		eventId: 841,
		eventTitle: MOCK_EVENT_TITLES[841],
		author: ME.author,
		authorKey: ME.authorKey,
		isAnonymous: true,
		isMine: true,
		rating: 5,
		content:
			"두 시간 걷고 쓰레기 줍는 게 전부인데 생각보다 재밌었어요. 봉투랑 집게는 현장에서 나눠줍니다.",
		createdAt: ago(3 * HOUR),
		likeCount: 8,
		isLiked: true,
	},
];

const SEED_COMMENTS: ReviewComment[] = [
	{
		id: 1,
		reviewId: 1,
		author: "서울대붕어빵",
		authorKey: "u2",
		isAnonymous: true,
		isMine: false,
		content: "혹시 사전 과제 같은 것도 있었나요?",
		createdAt: ago(30 * HOUR),
		likeCount: 2,
		isLiked: false,
	},
	{
		id: 2,
		reviewId: 1,
		author: "감자밭관리인",
		authorKey: "u1",
		isAnonymous: false,
		isMine: false,
		content: "따로 없었어요. 첫 시간에 환경 세팅부터 같이 합니다.",
		createdAt: ago(28 * HOUR),
		likeCount: 5,
		isLiked: true,
	},
	{
		id: 3,
		reviewId: 1,
		author: ME.author,
		authorKey: ME.authorKey,
		isAnonymous: true,
		isMine: true,
		content: "저도 이거 궁금했는데 답변 감사합니다!",
		createdAt: ago(20 * HOUR),
		likeCount: 1,
		isLiked: false,
	},
	{
		id: 4,
		reviewId: 1,
		author: "관악산다람쥐",
		authorKey: "u3",
		isAnonymous: false,
		isMine: false,
		content: "40기도 이 정도 분위기면 신청해봐야겠네요.",
		createdAt: ago(9 * HOUR),
		likeCount: 0,
		isLiked: false,
	},
	{
		id: 5,
		reviewId: 3,
		author: "서울대붕어빵",
		authorKey: "u2",
		isAnonymous: true,
		isMine: false,
		content: "명함 안 만들어봤는데 그냥 학과랑 이름만 적어가도 되나요?",
		createdAt: ago(5 * DAY),
		likeCount: 3,
		isLiked: false,
	},
];

let nextReviewId = 100;
let nextCommentId = 100;

export const useMockReviews = () => {
	const [reviews, setReviews] = useState<Review[]>(SEED_REVIEWS);
	const [comments, setComments] = useState<ReviewComment[]>(SEED_COMMENTS);

	const addReview = useCallback(
		(draft: ReviewDraft, eventId: number, eventTitle: string) => {
			nextReviewId += 1;
			const id = nextReviewId;
			setReviews((prev) => [
				{
					id,
					eventId,
					eventTitle,
					author: ME.author,
					authorKey: ME.authorKey,
					isAnonymous: draft.isAnonymous,
					isMine: true,
					rating: draft.rating,
					content: draft.content.trim(),
					createdAt: new Date(),
					likeCount: 0,
					isLiked: false,
				},
				...prev,
			]);
			return id;
		},
		[],
	);

	const removeReview = useCallback((id: number) => {
		setReviews((prev) => prev.filter((r) => r.id !== id));
		setComments((prev) => prev.filter((c) => c.reviewId !== id));
	}, []);

	const toggleReviewLike = useCallback((id: number) => {
		setReviews((prev) =>
			prev.map((r) =>
				r.id === id
					? {
							...r,
							isLiked: !r.isLiked,
							likeCount: r.likeCount + (r.isLiked ? -1 : 1),
						}
					: r,
			),
		);
	}, []);

	const addComment = useCallback(
		(reviewId: number, content: string, isAnonymous: boolean) => {
			nextCommentId += 1;
			setComments((prev) => [
				...prev,
				{
					id: nextCommentId,
					reviewId,
					author: ME.author,
					authorKey: ME.authorKey,
					isAnonymous,
					isMine: true,
					content: content.trim(),
					createdAt: new Date(),
					likeCount: 0,
					isLiked: false,
				},
			]);
		},
		[],
	);

	const removeComment = useCallback((id: number) => {
		setComments((prev) => prev.filter((c) => c.id !== id));
	}, []);

	const toggleCommentLike = useCallback((id: number) => {
		setComments((prev) =>
			prev.map((c) =>
				c.id === id
					? {
							...c,
							isLiked: !c.isLiked,
							likeCount: c.likeCount + (c.isLiked ? -1 : 1),
						}
					: c,
			),
		);
	}, []);

	const reviewsByEvent = useCallback(
		(eventId: number) => reviews.filter((r) => r.eventId === eventId),
		[reviews],
	);

	const commentsByReview = useCallback(
		(reviewId: number) =>
			comments
				.filter((c) => c.reviewId === reviewId)
				.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()),
		[comments],
	);

	const myReviews = useMemo(() => reviews.filter((r) => r.isMine), [reviews]);

	return {
		reviews,
		myReviews,
		reviewsByEvent,
		commentsByReview,
		addReview,
		removeReview,
		toggleReviewLike,
		addComment,
		removeComment,
		toggleCommentLike,
	};
};

/**
 * 익명 작성자에게 번호를 붙인다. 범위는 **행사 하나 전체** — 후기별로 따로 매기면
 * 같은 화면에 서로 다른 사람이 둘 다 "익명1"로 찍힌다.
 * 오래된 글부터 번호를 주므로 새 글이 올라와도 기존 번호가 밀리지 않는다.
 */
export const buildAnonLabels = (
	reviews: Review[],
	comments: ReviewComment[],
): Map<string, string> => {
	const labels = new Map<string, string>();
	const items = [...reviews, ...comments]
		.filter((i) => i.isAnonymous)
		.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
	let n = 0;
	for (const { authorKey } of items) {
		if (labels.has(authorKey)) continue;
		n += 1;
		labels.set(authorKey, `익명${n}`);
	}
	return labels;
};

/** 화면에 찍을 이름. 익명이면 스레드 안에서 부여된 번호를 쓴다. */
export const displayName = (
	item: Authored,
	labels: Map<string, string>,
): string =>
	item.isAnonymous ? (labels.get(item.authorKey) ?? "익명") : item.author;

/** 아바타 원에 넣을 한 글자. */
export const displayInitial = (item: Authored): string =>
	item.isAnonymous ? "익" : item.author.slice(0, 1);

/** 평균 별점. 후기가 없으면 null. */
export const averageRating = (list: Review[]): number | null => {
	if (list.length === 0) return null;
	const sum = list.reduce((acc, r) => acc + r.rating, 0);
	return Math.round((sum / list.length) * 10) / 10;
};

export const formatRelative = (date: Date): string => {
	const diff = Date.now() - date.getTime();
	const minutes = Math.floor(diff / MINUTE);
	if (minutes < 1) return "방금 전";
	if (minutes < 60) return `${minutes}분 전`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}시간 전`;
	const days = Math.floor(hours / 24);
	if (days < 7) return `${days}일 전`;
	return `${date.getMonth() + 1}.${date.getDate()}`;
};
