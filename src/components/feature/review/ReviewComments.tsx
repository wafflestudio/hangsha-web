import { useState } from "react";
import { FaHeart, FaRegHeart, FaTrashCan } from "react-icons/fa6";
import { avatarColor } from "./avatarColor";
import {
	displayInitial,
	formatRelative,
	type Review,
	type ReviewComment,
} from "./reviewModel";
import { useReviewActions, useReviewComments } from "./useReviewQueries";
import styles from "./ReviewComments.module.css";

/** 댓글 입력창. 익명 체크는 글 하나마다 새로 고른다. */
const CommentForm = ({
	placeholder,
	onSubmit,
	onCancel,
}: {
	placeholder: string;
	onSubmit: (content: string, isAnonymous: boolean) => void;
	onCancel?: () => void;
}) => {
	const [content, setContent] = useState("");
	const [isAnonymous, setIsAnonymous] = useState(false);

	const submit = () => {
		if (!content.trim()) return;
		onSubmit(content, isAnonymous);
		setContent("");
		setIsAnonymous(false);
	};

	return (
		<div className={styles.form}>
			<textarea
				className={styles.input}
				value={content}
				placeholder={placeholder}
				onChange={(e) => setContent(e.currentTarget.value)}
			/>
			<div className={styles.formActions}>
				<label className={styles.anonToggle}>
					<input
						type="checkbox"
						checked={isAnonymous}
						onChange={(e) => setIsAnonymous(e.currentTarget.checked)}
					/>
					<span>익명</span>
				</label>
				{onCancel && (
					<button type="button" className={styles.textBtn} onClick={onCancel}>
						취소
					</button>
				)}
				<button
					type="button"
					className={styles.submitBtn}
					onClick={submit}
					disabled={!content.trim()}
				>
					등록
				</button>
			</div>
		</div>
	);
};

const CommentRow = ({
	comment,
	isReply,
	onReply,
	onToggleLike,
	onDelete,
}: {
	comment: ReviewComment;
	isReply: boolean;
	/** 넘기면 "답글" 버튼이 생긴다. 최상위 댓글에만 넘긴다. */
	onReply?: () => void;
	onToggleLike: (comment: ReviewComment) => void;
	onDelete: (id: number) => void;
}) => {
	// 답글이 남아 있어 자리만 지키는 댓글. 작성자·본문·좋아요를 모두 숨긴다.
	if (comment.isDeleted) {
		return (
			<div className={`${styles.row} ${isReply ? styles.reply : ""}`}>
				<p className={styles.deleted}>삭제된 댓글입니다.</p>
			</div>
		);
	}

	const color = avatarColor(comment.authorName ?? "", comment.isAnonymous);

	return (
		<div className={`${styles.row} ${isReply ? styles.reply : ""}`}>
			<span
				className={styles.avatar}
				style={{ background: color.bg, color: color.fg }}
				aria-hidden="true"
			>
				{displayInitial(comment)}
			</span>
			<div className={styles.body}>
				<div className={styles.meta}>
					<span className={styles.author}>{comment.authorName}</span>
					{comment.isReviewAuthor && <span className={styles.badge}>작성자</span>}
					<span className={styles.time}>
						{formatRelative(comment.createdAt)}
					</span>
					{comment.isMine && (
						<button
							type="button"
							className={styles.deleteBtn}
							aria-label="댓글 삭제"
							onClick={() => onDelete(comment.id)}
						>
							<FaTrashCan size={11} />
						</button>
					)}
				</div>
				<p className={styles.content}>{comment.content}</p>
				<div className={styles.actions}>
					<button
						type="button"
						className={`${styles.likeBtn} ${comment.isLiked ? styles.liked : ""}`}
						onClick={() => onToggleLike(comment)}
						aria-pressed={comment.isLiked}
						aria-label={`좋아요 ${comment.likeCount}개`}
					>
						{comment.isLiked ? <FaHeart size={11} /> : <FaRegHeart size={11} />}
						<span>{comment.likeCount}</span>
					</button>
					{onReply && (
						<button type="button" className={styles.textBtn} onClick={onReply}>
							답글
						</button>
					)}
				</div>
			</div>
		</div>
	);
};

/**
 * 한 후기에 달린 댓글 목록. 답글은 **1단까지** — 최상위 댓글 밑에 들여써서 붙고,
 * 답글에는 다시 답글을 달 수 없다.
 */
const ReviewComments = ({
	review,
	onRequireLogin,
	canWrite,
}: {
	review: Review;
	canWrite: boolean;
	onRequireLogin?: () => void;
}) => {
	const { addComment, removeComment, toggleCommentLike } = useReviewActions();
	const [isOpen, setIsOpen] = useState(false);
	const [replyingTo, setReplyingTo] = useState<number | null>(null);

	// 펼쳤을 때만 불러온다. 개수는 후기 응답의 commentCount(삭제 자리 제외)를 쓴다.
	const { data: thread = [] } = useReviewComments(review.id, isOpen);
	const roots = thread.filter((c) => c.parentId === null);
	const onToggleLike = (c: ReviewComment) =>
		toggleCommentLike({ id: c.id, isLiked: c.isLiked });
	const onDelete = (id: number) => removeComment(id);

	const submit = (
		content: string,
		isAnonymous: boolean,
		parentId: number | null,
	) => {
		if (!canWrite) {
			onRequireLogin?.();
			return;
		}
		addComment({ reviewId: review.id, content, isAnonymous, parentId });
	};

	return (
		<div className={styles.section}>
			<button
				type="button"
				className={styles.toggle}
				onClick={() => setIsOpen((v) => !v)}
				aria-expanded={isOpen}
			>
				댓글 {review.commentCount}
			</button>

			{isOpen && (
				<div className={styles.thread}>
					{/* 입력창이 목록 위 — 후기 작성 폼과 같은 배치 */}
					<CommentForm
						placeholder="이 후기에 댓글 남기기"
						onSubmit={(content, isAnonymous) =>
							submit(content, isAnonymous, null)
						}
					/>

					{roots.length > 0 ? (
						<div className={styles.list}>
							{roots.map((root) => (
								<div key={root.id} className={styles.group}>
									<CommentRow
										comment={root}
										isReply={false}
										onReply={
											root.isDeleted
												? undefined
												: () =>
														setReplyingTo((cur) =>
															cur === root.id ? null : root.id,
														)
										}
										onToggleLike={onToggleLike}
										onDelete={onDelete}
									/>
									{thread
										.filter((c) => c.parentId === root.id)
										.map((child) => (
											<CommentRow
												key={child.id}
												comment={child}
												isReply
												onToggleLike={onToggleLike}
												onDelete={onDelete}
											/>
										))}
									{replyingTo === root.id && (
										<div className={styles.replyForm}>
											<CommentForm
												placeholder={`${root.authorName}님에게 답글 남기기`}
												onCancel={() => setReplyingTo(null)}
												onSubmit={(content, isAnonymous) => {
													submit(content, isAnonymous, root.id);
													setReplyingTo(null);
												}}
											/>
										</div>
									)}
								</div>
							))}
						</div>
					) : (
						<p className={styles.empty}>아직 댓글이 없어요.</p>
					)}
				</div>
			)}
		</div>
	);
};

export default ReviewComments;
