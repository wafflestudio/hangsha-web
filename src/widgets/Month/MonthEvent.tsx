import { CATEGORY_COLORS, CATEGORY_TEXT_COLORS } from "@constants";
import type { CalendarEvent } from "@types";
import styles from "@styles/MonthEvent.module.css";
import { CATEGORY_OTHER_INDEX } from "@constants";

const MonthEvent = ({ event: calendarEvent }: { event: CalendarEvent }) => {
	const { isPeriodEvent, event } = calendarEvent.resource;
	const backgroundColor = CATEGORY_COLORS[event.eventTypeId] || CATEGORY_COLORS[CATEGORY_OTHER_INDEX];
	const color = CATEGORY_TEXT_COLORS[event.eventTypeId] || CATEGORY_TEXT_COLORS[CATEGORY_OTHER_INDEX];
	
	// 기간제 행사 : 화살표
	if (isPeriodEvent) {
		return (
			<div className={styles.arrowEventContainer} style={{ color: color }}>
				<span className={styles.arrowText}>{event.title}</span>
				<div className={styles.arrowLine} style={{ backgroundColor: backgroundColor }}>
					<div
						className={`${styles.arrowHead} ${styles.left}`}
						style={{ borderRightColor: backgroundColor }}
					/>
					<div
						className={styles.arrowHead}
						style={{ borderLeftColor: backgroundColor }}
					/>
				</div>
			</div>
		);
	}
	// 단발성 행사 : 블록
	return (
		<div
			className={styles.blockEventContainer}
			style={{
				backgroundColor: backgroundColor,
			}}
		>
			{event.title}
		</div>
	);
};

export default MonthEvent;
