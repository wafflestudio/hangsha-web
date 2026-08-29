import {
	useMemo,
	useRef,
	useState,
	type CSSProperties,
	type PointerEvent,
} from "react";
import type { CalendarEvent } from "@/util/types";
import {
	CATEGORY_COLORS,
	CATEGORY_OTHER_INDEX,
	CATEGORY_TEXT_COLORS,
} from "@/util/constants";
import styles from "./MobileEventSheet.module.css";

type Props = {
	periodEvents: CalendarEvent[];
	allDayEvents: CalendarEvent[];
	weekDate: Date;
};

type PositionedEvent = {
	event: CalendarEvent;
	start: number;
	end: number;
	lane: number;
	continuesBefore: boolean;
	continuesAfter: boolean;
};

const DAY_COUNT = 5;

function startOfMonday(date: Date) {
	const result = new Date(date);
	result.setHours(0, 0, 0, 0);
	const offset = (result.getDay() + 6) % 7;
	result.setDate(result.getDate() - offset);
	return result;
}

function endOfFriday(date: Date) {
	const result = startOfMonday(date);
	result.setDate(result.getDate() + 4);
	result.setHours(23, 59, 59, 999);
	return result;
}

function dayIndex(date: Date, weekStart: Date) {
	const normalized = new Date(date);
	normalized.setHours(0, 0, 0, 0);
	return Math.round(
		(normalized.getTime() - weekStart.getTime()) / (24 * 60 * 60 * 1000),
	);
}

function layoutEvents(
	events: CalendarEvent[],
	weekStart: Date,
	weekEnd: Date,
	isAllDay: boolean,
): PositionedEvent[] {
	const lanes: PositionedEvent[][] = [];

	return [...events]
		.filter((event) => event.start <= weekEnd && event.end >= weekStart)
		.map((event) => {
			const displayEnd = new Date(event.end);
			if (
				isAllDay &&
				displayEnd.getHours() === 0 &&
				displayEnd.getMinutes() === 0 &&
				displayEnd.getSeconds() === 0
			) {
				displayEnd.setMilliseconds(displayEnd.getMilliseconds() - 1);
			}

			return {
				event,
				start: Math.max(0, dayIndex(event.start, weekStart)),
				end: Math.min(DAY_COUNT - 1, dayIndex(displayEnd, weekStart)),
				lane: 0,
				continuesBefore: event.start < weekStart,
				continuesAfter: event.end > weekEnd,
			};
		})
		.filter((event) => event.end >= 0 && event.start < DAY_COUNT)
		.sort((a, b) => a.start - b.start || b.end - a.end)
		.map((event) => {
			let lane = 0;
			while (
				lanes[lane]?.some(
					(placed) => !(event.end < placed.start || event.start > placed.end),
				)
			) {
				lane += 1;
			}
			if (!lanes[lane]) lanes[lane] = [];
			lanes[lane].push({ ...event, lane });
			return { ...event, lane };
		});
}

export function MobileEventSheet({
	periodEvents,
	allDayEvents,
	weekDate,
}: Props) {
	const [isExpanded, setIsExpanded] = useState(false);
	const dragStartY = useRef<number | null>(null);
	const weekStart = useMemo(() => startOfMonday(weekDate), [weekDate]);
	const weekEnd = useMemo(() => endOfFriday(weekDate), [weekDate]);
	const positionedPeriods = useMemo(
		() => layoutEvents(periodEvents, weekStart, weekEnd, false),
		[periodEvents, weekStart, weekEnd],
	);
	const positionedAllDay = useMemo(
		() => layoutEvents(allDayEvents, weekStart, weekEnd, true),
		[allDayEvents, weekStart, weekEnd],
	);
	const periodLaneCount = useMemo(
		() => Math.max(1, ...positionedPeriods.map((item) => item.lane + 1)),
		[positionedPeriods],
	);

	const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
		dragStartY.current = event.clientY;
		event.currentTarget.setPointerCapture(event.pointerId);
	};

	const onPointerUp = (event: PointerEvent<HTMLButtonElement>) => {
		const startY = dragStartY.current;
		dragStartY.current = null;
		if (startY === null) return;

		const deltaY = event.clientY - startY;
		if (Math.abs(deltaY) < 8) {
			setIsExpanded((expanded) => !expanded);
		} else if (deltaY < 0) {
			setIsExpanded(true);
		} else {
			setIsExpanded(false);
		}
	};

	return (
		<section
			className={`${styles.sheet} ${isExpanded ? styles.expanded : styles.collapsed}`}
			aria-label="행사 타임라인"
		>
			<button
				type="button"
				className={styles.grabberButton}
				aria-expanded={isExpanded}
				aria-label={isExpanded ? "행사 타임라인 접기" : "행사 타임라인 열기"}
				onPointerDown={onPointerDown}
				onPointerUp={onPointerUp}
				onPointerCancel={() => {
					dragStartY.current = null;
				}}
			>
				<span className={styles.grabber} />
			</button>

			<div className={styles.content} aria-hidden={!isExpanded}>
				<header className={styles.header}>
					<h2>기간제 행사 타임라인</h2>
				</header>

				<div
					className={styles.timeline}
					style={{ "--period-lane-count": periodLaneCount } as CSSProperties}
				>
					{positionedPeriods.length === 0 ? (
						<p className={styles.empty}>이번 주 기간제 행사가 없어요.</p>
					) : (
						positionedPeriods.map((item) => (
							<PeriodItem key={item.event.resource.event.id} item={item} />
						))
					)}
				</div>

				<div className={styles.allDaySection}>
					<h3>종일 행사</h3>
					<div className={styles.weekLabels} aria-hidden="true">
						{["월", "화", "수", "목", "금"].map((label) => (
							<span key={label}>{label}</span>
						))}
					</div>
					<div className={styles.allDayGrid}>
						{positionedAllDay.length === 0 ? (
							<p className={styles.empty}>이번 주 종일 행사가 없어요.</p>
						) : (
							positionedAllDay.map((item) => (
								<AllDayItem key={item.event.resource.event.id} item={item} />
							))
						)}
					</div>
				</div>
			</div>
		</section>
	);
}

function PeriodItem({ item }: { item: PositionedEvent }) {
	const categoryId = item.event.resource.event.eventTypeId;
	const color =
		CATEGORY_TEXT_COLORS[categoryId] ??
		CATEGORY_TEXT_COLORS[CATEGORY_OTHER_INDEX];
	const span = item.end - item.start + 1;
	const style = {
		"--start": item.start + 1,
		"--span": span,
		"--lane": item.lane,
		"--event-color": color,
	} as CSSProperties;

	return (
		<div className={styles.periodItem} style={style} title={item.event.title}>
			<span className={styles.periodTitle}>{item.event.title}</span>
			<span
				className={`${styles.periodLine} ${item.continuesBefore ? styles.arrowLeft : ""} ${
					item.continuesAfter ? styles.arrowRight : ""
				}`}
			/>
		</div>
	);
}

function AllDayItem({ item }: { item: PositionedEvent }) {
	const categoryId = item.event.resource.event.eventTypeId;
	const color =
		CATEGORY_COLORS[categoryId] ?? CATEGORY_COLORS[CATEGORY_OTHER_INDEX];
	const style = {
		gridColumn: `${item.start + 1} / span ${item.end - item.start + 1}`,
		gridRow: item.lane + 1,
		backgroundColor: color,
	} as CSSProperties;

	return (
		<div className={styles.allDayItem} style={style} title={item.event.title}>
			{item.event.title}
		</div>
	);
}
