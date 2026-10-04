import type { ReactNode } from "react";
import styles from "./SidePanel.module.css";
import {
	SidePanelResizeHandle,
	useResizableSidePanel,
} from "./SidePanelResize";

/**
 * 화면 우측에 붙는 상세 패널 껍데기. 행사 상세 · 게시글 · 후기의 행사 보기가 같이 쓴다.
 * 데스크톱은 왼쪽 가장자리를 끌어 너비를 바꾸고(너비는 패널끼리 공유·저장),
 * 모바일(576px 이하)은 화면 전체를 덮는다. 부모는 position: relative여야 한다.
 */
const SidePanel = ({
	label,
	children,
}: {
	label: string;
	children: ReactNode;
}) => {
	const { isMobile, handleResizeStart, sidePanelStyle } =
		useResizableSidePanel();

	return (
		<aside className={styles.panel} style={sidePanelStyle} aria-label={label}>
			{!isMobile && <SidePanelResizeHandle onMouseDown={handleResizeStart} />}
			{children}
		</aside>
	);
};

export default SidePanel;
