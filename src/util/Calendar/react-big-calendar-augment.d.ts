import "react-big-calendar";

declare module "react-big-calendar" {
	interface CalendarProps<
		_TEvent extends object = Event,
		_TResource extends object = object,
	> {
		monthMaxRows?: number | undefined;
	}
}
