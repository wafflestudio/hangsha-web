import { useEffect, useState } from "react";
import {
	DAY_VIEW_TUTORIAL_GUIDES,
	TUTORIAL_GUIDES,
	WEEK_VIEW_TUTORIAL_GUIDES,
} from "./guides/tutorialRegistry";
import { DAY_VIEW_MODE_TUTORIAL_ID } from "./guides/dayViewModeGuide";
import { MAIN_ROUTE_TUTORIAL_ID } from "./guides/mainRouteGuide";
import { WEEK_VIEW_TUTORIAL_ID } from "./guides/weekViewGuide";
import { MobileMainRouteTutorial } from "./MobileMainRouteTutorial";
import { TutorialOverlay } from "./TutorialOverlay";
import type { GuideDefinitions, TourStep } from "./types";

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

const isCalendarModeStep = (step: TourStep | undefined) =>
	step?.targetIds.includes("main-tour-view-toggle") === true;

const hasViewSpecificGuide = (guides: GuideDefinitions[]) =>
	guides.some(
		(guide) =>
			guide.id === WEEK_VIEW_TUTORIAL_ID ||
			guide.id === DAY_VIEW_MODE_TUTORIAL_ID,
	);

const shouldDeferViewTutorialAfterModeSwitch = (
	guide: GuideDefinitions,
	step: TourStep | undefined,
	guides: GuideDefinitions[],
) =>
	guide.id === MAIN_ROUTE_TUTORIAL_ID &&
	isCalendarModeStep(step) &&
	hasViewSpecificGuide(guides);

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
		return (
			<TutorialOverlay
				guides={WEEK_VIEW_TUTORIAL_GUIDES}
				shouldDeferNextGuideAfterClose={
					shouldDeferViewTutorialAfterModeSwitch
				}
			/>
		);
	}

	if (isDayView) {
		return (
			<TutorialOverlay
				guides={DAY_VIEW_TUTORIAL_GUIDES}
				shouldDeferNextGuideAfterClose={
					shouldDeferViewTutorialAfterModeSwitch
				}
			/>
		);
	}

	return <TutorialOverlay guides={TUTORIAL_GUIDES} />;
};

export default MainRouteTutorial;
