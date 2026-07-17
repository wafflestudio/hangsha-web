import { useCallback } from "react";
import { type View, Views } from "react-big-calendar";
import { useSearchParams } from "react-router-dom";

const isSupportedView = (view: string | null): view is View =>
	view === Views.MONTH || view === Views.WEEK || view === Views.DAY;

export const useCalendarViewQuery = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const viewParam = searchParams.get("view");
	const calendarView = isSupportedView(viewParam) ? viewParam : Views.MONTH;

	const setCalendarView = useCallback(
		(view: View) => {
			if (!isSupportedView(view)) return;

			setSearchParams((prev) => {
				const next = new URLSearchParams(prev);
				next.set("view", view);
				return next;
			});
		},
		[setSearchParams],
	);

	return { calendarView, setCalendarView };
};
