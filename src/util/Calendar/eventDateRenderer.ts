import { formatDateDotParsed } from "./dateFormatter";

export const eventStartEndRenderer = (
	eventStart: Date | null,
	eventEnd: Date | null,
) =>
	eventStart && eventEnd
		? eventStart.toDateString() === eventEnd.toDateString()
			? formatDateDotParsed(eventStart)
			: `${formatDateDotParsed(eventStart)} ~ ${formatDateDotParsed(eventEnd)}`
		: eventEnd
			? formatDateDotParsed(eventEnd)
			: "";

export const applyStartEndRenderer = (
	applyStart: Date | null,
	applyEnd: Date | null,
) =>
	applyStart && applyEnd
		? applyStart.toDateString() === applyEnd.toDateString()
			? formatDateDotParsed(applyStart)
			: `${formatDateDotParsed(applyStart)} ~ ${formatDateDotParsed(applyEnd)}`
		: applyEnd
			? formatDateDotParsed(applyEnd)
			: "";
