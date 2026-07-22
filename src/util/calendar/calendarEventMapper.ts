import { Views, type View } from "react-big-calendar";
import type { Event, EventDetail } from "../types";

const calendarEventMapper = (event: Event | EventDetail, currentView: View) => {
	const isPeriodEvent = event.isPeriodEvent;
	const startDate =
		(isPeriodEvent ? event.applyStart : event.eventStart) ||
		event.eventStart ||
		event.applyStart || 
		null;
	const endDate =
		(isPeriodEvent ? event.applyEnd : event.eventEnd) ||
		event.eventEnd ||
		event.applyEnd || 
		null;

	const isAllDay = currentView === Views.MONTH ? true : isPeriodEvent;

	return {
		start: startDate,
		end: endDate,
		title: event.title,
		allDay: isAllDay,
		resource: { event, isPeriodEvent },
	};
};

export default calendarEventMapper;
