import type React from "react";
import { useLayoutEffect, useRef, useState, useCallback, useMemo } from "react";
import type {
	DateLocalizer,
	NavigateAction,
	ViewStatic,
} from "react-big-calendar";

import type { Event, CalendarEvent } from "../../util/types";
import {
	config,
	flattenEventsToBlocks,
} from "../../util/weekly_timetable/layout";
import { WeekGrid } from "./WeekGrid";
import { PeriodBars } from "./PeriodBar";
import AllDayBar from "./AllDayBar";
import styles from "@styles/WeekView.module.css";

interface CustomWeekViewProps {
	date: Date;
	localizer: DateLocalizer;
	events: CalendarEvent[];
	onSelectEvent?: (event: CalendarEvent) => void;
	[key: string]: unknown;
}

type Rect = { left: number; width: number };

function useAnchorRect<T extends HTMLElement>(
	anchorRef: React.RefObject<T | null>,
) {
	const [rect, setRect] = useState<Rect>({ left: 0, width: 0 });

	useLayoutEffect(() => {
		const el = anchorRef.current;
		if (!el) return;

		const update = () => {
			const r = el.getBoundingClientRect();
			setRect({ left: r.left, width: r.width });
		};

		update();

		window.addEventListener("resize", update);
		window.addEventListener("scroll", update, { passive: true });

		const ro = new ResizeObserver(update);
		ro.observe(el);

		return () => {
			window.removeEventListener("resize", update);
			window.removeEventListener("scroll", update);
			ro.disconnect();
		};
	}, [anchorRef]);

	return rect;
}

function CustomWeekView({
	date,
	localizer,
	events,
	onSelectEvent,
}: CustomWeekViewProps) {
	const WEEK_EVENTS = useMemo(() => {
		const weekStart = new Date(date);
		weekStart.setHours(0, 0, 0, 0);
		weekStart.setDate(weekStart.getDate() - weekStart.getDay());

		const weekEnd = new Date(weekStart);
		weekEnd.setDate(weekEnd.getDate() + 6);
		weekEnd.setHours(23, 59, 59, 999);

		return events
			.filter((cevent: CalendarEvent) => {
				console.log("Filtering event:", cevent, cevent.start, cevent.end);
				const eventStart = cevent.start;
				const eventEnd = cevent.end;

				return eventStart <= weekEnd && eventEnd >= weekStart;
			})
			.map((cevent: CalendarEvent) => {
				let isAllDay = false;
				const sameMinute =
					Math.floor(cevent.start.getTime() / 60000) ===
					Math.floor(cevent.end.getTime() / 60000);

				if (cevent.start && cevent.end) {
					const startDay = new Date(
						cevent.start.getFullYear(),
						cevent.start.getMonth(),
						cevent.start.getDate(),
					);
					const endDay = new Date(
						cevent.end.getFullYear(),
						cevent.end.getMonth(),
						cevent.end.getDate(),
					);
					const differentDate = (startDay.getFullYear() !== endDay.getFullYear() 
						&& startDay.getMonth() !== endDay.getMonth() 
						&& startDay.getDate() !== endDay.getDate());
					
					isAllDay = Boolean(cevent.allDay) || differentDate || sameMinute;
				}

				return {
					...cevent,
					allDay: isAllDay,
				};
			});
	}, [events, date]);

	const { allDayCalendarEvents, timetableEvents, periodEvents } =
		useMemo(() => {
			const src = WEEK_EVENTS ?? [];
			const allDayCalendarEvents = src.filter(
				(ce) => ce?.allDay === true && ce.resource.isPeriodEvent === false,
			);
			const timetable = src.filter(
				(ce) =>
					ce?.resource?.event &&
					ce.resource.isPeriodEvent === false &&
					ce.allDay === false,
			);

			const period = src.filter(
				(
					ce,
				): ce is CalendarEvent & {
					resource: { event: Event; isPeriodEvent: true };
				} => Boolean(ce?.resource?.event) && ce.resource.isPeriodEvent === true,
			);
			return {
				allDayCalendarEvents,
				timetableEvents: timetable,
				periodEvents: period,
			};
		}, [WEEK_EVENTS]);

	const handleSelectBlock = useCallback(
		(calendarEventLike: CalendarEvent | Event) => {
			const raw = calendarEventLike as Event;
			const found = (events ?? []).find(
				(ce) => ce?.resource?.event?.id === raw.id,
			);

			if (found) {
				onSelectEvent?.(found);
				return;
			}

			const start = raw.eventStart || raw.applyStart;
			const end = raw.eventEnd || raw.applyEnd;

			onSelectEvent?.({
				start: new Date(start),
				end: new Date(end),
				title: raw.title,
				allDay: true,
				resource: { event: raw, isPeriodEvent: !raw.eventStart },
			} as unknown as CalendarEvent);
		},
		[events, onSelectEvent],
	);

	const gridRef = useRef<HTMLDivElement>(null);
	const { left, width } = useAnchorRect(gridRef);

	return (
		<div className={styles.weekView}>
			<AllDayBar
				date={date}
				localizer={localizer}
				events={allDayCalendarEvents}
				onSelectEvent={onSelectEvent}
			/>
			<div className={styles.timetableLayer}>
				<WeekGrid
					ref={gridRef}
					items={timetableEvents}
					config={config}
					toBlocks={flattenEventsToBlocks}
					onSelectBlock={handleSelectBlock}
				/>
			</div>
			<div className={styles.periodLayer} style={{ left, width }}>
				<div className={styles.inner}>
					<PeriodBars
						date={date}
						items={periodEvents}
						onSelectEvent={handleSelectBlock}
						left={left}
						width={width}
					/>
				</div>
			</div>
		</div>
	);
}

// ViewStatic

type ViewOptions = {
	localizer: DateLocalizer;
	culture?: string;
};

// 1) range
CustomWeekView.range = (date: Date, options: ViewOptions): Date[] => {
	const localizer = options?.localizer as DateLocalizer;
	const culture = options?.culture as string | undefined;

	// culture가 없는 경우
	const firstDayOfWeek = localizer.startOfWeek?.(culture ?? "ko") ?? 0;

	const start = localizer.startOf(date, "week", firstDayOfWeek);

	const days: Date[] = [];
	for (let i = 0; i < 7; i++) {
		days.push(localizer.add(start, i, "day"));
	}
	return days;
};

// 2) navigate
CustomWeekView.navigate = (
	date: Date,
	action: NavigateAction,
	options: ViewOptions,
) => {
	const localizer = options?.localizer as DateLocalizer;

	switch (action) {
		case "PREV":
			return localizer.add(date, -1, "week");
		case "NEXT":
			return localizer.add(date, 1, "week");
		default:
			return date;
	}
};

// 3) title
CustomWeekView.title = (date: Date, options: ViewOptions) => {
	const localizer = options?.localizer as DateLocalizer;
	const culture = (options?.culture as string | undefined) ?? "ko";

	const days = CustomWeekView.range(date, { localizer, culture });
	const start = days[0];
	const end = days[days.length - 1];

	const startLabel = localizer.format(start, "M월 d일", culture);
	const endLabel = localizer.format(end, "M월 d일", culture);

	return `${startLabel} ~ ${endLabel}`;
};

export default CustomWeekView as unknown as React.ComponentType<any> &
	ViewStatic;
