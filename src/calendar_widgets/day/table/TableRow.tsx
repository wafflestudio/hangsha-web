import { useEffect, useState, type MouseEvent } from "react";
import type { CalendarEvent } from "@types";
// import { formatDateToMMDD } from "@calendarUtil/dateFormatter";
import { useDetail } from "@contexts/DetailContext";
import { ApplyDate, StartDate } from "@/components/feature/eventDate/EventDate";
import {
	CategoryChip,
	DdayChip,
} from "@/components/feature/eventChip/EventChip";
import { useAuth } from "@/contexts/AuthProvider";
import { useUserData } from "@/contexts/UserDataContext";
import styles from "./Table.module.css";

const TableRow = ({ data }: { data: CalendarEvent }) => {
	const event = data.resource.event;
	const ddayTargetDate = data.resource.event.applyEnd || null; // 지원 마감 기한

	const { openDetail } = useDetail();
	const { user } = useAuth();
	const { toggleBookmark } = useUserData();
	const [isBookmarked, setIsBookmarked] = useState(event.isBookmarked || false);

	useEffect(() => {
		setIsBookmarked(event.isBookmarked || false);
	}, [event.isBookmarked]);

	const handleClick = () => {
		openDetail(event.id);
	};
	const handleToggleBookmark = async (mouseEvent: MouseEvent) => {
		mouseEvent.stopPropagation();
		if (!user) return;

		const previousState = isBookmarked;
		setIsBookmarked(!previousState);
		try {
			await toggleBookmark(event);
		} catch (error) {
			console.error("Failed to toggle bookmark", error);
			setIsBookmarked(previousState);
		}
	};

	return (
		<tr onClick={handleClick}>
			<td>
				<button
					type="button"
					className={styles.bookmarkButton}
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
			</td>

			<td>{event.title}</td>
			<td>{ddayTargetDate && <DdayChip targetDate={ddayTargetDate} />}</td>
			<td>
				<CategoryChip categoryId={event.eventTypeId} compact />
			</td>
			<td>
				{/* {formatDateToMMDD(data.start) === formatDateToMMDD(data.end)
					? formatDateToMMDD(data.start)
					: `${formatDateToMMDD(data.start)} ~ ${formatDateToMMDD(data.end)}`} */}
				<StartDate
					label={null}
					eventStart={event.eventStart}
					eventEnd={event.eventEnd}
				/>
			</td>
			<td>
				<ApplyDate
					label={null}
					applyStart={event.applyStart}
					applyEnd={event.applyEnd}
				/>
			</td>
			<td>{event.organization}</td>
		</tr>
	);
};

export default TableRow;
