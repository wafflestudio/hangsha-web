import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import styles from "@styles/SidePanelResize.module.css";

const SIDE_PANEL_MIN_WIDTH = 280;
const SIDE_PANEL_MAX_WIDTH = 800;
const MOBILE_BREAKPOINT = 576;

// Keep in sync with media queries in page CSS modules
const getDefaultSidePanelWidth = () => {
	if (typeof window === "undefined") return 480;
	const w = window.innerWidth;
	if (w <= 1024) return 340;
	if (w <= 1200) return 460;
	if (w <= 1400) return 600;
	return 480;
};

interface SidePanelResizeContextType {
	width: number;
	setWidth: (w: number) => void;
	isMobile: boolean;
}

const SidePanelResizeContext = createContext<
	SidePanelResizeContextType | undefined
>(undefined);

export const SidePanelResizeProvider = ({
	children,
}: {
	children: ReactNode;
}) => {
	const [width, setWidth] = useState<number>(getDefaultSidePanelWidth);
	const [isMobile, setIsMobile] = useState<boolean>(
		typeof window !== "undefined" && window.innerWidth <= MOBILE_BREAKPOINT,
	);

	useEffect(() => {
		const onResize = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
		window.addEventListener("resize", onResize);
		return () => window.removeEventListener("resize", onResize);
	}, []);

	return (
		<SidePanelResizeContext.Provider value={{ width, setWidth, isMobile }}>
			{children}
		</SidePanelResizeContext.Provider>
	);
};

export const useResizableSidePanel = () => {
	const ctx = useContext(SidePanelResizeContext);
	if (!ctx) {
		throw new Error(
			"useResizableSidePanel must be used within SidePanelResizeProvider",
		);
	}
	const { width, setWidth, isMobile } = ctx;

	const handleResizeStart = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			e.preventDefault();
			e.stopPropagation();
			const startX = e.clientX;
			const startWidth = width;
			const previousCursor = document.body.style.cursor;
			document.body.style.cursor = "col-resize";

			const onMove = (ev: MouseEvent) => {
				// panel anchored to the right — dragging left increases width
				const next = Math.min(
					SIDE_PANEL_MAX_WIDTH,
					Math.max(SIDE_PANEL_MIN_WIDTH, startWidth + (startX - ev.clientX)),
				);
				setWidth(next);
			};
			const onUp = () => {
				document.body.style.cursor = previousCursor;
				document.removeEventListener("mousemove", onMove);
				document.removeEventListener("mouseup", onUp);
			};
			document.addEventListener("mousemove", onMove);
			document.addEventListener("mouseup", onUp);
		},
		[width, setWidth],
	);

	const sidePanelStyle = !isMobile
		? { width: `${width}px`, maxWidth: "none" as const }
		: undefined;

	return { width, isMobile, handleResizeStart, sidePanelStyle };
};

export const SidePanelResizeHandle = ({
	onMouseDown,
}: {
	onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
}) => (
	// biome-ignore lint/a11y/noStaticElementInteractions: drag handle is intentionally mouse-only
	<div className={styles.resizeHandle} onMouseDown={onMouseDown} />
);
