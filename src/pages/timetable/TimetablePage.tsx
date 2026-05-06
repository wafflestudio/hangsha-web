import { useEffect, useState, useMemo } from "react";
import { Views } from "react-big-calendar";
import { useTimetable } from "../../contexts/TimetableContext";
import { useEvents } from "../../contexts/EventContext";
import { useFilter } from "../../contexts/FilterContext";
import type {
	CalendarEvent,
	Event,
	FetchWeekEventArgs,
	Semester,
} from "../../util/types";
import { AddClassPanel } from "./AddClassPanel";
import {
	flattenCoursesToBlocks,
	config,
} from "../../util/weekly_timetable/layout";
import calendarEventMapper from "../../util/Calendar/calendarEventMapper";
import { formatDateToYYYYMMDD } from "../../util/Calendar/dateFormatter";
import { TimetableGrid } from "./TimetableGrid";
import styles from "@styles/Timetable.module.css";
import { SlArrowLeft } from "react-icons/sl";
import { TimeTableSidebar } from "./TimeTableSidebar";
import TimeTableToolbar from "./TimeTableToolbar";
import BottomNav from "@/widgets/BottomNav";

export default function TimetablePage() {
	const now = new Date();
	const years = Array.from({ length: 10 }, (_, i) => now.getFullYear() - i);
	const semesters: { id: Semester; label: string }[] = [
		{ id: "SPRING", label: "1학기" },
		{ id: "SUMMER", label: "여름 학기" },
		{ id: "FALL", label: "2학기" },
		{ id: "WINTER", label: "겨울 계절" },
	];

	const {
		timetables,
		courses,
		currentTimetable,
		createTimetable,
		loadTimetable,
		selectTimetable,
		updateTimetableName,
		deleteTimetable,
		loadCourses,
		addCustomCourse,
		// updateCustomCourse,
		deleteCourse,
	} = useTimetable();
	const { weekViewData, fetchWeekEvents } = useEvents();
	const { globalCategory, globalOrg, globalStatus } = useFilter();

	const [year, setYear] = useState<number>(now.getFullYear());
	const [semester, setSemester] = useState<Semester>("SPRING");
	const [tableName, setTableName] = useState<string>("");
	const [isAddClassPanelOpen, setIsAddClassPanelOpen] = useState(false);
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);
	const [isTimetableSimplified, setIsTimetableSimplified] = useState(false);

	useEffect(() => {
		loadTimetable(year, semester);
	}, [year, semester, loadTimetable]);

	// 현재 등록된 시간표가 존재할 경우 첫 번째 시간표를 선택
	useEffect(() => {
		if (!currentTimetable) return;
		loadCourses(currentTimetable.id);
	}, [currentTimetable, loadCourses]);

	useEffect(() => {
		if (!currentTimetable) {
			setIsAddClassPanelOpen(false);
			setTableName("");
			return;
		}
		setTableName(currentTimetable.name ?? "");
	}, [currentTimetable]);

	const hasTimetable = !!currentTimetable;
	const visibleCourses = hasTimetable ? (courses ?? []) : [];

	const allSlots = useMemo(
		() => visibleCourses.flatMap((c) => c.course.timeSlots),
		[visibleCourses],
	);

	useEffect(() => {
		const today = new Date();
		const from = new Date(today);
		from.setDate(from.getDate() - from.getDay());

		const to = new Date(from);
		to.setDate(to.getDate() + 6);

		const params: FetchWeekEventArgs = {
			from: formatDateToYYYYMMDD(from),
			to: formatDateToYYYYMMDD(to),
		};

		if (globalCategory) params.eventTypeId = globalCategory.map((g) => g.id);
		if (globalOrg) params.orgId = globalOrg.map((g) => g.id);
		if (globalStatus) params.statusId = globalStatus.map((g) => g.id);

		void fetchWeekEvents(params);
	}, [fetchWeekEvents, globalCategory, globalOrg, globalStatus]);

	const weekCalendarEvents = useMemo(() => {
		const weekStart = new Date();
		weekStart.setHours(0, 0, 0, 0);
		weekStart.setDate(weekStart.getDate() - weekStart.getDay());

		const weekEnd = new Date(weekStart);
		weekEnd.setDate(weekEnd.getDate() + 6);
		weekEnd.setHours(23, 59, 59, 999);

		const rawWeekEvents = Object.values(weekViewData?.byDate || {}).flatMap(
			(bucket) => bucket.events,
		);
		const uniqueWeekEvents = Array.from(
			new Map(rawWeekEvents.map((event: Event) => [event.id, event])).values(),
		);

		return uniqueWeekEvents
			.map((event) => calendarEventMapper(event, Views.WEEK) as CalendarEvent)
			.filter(
				(calendarEvent) =>
					calendarEvent.start >= weekStart && calendarEvent.end <= weekEnd,
			)
			.map((calendarEvent) => {
				const sameMinute =
					Math.floor(calendarEvent.start.getTime() / 60000) ===
					Math.floor(calendarEvent.end.getTime() / 60000);
				const startDay = new Date(
					calendarEvent.start.getFullYear(),
					calendarEvent.start.getMonth(),
					calendarEvent.start.getDate(),
				);
				const endDay = new Date(
					calendarEvent.end.getFullYear(),
					calendarEvent.end.getMonth(),
					calendarEvent.end.getDate(),
				);
				const differentDate =
					startDay.getFullYear() !== endDay.getFullYear() ||
					startDay.getMonth() !== endDay.getMonth() ||
					startDay.getDate() !== endDay.getDate();

				return {
					...calendarEvent,
					allDay: Boolean(calendarEvent.allDay) || differentDate || sameMinute,
				};
			})
			.filter(
				(calendarEvent) =>
					calendarEvent.resource.isPeriodEvent === false &&
					calendarEvent.allDay === false,
			);
	}, [weekViewData]);

	return (
		<div
			className={`${styles.page} ${
				isAddClassPanelOpen
					? styles.AddClassPanelOpen
					: styles.AddClassPanelClosed
			} ${isSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}
		>
			<TimeTableSidebar
				timetables={timetables}
				onAddTimetable={() =>
					createTimetable({
						year,
						semester,
						name: "새 시간표",
					})
				}
				onSelectTimetable={selectTimetable}
				onRename={updateTimetableName}
				onDelete={deleteTimetable}
				isOpen={isSidebarOpen}
				onOpenChange={setIsSidebarOpen}
			/>

			<main className={styles.main}>
				<TimeTableToolbar
					timetableName={tableName}
					year={year}
					semester={semester}
					SEMESTER_LABEL={semesters}
					onSemesterChange={setSemester}
					onYearChange={setYear}
					isToggleOn={isTimetableSimplified}
					onToggleChange={setIsTimetableSimplified}
					years={years}
				/>

				{!hasTimetable ? (
					<div style={{ padding: 16 }}>
						<div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
							선택된 시간표가 없어요
						</div>
						<div style={{ opacity: 0.7, lineHeight: 1.5 }}>
							왼쪽 사이드바에서 시간표를 추가하거나 선택해 주세요.
						</div>
					</div>
				) : (
					<TimetableGrid
						timetableId={currentTimetable.id}
						items={courses ?? []}
						config={config}
						toBlocks={flattenCoursesToBlocks}
						onRemoveBlock={deleteCourse}
						isSimplified={isTimetableSimplified}
						weekEvents={isTimetableSimplified ? weekCalendarEvents : []}
					/>
				)}
			</main>

			{hasTimetable && !isAddClassPanelOpen && (
				<button
					type="button"
					className={styles.addButton}
					onClick={() => setIsAddClassPanelOpen(true)}
				>
					<SlArrowLeft /> 수업 추가
				</button>
			)}

			{hasTimetable && isAddClassPanelOpen && (
				<AddClassPanel
					timetableId={currentTimetable.id}
					onAdd={addCustomCourse}
					allSlots={allSlots}
					year={year}
					semester={semester}
					setIsClicked={setIsAddClassPanelOpen}
				/>
			)}
			<BottomNav />
		</div>
	);
}
