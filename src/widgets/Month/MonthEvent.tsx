import { useCallback, useEffect, useRef, useState } from "react";
import { CATEGORY_COLORS, CATEGORY_TEXT_COLORS } from "@constants";
import type { CalendarEvent } from "@types";
import styles from "@styles/MonthEvent.module.css";
import { CATEGORY_OTHER_INDEX } from "@constants";
import { useMonthEventPreview } from "./MonthEventPreviewContext";

const LONG_PRESS_DURATION = 250;
const TOUCH_MOVE_THRESHOLD = 10;

interface MonthEventProps {
	event: CalendarEvent;
	/** For period events: whether this cell contains the event's applyStart. Defaults to true (single-cell rendering). */
	isPeriodStart?: boolean;
	/** For period events: whether this cell contains the event's applyEnd. Defaults to true. */
	isPeriodEnd?: boolean;
	/** Cell's 0-based offset within the arrow's week-local span. */
	spanOffset?: number;
	/** Total cells in the arrow's week-local span. */
	spanTotal?: number;
}

const MonthEvent = ({
	event: calendarEvent,
	isPeriodStart = true,
	isPeriodEnd = true,
	spanOffset = 0,
	spanTotal = 1,
}: MonthEventProps) => {
	const { isPeriodEvent, event } = calendarEvent.resource;
	const backgroundColor =
		CATEGORY_COLORS[event.eventTypeId] || CATEGORY_COLORS[CATEGORY_OTHER_INDEX];
	const color =
		CATEGORY_TEXT_COLORS[event.eventTypeId] ||
		CATEGORY_TEXT_COLORS[CATEGORY_OTHER_INDEX];

	const containerRef = useRef<HTMLDivElement | null>(null);
	const timerRef = useRef<number | null>(null);
	const longPressedRef = useRef(false);
	const touchStartPos = useRef<{ x: number; y: number } | null>(null);
	const [isTouchDevice, setIsTouchDevice] = useState(false);
	const { openPreview } = useMonthEventPreview();

	useEffect(() => {
		const mq = window.matchMedia("(hover: none) and (pointer: coarse)");
		const update = () => setIsTouchDevice(mq.matches);
		update();
		mq.addEventListener("change", update);
		return () => mq.removeEventListener("change", update);
	}, []);

	useEffect(() => {
		return () => {
			if (timerRef.current !== null) {
				window.clearTimeout(timerRef.current);
			}
		};
	}, []);

	const clearTimer = useCallback(() => {
		if (timerRef.current !== null) {
			window.clearTimeout(timerRef.current);
			timerRef.current = null;
		}
	}, []);

	const handleTouchStart = useCallback(
		(e: React.TouchEvent<HTMLDivElement>) => {
			if (!isTouchDevice) return;
			longPressedRef.current = false;
			clearTimer();
			const touch = e.touches[0];
			touchStartPos.current = { x: touch.clientX, y: touch.clientY };
			timerRef.current = window.setTimeout(() => {
				const el = containerRef.current;
				if (!el) return;
				const rect = el.getBoundingClientRect();
				const placement = rect.top < window.innerHeight / 2 ? "below" : "above";
				const top = placement === "below" ? rect.bottom + 8 : rect.top - 8;
				const left = rect.left + rect.width / 2;
				longPressedRef.current = true;
				openPreview({
					id: event.id,
					title: event.title,
					top,
					left,
					placement,
					backgroundColor,
				});
			}, LONG_PRESS_DURATION);
		},
		[
			isTouchDevice,
			clearTimer,
			event.id,
			event.title,
			backgroundColor,
			openPreview,
		],
	);

	const handleTouchMove = useCallback(
		(e: React.TouchEvent<HTMLDivElement>) => {
			if (!touchStartPos.current) return;
			const touch = e.touches[0];
			const dx = touch.clientX - touchStartPos.current.x;
			const dy = touch.clientY - touchStartPos.current.y;
			if (Math.hypot(dx, dy) > TOUCH_MOVE_THRESHOLD) {
				clearTimer();
			}
		},
		[clearTimer],
	);

	const handleTouchEnd = useCallback(() => {
		clearTimer();
		touchStartPos.current = null;
	}, [clearTimer]);

	const handleClick = useCallback((e: React.MouseEvent) => {
		if (longPressedRef.current) {
			e.stopPropagation();
			e.preventDefault();
			longPressedRef.current = false;
		}
	}, []);

	// 기간제 행사 : 화살표
	if (isPeriodEvent) {
		return (
			<div className={styles.arrowEventContainer} style={{ color: color }}>
				<div className={styles.arrowTitleClip}>
					<span
						className={styles.arrowText}
						style={{
							width: `${spanTotal * 100}%`,
							marginLeft: `-${spanOffset * 100}%`,
						}}
					>
						{event.title}
					</span>
				</div>
				<div
					className={styles.arrowLine}
					style={{ backgroundColor: backgroundColor }}
				>
					{isPeriodStart && (
						<div
							className={`${styles.arrowHead} ${styles.left}`}
							style={{ borderRightColor: backgroundColor }}
						/>
					)}
					{isPeriodEnd && (
						<div
							className={styles.arrowHead}
							style={{ borderLeftColor: backgroundColor }}
						/>
					)}
				</div>
			</div>
		);
	}

	// 단발성 행사 : 블록
	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: onClick suppresses synthesized click after long-press; click handling for the event itself stays on react-big-calendar's wrapper
		// biome-ignore lint/a11y/useKeyWithClickEvents: keyboard activation is handled by the parent calendar wrapper
		<div
			ref={containerRef}
			className={styles.blockEventContainer}
			style={{
				backgroundColor: backgroundColor,
			}}
			data-month-event-id={event.id}
			data-event-title={event.title}
			data-event-bg={backgroundColor}
			onTouchStart={handleTouchStart}
			onTouchMove={handleTouchMove}
			onTouchEnd={handleTouchEnd}
			onTouchCancel={handleTouchEnd}
			onClick={handleClick}
		>
			{event.title}
		</div>
	);
};

export default MonthEvent;
