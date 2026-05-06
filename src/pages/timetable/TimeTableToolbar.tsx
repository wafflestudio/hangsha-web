import type { Semester } from "../../util/types";
import { IoIosSearch } from "react-icons/io";
import { useAuth } from "../../contexts/AuthProvider";
import styles from "../../styles/Toolbar.module.css";
import { useNavigate } from "react-router-dom";

interface TimeTableToolbarProps {
	timetableName: string;
	year: number;
	semester: Semester;
	SEMESTER_LABEL: { id: Semester; label: string }[];
	onYearChange: (year: number) => void;
	onSemesterChange: (semester: Semester) => void;
	isToggleOn: boolean;
	onToggleChange: (isToggleOn: boolean) => void;
	years?: number[];
}

const TimeTableToolbar = ({
	timetableName,
	year,
	semester,
	SEMESTER_LABEL,
	onYearChange,
	onSemesterChange,
	isToggleOn,
	onToggleChange,
	years,
}: TimeTableToolbarProps) => {
	const { user } = useAuth();
	const navigate = useNavigate();
	const yearOptions =
		years ??
		Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - 3 + i);
	return (
		<div className={styles.timetableToolbarContainer}>
			<div className={styles.headerRow}>
				<div className={styles.selectGroup}>
					<span className={styles.selectWrap}>
						<select
							className={styles.select}
							value={year}
							onChange={(e) => onYearChange(Number(e.target.value))}
							aria-label="년도 선택"
						>
							{yearOptions.map((y) => (
								<option key={y} value={y}>
									{y}학년도
								</option>
							))}
						</select>
					</span>

					<span className={styles.selectWrap}>
						<select
							className={styles.select}
							value={semester}
							onChange={(e) => onSemesterChange(e.target.value as Semester)}
							aria-label="학기 선택"
						>
							{SEMESTER_LABEL.map((s) => (
								<option key={s.id} value={s.id}>
									{s.label}
								</option>
							))}
						</select>
					</span>
					<p className={styles.dateTitle}>{timetableName}</p>
					<button
						type="button"
						className={`${styles.timetableToggle} ${
							isToggleOn ? styles.timetableToggleOn : ""
						}`}
						aria-label="시간표 토글"
						aria-pressed={isToggleOn}
						onClick={() => onToggleChange(!isToggleOn)}
					>
						<span className={styles.timetableToggleThumb} />
					</button>
				</div>

				<div className={styles.profileRow}>
					<IoIosSearch size={20} color="rgba(130, 130, 130, 1)" />
					<button
						type="button"
						className={styles.profileButton}
						onClick={() => navigate("/my")}
					>
						<img
							alt="user profile"
							src={user?.profileImageUrl || "/assets/defaultProfile.png"}
						/>
					</button>
				</div>
			</div>
		</div>
	);
};

export default TimeTableToolbar;
