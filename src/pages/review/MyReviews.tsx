import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	FaChevronLeft,
	FaHeart,
	FaRegHeart,
	FaTrashCan,
} from "react-icons/fa6";
import Navigationbar from "@/components/layout/Navigationbar";
import BottomNav from "@/components/layout/BottomNav";
import Modal from "@/components/ui/Modal";
import Stars from "@/components/feature/review/Stars";
import { BoardFeed } from "@/pages/board/BoardHome";
import { useResizableSidePanel } from "@/components/layout/sidePannel/SidePanelResize";
import {
	averageRating,
	formatRelative,
	type Review,
} from "@/components/feature/review/reviewMock";
import { useAuth } from "@/contexts/AuthProvider";
import { useReviews } from "@/contexts/ReviewContext";
import styles from "./MyReviews.module.css";

const ReviewRow = ({
	review,
	onOpenEvent,
	onToggleLike,
	onDelete,
}: {
	review: Review;
	onOpenEvent: (eventId: number) => void;
	onToggleLike: (id: number) => void;
	onDelete: (id: number) => void;
}) => (
	<li className={styles.card}>
		<div className={styles.cardHead}>
			<button
				type="button"
				className={styles.eventTitle}
				onClick={() => onOpenEvent(review.eventId)}
			>
				{review.eventTitle}
			</button>
			<button
				type="button"
				className={styles.deleteBtn}
				aria-label="후기 삭제"
				onClick={() => onDelete(review.id)}
			>
				<FaTrashCan size={13} />
			</button>
		</div>

		<div className={styles.ratingRow}>
			<Stars value={review.rating} size={15} />
			<span className={styles.ratingValue}>{review.rating}.0</span>
			<span
				className={`${styles.vis} ${review.isAnonymous ? styles.anon : styles.pub}`}
			>
				{review.isAnonymous ? "익명" : "공개"}
			</span>
			<span className={styles.time}>{formatRelative(review.createdAt)}</span>
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
	</li>
);

/** 내가 남긴 후기를 모아 보는 페이지. 기존 메모 모음 페이지 자리를 대체한다. */
const MyReviews = () => {
	const { myReviews, removeReview, toggleReviewLike } = useReviews();
	const { user } = useAuth();
	const navigate = useNavigate();
	const { isMobile } = useResizableSidePanel();
	const [deletingId, setDeletingId] = useState<number | null>(null);
	// 모바일에는 사이드바가 없어 여기서 게시판으로 건너뛴다 (데스크톱은 좌측 사이드바 탭)
	const [tab, setTab] = useState<"review" | "board">("review");

	const handleDelete = () => {
		if (deletingId !== null) removeReview(deletingId);
		setDeletingId(null);
	};

	if (!user) {
		return (
			<div className={styles.notFound}>
				<Navigationbar />
				<Modal
					content={"후기 이용을 위해서는\n로그인이 필요해요."}
					leftText="로그인 · 회원가입 페이지로 이동"
					onLeftClick={() => navigate("/")}
					onClose={null}
				/>
				<BottomNav />
			</div>
		);
	}

	const average = averageRating(myReviews);
	const isBoard = isMobile && tab === "board";

	return (
		<div className={styles.main}>
			<div className={styles.page}>
				<Navigationbar />

				<div className={styles.header}>
					<button
						type="button"
						className={styles.backBtn}
						aria-label="뒤로 가기"
						onClick={() =>
							window.history.length > 1 ? navigate(-1) : navigate("/my")
						}
					>
						<FaChevronLeft size={18} />
					</button>
					<div className={styles.headerCenter}>
						<span className={styles.headerTitle}>
							{isBoard ? "자유게시판" : "내 후기 목록"}
						</span>
						<img src="/assets/pencil.svg" alt="" />
					</div>
				</div>

				{isMobile && (
					<div className={styles.tabs} role="tablist">
						<button
							type="button"
							role="tab"
							aria-selected={!isBoard}
							className={`${styles.tab} ${!isBoard ? styles.tabOn : ""}`}
							onClick={() => setTab("review")}
						>
							후기 보기
						</button>
						<button
							type="button"
							role="tab"
							aria-selected={isBoard}
							className={`${styles.tab} ${isBoard ? styles.tabOn : ""}`}
							onClick={() => setTab("board")}
						>
							게시판
						</button>
					</div>
				)}

				{!isBoard && myReviews.length > 0 && (
					<div className={styles.summary}>
						<div className={styles.summaryItem}>
							<span className={styles.summaryLabel}>남긴 후기</span>
							<span className={styles.summaryValue}>{myReviews.length}개</span>
						</div>
						<span className={styles.summaryDivider} />
						<div className={styles.summaryItem}>
							<span className={styles.summaryLabel}>평균 별점</span>
							<span className={styles.summaryRating}>
								<span className={styles.summaryValue}>
									{average?.toFixed(1)}
								</span>
								<Stars value={average ?? 0} size={14} />
							</span>
						</div>
					</div>
				)}

				<div className={styles.listWrapper}>
					{isBoard ? (
						<BoardFeed hideRail />
					) : myReviews.length > 0 ? (
						<ul className={styles.list}>
							{myReviews.map((review) => (
								<ReviewRow
									key={review.id}
									review={review}
									onOpenEvent={(eventId) => navigate(`/events/${eventId}`)}
									onToggleLike={toggleReviewLike}
									onDelete={setDeletingId}
								/>
							))}
						</ul>
					) : (
						<span className={styles.noneText}>
							{"아직 남긴 후기가 없습니다.\n다녀온 행사에 후기를 남겨보세요!"}
						</span>
					)}
				</div>
			</div>

			{deletingId !== null && (
				<Modal
					content="후기를 정말로 삭제하시겠습니까?"
					leftText="삭제"
					onLeftClick={handleDelete}
					rightText="취소"
					onRightClick={() => setDeletingId(null)}
					onClose={() => setDeletingId(null)}
				/>
			)}

			<BottomNav />
		</div>
	);
};

export default MyReviews;
