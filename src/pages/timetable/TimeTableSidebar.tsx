import { useState } from "react";
import { FaAnglesLeft, FaAnglesRight } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthProvider";
import styles from "../../styles/Sidebar.module.css";
import type { PatchTimetableRequest, Timetable } from "../../util/types";

interface TimeTableSidebarProps {
	timetables: Timetable[];
	isOpen: boolean;
	onOpenChange: (isOpen: boolean) => void;
	onAddTimetable: () => Promise<void>;
	onSelectTimetable: (timetable: Timetable) => void;
	onRename: (timetableId: number, body: PatchTimetableRequest) => void;
	onDelete: (timetableId: number) => void;
}

export const TimeTableSidebar = ({
	timetables,
	isOpen,
	onOpenChange,
	onAddTimetable,
	onSelectTimetable,
	onRename,
	onDelete,
}: TimeTableSidebarProps) => {
	const { user } = useAuth();
	const [editingId, setEditingId] = useState<number | null>(null);
	const [newName, setNewName] = useState("");
	const [nameChangeId, setNameChangeId] = useState<number | null>(null);

	const navigate = useNavigate();

	const handleCalendarClick = () => {
		navigate("/main");
	};

	const handleHeaderClick = () => {
		// if user exists: refresh page
		if (!user) navigate("/auth/login");
	};

	const handleTimetableClick = () => {
		navigate("/timetable");
	};

	const startRename = (tt: Timetable) => {
		setNameChangeId(tt.id);
		setEditingId(null);
		setNewName(tt.name ?? "");
	};

	const cancelRename = () => {
		setNameChangeId(null);
		setNewName("");
	};

	const applyRename = async (ttId: number) => {
		const name = newName.trim();
		if (!name) return;
		onRename(ttId, { name });
		cancelRename();
		setEditingId(null);
	};

	if (!isOpen) {
		return (
			<div className={styles.hiddenSidebar}>
				<button
					className={styles.expandBtn}
					type="button"
					onClick={() => onOpenChange(true)}
				>
					<FaAnglesRight width={20} color="rgba(171,171,171,1)" />
				</button>
			</div>
		);
	}

	return (
		<div className={styles.sidebarContainer}>
			<div className={styles.headerRow}>
				<button
					type="button"
					onClick={handleHeaderClick}
					className={styles.header}
				>
					{user ? `${user?.username}의 시간표` : "로그인하고 이용하기"}
				</button>
				<button
					className={styles.collapseBtn}
					type="button"
					onClick={() => onOpenChange(false)}
				>
					<FaAnglesLeft width={20} color="rgba(171,171,171,1)" />
				</button>
			</div>

			{/* My Timetables */}
			<div className={styles.section}>
				<div className={styles.sectionHeader}>
					<div className={styles.sectionTitle}>나의 시간표</div>
					<button
						type="button"
						className={styles.iconBtn}
						onClick={onAddTimetable}
						aria-label="시간표 추가"
					>
						<span className={styles.plus} aria-hidden="true">
							+
						</span>
					</button>
				</div>

				<ul className={styles.list}>
					{timetables.map((tt) => (
						<li key={tt.id} className={styles.listItem}>
							{nameChangeId === tt.id ? (
								<div className={styles.renameBox}>
									<input
										className={styles.renameInput}
										value={newName}
										onChange={(e) => setNewName(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter" && !e.nativeEvent.isComposing) {
												onRename(tt.id, { name: newName });
											}
											if (e.key === "Escape") {
												setEditingId(null);
											}
										}}
									></input>
									<button
										type="button"
										className={styles.applyButton}
										onClick={() => applyRename(tt.id)}
									>
										적용
									</button>
								</div>
							) : (
								<button
									type="button"
									className={`${styles.rowBtn}`}
									onClick={() => onSelectTimetable(tt)}
								>
									<span className={styles.rowText}>
										<span className={styles.ttName}>{tt.name}</span>
									</span>
								</button>
							)}

							{nameChangeId !== tt.id && (
								<button
									type="button"
									className={styles.moreBtn}
									onClick={() => setEditingId(tt.id)}
									aria-label={`${tt.name} 더보기`}
								>
									<span aria-hidden="true">⋮</span>
								</button>
							)}

							{editingId === tt.id && nameChangeId !== tt.id && (
								<div className={styles.menu}>
									<button
										type="button"
										className={styles.menuItem}
										onClick={() => startRename(tt)}
									>
										이름 바꾸기
									</button>

									<button
										type="button"
										className={`${styles.menuItem} ${styles.danger}`}
										onClick={() => onDelete(tt.id)}
									>
										삭제
									</button>
								</div>
							)}
						</li>
					))}
				</ul>
			</div>

			<div className={styles.sectionTitle} style={{ marginTop: "40px" }}>
				페이지
			</div>
			<button
				type="button"
				className={styles.pageLink}
				onClick={() => handleCalendarClick()}
			>
				<img
					className={styles.icon}
					src="/assets/calendar.svg"
					alt="calendar icon"
				/>
				<span>캘린더로 돌아가기</span>
			</button>
			<div className={styles.pageLink}>
				<img
					className={styles.icon}
					src="/assets/bookmark.svg"
					alt="bookmark icon"
				/>
				<span>찜한 행사</span>
			</div>
			<button
				type="button"
				className={styles.pageLink}
				onClick={() => handleTimetableClick()}
			>
				<img
					className={styles.icon}
					src="/assets/timetableActive.png"
					alt="timetable icon"
				/>
				<span>시간표</span>
			</button>
		</div>
	);
};
