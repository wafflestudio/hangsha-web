import { formatDateDotParsed } from "./dateFormatter";

const pad = (n: number) => String(n).padStart(2, "0");

const formatRangeEnd = (start: Date, end: Date) => {
	const sameYear = start.getFullYear() === end.getFullYear();
	const sameMonth = sameYear && start.getMonth() === end.getMonth();
	if (sameMonth) return pad(end.getDate());
	if (sameYear) return `${pad(end.getMonth() + 1)}.${pad(end.getDate())}`;
	return formatDateDotParsed(end);
};

export const eventDateRenderer = (
	eventStart: Date | null,
	eventEnd: Date | null,
) =>
	eventStart && eventEnd
		? eventStart.toDateString() === eventEnd.toDateString()
			? formatDateDotParsed(eventStart)
			: `${formatDateDotParsed(eventStart)}~${formatRangeEnd(eventStart, eventEnd)}`
		: eventEnd
			? formatDateDotParsed(eventEnd)
			: "";
