import type { GuideDefinitions, TourStep } from "../types";

export const DETAIL_VIEW_TUTORIAL_ID = "detail-view-actions-tutorial";

export const DETAIL_VIEW_TOUR_STEPS: TourStep[] = [
	{
		targetIds: ["detail-tour-bookmark"],
		title: "행사 북마크",
		description:
			"관심 있는 행사는 북마크해두고, 북마크 페이지나 마이페이지에서 편하게 모아봐요!",
		placement: "left",
		waitForTarget: true,
		blockTargetInteraction: true,
	},
	{
		targetIds: ["detail-tour-review"],
		title: "행사 후기",
		description:
			"다녀온 행사에 별점과 후기를 남겨보세요. 다음 참가자에게 큰 도움이 됩니다.",
		placement: "left",
		waitForTarget: true,
		blockTargetInteraction: true,
	},
];

export const DETAIL_VIEW_GUIDE: GuideDefinitions = {
	id: DETAIL_VIEW_TUTORIAL_ID,
	page: "/main",
	requiresAuth: false,
	requiredTargetIds: ["detail-tour-bookmark", "detail-tour-review"],
	steps: DETAIL_VIEW_TOUR_STEPS,
};
