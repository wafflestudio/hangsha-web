import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Views } from "react-big-calendar";
import styles from "./CalendarView.module.css";
import type { CalendarEvent, Event, Semester } from "@types";
import DetailView from "@/components/layout/sidePannel/DetailView";
import EventCardView from "@/components/layout/sidePannel/EventCardView";
import { MyCalendar } from "@/calendar_widgets/MyCalendar";
import { Sidebar } from "@/components/layout/filterSideBar/FilterSidebar";
import {
	SidePanelResizeHandle,
	useResizableSidePanel,
} from "@/components/layout/sidePannel/SidePanelResize";

import { useDetail } from "@contexts/DetailContext";
import { useEvents } from "@contexts/EventContext";
import { useFilter } from "@contexts/FilterContext";
import { useUserData } from "@/contexts/UserDataContext";
import BottomNav from "@/components/layout/BottomNav";
import { FilterSheet } from "@/components/layout/filterSheet/FilterSheet";
import MainRouteTutorial from "@/components/tutorial/MainRouteTutorial";
import {
	useMonthEvents,
	useWeekEvents,
	useDayEvents,
} from "@/contexts/useCalendarEvents";
import { useTimetable } from "@/contexts/TimetableContext";
import { useMainPanelQuery } from "@/pages/calendar/hooks/useMainPanelQuery";
import { useCalendarViewQuery } from "@/pages/calendar/hooks/useCalendarViewQuery";
import { formatDateToYYYYMMDD } from "@/util/calendar/dateFormatter";

const getSemesterByDate = (date: Date): Semester => {
	const month = date.getMonth() + 1;

	if (month >= 3 && month <= 6) return "SPRING";
	if (month >= 7 && month <= 8) return "SUMMER";
	if (month >= 9 && month <= 12) return "FALL";
	return "WINTER";
};

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
	const { showDetail, clickedEventId, openDetail } = useDetail();
	const {
		search: panelSearch,
		showEventList,
		eventListDate,
		openEventList,
		closePanel,
	} = useMainPanelQuery();
	const { calendarView, setCalendarView } = useCalendarViewQuery();
	const { excludedKeywords, interestCategories } = useUserData();
	const { initializeDefaultOverlay } = useTimetable();

	// 현재 기준점이 되는 날짜
	const [currentDate, setCurrentDate] = useState<Date>(new Date());

	/** ----------------------  FETCH MONTH / WEEK / DAY data -------------------- */

	const navigate = useNavigate();

	const filters = useMemo(
		() => ({
			eventTypeId: globalCategory?.map((g) => g.id),
			orgId: globalOrg?.map((g) => g.id),
			statusId: globalStatus?.map((g) => g.id),
		}),
		[globalCategory, globalOrg, globalStatus],
	);

	const { data: monthViewData } = useMonthEvents(
		currentDate,
		filters,
		excludedKeywords,
		interestCategories,
	);
	const { data: weekViewData } = useWeekEvents(
		currentDate,
		filters,
		excludedKeywords,
		interestCategories,
	);
	const { data: dayViewEvents = [] } = useDayEvents(
		currentDate,
		filters,
		excludedKeywords,
		interestCategories,
	);


	useEffect(() => {
		const today = new Date();
		void initializeDefaultOverlay(
			today.getFullYear(),
			getSemesterByDate(today),
		);
	}, [initializeDefaultOverlay]);

	// Flatten byDate buckets in chronological key order : preserve each date bucket's internal sequence
	// 중복 시 첫 event만 keep : multi-day event sits at the position of its earliest bucket
	const flattenByDate = (
		byDate: Record<string, { events: Event[] }> | undefined,
	) => {
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
		// Open the event list and close detail panel
		if (view === Views.MONTH) {
			openEventList(date);
		}
		setDayDate(date);
	};
	const onSelectEvent = (event: CalendarEvent) => {
		// Open the selected event detail.
		openDetail(event.resource.event.id);
	};

	const handleCloseSideMonth = () => {
		closePanel();
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
		if (!isMobile) return;
		if (calendarView !== Views.DAY && !showEventList && !showDetail) return;

		let nextSearch = panelSearch;
		if (calendarView === Views.DAY && !showEventList && !showDetail) {
			const nextParams = new URLSearchParams(panelSearch);
			nextParams.set("panel", "events");
			nextParams.set("date", formatDateToYYYYMMDD(dayDate));
			nextParams.delete("eventId");
			nextSearch = nextParams.toString();
		}

		navigate(
			{
				pathname: "/main/day",
				search: nextSearch ? `?${nextSearch}` : "",
			},
			{ replace: true },
		);
	}, [
		isMobile,
		calendarView,
		showEventList,
		showDetail,
		panelSearch,
		dayDate,
		navigate,
	]);

	// clicking outside of sideview (that is not event or anything else) created
	const sidePanelRef = useRef<HTMLDivElement>(null);

	// shared width for both MonthSideView and DetailView panels
	const { handleResizeStart, sidePanelStyle } = useResizableSidePanel();

	// detect outside clicks
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (!sidePanelRef.current) return;

			// Check if click target is inside the side panel
			const isInside = sidePanelRef.current.contains(event.target as Node);
			// If clicked OUTSIDE, close both panels
			if (!isInside) {
				closePanel();
			}
		}
		document.addEventListener("mousedown", handleClickOutside);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [closePanel]);

	return (
		<div className={styles.container}>
			<Sidebar />
			<div className={styles.calendarContainer}>
				<div className={styles.calendarWrapper}>
					{isMobile ? (
							<MyCalendar
								monthEvents={MONTH_EVENTS}
								weekEvents={WEEK_EVENTS}
								dayEvents={dayViewEvents}
								view={calendarView}
								onShowMoreClick={onShowMoreClick}
								onSelectEvent={onSelectEvent}
								onViewChange={setCalendarView}
							/>
					) : (
						<MyCalendar
							monthEvents={MONTH_EVENTS}
							weekEvents={WEEK_EVENTS}
							dayEvents={dayViewEvents}
							view={calendarView}
							onShowMoreClick={onShowMoreClick}
							onSelectEvent={onSelectEvent}
							onViewChange={setCalendarView}
						/>
					)}
				</div>
				{showEventList && eventListDate && (
					<div
						className={styles.sidePanel}
						ref={sidePanelRef}
						style={sidePanelStyle}
					>
						{!isMobile && (
							<SidePanelResizeHandle onMouseDown={handleResizeStart} />
						)}
						<EventCardView
							day={eventListDate}
							onClose={handleCloseSideMonth}
							onDateChange={openEventList}
						/>
					</div>
				)}

				{showDetail && clickedEventId !== undefined && (
					<div
						className={`${styles.sidePanel} ${styles.detailPanel}`}
						ref={sidePanelRef}
						style={sidePanelStyle}
					>
						{!isMobile && (
							<SidePanelResizeHandle onMouseDown={handleResizeStart} />
						)}
						<DetailView eventId={clickedEventId} />
					</div>
				)}
			</div>
			<FilterSheet />
			<BottomNav />
			<MainRouteTutorial
				isDayView={calendarView === Views.DAY}
				isWeekView={calendarView === Views.WEEK}
			/>
		</div>
	);
};

export default CalendarView;
