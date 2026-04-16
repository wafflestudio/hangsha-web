import React, {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useState,
} from "react";
import {
	getDayEvents,
	getEventDetail,
	getEventSearch,
	getMonthEvents,
} from "@api/event";
import { formatDateToYYYYMMDD } from "@calendarUtil/dateFormatter";
import { getMonthRange } from "@calendarUtil/getMonthRange";
import type {
	DayViewParams,
	Event,
	EventDetail,
	FetchDayEventArgs,
	FetchWeekEventArgs,
	FetchMonthEventArgs,
	MonthViewParams,
	MonthViewResponse,
	SearchParams,
	SearchResult,
} from "@types";

interface EventContextType {
	monthViewData: MonthViewResponse | null;
	weekViewData: MonthViewResponse | null;
	dayViewEvents: Event[];
	dayDate: Date;
	setDayDate: React.Dispatch<React.SetStateAction<Date>>;
	searchResults: SearchResult | null;

	isLoadingMonth: boolean;
	isLoadingWeek: boolean;
	isLoadingDay: boolean;
	isLoadingSearch: boolean;
	isLoadingDetail: boolean;

	calendarError: string | null;
	detailError: string | null;
	searchError: string | null;
	clearError: (error: "calendar" | "detail" | "search") => void;

	fetchMonthEvents: (params: FetchMonthEventArgs) => Promise<void>;
	fetchWeekEvents: (params: FetchWeekEventArgs) => Promise<void>;
	fetchDayEvents: (params: FetchDayEventArgs) => Promise<void>;
	searchEvents: (params: SearchParams) => Promise<void>;
	clearSearch: () => void;

	fetchEventById: (id: number) => Promise<EventDetail | null>;
}
const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [monthViewData, setMonthViewData] = useState<MonthViewResponse | null>(
		null,
	);
	const [dayDate, setDayDate] = useState<Date>(new Date());
	const [weekViewData, setWeekViewData] = useState<MonthViewResponse | null>(
		null,
	);
	const [dayViewEvents, setDayViewEvents] = useState<Event[]>([]);
	const [searchResults, setSearchResults] = useState<SearchResult | null>(null);

	const [isLoadingMonth, setIsLoadingMonth] = useState(false);
	const [isLoadingWeek, setIsLoadingWeek] = useState(false);
	const [isLoadingDay, setIsLoadingDay] = useState(false);
	const [isLoadingSearch, setIsLoadingSearch] = useState(false);
	const [isLoadingDetail, setIsLoadingDetail] = useState(false);

	const [calendarError, setCalendarError] = useState<string | null>(null);
	const [detailError, setDetailError] = useState<string | null>(null);
	const [searchError, setSearchError] = useState<string | null>(null);


	/* ACTIONS */
	const fetchMonthEvents = useCallback(
		async ({
			start = new Date(),
			statusId,
			eventTypeId,
			orgId,
		}: FetchMonthEventArgs = {}) => {
			// handle 'to' date
			const { from, to } = getMonthRange(start.getFullYear(), start.getMonth());

			const params: MonthViewParams = {
				from: formatDateToYYYYMMDD(from),
				to: formatDateToYYYYMMDD(to),
				statusId,
				eventTypeId,
				orgId,
			};

			setIsLoadingMonth(true);
			setCalendarError(null);
			try {
				const data = await getMonthEvents(params);
				setMonthViewData(data);
			} catch (err) {
				console.error(err);
				setCalendarError("월별 행사 정보를 가져오는 데에 실패했습니다.");
			} finally {
				setIsLoadingMonth(false);
			}
		},
		[],
	);

	const fetchWeekEvents = useCallback(
		async ({ from, to, statusId, eventTypeId, orgId }: FetchWeekEventArgs) => {
			const params: MonthViewParams = {
				from: from,
				to: to,
				statusId,
				eventTypeId,
				orgId,
			};
			setIsLoadingWeek(true);
			setCalendarError(null);
			try {
				const data = await getMonthEvents(params);
				setWeekViewData(data);
			} catch (err) {
				console.error(err);
				setCalendarError("주별 행사 정보를 가져오는 데에 실패했습니다.");
			} finally {
				setIsLoadingWeek(false);
			}
		},
		[],
	);

	const fetchDayEvents = useCallback(
		async ({
			date = new Date(),
			page,
			size,
			statusId,
			eventTypeId,
			orgId,
		}: FetchDayEventArgs = {}) => {
			const params: DayViewParams = {
				date: formatDateToYYYYMMDD(date),
				page,
				size,
				statusId,
				eventTypeId,
				orgId,
			};

			setIsLoadingDay(true);
			setCalendarError(null);
			try {
				const data = await getDayEvents(params);
				setDayViewEvents(data);
			} catch (err) {
				console.error(err);
				setCalendarError("일별 행사 정보를 가져오는 데에 실패했습니다.");
			} finally {
				setIsLoadingDay(false);
			}
		},
		[],
	);

	const searchEvents = useCallback(async (params: SearchParams) => {
		setIsLoadingSearch(true);
		setSearchError(null);
		try {
			const data = await getEventSearch(params);
			setSearchResults(data);
		} catch (err) {
			console.error(err);
			setSearchError("행사 검색에 실패했습니다.");
		} finally {
			setIsLoadingSearch(false);
		}
	}, []);

	const clearSearch = useCallback(() => {
		setSearchResults(null);
	}, []);

	const fetchEventById = useCallback(async (id: number) => {
		setDetailError(null);
		setIsLoadingDetail(true);
		try {
			const data = await getEventDetail(id);
			return data;
		} catch (err) {
			console.error(err);
			setDetailError("행사 상세 정보를 가져오는 데에 실패했습니다.");
			return null;
		} finally {
			setIsLoadingDetail(false);
		}
	}, []);

	const clearError = useCallback((error: "calendar" | "detail" | "search") => {
		if (error === "calendar") {
			setCalendarError(null);
		} else if (error === "detail") {
			setDetailError(null);
		} else {
			setSearchError(null);
		}
	}, []);

	const value: EventContextType = {
		monthViewData,
		weekViewData,
		dayViewEvents,

		dayDate,
		setDayDate,

		searchResults,

		isLoadingMonth,
		isLoadingWeek,
		isLoadingDay,
		isLoadingSearch,
		isLoadingDetail,

		calendarError,
		detailError,
		searchError,
		clearError,

		fetchMonthEvents,
		fetchWeekEvents,
		fetchDayEvents,
		searchEvents,
		clearSearch,
		fetchEventById,
	};

	return (
		<EventContext.Provider value={value}>{children}</EventContext.Provider>
	);
};

export const useEvents = () => {
	const context = useContext(EventContext);
	if (context === undefined) {
		throw new Error("useEvents must be used within an EventProvider");
	}
	return context;
};
