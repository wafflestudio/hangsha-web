import { useNavigate, useLocation } from "react-router-dom";
import styles from "@styles/BottomNav.module.css";
import { useEvents } from "@/contexts/EventContext";

interface NavItem {
	key: string;
	label: string;
	icon: string;
	path: string;
}

const NAV_ITEMS: NavItem[] = [
	{
		key: "calendar",
		label: "캘린더",
		icon: "/assets/bottom_calendar.svg",
		path: "/main",
	},
	{
		key: "timetable",
		label: "시간표",
		icon: "/assets/bottom_timetable.svg",
		path: "/timetable",
	},
	{
		key: "Reviews",
		label: "행사 후기",
		icon: "/assets/bottom_reviews.svg",
		path: "/",
	},
	{
		key: "profile",
		label: "마이페이지",
		icon: "/assets/bottom_profile.svg",
		path: "/my",
	},
];



const BottomNav = () => {
	const navigate = useNavigate();
	const location = useLocation();
    const { setDayDate } = useEvents();

	const isActive = (path: string) => location.pathname.startsWith(path);

	return (
		<nav className={styles.bottomNav}>
			{NAV_ITEMS.map((item) => (
				<button
					key={item.key}
					type="button"
					className={`${styles.navItem} ${
						isActive(item.path) ? styles.active : ""
					}`}
					onClick={() => {
                        navigate(item.path)
                        if (item.key === 'calendar') {
                            setDayDate(new Date());
                        }
                    }}
				>
					<img
						src={item.icon}
						alt={`${item.label} icon`}
						className={styles.icon}
					/>
				</button>
			))}
		</nav>
	);
};

export default BottomNav;
