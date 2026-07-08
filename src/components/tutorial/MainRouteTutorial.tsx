import {
	useCallback,
	useEffect,
	useRef,
	useState,
	type CSSProperties,
} from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { IoIosClose } from "react-icons/io";
import { LuMousePointerClick } from "react-icons/lu";
import styles from "./MainRouteTutorial.module.css";

const STORAGE_KEY = "hangsha-main-route-tutorial-seen";

type Placement = "top" | "right" | "bottom" | "left";

interface TourStep {
	targetIds: string[];
	title: string;
	description: string;
	placement: Placement;
	cursorDemo?: boolean;
}

interface Rect {
	top: number;
	right: number;
	bottom: number;
	left: number;
	width: number;
	height: number;
}

interface Size {
	width: number;
	height: number;
}

const TOUR_STEPS: TourStep[] = [
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

const DEFAULT_BUBBLE_SIZE: Size = {
	width: 320,
	height: 190,
};

const TARGET_PADDING = 8;
const VIEWPORT_MARGIN = 16;
const BUBBLE_GAP = 20;
const VIEW_DEMO_DURATION_MS = 3200;
const WEEK_DEMO_CLICK_MS = 1600;
const DAY_DEMO_CLICK_MS = 2624;

const clamp = (value: number, min: number, max: number) =>
	Math.min(Math.max(value, min), max);

const hasSeenTutorial = () => {
	try {
		return window.localStorage.getItem(STORAGE_KEY) === "true";
	} catch {
		return false;
	}
};

const markTutorialSeen = () => {
	try {
		window.localStorage.setItem(STORAGE_KEY, "true");
	} catch {
		// localStorage can be unavailable in private or restricted browser modes.
	}
};

const isVisibleTarget = (element: HTMLElement) => {
	const rect = element.getBoundingClientRect();
	const style = window.getComputedStyle(element);

	return (
		rect.width > 0 &&
		rect.height > 0 &&
		style.display !== "none" &&
		style.visibility !== "hidden"
	);
};

const getStepTarget = (step: TourStep) => {
	for (const targetId of step.targetIds) {
		const target = document.querySelector<HTMLElement>(
			`[data-tour-id="${targetId}"]`,
		);

		if (target && isVisibleTarget(target)) return target;
	}

	return null;
};

const toRect = (rect: DOMRect): Rect => ({
	top: rect.top,
	right: rect.right,
	bottom: rect.bottom,
	left: rect.left,
	width: rect.width,
	height: rect.height,
});

const getBubbleLayout = (
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

const getCursorDemoStyle = (targetRect: Rect) =>
	({
		left: targetRect.left + targetRect.width * 0.2,
		top: targetRect.top + targetRect.height * 0.65,
		"--cursor-demo-mid-x": `${targetRect.width * 0.3}px`,
		"--cursor-demo-end-x": `${targetRect.width * 0.6}px`,
	}) as CSSProperties;

const getBlockerStyles = (rect: Rect) => {
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

const clickCalendarViewButton = (view: "month" | "week" | "day") => {
	document
		.querySelector<HTMLButtonElement>(`[data-tour-view="${view}"]`)
		?.click();
};

const MainRouteTutorial = () => {
	const [isOpen, setIsOpen] = useState(() => !hasSeenTutorial());
	const [currentStepIndex, setCurrentStepIndex] = useState(0);
	const [targetRect, setTargetRect] = useState<Rect | null>(null);
	const [bubbleSize, setBubbleSize] = useState<Size>(DEFAULT_BUBBLE_SIZE);
	const bubbleRef = useRef<HTMLDivElement>(null);

	const findAvailableStepIndex = useCallback(
		(startIndex: number, direction: 1 | -1) => {
			let index = startIndex;

			while (index >= 0 && index < TOUR_STEPS.length) {
				const step = TOUR_STEPS[index];
				if (step && getStepTarget(step)) return index;
				index += direction;
			}

			return -1;
		},
		[],
	);

	const closeTutorial = useCallback(() => {
		markTutorialSeen();
		setIsOpen(false);
	}, []);

	useEffect(() => {
		if (isOpen) markTutorialSeen();
	}, [isOpen]);

	const updateTargetRect = useCallback(() => {
		const step = TOUR_STEPS[currentStepIndex];
		if (!step) return;

		const target = getStepTarget(step);
		if (!target) {
			const nextIndex = findAvailableStepIndex(currentStepIndex + 1, 1);
			if (nextIndex >= 0) {
				setCurrentStepIndex(nextIndex);
			} else {
				closeTutorial();
			}
			return;
		}

		setTargetRect(toRect(target.getBoundingClientRect()));
	}, [closeTutorial, currentStepIndex, findAvailableStepIndex]);

	useEffect(() => {
		if (!isOpen) return;

		const currentStep = TOUR_STEPS[currentStepIndex];
		if (currentStep && getStepTarget(currentStep)) return;

		const firstAvailableIndex = findAvailableStepIndex(0, 1);
		if (firstAvailableIndex < 0) {
			closeTutorial();
			return;
		}

		if (firstAvailableIndex !== currentStepIndex) {
			setCurrentStepIndex(firstAvailableIndex);
		}
	}, [closeTutorial, currentStepIndex, findAvailableStepIndex, isOpen]);

	useEffect(() => {
		if (!isOpen) return;

		const step = TOUR_STEPS[currentStepIndex];
		if (!step) return;

		const target = getStepTarget(step);
		if (!target) {
			updateTargetRect();
			return;
		}

		target.scrollIntoView({
			block: "center",
			inline: "center",
		});

		const animationFrame = window.requestAnimationFrame(updateTargetRect);
		const timeoutId = window.setTimeout(updateTargetRect, 120);

		return () => {
			window.cancelAnimationFrame(animationFrame);
			window.clearTimeout(timeoutId);
		};
	}, [currentStepIndex, isOpen, updateTargetRect]);

	useEffect(() => {
		if (!isOpen) return;

		window.addEventListener("resize", updateTargetRect);
		window.addEventListener("scroll", updateTargetRect, true);

		const resizeObserver = new ResizeObserver(updateTargetRect);
		resizeObserver.observe(document.body);

		return () => {
			window.removeEventListener("resize", updateTargetRect);
			window.removeEventListener("scroll", updateTargetRect, true);
			resizeObserver.disconnect();
		};
	}, [isOpen, updateTargetRect]);

	useEffect(() => {
		if (!isOpen) return;

		const currentStep = TOUR_STEPS[currentStepIndex];
		if (currentStep?.cursorDemo !== true || !getStepTarget(currentStep)) return;

		let weekTimeoutId: number | undefined;
		let dayTimeoutId: number | undefined;

		const runViewClickDemo = () => {
			clickCalendarViewButton("month");
			weekTimeoutId = window.setTimeout(
				() => clickCalendarViewButton("week"),
				WEEK_DEMO_CLICK_MS,
			);
			dayTimeoutId = window.setTimeout(
				() => clickCalendarViewButton("day"),
				DAY_DEMO_CLICK_MS,
			);
		};

		runViewClickDemo();
		const intervalId = window.setInterval(
			runViewClickDemo,
			VIEW_DEMO_DURATION_MS,
		);

		return () => {
			window.clearInterval(intervalId);
			if (weekTimeoutId !== undefined) window.clearTimeout(weekTimeoutId);
			if (dayTimeoutId !== undefined) window.clearTimeout(dayTimeoutId);
			clickCalendarViewButton("month");
		};
	}, [currentStepIndex, isOpen]);

	const setBubbleNode = useCallback((node: HTMLDivElement | null) => {
		bubbleRef.current = node;
		if (!node) return;

		const rect = node.getBoundingClientRect();
		setBubbleSize((previousSize) => {
			const nextSize = {
				width: rect.width,
				height: rect.height,
			};

			if (
				Math.abs(previousSize.width - nextSize.width) < 1 &&
				Math.abs(previousSize.height - nextSize.height) < 1
			) {
				return previousSize;
			}

			return nextSize;
		});
	}, []);

	const goToStep = (direction: 1 | -1) => {
		const nextIndex = findAvailableStepIndex(
			currentStepIndex + direction,
			direction,
		);

		if (nextIndex >= 0) {
			setCurrentStepIndex(nextIndex);
			return;
		}

		if (direction === 1) closeTutorial();
	};

	if (!isOpen || !targetRect) return null;

	const currentStep = TOUR_STEPS[currentStepIndex];
	if (!currentStep) return null;

	const highlightedRect: Rect = {
		top: targetRect.top - TARGET_PADDING,
		left: targetRect.left - TARGET_PADDING,
		right: targetRect.right + TARGET_PADDING,
		bottom: targetRect.bottom + TARGET_PADDING,
		width: targetRect.width + TARGET_PADDING * 2,
		height: targetRect.height + TARGET_PADDING * 2,
	};
	const highlightedStyle = {
		top: highlightedRect.top,
		left: highlightedRect.left,
		width: highlightedRect.width,
		height: highlightedRect.height,
	};
	const hasPreviousStep = findAvailableStepIndex(currentStepIndex - 1, -1) >= 0;
	const hasNextStep = findAvailableStepIndex(currentStepIndex + 1, 1) >= 0;
	const bubbleLayout = getBubbleLayout(
		targetRect,
		currentStep.placement,
		bubbleSize,
	);
	const showCursorDemo = currentStep.cursorDemo === true;

	return (
		<div className={styles.tourRoot} aria-live="polite">
			{getBlockerStyles(highlightedRect).map((blockerStyle, index) => (
				<div
					// biome-ignore lint/suspicious/noArrayIndexKey: fixed top/bottom/left/right blocker order
					key={index}
					className={styles.interactionBlocker}
					style={blockerStyle}
				/>
			))}
			<div className={styles.highlight} style={highlightedStyle} />
			{showCursorDemo && (
				<div
					className={styles.cursorDemo}
					style={getCursorDemoStyle(targetRect)}
					aria-hidden="true"
				>
					<span className={styles.cursorClickRing} />
					<LuMousePointerClick />
				</div>
			)}
			<div
				key={currentStepIndex}
				ref={setBubbleNode}
				className={styles.bubble}
				data-side={bubbleLayout.side}
				style={bubbleLayout.style}
				role="dialog"
				aria-modal="true"
				aria-labelledby="main-route-tutorial-title"
			>
				<button
					type="button"
					className={styles.closeButton}
					onClick={closeTutorial}
					aria-label="튜토리얼 닫기"
				>
					<IoIosClose size={28} aria-hidden="true" />
				</button>
				<h2 id="main-route-tutorial-title" className={styles.title}>
					{currentStep.title}
				</h2>
				<p className={styles.description}>{currentStep.description}</p>
				<div className={styles.controls}>
					<button
						type="button"
						className={styles.chevronButton}
						onClick={() => goToStep(-1)}
						disabled={!hasPreviousStep}
						aria-label="이전 튜토리얼"
					>
						<FaChevronLeft aria-hidden="true" />
					</button>
					<div className={styles.dots} aria-hidden="true">
						{TOUR_STEPS.map((step, index) => (
							<span
								key={step.targetIds[0]}
								className={`${styles.dot} ${
									index === currentStepIndex ? styles.activeDot : ""
								}`}
							/>
						))}
					</div>
					<button
						type="button"
						className={styles.chevronButton}
						onClick={() => goToStep(1)}
						aria-label={hasNextStep ? "다음 튜토리얼" : "튜토리얼 완료"}
					>
						<FaChevronRight aria-hidden="true" />
					</button>
				</div>
			</div>
		</div>
	);
};

export default MainRouteTutorial;
