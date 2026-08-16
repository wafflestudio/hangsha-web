import type { CalendarEvent, Event } from "@types";
import type { MouseEvent } from "react";
import { useDetail } from "@contexts/DetailContext";
import { useAuth } from "@/contexts/AuthProvider";
import { useBookmarkStatus, useUserData } from "@/contexts/UserDataContext";
import {
	CategoryChip,
	DdayChip,
} from "@/components/feature/eventChip/EventChip";
import styles from "@/pages/search/SearchNewItem.module.css";

const formatDateRange = (start: Date | null, end: Date | null) => {
	if (!start) return "";
	const formatDate = (date: Date) =>
		`${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;

	if (!end || start.toDateString() === end.toDateString()) {
		return formatDate(start);
	}
	return `${formatDate(start)} ~ ${formatDate(end)}`;
};

const MobileEventListItem = ({ event }: { event: Event }) => {
	const { openDetail } = useDetail();
	const { user } = useAuth();
	const { toggleBookmark } = useUserData();
	const date = formatDateRange(event.eventStart, event.eventEnd);
	const isBookmarked = useBookmarkStatus(event);

	const handleToggleBookmark = async (mouseEvent: MouseEvent) => {
		mouseEvent.stopPropagation();
		if (!user) return;

		try {
			await toggleBookmark(event);
		} catch (error) {
			console.error("Failed to toggle bookmark", error);
		}
	};

	return (
		// biome-ignore lint/a11y/useSemanticElements: the card needs a non-button wrapper to match the existing search result layout
		<div
			className={styles.variantA}
			role="button"
			tabIndex={0}
			onClick={() => openDetail(event.id)}
			onKeyDown={(keyboardEvent) => {
				if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
					keyboardEvent.preventDefault();
					openDetail(event.id);
				}
			}}
		>
			<div className={styles.aBookmarkColumn}>
				<button
					type="button"
					className={styles.aBookmarkBtn}
					onClick={handleToggleBookmark}
				>
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
			<div className={styles.aContent}>
				<h2 className={styles.aTitle}>{event.title}</h2>
				<div className={styles.aFooter}>
					{event.applyEnd && (
						<DdayChip compact prefix="" targetDate={event.applyEnd} />
					)}
					<CategoryChip categoryId={event.eventTypeId} compact />
					{date && (
						<>
							<span className={styles.aDate}>{date}</span>
							<span className={styles.aSep}>·</span>
						</>
					)}
					<span className={styles.aOrg}>{event.organization}</span>
				</div>
			</div>
			<div className={styles.aThumbnail}>
				<img src={event.imageUrl} alt={event.title} />
			</div>
		</div>
	);
};

const MobileEventList = ({ events }: { events: CalendarEvent[] }) => (
	<div>
		{events.map(({ resource: { event } }) => (
			<MobileEventListItem key={event.id} event={event} />
		))}
	</div>
);

export default MobileEventList;
