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
		targetIds: ["detail-tour-memo"],
		title: "행사 메모",
		description:
			"관심 있는 행사에 메모와 태그를 남겨보세요. 참여 후기는 물론, 참가 계획도 기록할 수 있습니다.",
		placement: "left",
		waitForTarget: true,
		blockTargetInteraction: true,
	},
];

export const DETAIL_VIEW_GUIDE: GuideDefinitions = {
	id: DETAIL_VIEW_TUTORIAL_ID,
	page: "/main",
	requiresAuth: false,
	requiredTargetIds: ["detail-tour-bookmark", "detail-tour-memo"],
	steps: DETAIL_VIEW_TOUR_STEPS,
};
