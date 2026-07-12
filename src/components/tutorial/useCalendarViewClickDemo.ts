import { useEffect } from "react";
import { getStepTarget } from "./tutorialTargets";
import type { TourStep } from "./types";

const VIEW_DEMO_DURATION_MS = 3200;
const WEEK_DEMO_CLICK_MS = 1600;
const DAY_DEMO_CLICK_MS = 2624;

const clickCalendarViewButton = (view: "month" | "week" | "day") => {
	document
		.querySelector<HTMLButtonElement>(`[data-tour-view="${view}"]`)
		?.click();
};

export const useCalendarViewClickDemo = (
	isOpen: boolean,
	currentStep: TourStep | undefined,
) => {
	useEffect(() => {
		if (!isOpen) return;
		if (currentStep?.cursorDemo !== true || !getStepTarget(currentStep)) return;

		let weekTimeoutId: number | undefined;
		let dayTimeoutId: number | undefined;

		const runViewClickDemo = () => {
			clickCalendarViewButton("month");
			weekTimeoutId = window.setTimeout(
				() => clickCalendarViewButton("week"),
				WEEK_DEMO_CLICK_MS,
			);
			dayTimeoutId = window.setTimeout(
				() => clickCalendarViewButton("day"),
				DAY_DEMO_CLICK_MS,
			);
		};

		runViewClickDemo();
		const intervalId = window.setInterval(
			runViewClickDemo,
			VIEW_DEMO_DURATION_MS,
		);

		return () => {
			window.clearInterval(intervalId);
			if (weekTimeoutId !== undefined) window.clearTimeout(weekTimeoutId);
			if (dayTimeoutId !== undefined) window.clearTimeout(dayTimeoutId);
			clickCalendarViewButton("month");
		};
	}, [currentStep, isOpen]);
};
