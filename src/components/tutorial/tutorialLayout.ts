import type { CSSProperties } from "react";
import type { Placement, Rect, Size } from "./types";

const VIEWPORT_MARGIN = 16;
const BUBBLE_GAP = 20;
const TARGET_PADDING = 8;

const clamp = (value: number, min: number, max: number) =>
	Math.min(Math.max(value, min), max);

export const DEFAULT_BUBBLE_SIZE: Size = {
	width: 320,
	height: 190,
};

export const getHighlightedRect = (targetRect: Rect): Rect => ({
	top: targetRect.top - TARGET_PADDING,
	left: targetRect.left - TARGET_PADDING,
	right: targetRect.right + TARGET_PADDING,
	bottom: targetRect.bottom + TARGET_PADDING,
	width: targetRect.width + TARGET_PADDING * 2,
	height: targetRect.height + TARGET_PADDING * 2,
});

export const getBubbleLayout = (
	targetRect: Rect,
	preferredPlacement: Placement,
	bubbleSize: Size,
) => {
	const viewportWidth = window.innerWidth;
	const viewportHeight = window.innerHeight;
	const bubbleWidth = Math.min(
		bubbleSize.width,
		viewportWidth - VIEWPORT_MARGIN * 2,
	);
	const bubbleHeight = bubbleSize.height;

	let side = preferredPlacement;
	let left = targetRect.right + BUBBLE_GAP;
	let top = targetRect.top + targetRect.height / 2 - bubbleHeight / 2;

	if (preferredPlacement === "left") {
		left = targetRect.left - bubbleWidth - BUBBLE_GAP;
	}

	if (preferredPlacement === "bottom") {
		left = targetRect.left + targetRect.width / 2 - bubbleWidth / 2;
		top = targetRect.bottom + BUBBLE_GAP;
	}

	if (preferredPlacement === "top") {
		left = targetRect.left + targetRect.width / 2 - bubbleWidth / 2;
		top = targetRect.top - bubbleHeight - BUBBLE_GAP;
	}

	if (
		preferredPlacement === "right" &&
		left + bubbleWidth > viewportWidth - VIEWPORT_MARGIN
	) {
		side = "left";
		left = targetRect.left - bubbleWidth - BUBBLE_GAP;
	}

	if (preferredPlacement === "left" && left < VIEWPORT_MARGIN) {
		side = "right";
		left = targetRect.right + BUBBLE_GAP;
	}

	if (
		preferredPlacement === "bottom" &&
		top + bubbleHeight > viewportHeight - VIEWPORT_MARGIN
	) {
		side = "top";
		top = targetRect.top - bubbleHeight - BUBBLE_GAP;
	}

	if (preferredPlacement === "top" && top < VIEWPORT_MARGIN) {
		side = "bottom";
		top = targetRect.bottom + BUBBLE_GAP;
	}

	left = clamp(
		left,
		VIEWPORT_MARGIN,
		viewportWidth - bubbleWidth - VIEWPORT_MARGIN,
	);
	top = clamp(
		top,
		VIEWPORT_MARGIN,
		viewportHeight - bubbleHeight - VIEWPORT_MARGIN,
	);

	const arrowX = clamp(
		targetRect.left + targetRect.width / 2 - left,
		24,
		bubbleWidth - 24,
	);
	const arrowY = clamp(
		targetRect.top + targetRect.height / 2 - top,
		24,
		bubbleHeight - 24,
	);

	return {
		side,
		style: {
			left,
			top,
			width: bubbleWidth,
			"--tour-arrow-x": `${arrowX}px`,
			"--tour-arrow-y": `${arrowY}px`,
		} as CSSProperties,
	};
};

export const getCursorDemoStyle = (targetRect: Rect) =>
	({
		left: targetRect.left + targetRect.width * 0.2,
		top: targetRect.top + targetRect.height * 0.65,
		"--cursor-demo-mid-x": `${targetRect.width * 0.3}px`,
		"--cursor-demo-end-x": `${targetRect.width * 0.6}px`,
	}) as CSSProperties;

export const getDragDemoStyle = (targetRect: Rect) =>
	({
		left: targetRect.left - 18,
		top: targetRect.top + targetRect.height * 0.38,
		"--drag-demo-x": "-86px",
	}) as CSSProperties;

export const getBlockerStyles = (rect: Rect) => {
	const viewportWidth = window.innerWidth;
	const viewportHeight = window.innerHeight;

	return [
		{
			top: 0,
			left: 0,
			width: viewportWidth,
			height: Math.max(0, rect.top),
		},
		{
			top: rect.bottom,
			left: 0,
			width: viewportWidth,
			height: Math.max(0, viewportHeight - rect.bottom),
		},
		{
			top: rect.top,
			left: 0,
			width: Math.max(0, rect.left),
			height: rect.height,
		},
		{
			top: rect.top,
			left: rect.right,
			width: Math.max(0, viewportWidth - rect.right),
			height: rect.height,
		},
	] satisfies CSSProperties[];
};
