import { useState } from "react";
import { FaHeart, FaRegHeart, FaTrashCan } from "react-icons/fa6";
import { useReviews } from "@/contexts/ReviewContext";
import { avatarColor } from "./avatarColor";
import {
	displayInitial,
	displayName,
	formatRelative,
	type Review,
	type ReviewComment,
} from "./reviewMock";
import styles from "./ReviewComments.module.css";

/** 댓글 입력창. 익명 체크는 글 하나마다 새로 고른다. */
const CommentForm = ({
	onSubmit,
}: {
	onSubmit: (content: string, isAnonymous: boolean) => void;
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
				placeholder="이 후기에 댓글 남기기"
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
	labels,
	isReviewAuthor,
	onToggleLike,
	onDelete,
}: {
	comment: ReviewComment;
	labels: Map<string, string>;
	isReviewAuthor: boolean;
	onToggleLike: (id: number) => void;
	onDelete: (id: number) => void;
}) => {
	const color = avatarColor(comment.authorKey, comment.isAnonymous);

	return (
		<div className={styles.row}>
			<span
				className={styles.avatar}
				style={{ background: color.bg, color: color.fg }}
				aria-hidden="true"
			>
				{displayInitial(comment)}
			</span>
			<div className={styles.body}>
				<div className={styles.meta}>
					<span className={styles.author}>{displayName(comment, labels)}</span>
					{isReviewAuthor && <span className={styles.badge}>작성자</span>}
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
				<button
					type="button"
					className={`${styles.likeBtn} ${comment.isLiked ? styles.liked : ""}`}
					onClick={() => onToggleLike(comment.id)}
					aria-pressed={comment.isLiked}
					aria-label={`좋아요 ${comment.likeCount}개`}
				>
					{comment.isLiked ? <FaHeart size={11} /> : <FaRegHeart size={11} />}
					<span>{comment.likeCount}</span>
				</button>
			</div>
		</div>
	);
};

/**
 * 한 후기에 달린 댓글 목록. **대댓글은 없다** —
 * 모든 댓글이 후기 바로 아래 한 단에 평평하게 쌓인다.
 */
const ReviewComments = ({
	review,
	labels,
	onRequireLogin,
	canWrite,
}: {
	review: Review;
	/** 행사 단위로 매겨진 익명 번호. */
	labels: Map<string, string>;
	canWrite: boolean;
	onRequireLogin?: () => void;
}) => {
	const { commentsByReview, addComment, removeComment, toggleCommentLike } =
		useReviews();
	const [isOpen, setIsOpen] = useState(false);

	const thread = commentsByReview(review.id);

	return (
		<div className={styles.section}>
			<button
				type="button"
				className={styles.toggle}
				onClick={() => setIsOpen((v) => !v)}
				aria-expanded={isOpen}
			>
				댓글 {thread.length}
			</button>

			{isOpen && (
				<div className={styles.thread}>
					{/* 입력창이 목록 위 — 후기 작성 폼과 같은 배치 */}
					<CommentForm
						onSubmit={(content, isAnonymous) => {
							if (!canWrite) {
								onRequireLogin?.();
								return;
							}
							addComment(review.id, content, isAnonymous);
						}}
					/>

					{thread.length > 0 ? (
						<div className={styles.list}>
							{thread.map((comment) => (
								<CommentRow
									key={comment.id}
									comment={comment}
									labels={labels}
									isReviewAuthor={comment.authorKey === review.authorKey}
									onToggleLike={toggleCommentLike}
									onDelete={removeComment}
								/>
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
