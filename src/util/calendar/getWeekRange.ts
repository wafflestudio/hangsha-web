import { formatDateToYYYYMMDD } from "./dateFormatter";

export const getWeekRangeByDate = (date: Date) => {
	const from = new Date(date);
	const day = from.getDay();
	from.setDate(from.getDate() - day);

	const to = new Date(from);
	to.setDate(to.getDate() + 6);

	return {
		from: formatDateToYYYYMMDD(from),
		to: formatDateToYYYYMMDD(to),
	};
};
