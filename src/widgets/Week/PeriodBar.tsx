import { useMemo, useCallback } from "react";
import type { Event, CalendarEvent } from "@/util/types";
import { clampDate, dayIndexFromWeekStart } from "@/util/weekly_timetable/time";
import styles from "@styles/PeriodBar.module.css";
import { CATEGORY_COLORS } from "@/util/constants";
import type { CSSProperties } from "react";

type Props = {
	date: Date;
	items: CalendarEvent[];
	left: number;
	width: number;
	laneHeight?: number;
	laneGap?: number;
	bottomOffset?: number;
	onSelectEvent?: (event: Event) => void;
};

type Bar = {
	id: string | number;
	title: string;
	startIdx: number;
	endIdx: number;
	raw: CalendarEvent;
};

type CSSVarStyle = CSSProperties & {
	[key: `--${string}`]: string;
};

function startOfWeekSunday(d: Date) {
	const x = new Date(d);
	x.setHours(0, 0, 0, 0);
	x.setDate(x.getDate() - x.getDay());
	return x;
}

function endOfWeekSaturday(d: Date) {
	const start = startOfWeekSunday(d);
	const end = new Date(start);
	end.setDate(end.getDate() + 6);
	end.setHours(23, 59, 59, 999);
	return end;
}

function truncate20(s: string) {
	if (!s) return "";
	return s.length > 20 ? `${s.slice(0, 20)}…` : s;
}

function assignLanes(bars: Bar[]) {
	const lanes: Bar[][] = [];
	const placed: Array<Bar & { lane: number }> = [];

	const sorted = [...bars].sort(
		(a, b) => a.startIdx - b.startIdx || a.endIdx - b.endIdx,
	);

	sorted.forEach((bar) => {
		let lane = 0;
		while (true) {
			const laneBars = lanes[lane] ?? [];
			const conflict = laneBars.some(
				(x) => !(bar.endIdx + 1 < x.startIdx || bar.startIdx > x.endIdx + 1),
			);
			if (!conflict) {
				if (!lanes[lane]) lanes[lane] = [];
				lanes[lane].push(bar);
				placed.push({ ...bar, lane });
				break;
			}
			lane += 1;
		}
	});

	return placed;
}

export function PeriodBars({
	date,
	items,
	left,
	width,
	laneHeight = 25,
	laneGap = 6,
	bottomOffset = 8,
	onSelectEvent,
}: Props) {
	console.log("render PeriodBars", { date, items, left, width });
	const weekStart = useMemo(() => startOfWeekSunday(date), [date]);
	const weekEnd = useMemo(() => endOfWeekSaturday(date), [date]);

	const barsWithLane = useMemo(() => {
		const bars: Bar[] = (items ?? [])
			.map((ev) => {
				const start = ev.start;
				const end = ev.end;

				const showLeftArrow = start.getTime() >= weekStart.getTime();
				const showRightArrow = end.getTime() <= weekEnd.getTime();

				const clampedStart = clampDate(start, weekStart, weekEnd);
				const clampedEnd = clampDate(end, weekStart, weekEnd);

				const startIdx = dayIndexFromWeekStart(weekStart, clampedStart);
				const endIdx = dayIndexFromWeekStart(weekStart, clampedEnd);

				return {
					id: ev.resource.event.id,
					title: ev.title,
					startIdx,
					endIdx,
					showLeftArrow,
					showRightArrow,
					raw: ev,
				};
			})
			.filter((b) => b.endIdx >= 0 && b.startIdx <= 6);

		return assignLanes(bars);
	}, [items, weekStart, weekEnd]);

	const laneCount = useMemo(() => {
		return barsWithLane.reduce((m, b) => Math.max(m, b.lane), -1) + 1;
	}, [barsWithLane]);

	const handleClick = useCallback(
		(ev: CalendarEvent) => {
			onSelectEvent?.(ev.resource.event);
		},
		[onSelectEvent],
	);

	return (
		<div
			className={styles.container}
			style={{
				bottom: bottomOffset,
				height: laneCount * laneHeight + Math.max(0, laneCount - 1) * laneGap,
				left: left,
				width: width,
			}}
		>
			{barsWithLane.map((b) => {
				const span = b.endIdx - b.startIdx + 1;

				const leftPct = b.startIdx * ((width - 80) / 7) + 80;
				const widthPct = span * ((width - 80) / 7);

				const displayTitle = truncate20(b.title);

				const categoryId = b.raw.resource.event.eventTypeId;
				const color = CATEGORY_COLORS[categoryId] ?? "#999";
				console.log("color", { categoryId, color });


				const style: CSSVarStyle = {
					left: `${leftPct}px`,
					width: `${widthPct}px`,
					bottom: b.lane * (laneHeight + laneGap),
					height: laneHeight,

					"--period-line": color,
					"--period-text": color,
				};

				return (
					<button
						key={String(b.id)}
						type="button"
						onClick={() => handleClick(b.raw)}
						className={styles.bar}
						style={style}
						title={b.title}
					>
						<div className={styles.line} />

						<div className={styles.label}>
							<span className={styles.title}>{displayTitle}</span>
						</div>
					</button>
				);
			})}
		</div>
	);
}
