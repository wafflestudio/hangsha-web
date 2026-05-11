import { useMemo, useState } from "react";
import { FaAngleLeft, FaAngleRight, FaAnglesRight } from "react-icons/fa6";
import styles from "@styles/MonthSideView.module.css";
import CardView from "./CardView";
import { useDetail } from "@/contexts/DetailContext";
import calendarEventMapper from "@/util/Calendar/calendarEventMapper";
import { Views } from "react-big-calendar";
import type { CalendarEvent, Event } from "@/util/types";
import { startOfDay, isWithinInterval } from 'date-fns';
import { IoClose } from "react-icons/io5";
import { useFilter } from "@/contexts/FilterContext";
import { useUserData } from "@/contexts/UserDataContext";
import { useDayEvents } from "@/contexts/useCalendarEvents";
import { FilterButton } from "@/widgets/Toolbar";

const MonthSideView = ({
	day,
	onClose,
}: {
	day: Date;
	onClose: () => void;
}) => {
	const { setShowDetail, setClickedEventId } = useDetail();
	const [date, setDate] = useState<Date>(day);
	const { globalCategory, globalOrg, globalStatus, setFilterSheetShowing } = useFilter();
	const { excludedKeywords, interestCategories } = useUserData();

	const filters = useMemo(
		() => ({
			eventTypeId: globalCategory?.map((g) => g.id),
			orgId: globalOrg?.map((g) => g.id),
			statusId: globalStatus?.map((g) => g.id),
		}),
		[globalCategory, globalOrg, globalStatus],
	);

	const { data: dayViewEvents = [] } = useDayEvents(
		date,
		filters,
		excludedKeywords,
		interestCategories,
	);

	// list of day events
	const dayCalendarEvents: CalendarEvent[] = dayViewEvents.map((e: Event) => calendarEventMapper(e, Views.DAY));
	// filter : server puts events in the day slot if applyStart < day < applyEnd OR eventStart < day < eventEnd
	// render differently for isPeriodEvent - put event in slot if
	const filteredCalendarEvents = dayCalendarEvents.filter((e) =>
		isWithinInterval(startOfDay(date), {
			start: startOfDay(e.start),
			end: startOfDay(e.end),
		}),
	);
	const events = filteredCalendarEvents.map(e => e.resource.event);

	const handleClickToday = () => {
		setDate(new Date());
	};
	const handleClickPrevday = () => {
		const prevDate = new Date(date);
		prevDate.setDate(date.getDate() - 1);
		setDate(prevDate);
	};
	const handleClickNextday = () => {
		const nextDate = new Date(date);
		nextDate.setDate(date.getDate() + 1);
		setDate(nextDate);
	};

	const handleDetailClick = (id: number) => {
		setShowDetail(true);
		setClickedEventId(id);
	};

	return (
		<div className={styles.mainWrapper}>
			<button type="button" className={styles.foldBtn} onClick={onClose}>
				<FaAnglesRight
					width={24}
					color="rgba(171, 171, 171, 1)"
				/>
			</button>
			<div className={styles.dateRow}>			
				<h1>{`${date.getMonth() + 1}월 ${date.getDate()}일`}</h1>
				<button type="button" className={styles.todayBtn} onClick={handleClickToday}>
					오늘
				</button>
				<button type="button" className={styles.dateChangeBtn} onClick={handleClickPrevday}>
					<FaAngleLeft size={24} color="rgba(171, 171, 171, 1)" />
				</button>
				<button type="button" className={styles.dateChangeBtn} onClick={handleClickNextday}>
					<FaAngleRight size={24} color="rgba(171, 171, 171, 1)" />
				</button>
				<FilterButton onFilterSet={() => setFilterSheetShowing(true)}/>
				<button type="button" className={`${styles.mobileCloseBtn}`} onClick={onClose}>
					<IoClose
						size={24}
						color="rgba(171, 171, 171, 1)"
					/>
				</button>	
			</div>
			<div className={styles.cardWrapper}>
				{events.map((event) => (
					// biome-ignore lint/a11y/useSemanticElements: Cannot use button because it contains nested interactive elements
					<div
						role="button"
						key={event.id}
						tabIndex={0}
						onClick={() => handleDetailClick(event.id)}
						onKeyDown={(e) => e.key === "Enter" && handleDetailClick(event.id)}
						className={styles.cardButton}
					>
						<CardView key={event.id} event={event} />
					</div>
				))}
			</div>
		</div>
	);
};

export default MonthSideView;
