import { useMemo, forwardRef } from "react";
import {
	DAY_LABELS_KO,
	type Day,
	type CalendarEvent,
	type Event,
} from "../../util/types";
import type {
	GridConfig,
	WeekGridBlock,
	LayoutedBlock,
} from "../../util/weekly_timetable/layout";
import { layoutDayBlocksLane } from "../../util/weekly_timetable/layout";
import { formatAmPmFromMinutes } from "../../util/weekly_timetable/time";
import { CATEGORY_COLORS } from "@/util/constants";
import styles from "@styles/WeekGrid.module.css";
type WeekGridProps = {
	items: CalendarEvent[];
	config: GridConfig;
	toBlocks: (items: CalendarEvent[], config: GridConfig) => WeekGridBlock[];
	onSelectBlock?: (event: Event) => void;
	dayLabels?: Record<Day, string>;
};

const Days: Day[] = [0, 1, 2, 3, 4, 5, 6];

export const WeekGrid = forwardRef<HTMLDivElement, WeekGridProps>(
	function WeekGrid(
		{ items, config, toBlocks, onSelectBlock, dayLabels = DAY_LABELS_KO },
		ref,
	) {
		const blocks = useMemo(
			() => toBlocks(items, config),
			[items, config, toBlocks],
		);

		const totalHeight = (config.endHour - config.startHour) * 60 * config.ppm;

		const hourMarks = useMemo(() => {
			const list: { hour: number; top: number; label: string }[] = [];
			for (let h = config.startHour; h <= config.endHour; h++) {
				const top = (h * 60 - config.startHour * 60) * config.ppm;
				const labelHour = formatAmPmFromMinutes(h * 60);
				list.push({ hour: h, top, label: labelHour });
			}
			return list;
		}, [config]);

		const blocksByDay = useMemo(() => {
			const map: Record<Day, WeekGridBlock[]> = {
				0: [],
				1: [],
				2: [],
				3: [],
				4: [],
				5: [],
				6: [],
			};
			for (const b of blocks) map[b.day].push(b);

			const laidOut: Record<Day, LayoutedBlock[]> = {
				0: layoutDayBlocksLane(map[0]),
				1: layoutDayBlocksLane(map[1]),
				2: layoutDayBlocksLane(map[2]),
				3: layoutDayBlocksLane(map[3]),
				4: layoutDayBlocksLane(map[4]),
				5: layoutDayBlocksLane(map[5]),
				6: layoutDayBlocksLane(map[6]),
			};

			return laidOut;
		}, [blocks]);

		return (
			<div className={styles.gridWrap} ref={ref}>
				<div className={styles.headerRow}>
					<div className={styles.timeGutterHeader} />
					{Days.map((d) => (
						<div key={d} className={styles.dayHeader}>
							{dayLabels[d]}
						</div>
					))}
				</div>

				<div className={styles.body}>
					<div className={styles.timeGutter} style={{ height: totalHeight }}>
						{hourMarks.map((m) => (
							<div
								key={m.hour}
								className={styles.hourLabel}
								style={{ top: m.top }}
							>
								{m.label}
							</div>
						))}
					</div>

					<div className={styles.days} style={{ height: totalHeight }}>
						{Days.map((d) => (
							<DayColumn
								key={d}
								height={totalHeight}
								blocks={blocksByDay[d]}
								config={config}
								onSelectBlock={onSelectBlock}
							/>
						))}
					</div>
				</div>
			</div>
		);
	},
);

function DayColumn({
	height,
	blocks,
	config,
	onSelectBlock,
}: {
	height: number;
	blocks: LayoutedBlock[];
	config: GridConfig;
	onSelectBlock?: (event: Event) => void;
}) {
	return (
		<div className={styles.dayCol} style={{ height }}>
			<GridLines height={height} cfg={config} />

			{blocks.map((b) => {
				const { event } = b.raw.resource;
				const color = CATEGORY_COLORS[event.eventTypeId] || CATEGORY_COLORS[6];

				return (
					<button
						key={b.blockId}
						className={styles.block}
						style={{
							top: b.top,
							height: b.height,
							left: `${b.leftPct}%`,
							width: `${b.widthPct}%`,
							backgroundColor: color,
							opacity: b.opacity,
							zIndex: b.zIndex,
						}}
						onClick={() => onSelectBlock?.(b.raw.resource.event)}
						type="button"
					>
						<div className={styles.blockTitle}>{b.title}</div>
						<div className={styles.blockTime}>
							{formatAmPmFromMinutes(b.startMin)} -{" "}
							{formatAmPmFromMinutes(b.endMin)}
						</div>
					</button>
				);
			})}
		</div>
	);
}

function GridLines({ height, cfg }: { height: number; cfg: GridConfig }) {
	const stepPx = cfg.ppm * 30;
	const count = Math.floor(height / stepPx);

	return (
		<div className={styles.lines}>
			{Array.from({ length: count }).map((_, i) => (
				<div
					key={i * stepPx}
					className={styles.line}
					style={{ top: i * 30 * cfg.ppm }}
				/>
			))}
		</div>
	);
}
