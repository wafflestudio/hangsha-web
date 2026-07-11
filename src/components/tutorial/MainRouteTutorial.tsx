import { useEffect, useState } from "react";
import {
	DAY_VIEW_TUTORIAL_GUIDES,
	TUTORIAL_GUIDES,
	WEEK_VIEW_TUTORIAL_GUIDES,
} from "./guides/tutorialRegistry";
import { TutorialOverlay } from "./TutorialOverlay";

const TUTORIAL_DESKTOP_MIN_WIDTH = 576;

const isDesktopTutorialWidth = () =>
	typeof window !== "undefined" &&
	window.innerWidth > TUTORIAL_DESKTOP_MIN_WIDTH;

interface MainRouteTutorialProps {
	isDayView?: boolean;
	isWeekView?: boolean;
}

const MainRouteTutorial = ({
	isDayView = false,
	isWeekView = false,
}: MainRouteTutorialProps) => {
	const [isDesktopWidth, setIsDesktopWidth] = useState(
		isDesktopTutorialWidth,
	);

	useEffect(() => {
		const handleResize = () => {
			setIsDesktopWidth(isDesktopTutorialWidth());
		};

		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	if (!isDesktopWidth) return null;

	if (isWeekView) {
		return <TutorialOverlay guides={WEEK_VIEW_TUTORIAL_GUIDES} />;
	}

	if (isDayView) {
		return <TutorialOverlay guides={DAY_VIEW_TUTORIAL_GUIDES} />;
	}

	return <TutorialOverlay guides={TUTORIAL_GUIDES} />;
};

export default MainRouteTutorial;
