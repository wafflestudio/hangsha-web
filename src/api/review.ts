import type {
	Review,
	ReviewComment,
	ReviewList,
} from "@/components/feature/review/reviewModel";
import api from "./axios";

// --- Reviews ---
export const getEventReviews = async (eventId: number) => {
	const res = await api.get<ReviewList>(`/events/${eventId}/reviews`);
	return res.data;
};

export const getMyReviews = async () => {
	const res = await api.get<ReviewList>("/users/me/reviews");
	return res.data;
};

export const createReview = async (
	eventId: number,
	body: { rating: number; content: string; isAnonymous: boolean },
) => {
	const res = await api.post<Review>(`/events/${eventId}/reviews`, body);
	return res.data;
};

/** 익명 여부는 작성 후 바꿀 수 없다. */
export const updateReview = async (
	reviewId: number,
	body: { rating?: number; content?: string },
) => {
	const res = await api.patch<Review>(`/reviews/${reviewId}`, body);
	return res.data;
};

export const deleteReview = async (reviewId: number) => {
	await api.delete(`/reviews/${reviewId}`);
};

export const likeReview = async (reviewId: number) => {
	await api.post(`/reviews/${reviewId}/like`);
};

export const unlikeReview = async (reviewId: number) => {
	await api.delete(`/reviews/${reviewId}/like`);
};

// --- Comments ---
export const getReviewComments = async (reviewId: number) => {
	const res = await api.get<ReviewComment[]>(
		`/reviews/${reviewId}/comments`,
	);
	return res.data;
};

export const createReviewComment = async (
	reviewId: number,
	body: { content: string; isAnonymous: boolean; parentId: number | null },
) => {
	const res = await api.post<ReviewComment>(
		`/reviews/${reviewId}/comments`,
		body,
	);
	return res.data;
};

export const deleteReviewComment = async (commentId: number) => {
	await api.delete(`/review-comments/${commentId}`);
};

export const likeReviewComment = async (commentId: number) => {
	await api.post(`/review-comments/${commentId}/like`);
};

export const unlikeReviewComment = async (commentId: number) => {
	await api.delete(`/review-comments/${commentId}/like`);
};
