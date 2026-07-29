import type { CalendarEvent } from "@types";
// import { formatDateToMMDD } from "@calendarUtil/dateFormatter";
import { useDetail } from "@contexts/DetailContext";
import { ApplyDate, StartDate } from "@/components/feature/eventDate/EventDate";
import { CategoryChip, DdayChip } from "@/components/feature/eventChip/EventChip";

const TableRow = ({ data }: { data: CalendarEvent }) => {
	const event = data.resource.event;
	const ddayTargetDate = data.resource.event.applyEnd || null; // 지원 마감 기한

	const { openDetail } = useDetail();

	const handleClick = () => {
		openDetail(event.id);
	};

	return (
		<tr onClick={handleClick}>
			<td>
				{event.isBookmarked ? (
					<img src="/assets/Bookmarked.svg" alt="bookmarked icon" />
				) : (
					<img src="/assets/notBookmarked.svg" alt="empty bookmark icon" />
				)}
			</td>

			<td>{event.title}</td>
			<td>
				{ddayTargetDate && <DdayChip targetDate={ddayTargetDate} />}
			</td>
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
