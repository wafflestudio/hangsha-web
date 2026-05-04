import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
	type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import styles from "@styles/MonthEvent.module.css";

export type MonthEventPreviewState = {
	id: number;
	title: string;
	top: number;
	left: number;
	placement: "above" | "below";
	backgroundColor: string;
};

type ContextValue = {
	openPreview: (state: MonthEventPreviewState) => void;
	closePreview: () => void;
};

const MonthEventPreviewContext = createContext<ContextValue | null>(null);

export const useMonthEventPreview = () => {
	const ctx = useContext(MonthEventPreviewContext);
	if (!ctx)
		throw new Error(
			"useMonthEventPreview must be used inside MonthEventPreviewProvider",
		);
	return ctx;
};

const VIEWPORT_MARGIN = 8;

const computePosition = (rect: DOMRect) => {
	const placement: "above" | "below" =
		rect.top < window.innerHeight / 2 ? "below" : "above";
	const top = placement === "below" ? rect.bottom + 8 : rect.top - 8;
	const left = rect.left + rect.width / 2;
	return { top, left, placement };
};

export const MonthEventPreviewProvider = ({
	children,
}: {
	children: ReactNode;
}) => {
	const [preview, setPreview] = useState<MonthEventPreviewState | null>(null);
	const previewRef = useRef<MonthEventPreviewState | null>(null);
	const previewElRef = useRef<HTMLDivElement | null>(null);
	const isOpen = preview !== null;

	const closePreview = useCallback(() => {
		previewRef.current = null;
		setPreview(null);
	}, []);

	const openPreview = useCallback((state: MonthEventPreviewState) => {
		previewRef.current = state;
		setPreview(state);
	}, []);

	useEffect(() => {
		if (!isOpen) return;

		const handleTouchMove = (e: TouchEvent) => {
			e.preventDefault();
			const touch = e.touches[0];
			if (!touch) return;
			const target = document.elementFromPoint(touch.clientX, touch.clientY);
			const block = target?.closest<HTMLElement>("[data-month-event-id]");
			if (!block) return;
			const id = Number(block.dataset.monthEventId);
			if (Number.isNaN(id)) return;
			if (previewRef.current && id === previewRef.current.id) return;
			const { top, left, placement } = computePosition(
				block.getBoundingClientRect(),
			);
			const next: MonthEventPreviewState = {
				id,
				title: block.dataset.eventTitle ?? "",
				top,
				left,
				placement,
				backgroundColor: block.dataset.eventBg ?? "",
			};
			previewRef.current = next;
			setPreview(next);
		};

		const handleEnd = () => {
			closePreview();
		};

		window.addEventListener("touchmove", handleTouchMove, { passive: false });
		window.addEventListener("touchend", handleEnd);
		window.addEventListener("touchcancel", handleEnd);

		return () => {
			window.removeEventListener("touchmove", handleTouchMove);
			window.removeEventListener("touchend", handleEnd);
			window.removeEventListener("touchcancel", handleEnd);
		};
	}, [isOpen, closePreview]);

	// 가로 클램프: preview의 실제 너비를 측정해 viewport 밖으로 나가지 않도록 left 보정
	useLayoutEffect(() => {
		if (!preview || !previewElRef.current) return;
		const width = previewElRef.current.offsetWidth;
		const halfW = width / 2;
		const minLeft = VIEWPORT_MARGIN + halfW;
		const maxLeft = window.innerWidth - VIEWPORT_MARGIN - halfW;
		if (minLeft > maxLeft) return; // preview가 viewport보다 넓으면 보정 불가
		const clamped = Math.max(minLeft, Math.min(maxLeft, preview.left));
		if (Math.abs(clamped - preview.left) > 0.5) {
			const next = { ...preview, left: clamped };
			previewRef.current = next;
			setPreview(next);
		}
	}, [preview]);

	return (
		<MonthEventPreviewContext.Provider value={{ openPreview, closePreview }}>
			{children}
			{preview &&
				createPortal(
					<div
						ref={previewElRef}
						className={styles.preview}
						style={{
							top: preview.top,
							left: preview.left,
							transform:
								preview.placement === "below"
									? "translateX(-50%)"
									: "translate(-50%, -100%)",
							backgroundColor: preview.backgroundColor,
						}}
					>
						{preview.title}
					</div>,
					document.body,
				)}
		</MonthEventPreviewContext.Provider>
	);
};
