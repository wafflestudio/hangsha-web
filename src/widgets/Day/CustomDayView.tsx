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

	const minTime = useMemo(() => {
		return new Date(
			date.getFullYear(),
			date.getMonth(),
			date.getDate(),
			7,
			0,
			0,
		);
	}, [date]);

	const maxTime = useMemo(() => {
		return new Date(
			date.getFullYear(),
			date.getMonth(),
			date.getDate(),
			23,
			59,
			59,
		);
	}, [date]);

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
				/>
			)}
			{dayViewMode === "List" && (
				<Table
					theadData={["찜", "제목", "D-day", "카테고리", "날짜", "주체기관"]}
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
