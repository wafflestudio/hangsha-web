// 모집 현황 필터 개수
export const STATUS_NUMBER = 3;
// '기타' index
export const CATEGORY_OTHER_INDEX = 7;
// 카테고리 최소 index
export const CATEGORY_MIN_INDEX = 4;
// 카테고리 최대 index
export const CATEGORY_MAX_INDEX = 10;


export const CATEGORY_COLORS: Record<number, string> = {
	1: "rgba(255, 140, 40, 0.6)",
	2: "rgba(186, 158, 49, 0.6)",
	3: "rgba(11, 206, 131, 0.6)",
	4: "rgba(0, 193, 232, 0.6)",
	5: "rgba(0, 136, 255, 0.6)",
	6: "rgba(162, 90, 255, 0.6)",
	7: "rgba(255, 45, 83, 0.6)",
};

export const CATEGORY_BUTTON_COLORS: Record<number, string> = {
	1: "rgba(255, 140, 40, 0.15)",
	2: "rgba(255, 204, 0, 0.15)",
	3: "rgba(11, 206, 131, 0.15)",
	4: "rgba(0, 193, 232, 0.15)",
	5: "rgba(0, 136, 255, 0.15)",
	6: "rgba(162, 90, 255, 0.15)",
	7: "rgba(255, 45, 83, 0.15)",
};

export const CATEGORY_TEXT_COLORS: Record<number, string> = {
	1: "#cc874c",
	2: "#ad9227",
	3: "#36a47a",
	4: "#3498c0",
	5: "#3d73c4",
	6: "#824acd",
	7: "#c84059",
};

export const CATEGORY_LIST: Record<number, string> = {
	1: "교육(특강/세미나)",
	2: "공모전/경진대회",
	3: "현장학습/인턴",
	4: "사회공헌(봉사)",
	5: "학습/진로상담",
	6: "OpenLnL",
	7: "기타",
};
