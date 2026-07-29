import type { Semester } from "../../util/types";
import { useAuth } from "../../contexts/AuthProvider";
import styles from "./TimetableToolbar.module.css";
import { useNavigate } from "react-router-dom";
import SearchButton from "../../components/layout/toolbar/SearchButton";

interface TimeTableToolbarProps {
	timetableName: string;
	year: number;
	semester: Semester;
	SEMESTER_LABEL: { id: Semester; label: string }[];
	onYearChange: (year: number) => void;
	onSemesterChange: (semester: Semester) => void;
	onSelectCurrentTimetable: () => Promise<void>;
	isCurrentTimetableSelected: boolean;
	isEventOverlayOn: boolean;
	onEventOverlayChange: (isEventOverlayOn: boolean) => void;
	onPrevEventWeek?: () => void;
	onNextEventWeek?: () => void;
	mobileEventWeekLabel?: string;
	isLoading?: boolean;
	years?: number[];
	hasTimetable?: boolean;
}

const TimeTableToolbar = ({
	timetableName,
	year,
	semester,
	SEMESTER_LABEL,
	onYearChange,
	onSemesterChange,
	onSelectCurrentTimetable,
	isCurrentTimetableSelected,
	isEventOverlayOn,
	onEventOverlayChange,
	onPrevEventWeek,
	onNextEventWeek,
	mobileEventWeekLabel,
	isLoading = false,
	years,
	hasTimetable = false,
}: TimeTableToolbarProps) => {
	const { user } = useAuth();
	const navigate = useNavigate();
	const displayTimetableName = timetableName.trim() || "나의 시간표";
	const yearOptions =
		years ??
		Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - 3 + i);
	return (
		<div className={styles.timetableToolbarContainer}>
			<div className={styles.headerRow}>
				<div className={styles.selectGroup}>
					<p className={styles.dateTitle}>{displayTimetableName}</p>
					<div className={styles.timetableControlRow}>
						<div className={styles.semesterSelectGroup}>
							<span className={styles.selectWrap}>
								<select
									className={styles.select}
									value={year}
									disabled={isLoading}
									onChange={(e) => {
										onYearChange(Number(e.target.value));
										e.currentTarget.blur();
									}}
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
									disabled={isLoading}
									onChange={(e) => {
										onSemesterChange(e.target.value as Semester);
										e.currentTarget.blur();
									}}
									aria-label="학기 선택"
								>
									{SEMESTER_LABEL.map((s) => (
										<option key={s.id} value={s.id}>
											{s.label}
										</option>
									))}
								</select>
							</span>
						</div>
						{hasTimetable ? (
							<label className={styles.selectCurrentTimetableButton}>
								<input
									type="checkbox"
									className={styles.currentTimetableCheckbox}
									checked={isCurrentTimetableSelected}
									onChange={() => void onSelectCurrentTimetable()}
									disabled={isLoading}
								/>
								현재 시간표 선택
							</label>
						) : null}
					</div>
					<div className={styles.mobileTimetableTitleGroup}>
						<p className={styles.mobileTimetableTitle}>
							{displayTimetableName}
						</p>
					</div>
					<div className={styles.mobileWeekNavGroup}>
						{mobileEventWeekLabel && (
							<p className={styles.mobileEventWeekLabel}>
								{mobileEventWeekLabel}
							</p>
						)}
						<div className={styles.mobileWeekNavButtons}>
							<button
								type="button"
								className={styles.mobileWeekNavButton}
								onClick={onPrevEventWeek}
								aria-label="이전 주 행사 보기"
							>
								&lt;
							</button>
							<button
								type="button"
								className={styles.mobileWeekNavButton}
								onClick={onNextEventWeek}
								aria-label="다음 주 행사 보기"
							>
								&gt;
							</button>
						</div>
					</div>
					{hasTimetable ? (
						<div className={styles.timetableToggleGroup}>
							<span className={styles.timetableToggleLabel}>
								행사 함께 보기
							</span>
							<button
								type="button"
								className={`${styles.timetableToggle} ${
									isEventOverlayOn ? styles.timetableToggleOn : ""
								}`}
								aria-label="행사 함께 보기"
								aria-pressed={isEventOverlayOn}
								onClick={() => onEventOverlayChange(!isEventOverlayOn)}
							>
								<span className={styles.timetableToggleThumb} />
							</button>
						</div>
					) : null}
				</div>

				<div className={styles.profileRow}>
					<SearchButton />
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
