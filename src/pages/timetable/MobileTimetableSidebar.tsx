import { useEffect, useState } from "react";
import { SlArrowRight } from "react-icons/sl";
import Modal from "@/components/ui/Modal";
import type {
	CreateTimetableRequest,
	PatchTimetableRequest,
	Semester,
	Timetable,
} from "../../util/types";
import styles from "./Timetable.module.css";

type NameModalMode = "create" | "rename";

type Props = {
	isOpen: boolean;
	timetables: Timetable[];
	currentTimetable: Timetable | null;
	year: number;
	semester: Semester;
	onClose: () => void;
	onAddTimetable: (body: CreateTimetableRequest) => Promise<void> | void;
	onSelectTimetable: (timetable: Timetable) => void;
	onRename: (
		timetableId: number,
		body: PatchTimetableRequest,
	) => Promise<void> | void;
	onDelete: (timetableId: number) => Promise<void> | void;
};

export function MobileTimetableSidebar({
	isOpen,
	timetables,
	currentTimetable,
	year,
	semester,
	onClose,
	onAddTimetable,
	onSelectTimetable,
	onRename,
	onDelete,
}: Props) {
	const [nameModalMode, setNameModalMode] = useState<NameModalMode | null>(
		null,
	);
	const [selectedTimetableForEdit, setSelectedTimetableForEdit] =
		useState<Timetable | null>(null);
	const [nameInput, setNameInput] = useState("");
	const [deleteTarget, setDeleteTarget] = useState<Timetable | null>(null);

	useEffect(() => {
		if (!isOpen) {
			setNameModalMode(null);
			setSelectedTimetableForEdit(null);
			setNameInput("");
			setDeleteTarget(null);
		}
	}, [isOpen]);

	if (!isOpen) return null;

	const openCreateModal = () => {
		setSelectedTimetableForEdit(null);
		setNameInput("");
		setNameModalMode("create");
	};

	const openRenameModal = (timetable: Timetable) => {
		setSelectedTimetableForEdit(timetable);
		setNameInput(timetable.name ?? "");
		setNameModalMode("rename");
	};

	const closeNameModal = () => {
		setNameModalMode(null);
		setSelectedTimetableForEdit(null);
		setNameInput("");
	};

	const submitNameModal = async () => {
		const nextName = nameInput.trim();
		if (!nextName) return;

		if (nameModalMode === "create") {
			await onAddTimetable({ year, semester, name: nextName });
		}

		if (nameModalMode === "rename" && selectedTimetableForEdit) {
			await onRename(selectedTimetableForEdit.id, { name: nextName });
		}

		closeNameModal();
	};

	const confirmDelete = async () => {
		if (!deleteTarget) return;
		await onDelete(deleteTarget.id);
		setDeleteTarget(null);
	};

	return (
		<>
			<button
				type="button"
				className={styles.mobileTimetableSidebarDim}
				aria-label="시간표 변경 닫기"
				onClick={onClose}
			/>

			<aside className={styles.mobileTimetableSidebar}>
				<button
					type="button"
					className={styles.mobileTimetableSidebarClose}
					onClick={onClose}
					aria-label="시간표 변경 닫기"
				>
					<SlArrowRight />
				</button>

				<div className={styles.mobileTimetableSidebarHeader}>
					<h2>나의 시간표</h2>
					<button
						type="button"
						className={styles.mobileTimetableAddIcon}
						onClick={openCreateModal}
						aria-label="새 시간표 추가"
					>
						+
					</button>
				</div>

				{timetables.length === 0 ? (
					<p className={styles.mobileTimetableEmpty}>
						시간표 변경에서 새 시간표를 추가해 주세요
					</p>
				) : (
					<ul className={styles.mobileTimetableList}>
						{timetables.map((timetable) => {
							const isSelected = currentTimetable?.id === timetable.id;
							return (
								<li
									key={timetable.id}
									className={`${styles.mobileTimetableItem} ${
										isSelected ? styles.mobileTimetableItemSelected : ""
									}`}
								>
									<button
										type="button"
										className={styles.mobileTimetableSelect}
										onClick={() => {
											onSelectTimetable(timetable);
											onClose();
										}}
									>
										<span className={styles.mobileTimetableName}>
											{timetable.name || "이름 없는 시간표"}
										</span>
									</button>

									<div className={styles.mobileTimetableActions}>
										<button
											type="button"
											className={styles.mobileTimetableEditButton}
											onClick={() => openRenameModal(timetable)}
										>
											수정
										</button>
										<button
											type="button"
											className={styles.mobileTimetableDeleteButton}
											onClick={() => setDeleteTarget(timetable)}
										>
											삭제
										</button>
									</div>
								</li>
							);
						})}
					</ul>
				)}
			</aside>

			{nameModalMode && (
				<Modal
					content={
						nameModalMode === "create"
							? "새 시간표 이름을 입력해 주세요."
							: "변경할 시간표 이름을 입력해 주세요."
					}
					leftText="확인"
					rightText="취소"
					onLeftClick={() => void submitNameModal()}
					onRightClick={closeNameModal}
					onClose={closeNameModal}
				>
					<input
						className={styles.mobileTimetableNameInput}
						value={nameInput}
						onChange={(event) => setNameInput(event.target.value)}
						onKeyDown={(event) => {
							if (event.key === "Enter" && !event.nativeEvent.isComposing) {
								void submitNameModal();
							}
						}}
						placeholder="시간표 이름"
					/>
				</Modal>
			)}

			{deleteTarget && (
				<Modal
					content={`'${deleteTarget.name || "이름 없는 시간표"}' 시간표를 삭제할까요?`}
					leftText="삭제"
					rightText="취소"
					onLeftClick={() => void confirmDelete()}
					onRightClick={() => setDeleteTarget(null)}
					onClose={() => setDeleteTarget(null)}
				/>
			)}
		</>
	);
}
