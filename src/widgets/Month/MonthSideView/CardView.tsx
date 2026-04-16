import { useState } from "react";
import styles from "@styles/CardView.module.css";
import { getDDay } from "@calendarUtil/getDday";
import { CATEGORY_COLORS, CATEGORY_LIST } from "@constants";
import type { Event } from "@types";
import { eventDateRenderer } from "@/util/Calendar/eventDateRenderer";
import calendarEventMapper from "@/util/Calendar/calendarEventMapper";
import { Views } from "react-big-calendar";
import { useUserData } from "@/contexts/UserDataContext";

const CardView = ({ event }: { event: Event }) => {
	const [isBookmarked, setIsBookmarked] = useState<boolean>(
		event.isBookmarked || false,
	);
	const { toggleBookmark } = useUserData();
	const ddayTargetDate = event.eventStart ? event.eventStart : event.applyEnd;

	const handleToggleBookmark = async (
		e: React.MouseEvent<HTMLButtonElement>,
	) => {
		const previousState = isBookmarked;
		e.stopPropagation();

		// optimistic update
		setIsBookmarked(!previousState);

		try {
			await toggleBookmark(event);
		} catch (e) {
			console.error("Failed to toggle bookmark", e);
			setIsBookmarked(previousState);
		}
	};

	return (
		<div className={styles.cardWrapper}>
			<button type="button" onClick={handleToggleBookmark}>
				<img
					src={
						isBookmarked
							? "/assets/Bookmarked.svg"
							: "/assets/notBookmarked.svg"
					}
					alt={isBookmarked ? "Remove bookmark" : "Add bookmark"}
				/>
			</button>
			<h1 className={styles.eventTitle}>{event.title}</h1>
			<span className={styles.dateText}>
				{eventDateRenderer(calendarEventMapper(event, Views.DAY))}
			</span>
			<ul className={styles.chipsList}>
				<li className={styles.deadlineChip}>{getDDay(ddayTargetDate)}</li>
				<li
					className={styles.categoryChip}
					style={{
						backgroundColor: CATEGORY_COLORS[event.eventTypeId],
					}}
				>
					{CATEGORY_LIST[event.eventTypeId]}
				</li>
			</ul>
			<span className={styles.orgText}>{event.organization}</span>
		</div>
	);
};

export default CardView;
