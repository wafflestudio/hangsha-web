import { useEffect, useRef, useState } from "react";
import { FaHeart, FaPen, FaRegHeart, FaTrashCan } from "react-icons/fa6";
import { useAuth } from "@/contexts/AuthProvider";
import { avatarColor } from "./avatarColor";
import ReviewComments from "./ReviewComments";
import { displayInitial, formatRelative, type Review } from "./reviewModel";
import Stars from "./Stars";
import { useEventReviews, useReviewActions } from "./useReviewQueries";
import styles from "./EventReviews.module.css";

const ReviewCard = ({
	review,
	onToggleLike,
	onUpdate,
	onDelete,
	canWrite,
	onRequireLogin,
}: {
	review: Review;
	onToggleLike: (review: Review) => void;
	onUpdate: (id: number, rating: number, content: string) => void;
	onDelete: (id: number) => void;
	canWrite: boolean;
	onRequireLogin?: () => void;
}) => {
	const [editing, setEditing] = useState(false);
	const [rating, setRating] = useState(review.rating);
	const [content, setContent] = useState(review.content);
	// 서버가 작성자 id를 주지 않으므로 표시 이름으로 색을 고정한다
	const color = avatarColor(review.authorName, review.isAnonymous);

	return (
		<li className={styles.card}>
			<div className={styles.cardHead}>
				<span
					className={styles.avatar}
					style={{ background: color.bg, color: color.fg }}
					aria-hidden="true"
				>
					{displayInitial(review)}
				</span>
				<div className={styles.authorCol}>
					<span className={styles.author}>{review.authorName}</span>
					<span className={styles.time}>
						{formatRelative(review.createdAt)}
					</span>
					{review.isEdited && <span className={styles.edited}>수정됨</span>}
				</div>
				<Stars value={review.rating} />
			</div>

			{editing ? (
				<>
					<Stars value={rating} size={17} onChange={setRating} />
					<textarea
						className={styles.textarea}
						value={content}
						onChange={(e) => setContent(e.currentTarget.value)}
					/>
					<div className={styles.editActions}>
						<button
							type="button"
							className={styles.cancelBtn}
							onClick={() => setEditing(false)}
						>
							취소
						</button>
						<button
							type="button"
							className={styles.submitBtn}
							disabled={!content.trim()}
							onClick={() => {
								onUpdate(review.id, rating, content);
								setEditing(false);
							}}
						>
							저장
						</button>
					</div>
				</>
			) : (
				<p className={styles.content}>{review.content}</p>
			)}

			<button
				type="button"
				className={`${styles.likeBtn} ${review.isLiked ? styles.liked : ""}`}
				onClick={() => onToggleLike(review)}
				aria-pressed={review.isLiked}
				aria-label={`좋아요 ${review.likeCount}개`}
			>
				{review.isLiked ? <FaHeart size={12} /> : <FaRegHeart size={12} />}
				<span>{review.likeCount}</span>
			</button>
			{review.isMine && !editing && (
				<div className={styles.manageActions}>
					<button
						type="button"
						className={styles.manageBtn}
						onClick={() => setEditing(true)}
					>
						<FaPen size={11} /> 수정
					</button>
					<button
						type="button"
						className={styles.manageBtn}
						onClick={() => onDelete(review.id)}
					>
						<FaTrashCan size={11} /> 삭제
					</button>
				</div>
			)}

			<ReviewComments
				review={review}
				canWrite={canWrite}
				onRequireLogin={onRequireLogin}
			/>
		</li>
	);
};

interface EventReviewsProps {
	eventId: number;
	onRequireLogin?: () => void;
}

/** 행사 상세 패널의 후기 섹션 (v2 카드 + 별점). */
const EventReviews = ({ eventId, onRequireLogin }: EventReviewsProps) => {
	const { data } = useEventReviews(eventId);
	const { addReview, updateReview, removeReview, toggleReviewLike } =
		useReviewActions();
	const { user } = useAuth();

	const [isWriting, setIsWriting] = useState(false);
	const [rating, setRating] = useState(5);
	const [content, setContent] = useState("");
	const [isAnonymous, setIsAnonymous] = useState(false);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// 폼이 열릴 때 본문으로 커서를 옮긴다
	useEffect(() => {
		if (isWriting) textareaRef.current?.focus();
	}, [isWriting]);

	// 지운 후기는 서버가 목록에서 빼고 보낸다. 익명 번호도 서버가 행사 단위로 매긴다.
	const list = data?.reviews ?? [];
	const average = data?.averageRating ?? null;

	const reset = () => {
		setIsWriting(false);
		setRating(5);
		setContent("");
		setIsAnonymous(false);
	};

	const handleOpen = () => {
		if (!user) {
			onRequireLogin?.();
			return;
		}
		setIsWriting(true);
	};

	const handleSubmit = () => {
		if (!content.trim()) return;
		addReview({ eventId, rating, content, isAnonymous });
		reset();
	};

	return (
		<section className={styles.section} data-testid="event-reviews">
			<header className={styles.header}>
				<span className={styles.headerTitle}>행사 후기</span>
				{average !== null && (
					<>
						<span className={styles.average}>{average.toFixed(1)}</span>
						<Stars value={average} />
					</>
				)}
				<span className={styles.count}>후기 {data?.reviewCount ?? 0}개</span>
			</header>

			{isWriting ? (
				<div className={styles.composer}>
					<div className={styles.composerHead}>
						<span className={styles.composerLabel}>이 행사는 어땠나요?</span>
						<Stars value={rating} size={19} onChange={setRating} />
					</div>
					<textarea
						ref={textareaRef}
						className={styles.textarea}
						value={content}
						placeholder="후기를 남기면 다음 참가자에게 큰 도움이 돼요."
						onChange={(e) => setContent(e.currentTarget.value)}
					/>
					<div className={styles.composerActions}>
						<label className={styles.anonToggle}>
							<input
								type="checkbox"
								checked={isAnonymous}
								onChange={(e) => setIsAnonymous(e.currentTarget.checked)}
							/>
							<span>익명으로 남기기</span>
						</label>
						<button type="button" className={styles.cancelBtn} onClick={reset}>
							취소
						</button>
						<button
							type="button"
							className={styles.submitBtn}
							onClick={handleSubmit}
							disabled={!content.trim()}
						>
							후기 등록
						</button>
					</div>
				</div>
			) : (
				<button type="button" className={styles.trigger} onClick={handleOpen}>
					<Stars value={0} size={16} />
					<span>후기 달기</span>
				</button>
			)}

			{list.length > 0 ? (
				<ul className={styles.list}>
					{list.map((review) => (
						<ReviewCard
							key={review.id}
							review={review}
							onToggleLike={(r) =>
								toggleReviewLike({ id: r.id, isLiked: r.isLiked })
							}
							onUpdate={(id, nextRating, nextContent) =>
								updateReview({ id, rating: nextRating, content: nextContent })
							}
							onDelete={(id) => removeReview(id)}
							canWrite={!!user}
							onRequireLogin={onRequireLogin}
						/>
					))}
				</ul>
			) : (
				!isWriting && (
					<p className={styles.empty}>
						아직 후기가 없어요. 첫 후기를 남겨보세요!
					</p>
				)
			)}
		</section>
	);
};

export default EventReviews;
