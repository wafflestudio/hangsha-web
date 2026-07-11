import { DAY_VIEW_MODE_GUIDE } from "./dayViewModeGuide";
import { DETAIL_VIEW_GUIDE } from "./detailViewGuide";
import { MAIN_ROUTE_GUIDE } from "./mainRouteGuide";
import { SIDE_PANEL_RESIZE_GUIDE } from "./sidePanelResizeGuide";
import { WEEK_VIEW_GUIDE } from "./weekViewGuide";
import type { GuideDefinitions } from "../types";

export const TUTORIAL_GUIDES: GuideDefinitions[] = [
	SIDE_PANEL_RESIZE_GUIDE,
	DETAIL_VIEW_GUIDE,
	MAIN_ROUTE_GUIDE,
];

export const DAY_VIEW_TUTORIAL_GUIDES: GuideDefinitions[] = [
	DAY_VIEW_MODE_GUIDE,
	...TUTORIAL_GUIDES,
];

export const WEEK_VIEW_TUTORIAL_GUIDES: GuideDefinitions[] = [
	WEEK_VIEW_GUIDE,
	...TUTORIAL_GUIDES,
];
