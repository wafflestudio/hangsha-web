import { useMemo } from "react";
import {
	DAY_LABELS_KO,
	type Day,
	type GetCoursesResponse,
	type Course,
} from "../../util/types";
import type {
	GridConfig,
	TimetableGridBlock,
} from "../../util/weekly_timetable/layout";
import { formatAmPmFromMinutes } from "../../util/weekly_timetable/time";
import { MdCancel } from "react-icons/md";
import styles from "@styles/Timetable.module.css";

export type TimetableProps = {
	timetableId: number;
	items: GetCoursesResponse[];
	config: GridConfig;
	toBlocks: (
		items: GetCoursesResponse[],
		config: GridConfig,
	) => TimetableGridBlock<Course>[];
	onSelectBlock?: (id: number, item: Course) => void;
	onAddBlock?: (id: number, item: Course) => void;
	onRemoveBlock?: (timetableId: number, enrollId: number) => Promise<void>;
	isSimplified?: boolean;
	dayLabels?: Record<Day, string>;
};

const Days: Day[] = [0, 1, 2, 3, 4, 5, 6];

export function TimetableGrid({
	timetableId,
	items,
	config,
	toBlocks,
	onRemoveBlock,
	isSimplified = false,
	dayLabels = DAY_LABELS_KO,
}: TimetableProps) {
	const blocks = useMemo(
		() => toBlocks(items, config),
		[items, config, toBlocks],
	);
	const totalHeight = config.endHour * 60 * config.ppm;

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
		const map: Record<Day, TimetableGridBlock<Course>[]> = {
			0: [],
			1: [],
			2: [],
			3: [],
			4: [],
			5: [],
			6: [],
		};
		for (const b of blocks) map[b.day].push(b);
		return map;
	}, [blocks]);

	return (
		<div className={styles.gridWrap}>
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
						<DayColumn<Course>
							key={d}
							timetableId={timetableId}
							height={totalHeight}
							blocks={blocksByDay[d]}
							config={config}
							// onSelectBlock={onSelectBlock}
							onRemoveBlock={onRemoveBlock}
							isSimplified={isSimplified}
						/>
					))}
				</div>
			</div>
		</div>
	);
}

function DayColumn<T>({
	timetableId,
	height,
	blocks,
	config,
	onSelectBlock,
	onRemoveBlock,
	isSimplified,
}: {
	timetableId: number;
	height: number;
	blocks: TimetableGridBlock<T>[];
	config: GridConfig;
	onSelectBlock?: (id: number, item: T) => void;
	onRemoveBlock?: (timetableId: number, enrollId: number) => Promise<void>;
	isSimplified: boolean;
}) {
	return (
		<div className={styles.dayCol} style={{ height }}>
			<GridLines height={height} cfg={config} />

			{blocks.map((b) => (
				<button
					key={b.id}
					className={`${styles.block} ${
						isSimplified ? styles.simplifiedBlock : ""
					}`}
					style={{
						top: b.top,
						height: b.height,
						width: `${b.widthPct}%`,
					}}
					onClick={() => onSelectBlock?.(b.id, b.raw)}
					type="button"
				>
					{onRemoveBlock && (
						<MdCancel
							className={styles.blockRemove}
							onClick={(e) => {
								e.stopPropagation();
								void onRemoveBlock(timetableId, b.enrollId);
							}}
						/>
					)}

					<div className={styles.blockTitle}>{b.title}</div>

					<div className={styles.blockTime}>
						{formatAmPmFromMinutes(b.startMin)} -{" "}
						{formatAmPmFromMinutes(b.endMin)}
					</div>
				</button>
			))}
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
