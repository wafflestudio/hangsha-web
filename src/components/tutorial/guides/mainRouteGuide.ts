import type { GuideDefinitions, TourStep } from "../types";

export const MAIN_ROUTE_TUTORIAL_ID = "main-route-tutorial";

export const MAIN_TOUR_STEPS: TourStep[] = [
	{
		targetIds: ["main-tour-view-toggle"],
		title: "캘린더 모드 전환",
		description:
			"보고 싶은 기간에 맞게 월, 주, 일 보기를 전환해 일정을 확인해 보세요.",
		placement: "bottom",
		cursorDemo: true,
	},
	{
		targetIds: ["main-tour-filters", "main-tour-mobile-filter"],
		title: "행사 필터 설정",
		description:
			"행사 종류, 주최 기관, 모집 현황에 따라 원하는 행사만 빠르게 찾아볼 수 있어요.",
		placement: "right",
	},
	{
		targetIds: ["main-tour-exclude"],
		title: "키워드로 행사 필터링 하기",
		description:
			"관심 없는 키워드를 제외하면 관련 없는 행사를 숨겨 더 편하게 둘러볼 수 있어요.",
		placement: "right",
	},
	{
		targetIds: ["main-tour-pages", "main-tour-bottom-nav"],
		title: "다른 페이지로 이동하기",
		description:
			"찜한 행사와 시간표 등 다른 페이지로 이동해 내 일정과 관심 행사를 함께 확인해 보세요.",
		placement: "right",
	},
	{
		targetIds: ["main-tour-search"],
		title: "행사 검색하기",
		description: "찾고 있는 행사나 키워드가 있다면 검색으로 빠르게 찾아보세요.",
		placement: "left",
	},
];

export const MAIN_ROUTE_GUIDE: GuideDefinitions = {
	id: MAIN_ROUTE_TUTORIAL_ID,
	page: "/main",
	requiresAuth: false,
	steps: MAIN_TOUR_STEPS,
};
