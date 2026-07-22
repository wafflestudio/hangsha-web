export type Placement = "top" | "right" | "bottom" | "left";

export interface TargetFocusArea {
	maxHeight?: number;
	verticalAnchor?: "top" | "center" | "bottom";
	viewportBottomMargin?: number;
}

export interface TourStep {
	targetIds: string[];
	title: string;
	description: string;
	placement: Placement;
	focusArea?: TargetFocusArea;
	cursorDemo?: boolean;
	dragDemo?: boolean;
	waitForTarget?: boolean;
	blockTargetInteraction?: boolean;
	scrollTargetIntoView?: boolean;
}

export interface GuideDefinitions {
	id: string;
	page: string;
	requiresAuth: boolean;
	requiredTargetIds?: string[];
	steps: TourStep[];
}

export interface Rect {
	top: number;
	right: number;
	bottom: number;
	left: number;
	width: number;
	height: number;
}

export interface Size {
	width: number;
	height: number;
}
