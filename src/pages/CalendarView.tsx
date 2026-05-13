import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Views, type View } from "react-big-calendar";
import { useQueryClient } from "@tanstack/react-query";
import PullToRefresh from "react-simple-pull-to-refresh";
import styles from "@styles/CalendarView.module.css";
import type {
	CalendarEvent,
	Event,
} from "@types";
import DetailView from "@/widgets/DetailView";
import MonthSideView from "@widgets/Month/MonthSideView/MonthSideView";
import { MyCalendar } from "@widgets/MyCalendar";
import { Sidebar } from "@widgets/Sidebar";

import { useDetail } from "@contexts/DetailContext";
import { useEvents } from "@contexts/EventContext";
import { useFilter } from "@contexts/FilterContext";
import { useUserData } from "@/contexts/UserDataContext";
import BottomNav from "@/widgets/BottomNav";
import { FilterSheet } from "@/widgets/FilterSheet/FilterSheet";
import { useMonthEvents, useWeekEvents, useDayEvents } from "@/contexts/useCalendarEvents";

const CalendarView = () => {
	// EventContext
	const {
		// monthViewData,
		// weekViewData,
		// dayViewEvents,
		dayDate,
		setDayDate,
	} = useEvents();

	const { globalCategory, globalOrg, globalStatus } = useFilter();
	// detail 보이는 뷰 조정
	const { showDetail, setShowDetail, clickedEventId, setClickedEventId } =
		useDetail();
	const { excludedKeywords, interestCategories } = useUserData();

	// 현재 기준점이 되는 날짜
	const [currentDate, setCurrentDate] = useState<Date>(new Date());

	// 캘린더 뷰 모드 추적 (월/주/일)
	const [currentView, setCurrentView] = useState<View>(Views.MONTH);

	// 월별 뷰 - 날짜 사이드 뷰
	const [showSideMonth, setShowSideMonth] = useState<boolean>(false);
	const [clickedDate, setClickedDate] = useState<Date>(new Date());

	/** ----------------------  FETCH MONTH / WEEK / DAY data -------------------- */ 

	const navigate = useNavigate();

	const filters = useMemo(
		() => ({
			eventTypeId: globalCategory?.map((g) => g.id),
			orgId: globalOrg?.map((g) => g.id),
			statusId: globalStatus?.map((g) => g.id),
		}), [globalCategory, globalOrg, globalStatus],
	)
	
	const { data: monthViewData } = useMonthEvents(currentDate, filters, excludedKeywords, interestCategories);
	const { data: weekViewData} = useWeekEvents(currentDate, filters, excludedKeywords, interestCategories);
	const { data: dayViewEvents = [] } = useDayEvents(currentDate, filters, excludedKeywords, interestCategories);

	const queryClient = useQueryClient();
	const handleRefresh = async () => {
		await Promise.all([
			queryClient.invalidateQueries({ queryKey: ["monthEvents"] }),
			queryClient.invalidateQueries({ queryKey: ["weekEvents"] }),
			queryClient.invalidateQueries({ queryKey: ["dayEvents"] }),
		]);
	};



	// Flatten byDate buckets in chronological key order : preserve each date bucket's internal sequence 
	// 중복 시 첫 event만 keep : multi-day event sits at the position of its earliest bucket
	const flattenByDate = (byDate: Record<string, { events: Event[] }> | undefined) => {
		const seen = new Map<number, Event>();
		const buckets = byDate ?? {};
		for (const dateKey of Object.keys(buckets).sort()) {
			for (const event of buckets[dateKey].events) {
				if (!seen.has(event.id)) seen.set(event.id, event);
			}
		}
		return Array.from(seen.values());
	};

	const MONTH_EVENTS = flattenByDate(monthViewData?.byDate);
	const WEEK_EVENTS = flattenByDate(weekViewData?.byDate);

	// Day context data doesn't need additional transformation; it is returned as Event[]
	useEffect(() => {
		setCurrentDate(dayDate);
	}, [dayDate]);


	// click handler
	const onShowMoreClick = (date: Date, view: string) => {
		// showSideMonth on, showDetailView off
		if (view === Views.MONTH) {
			setShowSideMonth(true);
		}
		setShowDetail(false);
		setClickedDate(date);
		setDayDate(date);
	};
	const onSelectEvent = (event: CalendarEvent) => {
		// showSideMonth off, showDetailView on
		setShowSideMonth(false);
		setShowDetail(true);
		setClickedEventId(event.resource.event.id);
	};

	const handleCloseSideMonth = () => {
		setShowSideMonth(false);
	};

	// 모바일 너비일 때 일별/사이드뷰/디테일뷰가 보이면 /main/day로 redirect
	const [isMobile, setIsMobile] = useState<boolean>(
		typeof window !== "undefined" && window.innerWidth <= 576,
	);
	useEffect(() => {
		const checkIsMobile = () => setIsMobile(window.innerWidth <= 576);
		window.addEventListener("resize", checkIsMobile);
		return () => window.removeEventListener("resize", checkIsMobile);
	}, []);
	useEffect(() => {
		if (
			isMobile &&
			(currentView === Views.DAY || showSideMonth || showDetail)
		) {
			navigate("/main/day");
		}
	}, [isMobile, currentView, showSideMonth, showDetail, navigate]);

	// clicking outside of sideview (that is not event or anything else) created
	const sidePanelRef = useRef<HTMLDivElement>(null);

	// detect outside clicks
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (!sidePanelRef.current) return;

			// Check if click target is inside the side panel
			const isInside = sidePanelRef.current.contains(event.target as Node);
			// If clicked OUTSIDE, close both panels
			if (!isInside) {
				setShowSideMonth(false);
				setShowDetail(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [setShowDetail]);

	return (
		<div className={styles.container}>
			<Sidebar />
			<div className={styles.calendarContainer}>
				<div className={styles.calendarWrapper}>
					{isMobile ? (
						<PullToRefresh onRefresh={handleRefresh} pullDownThreshold={70}>
							<MyCalendar
								monthEvents={MONTH_EVENTS}
								weekEvents={WEEK_EVENTS}
								dayEvents={dayViewEvents}
								onShowMoreClick={onShowMoreClick}
								onSelectEvent={onSelectEvent}
								onViewChange={setCurrentView}
							/>
						</PullToRefresh>
					) : (
						<MyCalendar
							monthEvents={MONTH_EVENTS}
							weekEvents={WEEK_EVENTS}
							dayEvents={dayViewEvents}
							onShowMoreClick={onShowMoreClick}
							onSelectEvent={onSelectEvent}
							onViewChange={setCurrentView}
						/>
					)}
				</div>
				{showSideMonth && (
					<div className={styles.sidePanel} ref={sidePanelRef}>
						<MonthSideView day={clickedDate} onClose={handleCloseSideMonth} />
					</div>
				)}

				{showDetail && clickedEventId !== undefined && (
					<div
						className={`${styles.sidePanel} ${styles.detailPanel}`}
						ref={sidePanelRef}
					>
						<DetailView eventId={clickedEventId} />
					</div>
				)}
			</div>
			<FilterSheet />
			<BottomNav />
		</div>
	);
};

export default CalendarView;
