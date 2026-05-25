import { useMemo, useRef, useState } from "react";
import { SlArrowRight } from "react-icons/sl";
import { TiDelete } from "react-icons/ti";
import { hasOverlap } from "../../util/weekly_timetable/layout";
import {
	dayOfWeekToDay,
	dayToDayOfWeek,
} from "../../util/weekly_timetable/time";

import type {
	Course,
	CreateCustomCourseRequest,
	Day,
	Semester,
	SlotRow,
	TimeSlot,
} from "../../util/types";
import { DAY_LABELS_KO } from "../../util/types";
import { buildTimeOptions, STEP_MIN } from "../../util/weekly_timetable/time";
import styles from "@styles/Timetable.module.css";

type Props = {
	timetableId?: number;
	onAdd: (timetableId: number, body: CreateCustomCourseRequest) => void;
	allSlots: TimeSlot[];
	year: number;
	semester: Semester;
	setIsClicked: (isClicked: boolean) => void;
};

const DAYS: Day[] = [0, 1, 2, 3, 4, 5, 6];

export function AddClassPanel({
	timetableId,
	onAdd,
	allSlots,
	year,
	semester,
	setIsClicked,
}: Props) {
	const timeOptions = useMemo(() => buildTimeOptions(STEP_MIN), []);
	const [title, setTitle] = useState("");
	const [professor, setProfessor] = useState("");
	const [credit, setCredit] = useState<number | undefined>(undefined);

	const emptyRow = (): SlotRow => ({
		rowId: crypto.randomUUID(),
		dayOfweek: "MON",
		startAt: 8 * 60,
		endAt: 11 * 60,
	});

	const [slot, setSlot] = useState<SlotRow[]>([emptyRow()]);
	const addRow = () => setSlot((prev) => [...prev, emptyRow()]);
	const removeRow = (rowId: string) =>
		setSlot((prev) => prev.filter((t) => t.rowId !== rowId));
	const updateRow = (rowId: string, patch: Partial<SlotRow>) =>
		setSlot((prev) =>
			prev.map((r) =>
				r.rowId === rowId ? ({ ...r, ...patch } as SlotRow) : r,
			),
		);

	const nextIdRef = useRef(0);

	const isTimeRangeValid = useMemo(() => {
		return slot.every(
			(t) =>
				t.endAt > t.startAt &&
				t.startAt % STEP_MIN === 0 &&
				t.endAt % STEP_MIN === 0,
		);
	}, [slot]);

	const isTitleValid = useMemo(() => {
		return title.trim().length > 0;
	}, [title]);

	const hasConflict = useMemo(() => {
		if (!isTimeRangeValid) return false;
		return slot.some((s) => hasOverlap(allSlots, s));
	}, [slot, allSlots, isTimeRangeValid]);

	const canSave = isTimeRangeValid && isTitleValid && !hasConflict;

	const handleSave = () => {
		const conflict = slot.some((s) => hasOverlap(allSlots, s));
		if (conflict) {
			alert("시간이 겹치는 수업은 추가할 수 없습니다.");
			return;
		}
		if (!timetableId) {
			alert("시간표를 먼저 추가해주세요.");
			return;
		}

		const item: Course = {
			id: nextIdRef.current,
			year,
			semester,
			courseTitle: title,
			source: "CUSTOM",
			timeSlots: slot.map(({ rowId, ...rest }) => rest),
			courseNumber: undefined,
			lectureNumber: undefined,
			credit,
			instructor: professor || undefined,
		};

		const { id, ...body } = item;

		onAdd(timetableId, body);
		nextIdRef.current += 1;

		// reset
		setTitle("");
		setProfessor("");
		setSlot([emptyRow()]);
	};

	return (
		<>
			<button
				type="button"
				className={styles.addClassPanelDim}
				aria-label="수업 추가 닫기"
				onClick={() => setIsClicked(false)}
			/>

			<aside className={styles.panel}>
				<SlArrowRight onClick={() => setIsClicked(false)} />
				<h2>새 수업 추가</h2>

				<label className={styles.field}>
					<div>과목명 (필수)</div>
					<input
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="경제학개론"
					/>
				</label>

				<label className={styles.field}>
					<div>교수명 (선택)</div>
					<input
						value={professor}
						onChange={(e) => setProfessor(e.target.value)}
						placeholder="박이택"
					/>
				</label>

				<label className={styles.field}>
					<div>학점 (선택)</div>
					<input
						type="number"
						value={credit ?? ""}
						onChange={(e) => {
							const value = e.target.value;
							setCredit(value === "" ? undefined : Number(value));
						}}
						placeholder="3"
						min={0}
						step={1}
					/>
				</label>

				<div>
					<div>
						<div>시간 (필수)</div>
					</div>

					{slot.map((t) => (
						<div key={t.rowId}>
							<div className={styles.timeslotDelete}>
								<TiDelete onClick={() => removeRow(t.rowId)} />
							</div>

							<div className={styles.dayButtons}>
								{DAYS.map((d) => {
									const active = dayOfWeekToDay(t.dayOfweek) === d;
									return (
										<button
											key={d}
											type="button"
											className={`${styles.dayBtn} ${active ? styles.isActive : ""}`}
											onClick={() =>
												updateRow(t.rowId, { dayOfweek: dayToDayOfWeek(d) })
											}
										>
											{DAY_LABELS_KO[d]}
										</button>
									);
								})}
							</div>

							<div className={styles.timeRange}>
								<select
									value={t.startAt}
									onChange={(e) =>
										updateRow(t.rowId, { startAt: Number(e.target.value) })
									}
								>
									{timeOptions.map((o) => (
										<option key={o.value} value={o.value}>
											{o.label}
										</option>
									))}
								</select>

								<span className={styles.tilde}>~</span>

								<select
									value={t.endAt}
									onChange={(e) =>
										updateRow(t.rowId, { endAt: Number(e.target.value) })
									}
								>
									{timeOptions.map((o) => (
										<option key={o.value} value={o.value}>
											{o.label}
										</option>
									))}
								</select>
							</div>
						</div>
					))}

					<button className={styles.link} type="button" onClick={addRow}>
						+ 시간 추가
					</button>

					{!isTimeRangeValid && (
						<div className={styles.error}>
							시간 범위가 잘못되었습니다. (종료가 시작보다 늦어야 하고 5분
							단위여야 합니다.)
						</div>
					)}

					{!isTitleValid && (
						<div className={styles.error}>과목 이름은 필수입니다.</div>
					)}
				</div>

				<button
					className={styles.save}
					type="button"
					disabled={!canSave}
					onClick={handleSave}
				>
					저장
				</button>
			</aside>
		</>
	);
}
