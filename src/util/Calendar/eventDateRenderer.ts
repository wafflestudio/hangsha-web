import type { CalendarEvent } from "@types";
import { formatDateDotParsed } from "./dateFormatter";

export const eventDateRenderer = (
	calendarEvent: CalendarEvent,
	// eventStart: Date,
	// eventEnd: Date,
	// applyStart: Date,
	// applyEnd: Date,
) =>
	// !event.eventStart : 기간제 행사, yyyy.mm.dd ~ yyyy.mm.dd로 표시
	// eventStart && eventEnd
	// 	? // 단발성 행사
	// 		eventStart === eventEnd
	// 		? // yyyy.mm.dd만 표시
	// 			formatDateDotParsed(eventStart)
	// 		: // yyyy.mm.dd ~ yyyy.mm.dd
	// 			`${formatDateDotParsed(eventStart)} ~ ${formatDateDotParsed(eventEnd)}`
	// 	: // 기간제 행사
	// 		`${formatDateDotParsed(applyStart)} ~ ${formatDateDotParsed(applyEnd)}`;

	calendarEvent.start.toDateString() === calendarEvent.end.toDateString()
		? // yyyy.mm.dd만 표시
			formatDateDotParsed(calendarEvent.start)
		: // yyyy.mm.dd ~ yyyy.mm.dd
			`${formatDateDotParsed(calendarEvent.start)} ~ ${formatDateDotParsed(calendarEvent.end)}`;
