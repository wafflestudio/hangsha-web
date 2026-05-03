import { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, type View, Views } from "react-big-calendar";
import styles from "@styles/Calendar.module.css";
import { localizer } from "@calendarUtil/calendarLocalizer";
import type { CalendarEvent, Event } from "@types";
import Toolbar from "./Toolbar";
import MonthEvent from "./Month/MonthEvent";
import DayEvent from "./Day/DayEvent";
import CustomDayView from "./Day/CustomDayView";
import CustomWeekView from "./Week/CustomWeekView";
import { useEvents } from "@/contexts/EventContext";
import calendarEventMapper from "@/util/Calendar/calendarEventMapper";

const eventPropGetter = () => {
	return {
		className: styles.resetEventStyle, // CSS 모듈로 기본 스타일 제거
	};
};

interface MyCalendarProps {
	monthEvents: Event[];
	weekEvents: Event[];
	dayEvents: Event[];
	onShowMoreClick: (date: Date, view: string) => void;
	onSelectEvent: (event: CalendarEvent) => void;
}

export const MyCalendar = ({
	monthEvents,
	weekEvents,
	dayEvents,
	onShowMoreClick,
	onSelectEvent,
}: MyCalendarProps) => {
	const { dayDate, setDayDate } = useEvents();
	const [currentView, setCurrentView] = useState<View>(Views.MONTH);
	const [isMobile, setIsMobile] = useState(false);

	const onNavigate = useCallback(
		(newDate: Date) => {
			setDayDate(newDate);
		},
		[setDayDate],
	);

	/** Event Mapping */
	const currentEvents = useMemo(() => {
		switch (currentView) {
			case Views.MONTH:
				return monthEvents;
			case Views.WEEK:
				return weekEvents;
			case Views.DAY:
				return dayEvents;
			default:
				return monthEvents;
		}
	}, [currentView, monthEvents, weekEvents, dayEvents]);

	const CALENDER_EVENTS = useMemo(() => {
		return currentEvents.map((e: Event) => calendarEventMapper(e, currentView));
	}, [currentEvents, currentView]);

	/** Calendar format */
	const formats = useMemo(
		() => ({
			monthHeaderFormat: "yyyy년 M월",
			dayHeaderFormat: "M월 d일 EEE",
			weekdayFormat: (date: Date) => {
				const days = ["일", "월", "화", "수", "목", "금", "토"];
				return days[date.getDay()];
			},
			dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) => {
				const startDate = start.toLocaleDateString("ko-KR", {
					month: "long",
					day: "numeric",
				});
				const endDate = end.toLocaleDateString("ko-KR", {
					month: "long",
					day: "numeric",
				});
				return `${startDate} – ${endDate}`;
			},
			timeGutterFormat: "h a",
			eventTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) => {
				return `${start.toLocaleTimeString("ko-KR", {
					hour: "numeric",
					minute: "2-digit",
				})} – ${end.toLocaleTimeString("ko-KR", {
					hour: "numeric",
					minute: "2-digit",
				})}`;
			},
		}),
		[],
	);

	/** '더 보기' 문구에 표시되지 않은 행사 수를 어떻게 표시할지 포맷 */
	const messages = useMemo(
		() => ({
			showMore: (total: number) => `+${total}`,
		}),
		[],
	);

	/** 모바일 환경인지 검증
	 * -> 모바일이면 개별 행사 선택 불가 : onSelectEvent prop에 onDrillDown과 같은 동작 하도록 전달
	 * (개별 행사 선택 = 날짜 선택 = 해당 날짜 행사 목록 보여주는 MonthSideview 렌더링)
	 */
	useEffect(() => {
		const checkIsMobile = () => {
			setIsMobile(window.innerWidth <= 576);
		};
		
		checkIsMobile();
		window.addEventListener("resize", checkIsMobile);

		return () => {
			window.removeEventListener("resize", checkIsMobile);
		}
	}, []);

	/** 날짜 클릭 핸들러 함수 - onDrillDown */
	const handleDrillDown = useCallback(
		(date: Date) => {
			onShowMoreClick(date, Views.MONTH);
		},[onShowMoreClick],);

	const handleSelectEvent = useCallback(
		(event: CalendarEvent) => {
			if (isMobile) {
				handleDrillDown(event.start);
				return;
			}
			onSelectEvent(event);
		}, [isMobile, handleDrillDown, onSelectEvent]);
		
	return (
		<div className={styles.main}>
			<Calendar
				localizer={localizer}
				events={CALENDER_EVENTS}
				startAccessor="start"
				endAccessor="end"
				style={{ height: "100%" }}
				// custom toolbar
				components={{
					toolbar: Toolbar,
					// event: MonthEvent,
					month: {
						event: MonthEvent,
					},
					day: {
						event: DayEvent,
					},
				}}
				// style function
				eventPropGetter={eventPropGetter}
				date={dayDate}
				// view setup
				view={currentView}
				onView={(view) => setCurrentView(view)}
				views={{
					month: true,
					week: CustomWeekView,
					day: CustomDayView,
				}}
				onNavigate={onNavigate}
				defaultView={Views.MONTH}
				// 한국어 형식
				formats={formats}
				// 더보기 눌렀을 때 popup 나타나기 X, 사이드뷰 나타남
				popup={false}
				onDrillDown={handleDrillDown}
				// 더보기 미리보기
				messages={messages}
				// 행사 눌렀을 때 상세 뷰 나타나게 하기 :
				onSelectEvent={handleSelectEvent}
			/>
		</div>
	);
};
