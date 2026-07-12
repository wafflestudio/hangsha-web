import { useCallback, useEffect, useState } from "react";
import { IoIosClose } from "react-icons/io";
import styles from "./MainRouteTutorial.module.css";
import { hasSeenTutorial, markTutorialSeen } from "./tutorialStorage";
import { getTourTarget, isVisibleTarget } from "./tutorialTargets";
import type { MouseEvent as ReactMouseEvent } from "react";

const MOBILE_MAIN_ROUTE_TUTORIAL_ID = "mobile-main-route-tutorial";
const MOBILE_TUTORIAL_GIF_SRC = "/assets/mobile_tutorial_1.GIF";
const MOBILE_MAIN_READY_TARGET_ID = "main-tour-bottom-nav";

const stopTutorialPointerEvent = (event: ReactMouseEvent<HTMLDivElement>) => {
	event.stopPropagation();
};

const isMobileMainRouteReady = () => {
	const target = getTourTarget(MOBILE_MAIN_READY_TARGET_ID);
	return Boolean(target && isVisibleTarget(target));
};

export const MobileMainRouteTutorial = () => {
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		let observer: MutationObserver | null = null;

		const openIfReady = () => {
			if (hasSeenTutorial(MOBILE_MAIN_ROUTE_TUTORIAL_ID)) return true;
			if (!isMobileMainRouteReady()) return false;

			markTutorialSeen(MOBILE_MAIN_ROUTE_TUTORIAL_ID);
			setIsOpen(true);
			return true;
		};

		if (openIfReady()) return;

		const handleReadyCheck = () => {
			if (!openIfReady()) return;

			observer?.disconnect();
			window.removeEventListener("resize", handleReadyCheck);
		};

		observer = new MutationObserver(handleReadyCheck);
		observer.observe(document.body, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: ["data-tour-id", "style", "class"],
		});
		window.addEventListener("resize", handleReadyCheck);

		return () => {
			observer?.disconnect();
			window.removeEventListener("resize", handleReadyCheck);
		};
	}, []);

	useEffect(() => {
		if (!isOpen) return;

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		return () => {
			document.body.style.overflow = previousOverflow;
		};
	}, [isOpen]);

	const closeTutorial = useCallback(() => {
		markTutorialSeen(MOBILE_MAIN_ROUTE_TUTORIAL_ID);
		setIsOpen(false);
	}, []);

	useEffect(() => {
		if (!isOpen) return;

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") closeTutorial();
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [closeTutorial, isOpen]);

	if (!isOpen) return null;

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: intercepts tutorial backdrop mousedown before page-level outside-click handlers
		<div
			className={styles.mobileTutorialRoot}
			aria-live="polite"
			onMouseDown={stopTutorialPointerEvent}
		>
			<div
				className={styles.mobileTutorialDialog}
				role="dialog"
				aria-modal="true"
				aria-labelledby="mobile-main-route-tutorial-title"
				aria-describedby="mobile-main-route-tutorial-description"
			>
				<button
					type="button"
					className={styles.mobileTutorialCloseButton}
					onClick={closeTutorial}
					aria-label="모바일 튜토리얼 닫기"
				>
					<IoIosClose size={34} aria-hidden="true" />
				</button>
				<h2
					id="mobile-main-route-tutorial-title"
					className={styles.mobileTutorialTitle}
				>
					블록 행사 제목 전체보기
				</h2>
				<img
					className={styles.mobileTutorialImage}
					src={MOBILE_TUTORIAL_GIF_SRC}
					alt=""
					aria-hidden="true"
				/>
				<p
					id="mobile-main-route-tutorial-description"
					className={styles.mobileTutorialDescription}
				>
					블록 모양의 참여형 행사를 꾹 누른 상태로 드래그하면 행사를 더 편하게 확인할 수 있어요!
				</p>
			</div>
		</div>
	);
};
