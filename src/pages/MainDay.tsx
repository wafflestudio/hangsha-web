import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "@styles/CalendarView.module.css";
import MonthSideView from "@widgets/Month/MonthSideView/MonthSideView";
import DetailView from "@/widgets/DetailView";
import BottomNav from "@/widgets/BottomNav";
import { useEvents } from "@/contexts/EventContext";
import { useDetail } from "@/contexts/DetailContext";
import { FilterSheet } from "@/widgets/FilterSheet/FilterSheet";

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
				<MonthSideView day={dayDate} onClose={handleClose} />
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
