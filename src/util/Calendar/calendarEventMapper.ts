import { Views, type View } from "react-big-calendar";
import type { Event, EventDetail } from "../types";

const calendarEventMapper = (event: Event | EventDetail, currentView: View) => {
	const isPeriodEvent =
		event.isPeriodEvent || (!event.eventStart && !event.eventEnd);

	const startDate = isPeriodEvent ? event.applyStart : (event.eventStart || event.eventEnd);
	const endDate = isPeriodEvent ? event.applyEnd : (event.eventEnd || event.eventStart);

	const isAllDay = currentView === Views.MONTH ? true : isPeriodEvent;

	if (!event.isPeriodEvent && (!event.eventStart || !event.eventEnd)) {
		console.log("[mapper] block event with missing time:", {
			id: (event as Event).id,
			title: event.title,
			isPeriodEvent: event.isPeriodEvent,
			eventStart: event.eventStart,
			eventEnd: event.eventEnd,
			applyStart: event.applyStart,
			applyEnd: event.applyEnd,
		});
	}

	return {
		start: startDate,
		end: endDate,
		title: event.title,
		allDay: isAllDay,
		resource: { event, isPeriodEvent },
	};
};

export default calendarEventMapper;
