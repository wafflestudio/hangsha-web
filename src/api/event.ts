import { transformEvent } from "@/util/calendar/transformEvent";
import type {
	OrgsResponse,
	CategoryGroupWithCategoriesResponse,
	DayViewParams,
	DayViewResponse,
	Event,
	EventDetail,
	EventDetailDTO,
	MonthViewParams,
	MonthViewResponse,
	MonthViewResponseDTO,
	SearchParams,
	SearchResult,
	SearchResultDTO,
	HighlightSearchResult,
	HighlightSearchResultDTO,
} from "../util/types";
import api from "./axios";

// Needed : mapResToEvent func & API response interface
export const getMonthEvents = async (
	params: MonthViewParams,
): Promise<MonthViewResponse> => {
	const res = await api.get<MonthViewResponseDTO>("/events/month", { params });
	const data = res.data;

	const transformedData = Object.entries(data.byDate).reduce(
		(acc, [dateKey, dayBucket]) => {
			const rawEvents = dayBucket?.events;
			acc[dateKey] = Array.isArray(rawEvents)
				? { events: rawEvents.map(transformEvent) }
				: { events: [] };
			return acc;
		},
		{} as Record<string, { events: Event[] }>,
	);

	const response: MonthViewResponse = {
		range: {
			from: new Date(data.range.from),
			to: new Date(data.range.to),
		},
		byDate: transformedData,
	};

	return response;
};

export const getDayEvents = async (params: DayViewParams): Promise<Event[]> => {
	const res = await api.get<DayViewResponse>("/events/day", { params });
	const data: DayViewResponse = res.data;
	const events: Event[] = data.items.map(transformEvent);
	return events;
};

export const getEventSearch = async (
	params: SearchParams,
): Promise<SearchResult> => {
	const res = await api.get<SearchResultDTO>("/events/search/title", {
		params,
	});
	const data: SearchResultDTO = res.data;
	const result: SearchResult = {
		page: data.page,
		size: data.size,
		total: data.total,
		items: data.items.map(transformEvent),
	};

	return result;
};

export const getEventSearchFull = async (
	params: SearchParams,
): Promise<HighlightSearchResult> => {
	const res = await api.get<HighlightSearchResultDTO>("/events/search", {
		params,
	});
	return {
		...res.data,
		items: (res.data.items ?? []).map((item) => ({
			event: transformEvent(item.event),
			highlight: item.highlight,
		})),
	};
};

export const getEventDetail = async (eventId: number): Promise<EventDetail> => {
	const res = await api.get<EventDetailDTO>(`/events/${eventId}`);
	const data = res.data;
	const eventDetail: EventDetail = {
		...transformEvent(data),
		bookmarkCount: data.bookmarkCount,
		detail: data.detail,
	};
	return eventDetail;
};

export const getCategoryGroups = async () => {
	const res = await api.get<CategoryGroupWithCategoriesResponse>(
		"/category-groups/with-categories",
	);
	return res.data.items;
};

export const getOrganizations = async () => {
	const res = await api.get<OrgsResponse>("/categories/orgs");
	return res.data.items;
};
