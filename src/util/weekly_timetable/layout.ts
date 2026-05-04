import type {
	Course,
	Day,
	TimeSlot,
	GetCoursesResponse,
	CalendarEvent,
} from "../types";
import { dayOfWeekToDay, toMinutesOfDay } from "./time";

export type GridConfig = {
	startHour: number; // 화면 시작 시간
	endHour: number; //화면 끝 시간
	ppm: number; // pixels per minute
};

export type WeekGridBlock = {
	blockId: number;
	sourceId: number;
	day: Day;
	top: number;
	height: number;
	title: string;
	startMin: number;
	endMin: number;
	raw: CalendarEvent;
};

export type TimetableGridBlock<T> = {
	id: number;
	enrollId: number;
	day: Day;
	top: number;
	height: number;
	widthPct: number;
	title: string;
	startMin: number;
	endMin: number;
	raw: T;
};

export type LayoutedBlock = WeekGridBlock & {
	laneIndex: number;
	peakOverlap: number;
	leftPct: number;
	widthPct: number;
	opacity: number;
	zIndex: number;
};

function minutesToTop(min: number, cfg: GridConfig) {
	const startMin = cfg.startHour * 60;
	return (min - startMin) * cfg.ppm;
}

function durationToHeight(startMin: number, endMin: number, cfg: GridConfig) {
	return (endMin - startMin) * cfg.ppm;
}

function toDay(d: number): Day {
	if (d < 0 || d > 6) {
		throw new Error(`Invalid day value: ${d}`);
	}
	return d as Day;
}

export function flattenCoursesToBlocks(
	coursesRes: GetCoursesResponse[],
	cfg: GridConfig,
): TimetableGridBlock<Course>[] {
	const blocks: TimetableGridBlock<Course>[] = [];
	for (const courseRes of coursesRes) {
		courseRes.course.timeSlots.forEach((slot: TimeSlot) => {
			blocks.push({
				id: courseRes.course.id,
				enrollId: courseRes.enrollId,
				title: courseRes.course.courseTitle,
				day: dayOfWeekToDay(slot.dayOfweek),
				startMin: slot.startAt,
				endMin: slot.endAt,
				top: minutesToTop(slot.startAt, cfg),
				height: durationToHeight(slot.startAt, slot.endAt, cfg),
				widthPct: 100,
				raw: courseRes.course,
			});
		});
	}

	return blocks;
}

export function flattenEventsToBlocks(
	cevents: CalendarEvent[],
	cfg: GridConfig,
): WeekGridBlock[] {
	const blocks: WeekGridBlock[] = [];

	cevents.forEach((cevent, idx) => {
		const start = cevent.resource.event.eventStart;
		const end = cevent.resource.event.eventEnd;

		if (!start || !end) return;

		// if (
		// 	start.getFullYear() !== end.getFullYear() ||
		// 	start.getMonth() !== end.getMonth() ||
		// 	start.getDate() !== end.getDate()
		// ) return;

		const startMin = toMinutesOfDay(start);
		const endMin = toMinutesOfDay(end);

		blocks.push({
			blockId: idx,
			sourceId: cevent.resource.event.id,
			title: cevent.title,
			day: toDay(start.getDay()),
			top: minutesToTop(startMin, cfg),
			height: durationToHeight(startMin, endMin, cfg),
			startMin,
			endMin,
			raw: cevent,
		});
	});

	return blocks;
}

// 겹침 체크
export function hasOverlap(existing: TimeSlot[], next: TimeSlot) {
	return existing.some(
		(s) =>
			s.dayOfweek === next.dayOfweek &&
			next.startAt < s.endAt &&
			s.startAt < next.endAt,
	);
}

export const config: GridConfig = {
	startHour: 7,
	endHour: 24,
	ppm: 0.9,
};

export function layoutDayBlocksLane(blocks: WeekGridBlock[]): LayoutedBlock[] {
	if (blocks.length === 0) return [];

	// sorting
	const sorted = [...blocks].sort((a, b) => {
		if (a.startMin !== b.startMin) return a.startMin - b.startMin;
		return a.endMin - b.endMin;
	});

	// lane 배치
	const laneEnd: number[] = [];
	const laneIndexMap = new Map<number, number>(); //blockId, LaneIndex

	for (const b of sorted) {
		let placed = false;

		for (let i = 0; i < laneEnd.length; i++) {
			if (b.startMin >= laneEnd[i]) {
				laneEnd[i] = b.endMin;
				laneIndexMap.set(b.blockId, i);
				placed = true;
				break;
			}
		}

		if (!placed) {
			laneEnd.push(b.endMin);
			laneIndexMap.set(b.blockId, laneEnd.length - 1);
		}
	}

	const peakMap = new Map<number, number>(); //blockId, peakOverlap
	for (const a of sorted) {
		let peak = 1;
		for (const t of sorted) {
			const time = t.startMin;
			if (time < a.startMin || time >= a.endMin) continue;

			let alive = 0;
			for (const x of sorted) {
				if (x.startMin <= time && time < x.endMin) alive++;
			}
			peak = Math.max(peak, alive);
		}
		peakMap.set(a.blockId, peak);
	}

	//2개까지만 분할 3개 이상이면 overlap
	const result: LayoutedBlock[] = [];

	for (const b of sorted) {
		const laneIndex = laneIndexMap.get(b.blockId) ?? 0;
		const peakOverlap = peakMap.get(b.blockId) ?? 1;

		// 기본값
		let widthPct = 100; //이후에 config 값으로 바꾸기
		let leftPct = 0;
		let opacity = 1;
		let zIndex = 2;

		if (peakOverlap === 2) {
			//2개 겹침
			widthPct = 50;
			leftPct = (laneIndex % 2) * 50;
			opacity = 1;
			zIndex = 3;
		} else if (peakOverlap >= 3) {
			if (laneIndex <= 1) {
				widthPct = 50;
				leftPct = laneIndex * 50;
				opacity = 1;
				zIndex = 3;
			} else {
				widthPct = 100;
				leftPct = 0;
				opacity = 0.5;
				zIndex = 1;
			}
		}
		result.push({
			...b,
			laneIndex,
			peakOverlap,
			leftPct,
			widthPct,
			opacity,
			zIndex,
		});
	}
	return result;
}
