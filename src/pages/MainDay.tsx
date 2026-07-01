import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CalendarView.module.css";
import EventCardView from "@/components/layout/sidePannel/EventCardView";
import DetailView from "@/components/layout/sidePannel/DetailView";
import BottomNav from "@/components/layout/BottomNav";
import { useEvents } from "@/contexts/EventContext";
import { useDetail } from "@/contexts/DetailContext";
import { FilterSheet } from "@/components/layout/filterSheet/FilterSheet";

const MOBILE_MAX_WIDTH = 576;

const MainDay = () => {
	const navigate = useNavigate();
	const { dayDate } = useEvents();
	const { showDetail, clickedEventId } = useDetail();

	useEffect(() => {
		const checkWidth = () => {
			if (window.innerWidth > MOBILE_MAX_WIDTH) {
				navigate("/main", { replace: true });
			}
		};
		checkWidth();
		window.addEventListener("resize", checkWidth);
		return () => window.removeEventListener("resize", checkWidth);
	}, [navigate]);

	const handleClose = () => {
		navigate("/main");
	};

	return (
		<div className={`${styles.container} ${styles.mainDay}`}>
			<div className={styles.calendarContainer}>
				<EventCardView day={dayDate} onClose={handleClose} />
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
