import { useEffect, useRef, useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa6";
import { useAuth } from "@/contexts/AuthProvider";
import { useReviews } from "@/contexts/ReviewContext";
import { avatarColor } from "./avatarColor";
import ReviewComments from "./ReviewComments";
import {
	averageRating,
	buildAnonLabels,
	displayInitial,
	displayName,
	formatRelative,
	type Review,
} from "./reviewMock";
import Stars from "./Stars";
import styles from "./EventReviews.module.css";

const ReviewCard = ({
	review,
	labels,
	onToggleLike,
	canWrite,
	onRequireLogin,
}: {
	review: Review;
	labels: Map<string, string>;
	onToggleLike: (id: number) => void;
	canWrite: boolean;
	onRequireLogin?: () => void;
}) => {
	const color = avatarColor(review.authorKey, review.isAnonymous);

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
					<span className={styles.author}>{displayName(review, labels)}</span>
					<span className={styles.time}>
						{formatRelative(review.createdAt)}
					</span>
				</div>
				<Stars value={review.rating} />
			</div>

			<p className={styles.content}>{review.content}</p>

			<button
				type="button"
				className={`${styles.likeBtn} ${review.isLiked ? styles.liked : ""}`}
				onClick={() => onToggleLike(review.id)}
				aria-pressed={review.isLiked}
				aria-label={`좋아요 ${review.likeCount}개`}
			>
				{review.isLiked ? <FaHeart size={12} /> : <FaRegHeart size={12} />}
				<span>{review.likeCount}</span>
			</button>

			<ReviewComments
				review={review}
				labels={labels}
				canWrite={canWrite}
				onRequireLogin={onRequireLogin}
			/>
		</li>
	);
};

interface EventReviewsProps {
	eventId: number;
	eventTitle: string;
	onRequireLogin?: () => void;
}

/** 행사 상세 패널의 후기 섹션 (v2 카드 + 별점). */
const EventReviews = ({
	eventId,
	eventTitle,
	onRequireLogin,
}: EventReviewsProps) => {
	const { reviewsByEvent, commentsByReview, addReview, toggleReviewLike } =
		useReviews();
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

	const list = reviewsByEvent(eventId);
	const average = averageRating(list);
	// 익명 번호는 행사 하나 전체에서 통일한다
	const labels = buildAnonLabels(
		list,
		list.flatMap((r) => commentsByReview(r.id)),
	);

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
		addReview({ rating, content, isAnonymous }, eventId, eventTitle);
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
				<span className={styles.count}>후기 {list.length}개</span>
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
							labels={labels}
							onToggleLike={toggleReviewLike}
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
