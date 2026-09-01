import { Navigate, useNavigate, useParams } from "react-router-dom";
import CalendarView from "@/pages/calendar/CalendarView";
import DetailView from "@/components/layout/sidePannel/DetailView";
import {
	SidePanelResizeHandle,
	useResizableSidePanel,
} from "@/components/layout/sidePannel/SidePanelResize";
import styles from "./EventDetailPage.module.css";

export default function EventDetailPage() {
	const { eventId } = useParams();
	const navigate = useNavigate();
	const { isMobile, handleResizeStart, sidePanelStyle } =
		useResizableSidePanel();
	const parsedEventId = Number(eventId);

	if (!Number.isSafeInteger(parsedEventId) || parsedEventId <= 0) {
		return <Navigate to="/main" replace />;
	}

	return (
		<main className={styles.page}>
			{/* Keep the detail URL independent while retaining the desktop side-panel UI. */}
			{!isMobile && <CalendarView />}
			<aside className={styles.detailPanel} style={sidePanelStyle}>
				{!isMobile && (
					<SidePanelResizeHandle onMouseDown={handleResizeStart} />
				)}
				<DetailView
					eventId={parsedEventId}
					onClose={() =>
						window.history.length > 1 ? navigate(-1) : navigate("/main")
					}
				/>
			</aside>
		</main>
	);
}
