import { useEffect, useState } from "react";
import { TUTORIAL_GUIDES } from "./guides/tutorialRegistry";
import { TutorialOverlay } from "./TutorialOverlay";

const TUTORIAL_DESKTOP_MIN_WIDTH = 576;

const isDesktopTutorialWidth = () =>
	typeof window !== "undefined" &&
	window.innerWidth > TUTORIAL_DESKTOP_MIN_WIDTH;

const MainRouteTutorial = () => {
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

	return <TutorialOverlay guides={TUTORIAL_GUIDES} />;
};

export default MainRouteTutorial;
