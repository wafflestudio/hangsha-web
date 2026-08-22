import {
	createContext,
	type Dispatch,
	type ReactNode,
	type SetStateAction,
	useContext,
	useState,
} from "react";
import type { CalendarViewMode } from "@types";

interface CalendarViewModeContextType {
	calendarViewMode: CalendarViewMode;
	setCalendarViewMode: Dispatch<SetStateAction<CalendarViewMode>>;
}

const CalendarViewModeContext = createContext<
	CalendarViewModeContextType | undefined
>(undefined);

export const CalendarViewModeProvider = ({
	children,
}: {
	children: ReactNode;
}) => {
	const [calendarViewMode, setCalendarViewMode] =
		useState<CalendarViewMode>("Calendar");

	return (
		<CalendarViewModeContext.Provider
			value={{ calendarViewMode, setCalendarViewMode }}
		>
			{children}
		</CalendarViewModeContext.Provider>
	);
};

export const useCalendarViewMode = () => {
	const ctx = useContext(CalendarViewModeContext);
	if (!ctx) {
		throw new Error(
			"useCalendarViewMode must be used within CalendarViewModeProvider",
		);
	}
	return ctx;
};
