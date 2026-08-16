import type { CalendarEvent, Event } from "@types";
import { useDetail } from "@contexts/DetailContext";
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
	const date = formatDateRange(event.eventStart, event.eventEnd);

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
			<div className={`${styles.aBookmarkColumn} ${styles.aBookmarkBtn}`}>
				<img
					src={
						event.isBookmarked
							? "/assets/Bookmarked.svg"
							: "/assets/notBookmarked.svg"
					}
					alt={event.isBookmarked ? "bookmarked" : "not bookmarked"}
				/>
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
