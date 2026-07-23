import { hasSeenTutorial } from "./tutorialStorage";
import type { GuideDefinitions, Rect, TourStep } from "./types";

export const isVisibleTarget = (element: HTMLElement) => {
	const rect = element.getBoundingClientRect();
	const style = window.getComputedStyle(element);

	return (
		rect.width > 0 &&
		rect.height > 0 &&
		style.display !== "none" &&
		style.visibility !== "hidden"
	);
};

export const getTourTarget = (targetId: string) =>
	document.querySelector<HTMLElement>(`[data-tour-id="${targetId}"]`);

export const getStepTarget = (step: TourStep) => {
	for (const targetId of step.targetIds) {
		const target = getTourTarget(targetId);

		if (target && isVisibleTarget(target)) return target;
	}

	return null;
};

export const hasGuideRequiredTargets = (guide: GuideDefinitions) =>
	(guide.requiredTargetIds ?? []).every((targetId) => {
		const target = getTourTarget(targetId);
		return target && isVisibleTarget(target);
	});

export const toRect = (rect: DOMRect): Rect => ({
	top: rect.top,
	right: rect.right,
	bottom: rect.bottom,
	left: rect.left,
	width: rect.width,
	height: rect.height,
});

export const getFirstAvailableStepIndex = (steps: TourStep[]) =>
	steps.findIndex((step) => getStepTarget(step) !== null);

export const getAvailableGuide = (guides: GuideDefinitions[]) =>
	guides.find(
		(guide) =>
			!hasSeenTutorial(guide.id) &&
			hasGuideRequiredTargets(guide) &&
			getFirstAvailableStepIndex(guide.steps) >= 0,
	) ?? null;
