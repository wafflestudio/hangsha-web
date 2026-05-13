import { CATEGORY_COLORS } from "@constants";
import type { CalendarEvent } from "@types";
import styles from "@styles/DayEvent.module.css";

const formatTime = (d: Date) =>
	d.toLocaleTimeString("ko-KR", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});

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
			<div className={styles.eventContent}>
				{formatTime(calendarEvent.start)} - {formatTime(calendarEvent.end)}
			</div>
			<div className={`${styles.eventContent} ${styles.eventMeta}`}>
				{event.location === "-" ? "" : event.location}
			</div>
		</div>
	);
};

export default DayEvent;
