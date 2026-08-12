import { useState, type KeyboardEvent, type MouseEvent } from "react";
import { CategoryChip, DdayChip } from "@/components/feature/eventChip/EventChip";
import type { HighlightSearchItem } from "@/util/types";
import { useUserData } from "@/contexts/UserDataContext";
import { useAuth } from "@/contexts/AuthProvider";
import { renderHighlight } from "./renderHighlight";
import styles from "./SearchGridItem.module.css";

function formatDateRange(start: Date | null, end: Date | null) {
	if (!start) return "";
	const fmt = (d: Date) =>
		`${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
	if (!end || start.toDateString() === end.toDateString()) return fmt(start);
	return `${fmt(start)} ~ ${fmt(end)}`;
}

interface GridItemProps {
	item: HighlightSearchItem;
	onClick?: (eventId: number) => void;
	onLoginPrompt?: () => void;
}

const SearchGridItem = ({ item, onClick, onLoginPrompt }: GridItemProps) => {
	const { event, highlight } = item;

	const ddayTargetDate = event.applyEnd || null;
	const dateStr = formatDateRange(event.eventStart, event.eventEnd);

	const { user } = useAuth();
	const { toggleBookmark } = useUserData();
	const [isBookmarked, setIsBookmarked] = useState<boolean>(
		event.isBookmarked || false,
	);

	const handleToggleBookmark = async (e: MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		if (!user) {
			onLoginPrompt?.();
			return;
		}
		const previousState = isBookmarked;
		setIsBookmarked(!previousState);
		try {
			await toggleBookmark(event.id);
		} catch (err) {
			console.error("Failed to toggle bookmark", err);
			setIsBookmarked(previousState);
		}
	};

	const handleOpen = () => onClick?.(event.id);

	const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
		if (!onClick || e.target !== e.currentTarget) return;
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			onClick(event.id);
		}
	};

	return (
		<article
			className={styles.cardWrapper}
			onClick={handleOpen}
			onKeyDown={handleKeyDown}
			role={onClick ? "button" : undefined}
			tabIndex={onClick ? 0 : undefined}
			style={onClick ? { cursor: "pointer" } : undefined}
		>
			<div className={styles.thumbnail}>
				<img
					alt={event.title}
					src={event.imageUrl}
					className={styles.thumbnailImage}
				/>
			</div>
			<button
				type="button"
				className={styles.gBookmarkBtn}
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
			<h2 className={styles.gTitle}>{renderHighlight(highlight.title)}</h2>
			{highlight.contentSnippet && (
				<p className={styles.gBody}>
					{renderHighlight(highlight.contentSnippet)}
				</p>
			)}
			<div className={styles.gDateOrg}>
				<span className={styles.gDate}>{dateStr}</span>
				<span className={styles.gOrg}>{event.organization}</span>
			</div>
			<ul className={styles.gChipsList}>
				{ddayTargetDate && <DdayChip as="li" compact targetDate={ddayTargetDate} />}
				<CategoryChip as="li" categoryId={event.eventTypeId} compact />
			</ul>
		</article>
	);
};

export default SearchGridItem;
