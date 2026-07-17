import { createContext, type ReactNode, useCallback, useContext } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { parseDateFromYYYYMMDD } from "@calendarUtil/dateFormatter";

interface DetailContextType {
	showDetail: boolean;
	clickedEventId?: number;
	openDetail: (eventId: number) => void;
	closeDetail: () => void;
}

const DetailContext = createContext<DetailContextType | undefined>(undefined);

export const DetailContextProvider = ({
	children,
}: {
	children: ReactNode;
}) => {
	const location = useLocation();
	const [searchParams, setSearchParams] = useSearchParams();
	const eventIdParam = searchParams.get("eventId");
	const parsedEventId = eventIdParam ? Number(eventIdParam) : Number.NaN;
	const clickedEventId =
		Number.isSafeInteger(parsedEventId) && parsedEventId > 0
			? parsedEventId
			: undefined;
	const showDetail =
		searchParams.get("panel") === "detail" && clickedEventId !== undefined;

	const openDetail = useCallback(
		(eventId: number) => {
			setSearchParams((prev) => {
				const next = new URLSearchParams(prev);
				next.set("panel", "detail");
				next.set("eventId", String(eventId));
				return next;
			});
		},
		[setSearchParams],
	);

	const closeDetail = useCallback(() => {
		setSearchParams(
			(prev) => {
				const next = new URLSearchParams(prev);
				const hasEventListDate =
					(location.pathname === "/main" ||
						location.pathname === "/main/day") &&
					parseDateFromYYYYMMDD(next.get("date")) !== null;

				if (hasEventListDate) {
					next.set("panel", "events");
				} else {
					next.delete("panel");
				}
				next.delete("eventId");
				return next;
			},
			{ replace: true },
		);
	}, [location.pathname, setSearchParams]);

	return (
		<DetailContext.Provider
			value={{
				showDetail,
				clickedEventId,
				openDetail,
				closeDetail,
			}}
		>
			{children}
		</DetailContext.Provider>
	);
};

export const useDetail = () => {
	const ctx = useContext(DetailContext);
	if (!ctx) {
		throw new Error("useDetail must be used within DetailContextProvider");
	}
	return ctx;
};
