export const isLongerThan = (
	start: Date,
	end: Date,
	daysThreshold: number,
): boolean => {
	const utcStart = Date.UTC(
		start.getFullYear(),
		start.getMonth(),
		start.getDate(),
	);
	const utcEnd = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
	const MS_PER_DAY = 1000 * 60 * 60 * 24;

	const diffInDays = (utcEnd - utcStart) / MS_PER_DAY;
	return diffInDays > daysThreshold;
};
