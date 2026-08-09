import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Sidebar } from "@/components/layout/filterSideBar/FilterSidebar";
import SearchNewListItem from "./SearchNewListItem";
import SearchGridItem from "./SearchGridItem";
import type { HighlightSearchResult } from "@/util/types";
import { getEventSearchFull } from "@/api/event";
import styles from "./Search.module.css";
import toolbarStyles from "./SearchToolbar.module.css";
import { IoIosClose, IoIosSearch } from "react-icons/io";
import BottomNav from "@/components/layout/BottomNav";
import Loading from "@/components/ui/Loading";
import Pagination from "@/components/ui/Pagination";
import DetailView from "@/components/layout/sidePannel/DetailView";
import {
	SidePanelResizeHandle,
	useResizableSidePanel,
} from "@/components/layout/sidePannel/SidePanelResize";
import { useDetail } from "@/contexts/DetailContext";
import { useAuth } from "@/contexts/AuthProvider";
import { useFilter } from "@/contexts/FilterContext";
import { useUserData } from "@/contexts/UserDataContext";
import { FilterSheet } from "@/components/layout/filterSheet/FilterSheet";
import {
	FilterButton,
	ProfileButton,
} from "@/components/layout/toolbar/Toolbar";
import Modal from "@/components/ui/Modal";
import { filterEventTimeVariants } from "@/util/calendar/filterEventTimeVariants";

const DEFAULT_PAGE_SIZE = 20;
const PAGE_GROUP_SIZE = 5;

