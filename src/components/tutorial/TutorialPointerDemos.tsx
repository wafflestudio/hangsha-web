import { LuMousePointerClick } from "react-icons/lu";
import styles from "./MainRouteTutorial.module.css";
import { getCursorDemoStyle, getDragDemoStyle } from "./tutorialLayout";
import type { Rect, TourStep } from "./types";

interface TutorialPointerDemosProps {
	step: TourStep;
	targetRect: Rect;
}

export const TutorialPointerDemos = ({
	step,
	targetRect,
}: TutorialPointerDemosProps) => (
	<>
		{step.cursorDemo === true && (
			<div
				className={styles.cursorDemo}
				style={getCursorDemoStyle(targetRect)}
				aria-hidden="true"
			>
				<span className={styles.cursorClickRing} />
				<LuMousePointerClick />
			</div>
		)}
		{step.dragDemo === true && (
			<div
				className={styles.dragDemo}
				style={getDragDemoStyle(targetRect)}
				aria-hidden="true"
			>
				<span className={styles.dragDemoTrack} />
				<span className={styles.dragDemoGrip} />
				<span className={styles.dragClickRing} />
				<LuMousePointerClick />
			</div>
		)}
	</>
);
