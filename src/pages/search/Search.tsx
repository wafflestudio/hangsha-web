import { useEffect, useMemo, useRef, useState } from "react";
import SearchToolbar from "./SearchToolbar";
import { Sidebar } from "@/components/layout/filterSideBar/FilterSidebar";
import GalleryView from "@/calendar_widgets/day/gallery/GalleryView";
import type { CalendarEvent, Event } from "@/util/types";
import Table from "@/calendar_widgets/day/table";
import styles from "./Search.module.css";
import DetailView from "@/components/layout/sidePannel/DetailView";
import Pagination from "@/components/ui/Pagination";
import Loading from "@/components/ui/Loading";
import { Views } from "react-big-calendar";
import calendarEventMapper from "@/util/Calendar/calendarEventMapper";
import BottomNav from "@/components/layout/BottomNav";
import { FilterSheet } from "@/components/layout/filterSheet/FilterSheet";

import { useSearch } from "@/contexts/SearchContext";
import { useDetail } from "@/contexts/DetailContext";
import {
	SidePanelResizeHandle,
	useResizableSidePanel,
} from "@/components/layout/sidePannel/SidePanelResize";

const SearchView = () => {
	const {
		query,
		page,
		size,
		setPage,
		setSize,
		fetchSearchResult,
		emptySearchResults,
		searchResults,
		searchLoading,
	} = useSearch();
	const { showDetail, setShowDetail, clickedEventId } = useDetail();
	const [viewMode, setViewMode] = useState<"List" | "Grid">("Grid");
	const { isMobile, handleResizeStart, sidePanelStyle } =
		useResizableSidePanel();

	const sidePanelRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (!sidePanelRef.current) return;
			const isInside = sidePanelRef.current.contains(event.target as Node);
			if (!isInside) {
				setShowDetail(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [setShowDetail]);

	useEffect(() => {
		const fetchData = async () => {
			if (query.trim()) {
				await fetchSearchResult(query, page, size);
			} else {
				// 빈 검색어로 들어오면 이전 검색 결과를 비움
				emptySearchResults();
			}
		};
		fetchData();
	}, [fetchSearchResult, emptySearchResults, query, page, size]);

	useEffect(() => {
		const mq = window.matchMedia("(max-width: 576px)");
		const apply = () => {
			if (mq.matches) setViewMode("Grid");
		};
		apply();
		mq.addEventListener("change", apply);
		return () => mq.removeEventListener("change", apply);
	}, []);

	const events: CalendarEvent[] = useMemo(() => {
		if (!searchResults) return [];

		return searchResults.items.map((e: Event) =>
			calendarEventMapper(e, Views.DAY),
		);
	}, [searchResults]);

	/* pagination logic */
	const totalPages = searchResults ? Math.ceil(searchResults.total / size) : 0;
	const PAGE_GROUP_SIZE = 5;
	const currentGroupStart =
		Math.floor((page - 1) / PAGE_GROUP_SIZE) * PAGE_GROUP_SIZE + 1;
	const currentGroupEnd = Math.min(
		totalPages,
		currentGroupStart + PAGE_GROUP_SIZE - 1,
	);

	const getPageNumbers = () => {
		const pageNumbers = [];
		for (let i = currentGroupStart; i <= currentGroupEnd; i++) {
			pageNumbers.push(i);
		}
		return pageNumbers;
	};
	const handlePageChange = (newPage: number) => {
		if (newPage >= 1 && newPage <= totalPages) {
			setPage(newPage);
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	};
	const handlePrevGroup = () => {
		const newPage = currentGroupStart - 1;
		if (newPage >= 1) handlePageChange(newPage);
	};

	const handleNextGroup = () => {
		const newPage = currentGroupEnd + 1;
		if (newPage <= totalPages) handlePageChange(newPage);
	};

	/* for pagination size */
	const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setSize(Number(e.target.value));
		setPage(1);
	};

	return (
		<div className={styles.container}>
			<Sidebar />
			<div className={styles.restContainer}>
				<SearchToolbar viewMode={viewMode} setViewMode={setViewMode} />
				<div className={styles.dropdownRow}>
					<div className={styles.sizeSelectContainer}>
						<span className={styles.sizeLabel}>표시 개수:</span>
						<select
							className={styles.sizeSelect}
							value={size}
							onChange={handleSizeChange}
						>
							{/* <option value={1}>1개</option> */}
							<option value={5}>5개</option>
							<option value={10}>10개</option>
							<option value={20}>20개</option>
						</select>
					</div>
				</div>
				{!searchResults || searchResults.total === 0 ? (
					<div className={styles.noResult}>
						<span>
							{searchLoading ? (
								<Loading />
							) : query ? (
								"검색 결과가 없습니다."
							) : (
								"검색어를 입력해보세요!"
							)}
						</span>
					</div>
				) : viewMode === "List" ? (
					<Table
						theadData={["찜", "제목", "D-day", "카테고리", "날짜", "주최기관"]}
						tbodyData={events}
					/>
				) : (
					viewMode === "Grid" && <GalleryView events={events} />
				)}
				{searchResults && searchResults.total > 0 && (
					<Pagination
						page={page}
						currentGroupStart={currentGroupStart}
						currentGroupEnd={currentGroupEnd}
						onPrev={handlePrevGroup}
						onNext={handleNextGroup}
						handlePageChange={handlePageChange}
						totalPages={totalPages}
						getPageNumbers={getPageNumbers}
					/>
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
