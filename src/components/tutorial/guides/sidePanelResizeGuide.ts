import type { GuideDefinitions, TourStep } from "../types";

export const SIDE_PANEL_RESIZE_TUTORIAL_ID = "side-panel-resize-tutorial";

export const SIDE_PANEL_RESIZE_TOUR_STEPS: TourStep[] = [
	{
		targetIds: ["detail-tour-resize-handle"],
		title: "행사 상세 화면 너비 조절",
		description:
			"상세 화면의 맨 왼쪽 부분을 클릭하고 드래그해서, 나에게 맞는 크기로 조절할 수 있어요!",
		placement: "left",
		dragDemo: true,
		waitForTarget: true,
	},
];

export const SIDE_PANEL_RESIZE_GUIDE: GuideDefinitions = {
	id: SIDE_PANEL_RESIZE_TUTORIAL_ID,
	page: "/main",
	requiresAuth: false,
	steps: SIDE_PANEL_RESIZE_TOUR_STEPS,
};
