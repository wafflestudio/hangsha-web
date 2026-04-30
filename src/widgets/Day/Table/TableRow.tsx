import type { CalendarEvent } from "@types";
import { getDDay } from "@calendarUtil/getDday";
import { CATEGORY_COLORS } from "@constants";
import { CATEGORY_LIST } from "@constants";
// import { formatDateToMMDD } from "@calendarUtil/dateFormatter";
import { useDetail } from "@contexts/DetailContext";
import { ApplyDate, StartDate } from "@/widgets/EventDate";

const TableRow = ({ data }: { data: CalendarEvent }) => {
	const event = data.resource.event;
	const ddayTargetDate = event.eventStart ? event.eventStart : event.applyEnd;

	const { setShowDetail, setClickedEventId } = useDetail();

	const handleClick = () => {
		setShowDetail(true);
		setClickedEventId(event.id);
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
				<li>{getDDay(ddayTargetDate)}</li>
			</td>
			<td>
				<li style={{ backgroundColor: CATEGORY_COLORS[event.eventTypeId] }}>
					{CATEGORY_LIST[event.eventTypeId]}
				</li>
			</td>
			<td>
				{/* {formatDateToMMDD(data.start) === formatDateToMMDD(data.end)
					? formatDateToMMDD(data.start)
					: `${formatDateToMMDD(data.start)} ~ ${formatDateToMMDD(data.end)}`} */}
				<StartDate label={null} eventStart={event.eventStart} eventEnd={event.eventEnd}/>
			</td>
			<td>
				<ApplyDate label={null} applyStart={event.applyStart} applyEnd={event.applyEnd}/>
			</td>
			<td>{event.organization}</td>
		</tr>
	);
};

export default TableRow;
