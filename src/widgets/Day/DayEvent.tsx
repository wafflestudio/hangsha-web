import { CATEGORY_COLORS } from "@constants";
import type { CalendarEvent } from "@types";
import styles from "@styles/DayEvent.module.css";
import EventDate from "../EventDate";

const DayEvent = ({ event: calendarEvent }: { event: CalendarEvent }) => {
	const { event } = calendarEvent.resource;
	const color = CATEGORY_COLORS[event.eventTypeId] || CATEGORY_COLORS[6];

	return (
		<div
			className={styles.dayEventContainer}
			style={{
				backgroundColor: color,
			}}
		>
			<div className={`${styles.eventContent} ${styles.eventTitle}`}>
				{event.title}
			</div>
			<EventDate event={event} />
			<div className={`${styles.eventContent} ${styles.eventMeta}`}>
				{event.location === "-" ? "" : event.location}
			</div>
		</div>
	);
};

export default DayEvent;
