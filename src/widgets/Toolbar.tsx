import {
	Navigate,
	type NavigateAction,
	type View,
	Views,
} from "react-big-calendar";
import { IoIosSearch } from "react-icons/io";
import { useAuth } from "@contexts/AuthProvider";
import styles from "@styles/Toolbar.module.css";
import { useDayView } from "@contexts/DayViewContext";
import type { User } from "@/util/types";
import { useState } from "react";
import { useSearch } from "@contexts/SearchContext";
import { useNavigate } from "react-router-dom";

interface ToolbarProps {
	view: View;
	onNavigate: (action: NavigateAction) => void;
	onView: (view: View) => void;
	label: string;
	date: Date;
}

const SearchInput = () => {
	const [active, setActive] = useState<boolean>(false);
	const [searchText, setSearchText] = useState<string>("");
	const { setQuery } = useSearch();
	const navigate = useNavigate();

	const handleSearch = () => {
		if (searchText.trim()) {
			setQuery(searchText);
		}
		navigate("/search");
	};

	return (
		<button
			type="button"
			className={styles.searchContainer}
			onMouseEnter={() => setActive(true)}
			// onMouseLeave={()=>setActive(false)}
			onFocus={() => setActive(true)}
			onBlur={() => setActive(false)}
		>
			<input
				type="text"
				className={`${styles.searchInput} ${active ? styles.active : ""}`}
				placeholder="검색어를 입력하세요"
				value={searchText}
				onKeyDown={(e)=>{if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleSearch()}}
				onChange={(e) => setSearchText(e.currentTarget.value)}
			/>
			<IoIosSearch
				onClick={handleSearch}
				size={20}
				color="rgba(130, 130, 130, 1)"
			/>
		</button>
	);
};

export const ProfileButton = ({ user }: { user: User | null }) => {
	const navigate = useNavigate();
	const [profilePreviewUrl, setProfilePreviewUrl] = useState<string>(
		user?.profileImageUrl || "/assets/defaultProfile.png",
	);

	const handleImageError = () => {
		setProfilePreviewUrl("/assets/defaultProfile.png");
	};

	return (
		<button
			type="button"
			className={styles.profileButton}
			onClick={() => navigate("/my")}
		>
			<img
				alt="user profile"
				src={profilePreviewUrl}
				onError={handleImageError}
			/>
		</button>
	);
};

const Toolbar: React.FC<ToolbarProps> = ({
	view,
	onNavigate,
	onView,
	label,
}) => {
	const { user } = useAuth();
	const { dayViewMode, setDayViewMode } = useDayView();

	return (
		<div className={styles.toolbarContainer}>
			{/* 월/주/일 토글 버튼 */}
			<div
				className={`${styles.centerControl} ${view === Views.DAY && styles.dayView}`}
			>
				<div className={styles.viewToggleGroup}>
					<button
						type="button"
						onClick={() => onView(Views.MONTH)}
						className={`${styles.toggleBtn} ${view === Views.MONTH ? styles.toggleBtnActive : ""}`}
					>
						월
					</button>
					<button
						type="button"
						onClick={() => onView(Views.WEEK)}
						className={`${styles.toggleBtn} ${view === Views.WEEK ? styles.toggleBtnActive : ""}`}
					>
						주
					</button>
					<button
						type="button"
						onClick={() => onView(Views.DAY)}
						className={`${styles.toggleBtn} ${view === Views.DAY ? styles.toggleBtnActive : ""}`}
					>
						일
					</button>
				</div>
			</div>

			{/* 날짜 및 내비게이션 */}
			<div className={styles.headerRow}>
				<div className={styles.leftGroup}>
					<h2 className={styles.dateTitle}>{label}</h2>
					<div className={styles.navBtnGroup}>
						<button
							type="button"
							className={styles.todayBtn}
							onClick={() => onNavigate(Navigate.TODAY)}
						>
							오늘
						</button>
						<button
							type="button"
							className={styles.navIconBtn}
							onClick={() => onNavigate(Navigate.PREVIOUS)}
						>
							&lt;
						</button>
						<button
							type="button"
							className={styles.navIconBtn}
							onClick={() => onNavigate(Navigate.NEXT)}
						>
							&gt;
						</button>
					</div>
				</div>

				<div className={styles.rightGroup}>
					{/* 일별 뷰 전용 모드 전환 토글 */}
					{view === Views.DAY && (
						<div className={styles.viewToggleGroup}>
							{/* 리스트 버튼 */}
							<button
								type="button"
								onClick={() => setDayViewMode("List")}
								className={`${styles.toggleBtn} ${dayViewMode === "List" ? styles.toggleBtnActive : ""}`}
							>
								<img
									alt="list icon, three rows of a small circle and a longer line"
									src="/assets/list.svg"
								/>
							</button>
							{/* 갤러리 (grid) 버튼 */}
							<button
								type="button"
								onClick={() => setDayViewMode("Grid")}
								className={`${styles.toggleBtn} ${dayViewMode === "Grid" ? styles.toggleBtnActive : ""}`}
							>
								<img
									alt="grid icon, four rectangles of 2x2 layout"
									src="/assets/grid.svg"
								/>
							</button>
							{/* 캘린더 버튼 */}
							<button
								type="button"
								onClick={() => setDayViewMode("Calendar")}
								className={`${styles.toggleBtn} ${dayViewMode === "Calendar" ? styles.toggleBtnActive : ""}`}
							>
								<img alt="calendar icon" src="/assets/calendar.svg" />
							</button>
						</div>
					)}
					<div className={styles.profileRow}>
						<SearchInput />
						{user && <ProfileButton user={user} />}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Toolbar;
