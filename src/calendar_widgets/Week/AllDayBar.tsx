import { useMemo } from "react";
import type { DateLocalizer } from "react-big-calendar";
import type { CalendarEvent } from "../../util/types";
import styles from "@styles/AllDayBar.module.css";
import { CATEGORY_COLORS, CATEGORY_LIST } from "../../util/constants";

type Props = {
	date: Date;
	localizer: DateLocalizer;
	events: CalendarEvent[];
	onSelectEvent?: (event: CalendarEvent) => void;
};

function AllDayBar({ date, localizer, events, onSelectEvent }: Props) {
	const weekDays = useMemo(() => {
		const firstDayOfWeek = localizer.startOfWeek?.("ko") ?? 0;
		const start = localizer.startOf(date, "week", firstDayOfWeek);
		const days: Date[] = [];
		for (let i = 0; i < 7; i++) days.push(localizer.add(start, i, "day"));
		return days;
	}, [date, localizer]);

	const weekStart = useMemo(() => {
		const d = weekDays[0];
		return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
	}, [weekDays]);

	const weekEndExclusive = useMemo(() => {
		const last = weekDays[6];
		return new Date(
			last.getFullYear(),
			last.getMonth(),
			last.getDate() + 1,
			0,
			0,
			0,
			0,
		);
	}, [weekDays]);

	const clipped = useMemo(() => {
		return (events ?? [])
			.filter((e) => e?.allDay)
			.map((e) => {
				const start = new Date(e.start);
				const end = new Date(e.end);

				if (end <= weekStart || start >= weekEndExclusive) return null;

				const s = start < weekStart ? weekStart : start;
				const ed = end > weekEndExclusive ? weekEndExclusive : end;

				const sDay = new Date(
					s.getFullYear(),
					s.getMonth(),
					s.getDate(),
					0,
					0,
					0,
					0,
				);
				const eDay = new Date(
					ed.getFullYear(),
					ed.getMonth(),
					ed.getDate(),
					0,
					0,
					0,
					0,
				);

				const startIdx = Math.max(
					0,
					Math.floor(
						(sDay.getTime() - weekStart.getTime()) / (24 * 60 * 60 * 1000),
					),
				);

				let endIdx = Math.floor(
					(eDay.getTime() - weekStart.getTime()) / (24 * 60 * 60 * 1000),
				);
				const isEndAtMidnight =
					ed.getHours() === 0 && ed.getMinutes() === 0 && ed.getSeconds() === 0;
				if (isEndAtMidnight) endIdx = Math.max(startIdx, endIdx - 1);

				endIdx = Math.min(6, endIdx);

				return { original: e, startIdx, endIdx };
			})
			.filter(Boolean) as {
			original: CalendarEvent;
			startIdx: number;
			endIdx: number;
		}[];
	}, [events, weekStart, weekEndExclusive]);

	const placed = useMemo(() => {
		const rows: Array<Array<{ ev: CalendarEvent; s: number; e: number }>> = [];
		const sorted = [...clipped].sort(
			(a, b) => a.startIdx - b.startIdx || a.endIdx - b.endIdx,
		);

		sorted.forEach(({ original, startIdx, endIdx }) => {
			let row = 0;
			while (true) {
				if (!rows[row]) rows[row] = [];
				const conflict = rows[row].some(
					(it) => !(endIdx < it.s || startIdx > it.e),
				);
				if (!conflict) {
					rows[row].push({ ev: original, s: startIdx, e: endIdx });
					break;
				}
				row += 1;
			}
		});

		return rows;
	}, [clipped]);

	return (
		<div className={styles.allDayWrap}>
			<div className={styles.grid}>
				{placed.map((row, rIdx) =>
					row.map(({ ev, s, e }, i) => {
						const categoryId = ev.resource.event.eventTypeId;
						const bg = CATEGORY_COLORS[categoryId];
						const categoryLabel = CATEGORY_LIST[categoryId];

						return (
							<button
								key={`${rIdx}-${i}-${ev.resource.event.id}`}
								type="button"
								className={styles.item}
								style={{
									gridColumnStart: s + 1,
									gridColumnEnd: e + 2,
									gridRowStart: rIdx + 1,
									backgroundColor: bg,
								}}
								onClick={() => onSelectEvent?.(ev)}
								title={`${categoryLabel} · ${ev.title}`}
							>
								<span className={styles.itemText}>{ev.title}</span>
							</button>
						);
					}),
				)}
			</div>
		</div>
	);
}

export default AllDayBar;
