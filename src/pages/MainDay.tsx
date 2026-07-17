import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./CalendarView.module.css";
import EventCardView from "@/components/layout/sidePannel/EventCardView";
import DetailView from "@/components/layout/sidePannel/DetailView";
import BottomNav from "@/components/layout/BottomNav";
import { useEvents } from "@/contexts/EventContext";
import { useDetail } from "@/contexts/DetailContext";
import { FilterSheet } from "@/components/layout/filterSheet/FilterSheet";
import { useMainPanelQuery } from "@/hooks/useMainPanelQuery";

const MOBILE_MAX_WIDTH = 576;

const MainDay = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { dayDate } = useEvents();
	const { showDetail, clickedEventId } = useDetail();
	const { eventListDate, openEventList } = useMainPanelQuery();

	useEffect(() => {
		const checkWidth = () => {
			if (window.innerWidth > MOBILE_MAX_WIDTH) {
				navigate(
					{ pathname: "/main", search: location.search },
					{ replace: true },
				);
			}
		};
		checkWidth();
		window.addEventListener("resize", checkWidth);
		return () => window.removeEventListener("resize", checkWidth);
	}, [location.search, navigate]);

	const handleClose = () => {
		navigate("/main");
	};

	return (
		<div className={`${styles.container} ${styles.mainDay}`}>
			<div className={styles.calendarContainer}>
				<EventCardView
					day={eventListDate ?? dayDate}
					onClose={handleClose}
					onDateChange={openEventList}
				/>
				{showDetail && clickedEventId !== undefined && (
					<div className={`${styles.sidePanel} ${styles.detailPanel}`}>
						<DetailView eventId={clickedEventId} />
					</div>
				)}
			</div>
			<FilterSheet />
			{!showDetail && <BottomNav />}
		</div>
	);
};

export default MainDay;
