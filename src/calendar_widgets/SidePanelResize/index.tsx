import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import styles from "@styles/SidePanelResize.module.css";

const SIDE_PANEL_MIN_WIDTH = 280;
// window가 없을 때(SSR)만 쓰는 기본 최대 너비
const SIDE_PANEL_MAX_WIDTH = 800;
// 좌측 사이드바(.sidebarContainer) 너비 :t Sidebar.module.css와 동기화
const SIDEBAR_WIDTH = 256;
const MOBILE_BREAKPOINT = 576;
const STORAGE_KEY = "sidePanelWidth";

// Keep in sync with media queries in page CSS modules
const getDefaultSidePanelWidth = () => {
	if (typeof window === "undefined") return 480;
	const w = window.innerWidth;
	if (w <= 1024) return 340;
	if (w <= 1200) return 460;
	if (w <= 1400) return 600;
	return 480;
};

// 패널 최대 너비 = 브라우저 너비 - 사이드바 너비 (사이드바를 덮지 않는 선까지 확장 허용)
const getSidePanelMaxWidth = () => {
	if (typeof window === "undefined") return SIDE_PANEL_MAX_WIDTH;
	return Math.max(SIDE_PANEL_MIN_WIDTH, window.innerWidth - SIDEBAR_WIDTH);
};

// 저장값이 있으면 현재 화면의 [min, max] 범위로 클램프해 복원, 없으면 기본값으로 폴백
const getInitialSidePanelWidth = () => {
	if (typeof window === "undefined") return 480;
	const stored = Number(window.localStorage.getItem(STORAGE_KEY));
	if (Number.isFinite(stored) && stored > 0) {
		return Math.min(
			getSidePanelMaxWidth(),
			Math.max(SIDE_PANEL_MIN_WIDTH, stored),
		);
	}
	return getDefaultSidePanelWidth();
};

const persistSidePanelWidth = (width: number) => {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(STORAGE_KEY, String(width));
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
	const [width, setWidth] = useState<number>(getInitialSidePanelWidth);
	const [isMobile, setIsMobile] = useState<boolean>(
		typeof window !== "undefined" && window.innerWidth <= MOBILE_BREAKPOINT,
	);

	// resize 핸들러(deps: [])에서 항상 최신 width를 읽기 위한 ref
	const widthRef = useRef(width);
	widthRef.current = width;

	useEffect(() => {
		const onResize = () => {
			setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
			// 창이 좁아지면 패널을 새 최대 너비로 실시간 축소 (넓어질 땐 사용자가 정한 너비 유지)
			const max = getSidePanelMaxWidth();
			if (widthRef.current > max) {
				setWidth(max);
				persistSidePanelWidth(max); // 자동 축소된 너비도 저장
			}
		};
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
			let latestWidth = startWidth;
			const maxWidth = getSidePanelMaxWidth();
			const previousCursor = document.body.style.cursor;
			document.body.style.cursor = "col-resize";

			const onMove = (ev: MouseEvent) => {
				// panel anchored to the right — dragging left increases width
				const next = Math.min(
					maxWidth,
					Math.max(SIDE_PANEL_MIN_WIDTH, startWidth + (startX - ev.clientX)),
				);
				latestWidth = next;
				setWidth(next);
			};
			const onUp = () => {
				document.body.style.cursor = previousCursor;
				document.removeEventListener("mousemove", onMove);
				document.removeEventListener("mouseup", onUp);
				// 드래그 종료 시점에 최종 너비만 1회 저장 (드래그 중 매 프레임 쓰기 방지)
				persistSidePanelWidth(latestWidth);
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
