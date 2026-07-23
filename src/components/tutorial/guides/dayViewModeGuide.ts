import type { GuideDefinitions, TourStep } from "../types";

export const DAY_VIEW_MODE_TUTORIAL_ID = "day-view-mode-tutorial";

export const DAY_VIEW_MODE_TOUR_STEPS: TourStep[] = [
	{
		targetIds: ["day-tour-view-mode-toggle"],
		title: "보기 모드 전환",
		description:
			"일별 뷰에서는 '표', '갤러리', '시간표' 모드로 전환해 원하는 방식으로 행사를 확인할 수 있어요.",
		placement: "left",
	},
];

export const DAY_VIEW_MODE_GUIDE: GuideDefinitions = {
	id: DAY_VIEW_MODE_TUTORIAL_ID,
	page: "/main",
	requiresAuth: false,
	requiredTargetIds: ["day-tour-view-mode-toggle"],
	steps: DAY_VIEW_MODE_TOUR_STEPS,
};
