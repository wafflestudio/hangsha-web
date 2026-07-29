import type { CalendarEvent } from "@types";

const isSingleDay = (event: CalendarEvent) =>
	event.start.toDateString() === event.end.toDateString();

export const compareMonthCalendarEvents = (
	a: CalendarEvent,
	b: CalendarEvent,
) => {
	const durationOrder = Number(!isSingleDay(a)) - Number(!isSingleDay(b));
	if (durationOrder !== 0) return durationOrder;

	const startOrder = a.start.getTime() - b.start.getTime();
	if (startOrder !== 0) return startOrder;

	const endOrder = a.end.getTime() - b.end.getTime();
	if (endOrder !== 0) return endOrder;

	return a.resource.event.id - b.resource.event.id;
};

export const sortMonthCalendarEvents = <T extends CalendarEvent>(
	events: readonly T[],
) => [...events].sort(compareMonthCalendarEvents);
