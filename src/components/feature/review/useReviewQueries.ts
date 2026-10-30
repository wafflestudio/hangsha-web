import {
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import * as reviewApi from "@api/review";

const reviewKeys = {
	all: ["reviews"] as const,
	event: (eventId: number) => ["reviews", "event", eventId] as const,
	mine: ["reviews", "mine"] as const,
	comments: (reviewId: number) => ["reviews", "comments", reviewId] as const,
};

// isMine · isLiked가 보는 사람마다 달라서 캐시를 오래 믿지 않는다.
const FRESH = { staleTime: 0 } as const;

export const useEventReviews = (eventId: number) =>
	useQuery({
		queryKey: reviewKeys.event(eventId),
		queryFn: () => reviewApi.getEventReviews(eventId),
		...FRESH,
	});

export const useMyReviews = (enabled: boolean) =>
	useQuery({
		queryKey: reviewKeys.mine,
		queryFn: reviewApi.getMyReviews,
		enabled,
		...FRESH,
	});

export const useReviewComments = (reviewId: number, enabled: boolean) =>
	useQuery({
		queryKey: reviewKeys.comments(reviewId),
		queryFn: () => reviewApi.getReviewComments(reviewId),
		enabled,
		...FRESH,
	});

/**
 * 후기·댓글 쓰기 동작. 어느 것이든 끝나면 후기 쿼리 전체를 다시 불러온다
 * (평균 별점, 댓글 수, 내 후기 목록이 함께 바뀌기 때문).
 */
export const useReviewActions = () => {
	const queryClient = useQueryClient();
	const onSettled = () =>
		queryClient.invalidateQueries({ queryKey: reviewKeys.all });
	const onError = (error: unknown) =>
		console.error("[review] 요청 실패", error);

	const addReview = useMutation({
		mutationFn: (args: {
			eventId: number;
			rating: number;
			content: string;
			isAnonymous: boolean;
		}) =>
			reviewApi.createReview(args.eventId, {
				rating: args.rating,
				content: args.content.trim(),
				isAnonymous: args.isAnonymous,
			}),
		onSettled,
		onError,
	});

	const updateReview = useMutation({
		mutationFn: (args: { id: number; rating: number; content: string }) =>
			reviewApi.updateReview(args.id, {
				rating: args.rating,
				content: args.content.trim(),
			}),
		onSettled,
		onError,
	});

	const removeReview = useMutation({
		mutationFn: reviewApi.deleteReview,
		onSettled,
		onError,
	});

	const toggleReviewLike = useMutation({
		mutationFn: (args: { id: number; isLiked: boolean }) =>
			args.isLiked
				? reviewApi.unlikeReview(args.id)
				: reviewApi.likeReview(args.id),
		onSettled,
		onError,
	});

	const addComment = useMutation({
		mutationFn: (args: {
			reviewId: number;
			content: string;
			isAnonymous: boolean;
			parentId: number | null;
		}) =>
			reviewApi.createReviewComment(args.reviewId, {
				content: args.content.trim(),
				isAnonymous: args.isAnonymous,
				parentId: args.parentId,
			}),
		onSettled,
		onError,
	});

	const removeComment = useMutation({
		mutationFn: reviewApi.deleteReviewComment,
		onSettled,
		onError,
	});

	const toggleCommentLike = useMutation({
		mutationFn: (args: { id: number; isLiked: boolean }) =>
			args.isLiked
				? reviewApi.unlikeReviewComment(args.id)
				: reviewApi.likeReviewComment(args.id),
		onSettled,
		onError,
	});

	return {
		addReview: addReview.mutate,
		updateReview: updateReview.mutate,
		removeReview: removeReview.mutate,
		toggleReviewLike: toggleReviewLike.mutate,
		addComment: addComment.mutate,
		removeComment: removeComment.mutate,
		toggleCommentLike: toggleCommentLike.mutate,
	};
};
