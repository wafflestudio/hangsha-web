import type { CalendarViewMode } from "@types";
import styles from "./Toolbar.module.css";

interface CalendarModeToggleProps {
	mode: CalendarViewMode;
	onModeChange: (mode: CalendarViewMode) => void;
}

const modes: { mode: CalendarViewMode; icon: string; alt: string }[] = [
	{
		mode: "List",
		icon: "/assets/list.svg",
		alt: "list icon, three rows of a small circle and a longer line",
	},
	{
		mode: "Grid",
		icon: "/assets/grid.svg",
		alt: "grid icon, four rectangles of 2x2 layout",
	},
	{ mode: "Calendar", icon: "/assets/calendar.svg", alt: "calendar icon" },
];

const CalendarModeToggle = ({
	mode,
	onModeChange,
}: CalendarModeToggleProps) => (
	<div
		className={styles.viewToggleGroup}
		data-tour-id="day-tour-view-mode-toggle"
	>
		{modes.map(({ mode: nextMode, icon, alt }) => (
			<button
				type="button"
				key={nextMode}
				onClick={() => onModeChange(nextMode)}
				className={`${styles.toggleBtn} ${mode === nextMode ? styles.toggleBtnActive : ""}`}
			>
				<img alt={alt} src={icon} />
			</button>
		))}
	</div>
);

export default CalendarModeToggle;
