import type { GuideDefinitions, TourStep } from "../types";

export const WEEK_VIEW_TUTORIAL_ID = "week-view-events-tutorial";

export const WEEK_VIEW_TOUR_STEPS: TourStep[] = [
	{
		targetIds: ["week-tour-participating-events"],
		title: "참여형 행사",
		description:
			"참여형 행사는 시간표에 표시됩니다.\n세미나, 강연 등 참여 시간과 장소가 있는 행사를 확인할 수 있습니다.",
		placement: "right",
	},
	{
		targetIds: ["week-tour-recruiting-events"],
		title: "모집형 행사",
		description:
			"모집형 행사는 시간표 아래에 표시됩니다.\n공모전, 인턴십 등 모집 기간만 있는 행사를 확인할 수 있습니다.",
		placement: "right",
	},
];

export const WEEK_VIEW_GUIDE: GuideDefinitions = {
	id: WEEK_VIEW_TUTORIAL_ID,
	page: "/main",
	requiresAuth: false,
	requiredTargetIds: [
		"week-tour-participating-events",
		"week-tour-recruiting-events",
	],
	steps: WEEK_VIEW_TOUR_STEPS,
};