const SearchView = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const navigate = useNavigate();
	const { user } = useAuth();
	const { globalStatus, globalOrg, globalCategory, setFilterSheetShowing } =
		useFilter();
	// 제외 키워드는 서버가 알아서 걸러주므로 파라미터로 보내지 않지만,
	// 목록에 반영하려면 값이 바뀔 때 재조회가 필요해 deps로만 사용한다.
	const { excludedKeywords } = useUserData();
	const { showDetail, closeDetail, clickedEventId, openDetail } = useDetail();
	const { isMobile, handleResizeStart, sidePanelStyle } =
		useResizableSidePanel();
	const sidePanelRef = useRef<HTMLDivElement>(null);

	const query = searchParams.get("q") ?? "";
	const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
	const [inputValue, setInputValue] = useState(query);
	const [result, setResult] = useState<HighlightSearchResult | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);
	const [viewMode, setViewMode] = useState<"list" | "grid">("list");
	const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
	const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

	useEffect(() => {
		setInputValue(query);
	}, [query]);

	useEffect(() => {
		if (!query.trim()) {
			setResult(null);
			setLoading(false);
			setError(false);
			return;
		}

		let cancelled = false;
		// 사이드바/필터시트에서 고른 값을 서버 파라미터 형태로 변환
		const filters = {
			statusId: globalStatus.map((g) => g.id),
			orgId: globalOrg.map((g) => g.id),
			eventTypeId: globalCategory.map((g) => g.id),
		};

		const fetchResults = async () => {
			setLoading(true);
			setError(false);
			try {
				const firstResult = await getEventSearchFull({
					query,
					page: 1,
					size: DEFAULT_PAGE_SIZE,
					...filters,
				});
				const fullResult =
					firstResult.items.length < firstResult.total
						? await getEventSearchFull({
								query,
								page: 1,
								size: firstResult.total,
								...filters,
							})
						: firstResult;
				if (cancelled) return;

				const items = filterEventTimeVariants(
					fullResult.items,
					(item) => item.event,
				);
				setResult({
					...fullResult,
					page: 1,
					size: items.length,
					total: items.length,
					items,
				});
			} catch {
				if (!cancelled) setError(true);
			} finally {
				if (!cancelled) setLoading(false);
			}
		};

		void fetchResults();
		return () => {
			cancelled = true;
		};
	}, [query, globalStatus, globalOrg, globalCategory, excludedKeywords]);

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (!sidePanelRef.current) return;
			if (!sidePanelRef.current.contains(e.target as Node)) {
				closeDetail();
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [closeDetail]);

	const handleSearch = () => {
		const trimmed = inputValue.trim();
		if (trimmed) setSearchParams({ q: trimmed, page: "1" });
	};

	const handleSizeChange = (e: ChangeEvent<HTMLSelectElement>) => {
		setPageSize(Number(e.target.value));
		setSearchParams({ q: query, page: "1" });
	};

	const totalPages = result ? Math.ceil(result.total / pageSize) : 0;
	const safePage = totalPages > 0 ? Math.min(page, totalPages) : 1;
	const pageItems =
		result?.items.slice((safePage - 1) * pageSize, safePage * pageSize) ?? [];
	const currentGroupStart =
		Math.floor((safePage - 1) / PAGE_GROUP_SIZE) * PAGE_GROUP_SIZE + 1;
	const currentGroupEnd = Math.min(
		totalPages,
		currentGroupStart + PAGE_GROUP_SIZE - 1,
	);
	const getPageNumbers = () => {
		const nums: number[] = [];
		for (let i = currentGroupStart; i <= currentGroupEnd; i++) nums.push(i);
		return nums;
	};
	const handlePageChange = (newPage: number) => {
		if (newPage >= 1 && newPage <= totalPages) {
			setSearchParams({ q: query, page: String(newPage) });
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	};

	return (
		<div className={styles.container}>
			{isLoginModalOpen && (
				<Modal
					content="로그인 이후 이용해주세요"
					leftText="로그인"
					rightText="닫기"
					onLeftClick={() => navigate("/")}
					onRightClick={() => setIsLoginModalOpen(false)}
					onClose={() => setIsLoginModalOpen(false)}
				/>
			)}
			<Sidebar />
			<div className={styles.restContainer}>
				<div className={toolbarStyles.toolbarContainer}>
					<div className={toolbarStyles.headerRow}>
						<span>{query ? `'${query}' 검색 결과` : "검색"}</span>
						<div className={toolbarStyles.btnGroup}>
							{/** 모바일뷰 전용 필터 버튼 */}
							<FilterButton onFilterSet={() => setFilterSheetShowing(true)} />
							{user && <ProfileButton user={user} />}
						</div>
					</div>
					<div className={toolbarStyles.searchRow}>
						<div className={toolbarStyles.searchBox}>
							<div className={toolbarStyles.inputWrapper}>
								<input
									type="text"
									maxLength={50}
									className={toolbarStyles.searchInput}
									placeholder="검색어를 입력해주세요"
									value={inputValue}
									onChange={(e) => setInputValue(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter" && !e.nativeEvent.isComposing)
											handleSearch();
									}}
								/>
								{inputValue && (
									<button
										type="button"
										className={toolbarStyles.clearBtn}
										onClick={() => {
											setInputValue("");
											setSearchParams({});
										}}
									>
										<IoIosClose size={20} color="rgba(130,130,130,1)" />
									</button>
								)}
							</div>
							<button
								type="button"
								className={toolbarStyles.searchBtn}
								onClick={handleSearch}
							>
								<IoIosSearch size={25} color="rgba(130,130,130,1)" />
							</button>
						</div>
						<div className={toolbarStyles.viewToggleGroup}>
							<button
								type="button"
								onClick={() => setViewMode("list")}
								className={`${toolbarStyles.toggleBtn} ${viewMode === "list" ? toolbarStyles.toggleBtnActive : ""}`}
							>
								<img
									alt="list icon, three rows of a small circle and a longer line"
									src="/assets/list.svg"
								/>
							</button>
							<button
								type="button"
								onClick={() => setViewMode("grid")}
								className={`${toolbarStyles.toggleBtn} ${viewMode === "grid" ? toolbarStyles.toggleBtnActive : ""}`}
							>
								<img
									alt="grid icon, four rectangles of 2x2 layout"
									src="/assets/grid.svg"
								/>
							</button>
						</div>
					</div>
				</div>

				{!loading && !error && result && result.total > 0 && (
					<div className={styles.dropdownRow}>
						<div className={styles.sizeSelectContainer}>
							<span className={styles.sizeLabel}>표시 개수:</span>
							<select
								className={styles.sizeSelect}
								value={pageSize}
								onChange={handleSizeChange}
							>
								<option value={5}>5개</option>
								<option value={10}>10개</option>
								<option value={20}>20개</option>
							</select>
						</div>
					</div>
				)}

				{loading ? (
					<div className={styles.noResult}>
						<Loading />
					</div>
				) : error ? (
					<div className={styles.noResult}>
						<span>오류가 발생했습니다. 잠시 후 다시 시도해주세요.</span>
					</div>
				) : !result || result.total === 0 ? (
					<div className={styles.noResult}>
						<span>
							{query ? "검색 결과가 없습니다." : "검색어를 입력해보세요!"}
						</span>
					</div>
				) : (
					<>
						<div className={styles.resultCount}>총 {result.total}개 결과</div>
						{viewMode === "list" ? (
							<div className={styles.listContainer}>
								{pageItems.map((item) => (
									<SearchNewListItem
										key={item.event.id}
										item={item}
										onClick={openDetail}
										onLoginPrompt={() => setIsLoginModalOpen(true)}
									/>
								))}
							</div>
						) : (
							<div className={styles.gridContainer}>
								{pageItems.map((item) => (
									<SearchGridItem
										key={item.event.id}
										item={item}
										onClick={openDetail}
										onLoginPrompt={() => setIsLoginModalOpen(true)}
									/>
								))}
							</div>
						)}
						{totalPages > 1 && (
							<Pagination
								page={safePage}
								totalPages={totalPages}
								currentGroupStart={currentGroupStart}
								currentGroupEnd={currentGroupEnd}
								onPrev={() => handlePageChange(currentGroupStart - 1)}
								onNext={() => handlePageChange(currentGroupEnd + 1)}
								handlePageChange={handlePageChange}
								getPageNumbers={getPageNumbers}
							/>
						)}
					</>
				)}
			</div>

			{showDetail && clickedEventId !== undefined && (
				<div
					className={styles.sidePanel}
					ref={sidePanelRef}
					style={sidePanelStyle}
				>
					{!isMobile && (
						<SidePanelResizeHandle onMouseDown={handleResizeStart} />
					)}
					<DetailView eventId={clickedEventId} />
				</div>
			)}

			<FilterSheet />
			<BottomNav />
		</div>
	);
};

export default SearchView;
