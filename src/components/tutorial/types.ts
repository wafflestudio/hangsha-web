export type Placement = "top" | "right" | "bottom" | "left";

export interface TourStep {
	targetIds: string[];
	title: string;
	description: string;
	placement: Placement;
	cursorDemo?: boolean;
	dragDemo?: boolean;
	waitForTarget?: boolean;
	blockTargetInteraction?: boolean;
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
