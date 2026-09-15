import { useNavigate } from "react-router-dom";
import { FaChevronRight, FaRegHeart } from "react-icons/fa6";
import { useReviews } from "@/contexts/ReviewContext";
import { formatRelative } from "./reviewMock";
import Stars from "./Stars";
import styles from "./MyReviewWidget.module.css";

/** 마이페이지의 내 후기 미리보기. 기존 메모 위젯 자리를 대체한다. */
const MyReviewWidget = () => {
	const navigate = useNavigate();
	const { myReviews } = useReviews();

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<div className={styles.left}>
					<span>후기 보기</span>
					<img src="/assets/pencil.svg" alt="pencil icon" />
				</div>
				<button
					type="button"
					className={styles.moreBtn}
					aria-label="내 후기 전체 보기"
					onClick={() => navigate("/review")}
				>
					<FaChevronRight size={18} />
				</button>
			</div>

			{myReviews.length > 0 ? (
				<div className={styles.row}>
					{myReviews.map((review) => (
						<button
							key={review.id}
							type="button"
							className={styles.card}
							onClick={() => navigate("/review")}
						>
							<span className={styles.cardTop}>
								<Stars value={review.rating} size={12} />
								<span
									className={`${styles.vis} ${review.isAnonymous ? styles.anon : styles.pub}`}
								>
									{review.isAnonymous ? "익명" : "공개"}
								</span>
								<span className={styles.time}>
									{formatRelative(review.createdAt)}
								</span>
							</span>
							<p className={styles.body}>{review.content}</p>
							<span className={styles.event}>{review.eventTitle}</span>
							<span className={styles.stats}>
								<span className={styles.stat}>
									<FaRegHeart size={11} />
									{review.likeCount}
								</span>
							</span>
						</button>
					))}
				</div>
			) : (
				<span className={styles.noneText}>
					{"아직 남긴 후기가 없습니다.\n다녀온 행사에 후기를 남겨보세요!"}
				</span>
			)}
		</div>
	);
};

export default MyReviewWidget;
