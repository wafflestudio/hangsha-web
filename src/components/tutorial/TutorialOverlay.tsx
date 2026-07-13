import {
	useCallback,
	useEffect,
	useState,
	type MouseEvent as ReactMouseEvent,
} from "react";
import styles from "./MainRouteTutorial.module.css";
import { TutorialBubble } from "./TutorialBubble";
import { TutorialPointerDemos } from "./TutorialPointerDemos";
import {
	DEFAULT_BUBBLE_SIZE,
	getBlockerStyles,
	getBubbleLayout,
	getFocusAreaRect,
	getHighlightedRect,
} from "./tutorialLayout";
import { markTutorialSeen } from "./tutorialStorage";
import {
	getAvailableGuide,
	getFirstAvailableStepIndex,
	getStepTarget,
	hasGuideRequiredTargets,
	toRect,
} from "./tutorialTargets";
import type { GuideDefinitions, Rect, Size, TourStep } from "./types";
import { useCalendarViewClickDemo } from "./useCalendarViewClickDemo";

interface TutorialOverlayProps {
	guides: GuideDefinitions[];
}

const canNavigateToStep = (step: TourStep | undefined) =>
	Boolean(step && (step.waitForTarget === true || getStepTarget(step)));

const stopTutorialPointerEvent = (event: ReactMouseEvent<HTMLDivElement>) => {
	event.stopPropagation();
};

