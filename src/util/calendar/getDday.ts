export const getDDay = (targetDate: Date | string | undefined): string => {
	if (!targetDate) return "";

	const today = new Date();
	const target = new Date(targetDate);

	today.setHours(0, 0, 0, 0);
	target.setHours(0, 0, 0, 0);

	const diffTime = target.getTime() - today.getTime();
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

	if (diffDays === 0) return "D-DAY";
	if (diffDays > 0) return `D-${diffDays}`;
	return `D+${Math.abs(diffDays)}`;
};
