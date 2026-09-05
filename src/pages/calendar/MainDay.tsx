import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./CalendarView.module.css";
import EventCardView from "@/components/layout/sidePannel/EventCardView";
import BottomNav from "@/components/layout/BottomNav";
import { useEvents } from "@/contexts/EventContext";
import { FilterSheet } from "@/components/layout/filterSheet/FilterSheet";
import { useMainPanelQuery } from "@/pages/calendar/hooks/useMainPanelQuery";

const MOBILE_MAX_WIDTH = 576;

const MainDay = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { dayDate } = useEvents();
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
			</div>
			<FilterSheet />
			<BottomNav />
		</div>
	);
};

export default MainDay;
