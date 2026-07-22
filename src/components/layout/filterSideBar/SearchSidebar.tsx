import { useRef, useState } from "react";
import { FaAnglesLeft, FaAnglesRight } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthProvider";
import styles from "./Sidebar.module.css";
import { SidebarLogoutButton } from "./LogoutButton";

/** Search results sidebar without calendar filter controls. */
export const SearchSidebar = () => {
	const { user } = useAuth();
	const navigate = useNavigate();
	const ref = useRef<HTMLDivElement>(null);
	const [isHidden, setIsHidden] = useState(false);

	if (isHidden) {
		return (
			<div className={styles.hiddenSidebar}>
				<button
					className={styles.expandBtn}
					type="button"
					onClick={() => setIsHidden(false)}
				>
					<FaAnglesRight width={20} color="rgba(171,171,171,1)" />
				</button>
			</div>
		);
	}

	return (
		<div className={styles.sidebarContainer} ref={ref}>
			<div className={styles.headerRow}>
				<div className={styles.topButtons}>
					<button
						type="button"
						onClick={() => navigate("/main")}
						className={styles.header}
					>
						<img
							src="/assets/logo.png"
							alt="calendar with sha on it, app logo"
						/>
					</button>
					<button
						type="button"
						onClick={() => navigate(user ? "/main" : "/")}
						className={styles.header}
					>
						{user ? `${user.username}의 캘린더` : "로그인하고 이용하기"}
					</button>
				</div>
				<button
					className={styles.collapseBtn}
					type="button"
					onClick={() => setIsHidden(true)}
				>
					<FaAnglesLeft width={20} color="rgba(171,171,171,1)" />
				</button>
			</div>

			<div className={styles.tourTargetGroup}>
				<div className={styles.sectionTitle} style={{ marginTop: "20px" }}>
					페이지
				</div>
				<button
					className={styles.pageLink}
					type="button"
					onClick={() => navigate("/bookmark")}
				>
					<img
						className={styles.icon}
						src="/assets/bookmark.svg"
						alt="bookmark icon"
					/>
					<span>찜한 행사</span>
				</button>
				<button
					className={styles.pageLink}
					type="button"
					onClick={() => navigate("/timetable")}
				>
					<img
						className={styles.icon}
						src="/assets/timetable.svg"
						alt="timetable icon"
					/>
					<span>시간표</span>
				</button>
			</div>
			<SidebarLogoutButton onLogout={() => ref.current?.scrollTo(0, 0)} />
		</div>
	);
};
