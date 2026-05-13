import { useAuth } from "@/contexts/AuthProvider";
// import { useFilter } from "@/contexts/FilterContext";
import { useSearch } from "@/contexts/SearchContext";
import { ProfileButton } from "@/widgets/Toolbar";
import styles from "@styles/SearchToolbar.module.css";
import { useState } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import { IoIosClose, IoIosSearch } from "react-icons/io";
import { useNavigate } from "react-router-dom";

interface SearchToolbarProps {
	viewMode: "List" | "Grid";
	setViewMode: React.Dispatch<React.SetStateAction<"List" | "Grid">>;
}

const SearchToolbar = ({ viewMode, setViewMode }: SearchToolbarProps) => {
	const { user } = useAuth();
	const { query, setQuery } = useSearch();
	const [queryState, setQueryState] = useState<string>(query);
	// const { setFilterSheetShowing } = useFilter();

	const navigate = useNavigate();

	return (
		<div className={styles.toolbarContainer}>
			<div className={styles.headerRow}>
				<span>
					{query.trim() ? `'${query}' 검색 결과` : "검색"}
				</span>
				<div className={styles.btnGroup}>
					<button type="button" className={styles.calendarBtn}>
						<FaCalendarAlt
							onClick={() => navigate("/main")}
							size={25}
							color="rgba(130, 130, 130, 1)"
						/>
					</button>
					{/* <FilterButton onFilterSet={() => setFilterSheetShowing(true)} /> */}
					{user && <ProfileButton user={user} />}
				</div>
			</div>
			<div className={styles.searchRow}>
				<div className={styles.searchBox}>
					<div className={styles.inputWrapper}>
						<input
							type="text"
							className={styles.searchInput}
							placeholder="검색어를 입력해주세요"
							value={queryState}
							onChange={(e) => setQueryState(e.currentTarget.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.nativeEvent.isComposing)
									setQuery(queryState);
							}}
						/>
						{queryState && (
							<button
								type="button"
								className={styles.clearBtn}
								onClick={() => setQueryState("")}
							>
								<IoIosClose size={20} color="rgba(130, 130, 130, 1)" />
							</button>
						)}
					</div>
					<button
						type="button"
						onClick={() => setQuery(queryState)}
						className={styles.searchBtn}
					>
						<IoIosSearch size={25} color="rgba(130, 130, 130, 1)" />
					</button>
				</div>
				<div className={styles.viewToggleGroup}>
					{/* 리스트 버튼 */}
					<button
						type="button"
						onClick={() => setViewMode("List")}
						className={`${styles.toggleBtn} ${viewMode === "List" ? styles.toggleBtnActive : ""}`}
					>
						<img
							alt="list icon, three rows of a small circle and a longer line"
							src="/assets/list.svg"
						/>
					</button>
					{/* 갤러리 (grid) 버튼 */}
					<button
						type="button"
						onClick={() => setViewMode("Grid")}
						className={`${styles.toggleBtn} ${viewMode === "Grid" ? styles.toggleBtnActive : ""}`}
					>
						<img
							alt="grid icon, four rectangles of 2x2 layout"
							src="/assets/grid.svg"
						/>
					</button>
				</div>
			</div>
		</div>
	);
};
export default SearchToolbar;
