import { formatDateDotParsed } from "./dateFormatter";

export const eventDateRenderer = (
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
