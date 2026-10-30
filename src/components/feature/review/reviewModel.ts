/**
 * 후기 API 응답 모델 (hangsha-server `review/dto/ReviewResponses.kt`).
 * 작성자 id는 내려오지 않는다. 익명 번호("익명3")와 "작성자" 배지는 서버가 계산한다.
 * createdAt은 ISO 문자열 그대로 둔다 — 쿼리 캐시가 localStorage를 거치며 Date가 문자열이 되기 때문.
 */
export interface Review {
	id: number;
	eventId: number;
	eventTitle: string;
	rating: number;
	content: string;
	/** 실명이면 username, 익명이면 "익명3" */
	authorName: string;
	isAnonymous: boolean;
	isMine: boolean;
	isEdited: boolean;
	likeCount: number;
	isLiked: boolean;
	/** "삭제된 댓글입니다" 자리는 세지 않는다. */
	commentCount: number;
	createdAt: string;
}

export interface ReviewList {
	/** 후기가 없으면 null */
	averageRating: number | null;
	reviewCount: number;
	reviews: Review[];
}

/**
 * 후기에 달리는 댓글과 답글. 답글은 **1단까지** — 최상위 댓글(parentId = null)에만
 * 달 수 있고, 답글에 다시 답글은 달 수 없다.
 */
export interface ReviewComment {
	id: number;
	reviewId: number;
	/** null이면 최상위 댓글, 값이 있으면 그 댓글의 답글. */
	parentId: number | null;
	/** isDeleted면 null */
	content: string | null;
	/** isDeleted면 null */
	authorName: string | null;
	isAnonymous: boolean;
	isMine: boolean;
	isReviewAuthor: boolean;
	isEdited: boolean;
	/**
	 * 작성자가 지웠지만 살아 있는 답글이 있어 "삭제된 댓글입니다" 자리로 남은 댓글.
	 * 답글이 없는 댓글은 지우면 목록에서 바로 빠진다.
	 */
	isDeleted: boolean;
	likeCount: number;
	isLiked: boolean;
	createdAt: string;
}

const MINUTE = 60 * 1000;

/** 아바타 원에 넣을 한 글자. */
export const displayInitial = (item: {
	authorName: string | null;
	isAnonymous: boolean;
}): string => (item.isAnonymous ? "익" : (item.authorName ?? "?").slice(0, 1));

export const formatRelative = (value: string | Date): string => {
	const date = new Date(value);
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
