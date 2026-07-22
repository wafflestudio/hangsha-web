export const getMonthRange = (year: number, month: number) => {
	// month : 0-indexed in JS date, 0:Jan - 11:Dec

	// first day of actual month
	const startOfMonth = new Date(year, month, 1);
	// last day of actual month
	const endOfMonth = new Date(year, month + 1, 0);

	// start of grid: substract necessary num of days(getDay()) to default to start at Sunday.
	const startOfGrid = new Date(startOfMonth);
	startOfGrid.setDate(startOfMonth.getDate() - startOfMonth.getDay());

	// end of grid: substract necessary num of days(getDay()) to default to end on saturday (index==6)
	const endOfGrid = new Date(endOfMonth);
	const daysNeeded = 6 - endOfMonth.getDay();
	endOfGrid.setDate(endOfMonth.getDate() + daysNeeded);

	return { from: startOfGrid, to: endOfGrid };
};
