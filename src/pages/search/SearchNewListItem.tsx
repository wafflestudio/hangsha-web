import { useState } from "react";
import { CATEGORY_COLORS, CATEGORY_LIST } from "@/util/constants";
import { getDDay } from "@/util/Calendar/getDday";
import type { HighlightSearchItem } from "@/util/types";
import { useUserData } from "@/contexts/UserDataContext";
import { useAuth } from "@/contexts/AuthProvider";
import styles from "@styles/SearchNewItem.module.css";

function formatDateRange(start: Date | null, end: Date | null) {
  if (!start) return "";
  const fmt = (d: Date) =>
    `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  if (!end || start.toDateString() === end.toDateString()) return fmt(start);
  return `${fmt(start)} ~ ${fmt(end)}`;
}

interface ItemProps {
  item: HighlightSearchItem;
  onClick?: (eventId: number) => void;
  onLoginPrompt?: () => void;
}

const SearchNewListItem = ({ item, onClick, onLoginPrompt }: ItemProps) => {
  const { event, highlight } = item;
  const dday = getDDay(event.applyEnd);
  const catColor = CATEGORY_COLORS[event.eventTypeId];
  const dateStr = formatDateRange(event.eventStart, event.eventEnd);

  const { user } = useAuth();
  const { toggleBookmark } = useUserData();
  const [isBookmarked, setIsBookmarked] = useState<boolean>(
    event.isBookmarked || false,
  );

  const handleToggleBookmark = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!user) {
      onLoginPrompt?.();
      return;
    }
    const previousState = isBookmarked;
    setIsBookmarked(!previousState);
    try {
      await toggleBookmark(event);
    } catch (err) {
      console.error("Failed to toggle bookmark", err);
      setIsBookmarked(previousState);
    }
  };

  return (
    <article className={styles.variantA} onClick={() => onClick?.(event.id)} style={onClick ? { cursor: "pointer" } : undefined}>
      <div className={styles.aBookmarkColumn}>
        <button
          type="button"
          className={styles.aBookmarkBtn}
          onClick={handleToggleBookmark}
        >
          <img
            src={isBookmarked ? "/assets/Bookmarked.svg" : "/assets/notBookmarked.svg"}
            alt={isBookmarked ? "Remove bookmark" : "Add bookmark"}
          />
        </button>
      </div>
      <div className={styles.aContent}>
        {/* eslint-disable-next-line react/no-danger */}
        <h2
          className={styles.aTitle}
          dangerouslySetInnerHTML={{ __html: highlight.title }}
        />
        {highlight.contentSnippet && (
          <p
            className={styles.aBody}
            dangerouslySetInnerHTML={{ __html: highlight.contentSnippet }}
          />
        )}
        <div className={styles.aFooter}>
          <span className={styles.aDday}>{dday}</span>
          <span
            className={styles.aCategoryChip}
            style={{ backgroundColor: catColor }}
          >
            {CATEGORY_LIST[event.eventTypeId]}
          </span>
          <span className={styles.aDate}>{dateStr}</span>
          <span className={styles.aSep}>·</span>
          <span className={styles.aOrg}>{event.organization}</span>
        </div>
      </div>
      <div className={styles.aThumbnail}>
        <img src={event.imageUrl} alt={event.title} />
      </div>
    </article>
  );
};

export default SearchNewListItem;
