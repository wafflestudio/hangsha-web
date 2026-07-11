import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { IoIosClose } from "react-icons/io";
import styles from "./MainRouteTutorial.module.css";
import type { getBubbleLayout } from "./tutorialLayout";
import type { TourStep } from "./types";
import type { MouseEvent as ReactMouseEvent } from "react";

interface TutorialBubbleProps {
	step: TourStep;
	stepIndex: number;
	steps: TourStep[];
	bubbleLayout: ReturnType<typeof getBubbleLayout>;
	setBubbleNode: (node: HTMLDivElement | null) => void;
	onClose: () => void;
	onPrevious: () => void;
	onNext: () => void;
	hasPreviousStep: boolean;
}

const stopTutorialPointerEvent = (event: ReactMouseEvent<HTMLDivElement>) => {
	event.stopPropagation();
};

export const TutorialBubble = ({
	step,
	stepIndex,
	steps,
	bubbleLayout,
	setBubbleNode,
	onClose,
	onPrevious,
	onNext,
	hasPreviousStep,
}: TutorialBubbleProps) => {
	const stepCount = steps.length;
	const hasMultipleSteps = stepCount > 1;

	return (
		<div
			key={stepIndex}
			ref={setBubbleNode}
			className={styles.bubble}
			data-side={bubbleLayout.side}
			style={bubbleLayout.style}
			role="dialog"
			aria-modal="true"
			aria-labelledby="main-route-tutorial-title"
			onMouseDown={stopTutorialPointerEvent}
		>
			<button
				type="button"
				className={styles.closeButton}
				onClick={onClose}
				aria-label="튜토리얼 닫기"
			>
				<IoIosClose size={28} aria-hidden="true" />
			</button>
			<h2 id="main-route-tutorial-title" className={styles.title}>
				{step.title}
			</h2>
			<p className={styles.description}>{step.description}</p>
			{hasMultipleSteps && (
				<div className={styles.controls}>
					<button
						type="button"
						className={styles.chevronButton}
						onClick={onPrevious}
						disabled={!hasPreviousStep}
						aria-label="이전 튜토리얼"
					>
						<FaChevronLeft aria-hidden="true" />
					</button>
					<div className={styles.dots} aria-hidden="true">
						{steps.map((dotStep, index) => (
							<span
								key={dotStep.title}
								className={`${styles.dot} ${
									index === stepIndex ? styles.activeDot : ""
								}`}
							/>
						))}
					</div>
					<button
						type="button"
						className={styles.chevronButton}
						onClick={onNext}
						aria-label={
							stepIndex < stepCount - 1 ? "다음 튜토리얼" : "튜토리얼 완료"
						}
					>
						<FaChevronRight aria-hidden="true" />
					</button>
				</div>
			)}
		</div>
	);
};
