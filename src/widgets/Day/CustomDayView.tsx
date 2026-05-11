import { useMemo } from "react";
import {
	Navigate,
	type NavigateAction,
	type DateLocalizer,
} from "react-big-calendar";
import TimeGrid from "react-big-calendar/lib/TimeGrid";
import styles from "@styles/DayView.module.css";
import { useDayView } from "@contexts/DayViewContext";
import Table from "./Table";
import type { CalendarEvent } from "@types";
import GalleryView from "./Gallery/GalleryView";

interface CustomDayViewProps {
	date: Date;
	localizer: DateLocalizer;
	events: CalendarEvent[];
	[key: string]: unknown;
}

const CustomDayView = ({
	date,
	localizer,
	events,
	...props
}: CustomDayViewProps) => {
	const { dayViewMode } = useDayView();

	const range = useMemo(() => {
		return CustomDayView.range(date);
	}, [date]);

	const { minTime, maxTime } = useMemo(() => {
		const dayStart = new Date(
			date.getFullYear(),
			date.getMonth(),
			date.getDate(),
			0,
			0,
			0,
		);
		const dayEnd = new Date(
			date.getFullYear(),
			date.getMonth(),
			date.getDate(),
			23,
			59,
			59,
		);

		const timedOnDay = events.filter(
			(e) => !e.allDay && e.end > dayStart && e.start < dayEnd,
		);

		const defaultMin = new Date(
			date.getFullYear(),
			date.getMonth(),
			date.getDate(),
			7,
			0,
			0,
		);

		if (timedOnDay.length === 0) {
			return { minTime: defaultMin, maxTime: dayEnd };
		}

		const earliestMs = Math.min(
			...timedOnDay.map((e) => Math.max(e.start.getTime(), dayStart.getTime())),
		);
		const latestMs = Math.max(
			...timedOnDay.map((e) => Math.min(e.end.getTime(), dayEnd.getTime())),
		);

		const earliest = new Date(earliestMs);
		const latest = new Date(latestMs);

		const minHour = Math.max(earliest.getHours() - 2, 7);
		const minTime = new Date(
			date.getFullYear(),
			date.getMonth(),
			date.getDate(),
			minHour,
			0,
			0,
		);

		const maxHour = Math.min(
			latest.getMinutes() === 0 && latest.getSeconds() === 0
				? latest.getHours() + 2 // 1 padding by default
				: latest.getHours() + 3
			, 23);
		
			
		const maxTime =
			maxHour >= 24
				? dayEnd
				: new Date(
						date.getFullYear(),
						date.getMonth(),
						date.getDate(),
						maxHour,
						0,
						0,
					);

		return { minTime, maxTime };
	}, [date, events]);

	return (
		<div className={styles.dayViewWrapper}>
			{dayViewMode === "Calendar" && (
				<TimeGrid
					date={date}
					localizer={localizer}
					range={range}
					events={events}
					eventOffset={15}
					step={30}
					timeslots={2}
					min={minTime}
					max={maxTime}
					{...props}
					dayLayoutAlgorithm="no-overlap"
				/>
			)}
			{dayViewMode === "List" && (
				<Table
					theadData={["찜", "제목", "D-day", "카테고리", "행사 날짜", "지원 기간", "주최기관"]}
					tbodyData={events}
				/>
			)}
			{dayViewMode === "Grid" && <GalleryView events={events} />}
		</div>
	);
};

CustomDayView.range = (date: Date): Date[] => {
	return [date];
};

CustomDayView.navigate = (date: Date, action: NavigateAction) => {
	switch (action) {
		case Navigate.PREVIOUS:
			return new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
		case Navigate.NEXT:
			return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
		default:
			return date;
	}
};

CustomDayView.title = (date: Date) => {
	return date.toLocaleDateString("ko-KR", {
		year: "numeric",
		month: "long",
		day: "numeric",
		weekday: "short",
	});
};

export default CustomDayView;
