import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
	formatDateToYYYYMMDD,
	parseDateFromYYYYMMDD,
} from "@calendarUtil/dateFormatter";

export const useMainPanelQuery = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const eventListDate = parseDateFromYYYYMMDD(searchParams.get("date"));
	const showEventList =
		searchParams.get("panel") === "events" && eventListDate !== null;

	const openEventList = useCallback(
		(date: Date) => {
			setSearchParams((prev) => {
				const next = new URLSearchParams(prev);
				next.set("panel", "events");
				next.set("date", formatDateToYYYYMMDD(date));
				next.delete("eventId");
				return next;
			});
		},
		[setSearchParams],
	);

	const closePanel = useCallback(() => {
		setSearchParams(
			(prev) => {
				const next = new URLSearchParams(prev);
				next.delete("panel");
				next.delete("eventId");
				next.delete("date");
				return next;
			},
			{ replace: true },
		);
	}, [setSearchParams]);

	return {
		search: searchParams.toString(),
		showEventList,
		eventListDate,
		openEventList,
		closePanel,
	};
};
