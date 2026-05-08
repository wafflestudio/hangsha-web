import type React from "react";
import { useCallback, useMemo } from "react";
import {
	eachDayOfInterval,
	endOfMonth,
	endOfWeek,
	isSameDay,
	isSameMonth,
	startOfMonth,
	startOfWeek,
} from "date-fns";
import {
	type DateLocalizer,
	type NavigateAction,
	Views,
	type ViewStatic,
} from "react-big-calendar";
import { useEvents } from "@/contexts/EventContext";
import calendarEventMapper from "@calendarUtil/calendarEventMapper";
import { formatDateToYYYYMMDD } from "@calendarUtil/dateFormatter";
import type { CalendarEvent, Event } from "@/util/types";
import styles from "@styles/CustomMonthView.module.css";
import MonthEvent from "./MonthEvent";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const MAX_VISIBLE_EVENTS = 3;

const isPeriod = (ev: Event) =>
	ev.isPeriodEvent || (!ev.eventStart && !ev.eventEnd);

// Server places an event on a day when EITHER [applyStart, applyEnd] OR
// [eventStart, eventEnd] covers it. For the month grid we only want the
// range that matches each event's render style: applyStart..applyEnd for
// period (arrow), eventStart..eventEnd for block.
const eventOnDay = (ev: Event, d: Date) => {
	const ce = calendarEventMapper(ev, Views.MONTH) as CalendarEvent;
	if (!ce.start || !ce.end) return false;
	const dayKey = formatDateToYYYYMMDD(d);
	return (
		dayKey >= formatDateToYYYYMMDD(ce.start) &&
		dayKey <= formatDateToYYYYMMDD(ce.end)
	);
};

interface Props {
	date: Date;
	localizer: DateLocalizer;
	onSelectEvent?: (event: CalendarEvent) => void;
	onDrillDown?: (date: Date, view?: string) => void;
}

function CustomMonthView({ date, onSelectEvent, onDrillDown }: Props) {
	const { monthViewData } = useEvents();
	const today = useMemo(() => new Date(), []);

	const weeks = useMemo(() => {
		const start = startOfWeek(startOfMonth(date), { weekStartsOn: 0 });
		const end = endOfWeek(endOfMonth(date), { weekStartsOn: 0 });
		const days = eachDayOfInterval({ start, end });
		const out: Date[][] = [];
		for (let i = 0; i < days.length; i += 7) out.push(days.slice(i, i + 7));
		return out;
	}, [date]);

	const byDate = monthViewData?.byDate ?? {};

	const handleDateClick = useCallback(
		(d: Date) => {
			onDrillDown?.(d, Views.MONTH);
		},
		[onDrillDown],
	);

	const handleEventClick = useCallback(
		(e: React.MouseEvent, ce: CalendarEvent) => {
			e.stopPropagation();
			onSelectEvent?.(ce);
		},
		[onSelectEvent],
	);

	return (
		<div className={styles.monthView}>
			<div className={styles.weekdayHeader}>
				{WEEKDAYS.map((label) => (
					<div key={label} className={styles.weekdayLabel}>
						{label}
					</div>
				))}
			</div>
			{weeks.map((week) => {
				// Week-local span info for each ArrowEvent: first/last cell index
				// in this week where the event appears in the bucket. Used to
				// flow the title across cells and place heads at the correct cell.
				const arrowSpans = new Map<
					number,
					{ startCellIdx: number; endCellIdx: number }
				>();
				for (let i = 0; i < week.length; i++) {
					const dk = formatDateToYYYYMMDD(week[i]);
					for (const ev of byDate[dk]?.events ?? []) {
						if (!isPeriod(ev)) continue;
						if (!eventOnDay(ev, week[i])) continue;
						const existing = arrowSpans.get(ev.id);
						if (existing) existing.endCellIdx = i;
						else arrowSpans.set(ev.id, { startCellIdx: i, endCellIdx: i });
					}
				}

				return (
					<div key={week[0].toISOString()} className={styles.weekRow}>
						{week.map((d, cellIdx) => {
							const offRange = !isSameMonth(d, date);
							const isToday = isSameDay(d, today);
							const isSunday = d.getDay() === 0;
							const dateKey = formatDateToYYYYMMDD(d);
							const cellEvents: Event[] = (
								byDate[dateKey]?.events ?? []
							).filter((ev) => eventOnDay(ev, d));
							const visible = cellEvents.slice(0, MAX_VISIBLE_EVENTS);
							const overflow = cellEvents.length - visible.length;

							const dateLabelClass = [
								styles.dateLabel,
								isSunday && styles.sunday,
								offRange && styles.offRangeDate,
								isToday && styles.today,
							]
								.filter(Boolean)
								.join(" ");

							return (
								<div
									key={d.toISOString()}
									className={`${styles.dayCell} ${offRange ? styles.offRange : ""}`}
								>
									<button
										type="button"
										className={dateLabelClass}
										onClick={() => handleDateClick(d)}
									>
										{d.getDate()}
									</button>
									<div className={styles.eventList}>
										{visible.map((ev) => {
											const ce = calendarEventMapper(
												ev,
												Views.MONTH,
											) as CalendarEvent;
											let arrowProps = {};
											if (isPeriod(ev)) {
												const span = arrowSpans.get(ev.id);
												const startCellIdx = span?.startCellIdx ?? cellIdx;
												const endCellIdx = span?.endCellIdx ?? cellIdx;
												arrowProps = {
													isPeriodStart: isSameDay(d, ev.applyStart),
													isPeriodEnd: isSameDay(d, ev.applyEnd),
													spanOffset: cellIdx - startCellIdx,
													spanTotal: endCellIdx - startCellIdx + 1,
												};
											}
											return (
												<button
													type="button"
													key={ev.id}
													className={styles.eventChip}
													onClick={(e) => handleEventClick(e, ce)}
												>
													<MonthEvent event={ce} {...arrowProps} />
												</button>
											);
										})}
									{overflow > 0 && (
										<button
											type="button"
											className={styles.showMore}
											onClick={() => handleDateClick(d)}
										>
											+{overflow}
										</button>
									)}
								</div>
							</div>
						);
					})}
				</div>
				);
			})}
		</div>
	);
}

type ViewOptions = { localizer: DateLocalizer; culture?: string };

CustomMonthView.range = (date: Date, _: ViewOptions) => {
	const start = startOfWeek(startOfMonth(date), { weekStartsOn: 0 });
	const end = endOfWeek(endOfMonth(date), { weekStartsOn: 0 });
	return { start, end };
};

CustomMonthView.navigate = (
	date: Date,
	action: NavigateAction,
	{ localizer }: ViewOptions,
) => {
	switch (action) {
		case "PREV":
			return localizer.add(date, -1, "month");
		case "NEXT":
			return localizer.add(date, 1, "month");
		default:
			return date;
	}
};

CustomMonthView.title = (date: Date, { localizer }: ViewOptions) => {
	return localizer.format(date, "monthHeaderFormat");
};

export default CustomMonthView as unknown as React.ComponentType<Props> &
	ViewStatic;
