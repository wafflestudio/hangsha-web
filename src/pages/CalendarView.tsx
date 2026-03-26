import { useEffect, useRef, useState } from "react";
import { Views } from "react-big-calendar";
import { useEvents } from "@contexts/EventContext";
import { useFilter } from "@contexts/FilterContext";
import styles from "@styles/CalendarView.module.css";
import type {
	CalendarEvent,
	FetchDayEventArgs,
	FetchMonthEventArgs,
	FetchWeekEventArgs,
} from "@types";
import DetailView from "@/widgets/DetailView";
import MonthSideView from "@widgets/Month/MonthSideView/MonthSideView";
import { MyCalendar } from "@widgets/MyCalendar";
import { Sidebar } from "@widgets/Sidebar";
import { useDetail } from "@contexts/DetailContext";
import { formatDateToYYYYMMDD } from "@calendarUtil/dateFormatter";
import { useUserData } from "@/contexts/UserDataContext";

const CalendarView = () => {
	const {
		monthViewData,
		fetchMonthEvents,
		weekViewData,
		fetchWeekEvents,
		dayViewEvents,
		fetchDayEvents,
		dayDate,
	} = useEvents();
	const { globalCategory, globalOrg, globalStatus } = useFilter();
	// detail 보이는 뷰 조정
	const { showDetail, setShowDetail, clickedEventId, setClickedEventId } =
		useDetail();
	const { excludedKeywords, interestCategories } = useUserData();

	// 현재 기준점이 되는 날짜
	const [currentDate, setCurrentDate] = useState<Date>(new Date());

	// 월별 뷰 - 날짜 사이드 뷰
	const [showSideMonth, setShowSideMonth] = useState<boolean>(false);
	const [clickedDate, setClickedDate] = useState<Date>(new Date());

	// need to get month data from sidebar
	// const MONTH_EVENTS = Object.values(monthViewData?.byDate || {}).flatMap(
	// 	(bucket) => bucket.preview,
	// );
	const rawMonthEvents = Object.values(monthViewData?.byDate || {}).flatMap(
		(bucket) => bucket.events,
	);
	const MONTH_EVENTS = Array.from(
		new Map(rawMonthEvents.map((event) => [event.id, event])).values(),
	);

	const rawWEEKEVENTS = Object.values(weekViewData?.byDate || {}).flatMap(
		(bucket) => bucket.events,
	);

	const WEEK_EVENTS = Array.from(
		new Map(rawWEEKEVENTS.map((event) => [event.id, event])).values(),
	);

	// Day context data doesn't need additional transformation; it is returned as Event[]
	useEffect(() => {
		setCurrentDate(dayDate);
	}, [dayDate]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: excludedKeywords and interestCategories change server data although not explicitly used in FE
	useEffect(() => {
		const loadMonthEvents = async () => {
			const paramMonth: FetchMonthEventArgs = {
				start: currentDate,
			};
			if (globalCategory)
				paramMonth.eventTypeId = globalCategory.map((g) => g.id);
			if (globalOrg) paramMonth.orgId = globalOrg.map((g) => g.id);
			if (globalStatus) paramMonth.statusId = globalStatus.map((g) => g.id);

			console.log("paramMonth", paramMonth);
			await fetchMonthEvents(paramMonth);
		};
		loadMonthEvents();
	}, [
		currentDate,
		fetchMonthEvents,
		globalCategory,
		globalOrg,
		globalStatus,
		excludedKeywords,
		interestCategories,
	]);

	useEffect(() => {
		const getWeekRangeByDate = (date: Date) => {
			const from = new Date(date);
			const day = from.getDay();
			from.setDate(from.getDate() - day);

			const to = new Date(from);
			to.setDate(to.getDate() + 6);

			return {
				from: formatDateToYYYYMMDD(from),
				to: formatDateToYYYYMMDD(to),
			};
		};
		const loadWeekEvents = async () => {
			const { from, to } = getWeekRangeByDate(currentDate);
			const paramWeek: FetchWeekEventArgs = {
				from: from,
				to: to,
			};

			if (globalCategory)
				paramWeek.eventTypeId = globalCategory.map((g) => g.id);
			if (globalOrg) paramWeek.orgId = globalOrg.map((g) => g.id);
			if (globalStatus) paramWeek.statusId = globalStatus.map((g) => g.id);

			console.log("paramWeek", paramWeek);
			await fetchWeekEvents(paramWeek);
		};
		loadWeekEvents();
	}, [currentDate, fetchWeekEvents, globalCategory, globalOrg, globalStatus]);

	useEffect(() => {
		const loadDayEvents = async () => {
			const paramDay: FetchDayEventArgs = {
				date: currentDate,
			};

			if (globalCategory)
				paramDay.eventTypeId = globalCategory.map((g) => g.id);
			if (globalOrg) paramDay.orgId = globalOrg.map((g) => g.id);
			if (globalStatus) paramDay.statusId = globalStatus.map((g) => g.id);

			await fetchDayEvents(paramDay);
		};
		loadDayEvents();
	}, [currentDate, fetchDayEvents, globalCategory, globalOrg, globalStatus]);

	// click handler
	const onShowMoreClick = (date: Date, view: string) => {
		// showSideMonth on, showDetailView off
		if (view === Views.MONTH) {
			setShowSideMonth(true);
		}
		setShowDetail(false);
		setClickedDate(date);
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
			<div className={styles.sidebarContainer}>
				<Sidebar />
			</div>
			<div className={styles.calendarContainer}>
				<div className={styles.calendarWrapper}>
					<MyCalendar
						monthEvents={MONTH_EVENTS}
						weekEvents={WEEK_EVENTS}
						dayEvents={dayViewEvents}
						onShowMoreClick={onShowMoreClick}
						onSelectEvent={onSelectEvent}
					/>
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
		</div>
	);
};

export default CalendarView;