export const TutorialOverlay = ({ guides }: TutorialOverlayProps) => {
	const [activeGuide, setActiveGuide] = useState<GuideDefinitions | null>(() =>
		getAvailableGuide(guides),
	);
	const [isOpen, setIsOpen] = useState(() => activeGuide !== null);
	const [currentStepIndex, setCurrentStepIndex] = useState(0);
	const [targetRect, setTargetRect] = useState<Rect | null>(null);
	const [bubbleSize, setBubbleSize] = useState<Size>(DEFAULT_BUBBLE_SIZE);
	const activeSteps = activeGuide?.steps ?? [];

	const openNextAvailableGuide = useCallback(() => {
		const nextGuide = getAvailableGuide(guides);
		if (!nextGuide) return false;

		const firstStepIndex = getFirstAvailableStepIndex(nextGuide.steps);
		if (firstStepIndex < 0) return false;

		setActiveGuide(nextGuide);
		setCurrentStepIndex(firstStepIndex);
		setTargetRect(null);
		setIsOpen(true);
		return true;
	}, [guides]);

	const findAvailableStepIndex = useCallback(
		(startIndex: number, direction: 1 | -1) => {
			let index = startIndex;

			while (index >= 0 && index < activeSteps.length) {
				const step = activeSteps[index];
				if (canNavigateToStep(step)) return index;
				index += direction;
			}

			return -1;
		},
		[activeSteps],
	);

	const closeTutorial = useCallback(() => {
		if (activeGuide) markTutorialSeen(activeGuide.id);
		setIsOpen(false);
		setActiveGuide(null);
		setTargetRect(null);
	}, [activeGuide]);

	useEffect(() => {
		if (isOpen && activeGuide) markTutorialSeen(activeGuide.id);
	}, [activeGuide, isOpen]);

	useEffect(() => {
		if (isOpen) return;
		if (openNextAvailableGuide()) return;

		const observer = new MutationObserver(() => {
			openNextAvailableGuide();
		});
		observer.observe(document.body, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: ["data-tour-id", "style", "class"],
		});

		return () => observer.disconnect();
	}, [isOpen, openNextAvailableGuide]);

	const updateTargetRect = useCallback(() => {
		const step = activeSteps[currentStepIndex];
		if (!step) return;

		const target = getStepTarget(step);
		if (!target) {
			if (activeGuide && !hasGuideRequiredTargets(activeGuide)) {
				setIsOpen(false);
				setActiveGuide(null);
				setTargetRect(null);
				return;
			}

			if (step.waitForTarget === true) {
				return;
			}

			const nextIndex = findAvailableStepIndex(currentStepIndex + 1, 1);
			if (nextIndex >= 0) {
				setCurrentStepIndex(nextIndex);
			} else {
				closeTutorial();
			}
			return;
		}

		setTargetRect(
			getFocusAreaRect(toRect(target.getBoundingClientRect()), step.focusArea),
		);
	}, [
		activeGuide,
		activeSteps,
		closeTutorial,
		currentStepIndex,
		findAvailableStepIndex,
	]);

	useEffect(() => {
		if (!isOpen) return;

		const currentStep = activeSteps[currentStepIndex];
		if (currentStep && getStepTarget(currentStep)) return;
		if (activeGuide && !hasGuideRequiredTargets(activeGuide)) {
			setIsOpen(false);
			setActiveGuide(null);
			setTargetRect(null);
			return;
		}
		if (currentStep?.waitForTarget === true) {
			return;
		}

		const firstAvailableIndex = findAvailableStepIndex(0, 1);
		if (firstAvailableIndex < 0) {
			closeTutorial();
			return;
		}

		if (firstAvailableIndex !== currentStepIndex) {
			setCurrentStepIndex(firstAvailableIndex);
		}
	}, [
		activeSteps,
		activeGuide,
		closeTutorial,
		currentStepIndex,
		findAvailableStepIndex,
		isOpen,
	]);

	useEffect(() => {
		if (!isOpen) return;

		const step = activeSteps[currentStepIndex];
		if (!step) return;

		const target = getStepTarget(step);
		if (!target) {
			updateTargetRect();
			return;
		}

		if (step.scrollTargetIntoView !== false) {
			target.scrollIntoView({
				block: "center",
				inline: "center",
			});
		}

		const animationFrame = window.requestAnimationFrame(updateTargetRect);
		const timeoutId = window.setTimeout(updateTargetRect, 120);

		return () => {
			window.cancelAnimationFrame(animationFrame);
			window.clearTimeout(timeoutId);
		};
	}, [activeSteps, currentStepIndex, isOpen, updateTargetRect]);

	useEffect(() => {
		if (!isOpen) return;

		window.addEventListener("resize", updateTargetRect);
		window.addEventListener("scroll", updateTargetRect, true);

		const resizeObserver = new ResizeObserver(updateTargetRect);
		resizeObserver.observe(document.body);
		const mutationObserver = new MutationObserver(updateTargetRect);
		mutationObserver.observe(document.body, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: ["data-tour-id", "style", "class"],
		});

		return () => {
			window.removeEventListener("resize", updateTargetRect);
			window.removeEventListener("scroll", updateTargetRect, true);
			resizeObserver.disconnect();
			mutationObserver.disconnect();
		};
	}, [isOpen, updateTargetRect]);

	const currentStep = activeSteps[currentStepIndex];
	useCalendarViewClickDemo(isOpen, currentStep);

	const setBubbleNode = useCallback((node: HTMLDivElement | null) => {
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

	if (!isOpen || !activeGuide || !targetRect) return null;

	if (!currentStep) return null;

	const highlightedRect = getHighlightedRect(targetRect);
	const highlightedStyle = {
		top: highlightedRect.top,
		left: highlightedRect.left,
		width: highlightedRect.width,
		height: highlightedRect.height,
	};
	const hasPreviousStep = findAvailableStepIndex(currentStepIndex - 1, -1) >= 0;
	const bubbleLayout = getBubbleLayout(
		targetRect,
		currentStep.placement,
		bubbleSize,
	);

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: intercepts tutorial backdrop mousedown before page-level outside-click handlers
		<div
			className={styles.tourRoot}
			aria-live="polite"
			onMouseDown={stopTutorialPointerEvent}
		>
			{getBlockerStyles(highlightedRect).map((blockerStyle, index) => (
				<div
					// biome-ignore lint/suspicious/noArrayIndexKey: fixed top/bottom/left/right blocker order
					key={index}
					className={styles.interactionBlocker}
					style={blockerStyle}
				/>
			))}
			<div className={styles.highlight} style={highlightedStyle} />
			{currentStep.blockTargetInteraction === true && (
				<div
					className={styles.targetInteractionBlocker}
					style={highlightedStyle}
					aria-hidden="true"
				/>
			)}
			<TutorialPointerDemos step={currentStep} targetRect={targetRect} />
			<TutorialBubble
				step={currentStep}
				stepIndex={currentStepIndex}
				steps={activeSteps}
				bubbleLayout={bubbleLayout}
				setBubbleNode={setBubbleNode}
				onClose={closeTutorial}
				onPrevious={() => goToStep(-1)}
				onNext={() => goToStep(1)}
				hasPreviousStep={hasPreviousStep}
			/>
		</div>
	);
};
