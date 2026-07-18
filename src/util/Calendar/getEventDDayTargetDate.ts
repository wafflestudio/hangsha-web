import type { Event } from "@types";

export const getEventDDayTargetDate = (
	event: Event | undefined,
): Date | undefined => {
	if (!event) return undefined;

	return event.isPeriodEvent
		? event.applyEnd
		: (event.eventStart ?? event.applyStart);
};
