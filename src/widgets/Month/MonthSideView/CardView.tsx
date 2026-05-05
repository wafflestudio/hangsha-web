import { useRef, useState } from "react";
import styles from "@styles/CardView.module.css";
import { getDDay } from "@calendarUtil/getDday";
import { CATEGORY_COLORS, CATEGORY_LIST } from "@constants";
import type { Event } from "@types";
import { useUserData } from "@/contexts/UserDataContext";
import { StartDate } from "@/widgets/EventDate";

const MobileChipsList = ({ event }: { event: Event }) => {
	const ddayTargetDate = event.applyEnd;
	const [expanded, setExpanded] = useState(false);
	const timerRef = useRef<number | null>(null);

	const startPress = () => {
		timerRef.current = window.setTimeout(() => setExpanded(true), 500);
	};
	const cancelPress = () => {
		if (timerRef.current) {
			clearTimeout(timerRef.current);
			timerRef.current = null;
		}
	};

	return (
		<ul className={styles.mobileChipsList}>
			<li>
				<button
					type="button"
					className={`${styles.categoryCircle} ${expanded ? styles.categoryCircleExpanded : ""}`}
					style={{
						backgroundColor: CATEGORY_COLORS[event.eventTypeId],
					}}
					aria-pressed={expanded}
					onPointerDown={startPress}
					onPointerUp={cancelPress}
					onPointerLeave={cancelPress}
					onPointerCancel={cancelPress}
					onClick={(e) => {
						e.stopPropagation();
						setExpanded(prev => !prev);
						if (expanded) {
							e.stopPropagation();
							setExpanded(false);
						}
					}}
				>
					<span className={styles.categoryCircleLabel}>
						{CATEGORY_LIST[event.eventTypeId]}
					</span>
				</button>
			</li>
			{/* <li className={styles.deadlineChip}>{`지원 ${getDDay(ddayTargetDate)}`}</li> */}
			<span className={styles.ddayTargetDate}>{`지원 ${getDDay(ddayTargetDate)}`}</span>
		</ul>
	)
}

const CardView = ({ event }: { event: Event }) => {
	const ddayTargetDate = event.applyEnd;

	const [isBookmarked, setIsBookmarked] = useState<boolean>(
		event.isBookmarked || false,
	);
	const { toggleBookmark } = useUserData();

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
			<div className={styles.mobileRow}>
				<MobileChipsList event={event} />
				<button type="button" className={styles.bookmarkBtn} onClick={handleToggleBookmark}>
					<img
						src={
							isBookmarked
								? "/assets/Bookmarked.svg"
								: "/assets/notBookmarked.svg"
						}
						alt={isBookmarked ? "Remove bookmark" : "Add bookmark"}
					/>
				</button>
			</div>
			<h1 className={styles.eventTitle}>{event.title}</h1>
			<div className={styles.mobileDateOrg}>
				<StartDate label={null} eventStart={event.eventStart} eventEnd={event.eventEnd} />
				<span className={styles.orgText}>{event.organization}</span>
			</div>
			<ul className={styles.chipsList}>
				<li className={styles.deadlineChip}>{`지원 ${getDDay(ddayTargetDate)}`}</li>
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
