import { useQuery } from "@tanstack/react-query";
import { getDayEvents, getMonthEvents } from "@api/event";
import { formatDateToYYYYMMDD } from "@calendarUtil/dateFormatter";
import { getMonthRange } from "@calendarUtil/getMonthRange";
import type { Category, Event, MonthViewResponse } from "@types";
import { getWeekRangeByDate } from "@/util/Calendar/getWeekRange";

type Filters = {
	statusId?: number[];
	eventTypeId?: number[];
	orgId?: number[];
};

// localStorage round-trip stringifies Date fields — revive them so
// react-big-calendar's date math (.getMonth(), .getDate(), etc.) works.
const reviveEvent = (event: Event): Event => ({
	...event,
	applyStart: new Date(event.applyStart),
	applyEnd: new Date(event.applyEnd),
	eventStart: event.eventStart ? new Date(event.eventStart) : null,
	eventEnd: event.eventEnd ? new Date(event.eventEnd) : null,
});

const reviveMonthResponse = (data: MonthViewResponse): MonthViewResponse => ({
	range: {
		from: new Date(data.range.from),
		to: new Date(data.range.to),
	},
	byDate: Object.fromEntries(
		Object.entries(data.byDate).map(([key, bucket]) => [
			key,
			{ events: bucket.events.map(reviveEvent) },
		]),
	),
});

export const useMonthEvents = (
	date: Date,
	filters: Filters,
	excludedKeywords: { id: number; keyword: string }[],
	interestCategories: Category[],
) => {
	const { from, to } = getMonthRange(date.getFullYear(), date.getMonth());
	const fromStr = formatDateToYYYYMMDD(from);
	const toStr = formatDateToYYYYMMDD(to);

	return useQuery({
		queryKey: [
			"monthEvents",
			fromStr,
			toStr,
			filters,
			excludedKeywords,
			interestCategories,
		],
		queryFn: () => getMonthEvents({ from: fromStr, to: toStr, ...filters }),
		select: reviveMonthResponse,
	});
};

export const useWeekEvents = (
	date: Date,
	filters: Filters,
	excludedKeywords: { id: number; keyword: string }[],
	interestCategories: Category[],
) => {
	const { from, to } = getWeekRangeByDate(date);
	return useQuery({
		queryKey: [
			"weekEvents",
			from,
			to,
			filters,
			excludedKeywords,
			interestCategories,
		],
		queryFn: () => getMonthEvents({ from, to, ...filters }),
		select: reviveMonthResponse,
	});
};

export const useDayEvents = (
	date: Date,
	filters: Filters,
	excludedKeywords: { id: number; keyword: string }[],
	interestCategories: Category[],
) => {
	const dateStr = formatDateToYYYYMMDD(date);

	return useQuery({
		queryKey: [
			"dayEvents",
			dateStr,
			filters,
			excludedKeywords,
			interestCategories,
		],
		queryFn: () => getDayEvents({ date: dateStr, ...filters }),
		select: (events: Event[]) => events.map(reviveEvent),
	});
};
