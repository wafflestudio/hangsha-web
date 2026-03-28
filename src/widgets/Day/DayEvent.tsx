import { CATEGORY_COLORS } from "@constants";
import type { CalendarEvent } from "@types";
import styles from "@styles/DayEvent.module.css";
import { eventDateRenderer } from "@/util/Calendar/eventDateRenderer";

const DayEvent = ({ event: calendarEvent }: { event: CalendarEvent }) => {
	const { /*isPeriodEvent,*/ event } = calendarEvent.resource;
	const color = CATEGORY_COLORS[event.eventTypeId] || CATEGORY_COLORS[6];

	// // 기간제 행사 : 화살표
	// if (isPeriodEvent) {
	//     return (
	//         <div className={styles.arrowEventContainer} style={{ color: color }}>
	//             <span className={styles.arrowText}>{event.title}</span>
	//             <div className={styles.arrowLine} style={{ backgroundColor: color }}>
	//                 <div
	//                     className={styles.arrowHead}
	//                     style={{ borderLeftColor: color }}
	//                 />
	//             </div>
	//         </div>
	//     );
	// }

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
			<div className={`${styles.eventContent} ${styles.eventMeta}`}>
				{eventDateRenderer(calendarEvent)}
			</div>
			<div className={`${styles.eventContent} ${styles.eventMeta}`}>
				{event.location === "-" ? "" : event.location}
			</div>
		</div>
	);
};

export default DayEvent;
