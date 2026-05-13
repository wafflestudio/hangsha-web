import { Views, type View } from "react-big-calendar";
import type { Event, EventDetail } from "../types";

const calendarEventMapper = (event: Event | EventDetail, currentView: View) => {
	const isPeriodEvent = event.isPeriodEvent;
	// if (!event.eventStart || !event.eventEnd) {
	// 	// 기본 : eventStart 혹은 eventEnd가 없으면 기간제 행사 처리
	// 	isPeriodEvent = true;
	// } else if (
	// 	event.title.includes("공모전") ||
	// 	event.title.includes("인턴십") ||
	// 	event.title.includes("학생기자딘")
	// ) {
	// 	// 인턴십, 공모전 : 신청형 기간제 행사임에도 eventStart, eventEnd 데이터가 들어있는 경우 있음
	// 	// -> 일괄적으로 기간제 행사 처리
	// 	isPeriodEvent = true;
	// } else if (isLongerThan(event.eventStart, event.eventEnd, 7)) {
	// 	// eventEnd-eventStart > 일주일 에 해당하는 긴 행사들의 경우, 차라리 기간제 행사처럼 처리
	// 	isPeriodEvent = true;
	// } else {
	// 	// 이외 : eventStart & eventEnd가 있음
	// 	isPeriodEvent = false;
	// }

	const startDate =
		(isPeriodEvent ? event.applyStart : event.eventStart) ||
		event.eventStart ||
		event.applyStart;
	const endDate =
		(isPeriodEvent ? event.applyEnd : event.eventEnd) ||
		event.eventEnd ||
		event.applyEnd;

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
