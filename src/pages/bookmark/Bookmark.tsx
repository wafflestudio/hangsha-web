import { useUserData } from "@/contexts/UserDataContext";
import styles from "@styles/Bookmarks.module.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import Navigationbar from "@/widgets/Navigationbar";
import { useNavigate } from "react-router-dom";
import GalleryCard from "@/widgets/Day/Gallery/GalleryCard";
import { useDetail } from "@/contexts/DetailContext";
import DetailView from "@/widgets/DetailView";

export const BookmarkWidget = () => {
	const { bookmarkedEvents } = useUserData();
	const navigate = useNavigate();

	return (
		<div className={styles.bookmarksContainer}>
			<div className={styles.bookmarksHeader}>
				<div className={styles.headerLeft}>
					<span>내 찜 목록</span>
					<img src="/assets/Bookmarked.svg" alt="filled bookmark icon" />
				</div>
				<FaChevronRight
					className={styles.backBtn}
					color="ABABAB"
					size={18}
					onClick={() => navigate("/my/bookmark")}
				/>
			</div>
			<div className={styles.cardsRow}>
				{bookmarkedEvents.map((e) => (
					<GalleryCard key={e.id} event={e} />
				))}
			</div>
			{(!bookmarkedEvents || bookmarkedEvents.length === 0) && (
				<span
					className={styles.noneText}
				>{`아직 찜된 행사가 없습니다.\n관심있는 행사를 찜해보세요!`}</span>
			)}
		</div>
	);
};
const BookmarksPage = () => {
	const { bookmarkedEvents } = useUserData();
	const navigate = useNavigate();

	const { showDetail, clickedEventId } = useDetail();

	return (
		<div className={styles.container}>
			<div className={styles.bookmarksPage}>
				<Navigationbar />
				<div className={styles.bookmarksHeader}>
					<FaChevronLeft
						className={styles.backBtn}
						color="ABABAB"
						size={18}
						onClick={() => navigate("/my")}
					/>
					<div className={styles.row}>
						<span>내 찜 목록</span>
						<img src="/assets/Bookmarked.svg" alt="filled bookmark icon" />
					</div>
				</div>
				<div className={styles.cardsColumn}>
					{bookmarkedEvents &&
						bookmarkedEvents.length > 0 &&
						bookmarkedEvents.map((e) => <GalleryCard key={e.id} event={e} />)}
				</div>
				{(!bookmarkedEvents || bookmarkedEvents.length === 0) && (
					<span
						className={styles.noneText}
					>{`아직 찜된 행사가 없습니다.\n관심있는 행사를 찜해보세요!`}</span>
				)}
			</div>
			{showDetail && clickedEventId !== undefined && (
				<div className={styles.sidePanel}>
					<DetailView eventId={clickedEventId} />
				</div>
			)}
		</div>
	);
};

export default BookmarksPage;
