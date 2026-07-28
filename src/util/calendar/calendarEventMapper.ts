import { Views, type View } from "react-big-calendar";
import type { CalendarEvent, Event, EventDetail } from "../types";

type DateRange = Pick<CalendarEvent, "start" | "end">;

const normalizeRange = (
	start: Date | null,
	end: Date | null,
): DateRange | null => {
	const fallback = start ?? end;

	if (!fallback) return null;

	return {
		start: start ?? fallback,
		end: end ?? fallback,
	};
};

const calendarEventMapper = (
	event: Event | EventDetail,
	currentView: View,
): CalendarEvent | null => {
	const isPeriodEvent = event.isPeriodEvent;
	const eventRange = normalizeRange(event.eventStart, event.eventEnd);
	const applyRange = normalizeRange(event.applyStart, event.applyEnd);
	const range = isPeriodEvent
		? (applyRange ?? eventRange)
		: (eventRange ?? applyRange);

	if (!range) return null;

	const isAllDay = currentView === Views.MONTH ? true : isPeriodEvent;

	return {
		...range,
		title: event.title,
		allDay: isAllDay,
		resource: { event, isPeriodEvent },
	};
};

export default calendarEventMapper;
