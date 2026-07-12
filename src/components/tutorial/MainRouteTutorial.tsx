import { useEffect, useState } from "react";
import {
	DAY_VIEW_TUTORIAL_GUIDES,
	TUTORIAL_GUIDES,
	WEEK_VIEW_TUTORIAL_GUIDES,
} from "./guides/tutorialRegistry";
import { MobileMainRouteTutorial } from "./MobileMainRouteTutorial";
import { TutorialOverlay } from "./TutorialOverlay";

const TUTORIAL_DESKTOP_MIN_WIDTH = 576;

const isDesktopTutorialWidth = () =>
	typeof window !== "undefined" &&
	window.innerWidth > TUTORIAL_DESKTOP_MIN_WIDTH;

const isActualMobileEnvironment = () => {
	if (typeof navigator === "undefined" || typeof window === "undefined") {
		return false;
	}

	const navigatorWithUserAgentData = navigator as Navigator & {
		userAgentData?: { mobile?: boolean };
	};

	if (typeof navigatorWithUserAgentData.userAgentData?.mobile === "boolean") {
		return navigatorWithUserAgentData.userAgentData.mobile;
	}

	const userAgent = navigator.userAgent;
	const isMobileUserAgent =
		/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
			userAgent,
		);
	const isIPadOSDesktopMode =
		navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;

	return isMobileUserAgent || isIPadOSDesktopMode;
};

const getTutorialMode = () => {
	if (isActualMobileEnvironment()) return "mobile";
	if (isDesktopTutorialWidth()) return "desktop";
	return "none";
};

interface MainRouteTutorialProps {
	isDayView?: boolean;
	isWeekView?: boolean;
}

const MainRouteTutorial = ({
	isDayView = false,
	isWeekView = false,
}: MainRouteTutorialProps) => {
	const [tutorialMode, setTutorialMode] = useState(getTutorialMode);

	useEffect(() => {
		const handleResize = () => {
			setTutorialMode(getTutorialMode());
		};

		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	if (tutorialMode === "mobile") {
		return <MobileMainRouteTutorial />;
	}

	if (tutorialMode !== "desktop") return null;

	if (isWeekView) {
		return <TutorialOverlay guides={WEEK_VIEW_TUTORIAL_GUIDES} />;
	}

	if (isDayView) {
		return <TutorialOverlay guides={DAY_VIEW_TUTORIAL_GUIDES} />;
	}

	return <TutorialOverlay guides={TUTORIAL_GUIDES} />;
};

export default MainRouteTutorial;
