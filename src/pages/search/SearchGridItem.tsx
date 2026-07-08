import { CATEGORY_COLORS, CATEGORY_LIST } from "@/util/constants";
import { getDDay } from "@/util/Calendar/getDday";
import type { HighlightSearchItem } from "@/util/types";
import styles from "@styles/SearchGridItem.module.css";

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
}

const SearchGridItem = ({ item, onClick }: GridItemProps) => {
	const { event, highlight } = item;

	const dday = getDDay(event.applyEnd);
	const catColor = CATEGORY_COLORS[event.eventTypeId];
	const dateStr = formatDateRange(event.eventStart, event.eventEnd);

	return (
		<article
			className={styles.cardWrapper}
			onClick={() => onClick?.(event.id)}
			style={onClick ? { cursor: "pointer" } : undefined}
		>
			<div className={styles.thumbnail}>
				<img alt={event.title} src={event.imageUrl} className={styles.thumbnailImage} />
			</div>
			{/* eslint-disable-next-line react/no-danger */}
			<h2
				className={styles.gTitle}
				dangerouslySetInnerHTML={{ __html: highlight.title }}
			/>
			{highlight.contentSnippet && (
				// eslint-disable-next-line react/no-danger
				<p
					className={styles.gBody}
					dangerouslySetInnerHTML={{ __html: highlight.contentSnippet }}
				/>
			)}
			<div className={styles.gDateOrg}>
				<span className={styles.gDate}>{dateStr}</span>
				<span className={styles.gOrg}>{event.organization}</span>
			</div>
			<ul className={styles.gChipsList}>
				<li className={styles.gDday}>{`지원 ${dday}`}</li>
				<li className={styles.gCategoryChip} style={{ backgroundColor: catColor }}>
					{CATEGORY_LIST[event.eventTypeId]}
				</li>
			</ul>
		</article>
	);
};

export default SearchGridItem;
