import type { Day, DayOfWeek } from "../types";

export const STEP_MIN = 5;

export function clampDate(d: Date, min: Date, max: Date) {
	return new Date(
		Math.min(Math.max(d.getTime(), min.getTime()), max.getTime()),
	);
}

// function snapToStep(min: number, step = STEP_MIN) {
// 	return Math.round(min / step) * step;
// }

// function hhmmToMinutes(hh: number, mm: number) {
// 	return hh * 60 + mm;
// }

function minutesToHHMM(min: number) {
	const hh = Math.floor(min / 60);
	const mm = min % 60;
	return { hh, mm };
}

function pad2(n: number) {
	// 두 자리 문자열로 변환
	return String(n).padStart(2, "0");
}

export function formatAmPmFromMinutes(min: number) {
	const { hh, mm } = minutesToHHMM(min);
	const am = hh < 12;
	const hour12 = hh % 12 === 0 ? 12 : hh % 12;
	return `${hour12}:${pad2(mm)} ${am ? "AM" : "PM"}`;
}

export function buildTimeOptions(step = STEP_MIN) {
	const out: { value: number; label: string }[] = [];
	for (let m = 0; m < 24 * 60; m += step) {
		out.push({ value: m, label: formatAmPmFromMinutes(m) });
	}
	return out;
}

export function toMinutesOfDay(date: Date): number {
	return date.getHours() * 60 + date.getMinutes();
}

export function dayIndexFromWeekStart(weekStart: Date, d: Date) {
	const dd = new Date(d);
	dd.setHours(0, 0, 0, 0);
	const ws = new Date(weekStart);
	ws.setHours(0, 0, 0, 0);
	const diffDays = Math.round((dd.getTime() - ws.getTime()) / 86400000);
	return Math.min(6, Math.max(0, diffDays));
}

export const dayToDayOfWeek = (day: Day): DayOfWeek => {
	switch (day) {
		case 0:
			return "SUN";
		case 1:
			return "MON";
		case 2:
			return "TUE";
		case 3:
			return "WED";
		case 4:
			return "THU";
		case 5:
			return "FRI";
		case 6:
			return "SAT";
	}
};

export const dayOfWeekToDay = (dow: DayOfWeek): Day => {
	switch (dow) {
		case "SUN":
			return 0;
		case "MON":
			return 1;
		case "TUE":
			return 2;
		case "WED":
			return 3;
		case "THU":
			return 4;
		case "FRI":
			return 5;
		case "SAT":
			return 6;
	}
};
