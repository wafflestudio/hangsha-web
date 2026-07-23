import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaAngleLeft, FaAngleRight, FaAnglesRight } from "react-icons/fa6";
import styles from "./EventCardView.module.css";
import CardView from "./EventCard";
import { useDetail } from "@/contexts/DetailContext";
import calendarEventMapper from "@/util/calendar/calendarEventMapper";
import { Views } from "react-big-calendar";
import type { CalendarEvent, Event } from "@/util/types";
import { startOfDay, isWithinInterval } from "date-fns";
import { IoClose } from "react-icons/io5";
import { useFilter } from "@/contexts/FilterContext";
import { useUserData } from "@/contexts/UserDataContext";
import { useDayEvents } from "@/contexts/useCalendarEvents";
import { FilterButton } from "@/components/layout/toolbar/Toolbar";
import Modal from "@/components/ui/Modal";
import { sortMonthCalendarEvents } from "@/util/calendar/sortMonthCalendarEvents";

// 월별 뷰에서 날짜 클릭 시 나오는, 일별 행사 목록 보여주는 side panel
const EventCardView = ({
	day,
	onClose,
	onDateChange, // 선택된 날짜 query에 반영
}: {
	day: Date;
	onClose: () => void;
	onDateChange: (date: Date) => void;
}) => {
	const navigate = useNavigate();
	const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
	const { openDetail } = useDetail();
	const { globalCategory, globalOrg, globalStatus, setFilterSheetShowing } =
		useFilter();
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
		day,
		filters,
		excludedKeywords,
		interestCategories,
	);

	// list of day events
	const dayCalendarEvents: CalendarEvent[] = dayViewEvents.map((e: Event) =>
		calendarEventMapper(e, Views.DAY),
	);
	// filter : server puts events in the day slot if applyStart < day < applyEnd OR eventStart < day < eventEnd
	// render differently for isPeriodEvent - put event in slot if applyStart < day < applyEnd
	const filteredCalendarEvents = sortMonthCalendarEvents(
		dayCalendarEvents.filter((e) =>
			isWithinInterval(startOfDay(day), {
				start: startOfDay(e.start),
				end: startOfDay(e.end),
			}),
		),
	);
	const events = filteredCalendarEvents.map((e) => e.resource.event);

	const handleClickToday = () => {
		onDateChange(new Date());
	};
	const handleClickPrevday = () => {
		const prevDate = new Date(day);
		prevDate.setDate(day.getDate() - 1);
		onDateChange(prevDate);
	};
	const handleClickNextday = () => {
		const nextDate = new Date(day);
		nextDate.setDate(day.getDate() + 1);
		onDateChange(nextDate);
	};

	const handleDetailClick = (id: number) => {
		openDetail(id);
	};

	return (
		<div className={styles.mainWrapper}>
			{isLoginModalOpen && (
				<Modal
					content="로그인 이후 이용해주세요"
					leftText="로그인"
					rightText="닫기"
					onLeftClick={() => navigate("/")}
					onRightClick={() => setIsLoginModalOpen(false)}
					onClose={() => setIsLoginModalOpen(false)}
				/>
			)}
			<button type="button" className={styles.foldBtn} onClick={onClose}>
				<FaAnglesRight width={24} color="rgba(171, 171, 171, 1)" />
			</button>
			<div className={styles.dateRow}>
				<h1>{`${day.getMonth() + 1}월 ${day.getDate()}일`}</h1>
				<button
					type="button"
					className={styles.todayBtn}
					onClick={handleClickToday}
				>
					오늘
				</button>
				<button
					type="button"
					className={styles.dateChangeBtn}
					onClick={handleClickPrevday}
				>
					<FaAngleLeft size={24} color="rgba(171, 171, 171, 1)" />
				</button>
				<button
					type="button"
					className={styles.dateChangeBtn}
					onClick={handleClickNextday}
				>
					<FaAngleRight size={24} color="rgba(171, 171, 171, 1)" />
				</button>
				<FilterButton onFilterSet={() => setFilterSheetShowing(true)} />
				<button
					type="button"
					className={`${styles.mobileCloseBtn}`}
					onClick={onClose}
				>
					<IoClose size={24} color="rgba(171, 171, 171, 1)" />
				</button>
			</div>
			<div className={styles.cardWrapper}>
				{events.length === 0 ? (
					<p className={styles.emptyText}>행사가 없습니다.</p>
				) : (
					events.map((event) => (
						// biome-ignore lint/a11y/useSemanticElements: Cannot use button because it contains nested interactive elements
						<div
							role="button"
							key={event.id}
							tabIndex={0}
							onClick={() => handleDetailClick(event.id)}
							onKeyDown={(e) =>
								e.key === "Enter" && handleDetailClick(event.id)
							}
							className={styles.cardButton}
						>
							<CardView
								key={event.id}
								event={event}
								fullWidth
								onLoginPrompt={() => setIsLoginModalOpen(true)}
							/>
						</div>
					))
				)}
			</div>
		</div>
	);
};

export default EventCardView;
