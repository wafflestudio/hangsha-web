import styles from "@styles/DetailMemo.module.css";
import { useUserData } from "@/contexts/UserDataContext";
import { useEffect, useRef, useState, type SetStateAction } from "react";
import { TiPencil } from "react-icons/ti";
import type { Memo, MemoTag } from "@/util/types";

interface DetailMemoProps {
	eventId: number;
	isMemoExpanded: boolean;
	setIsMemoExpanded: React.Dispatch<SetStateAction<boolean>>;
}

const DetailMemo = ({
	eventId,
	isMemoExpanded,
	setIsMemoExpanded,
}: DetailMemoProps) => {
	const { eventMemos, addMemo, updateMemo } = useUserData();
	// events that user has written memos
	const CURRENT_MEMO: Memo | undefined = eventMemos.find(
		(m: Memo) => m.eventId === eventId,
	);

	// 메모 관련 상태
	const [memoContent, setMemoContent] = useState<string>(
		CURRENT_MEMO ? CURRENT_MEMO.content : "",
	);
	const [isSavingMemo, setIsSavingMemo] = useState<boolean>(false);

	// 태그 관련 상태
	const [tagNames, setTagNames] = useState<string[]>(
		CURRENT_MEMO ? CURRENT_MEMO.tags.map((t) => t.name) : [],
	);
	const [tagInput, setTagInput] = useState<string>("");

	const currentTagNames = CURRENT_MEMO
		? CURRENT_MEMO.tags.map((t) => t.name)
		: [];

	const tagsChanged =
		JSON.stringify(tagNames.sort()) !== JSON.stringify(currentTagNames.sort());

	const isContentChanged = memoContent !== CURRENT_MEMO?.content;

	const showSaveBtn =
		(CURRENT_MEMO && (memoContent !== CURRENT_MEMO.content || tagsChanged)) ||
		(!CURRENT_MEMO && memoContent.trim().length > 0);

	// 메모 & 태그 input ref
	const memoInputRef = useRef<HTMLTextAreaElement | null>(null);
	const tagInputRef = useRef<HTMLInputElement | null>(null);

	useEffect(() => {
		const currentMemo = eventMemos.find((m: Memo) => m.eventId === eventId);
		setMemoContent(currentMemo ? currentMemo.content : "");
		setIsSavingMemo(false);
		setTagNames(
			currentMemo ? currentMemo.tags.map((t: MemoTag) => t.name) : [],
		);
		setTagInput("");
	}, [eventId, eventMemos]);

	// 태그 관련 함수
	const normalizeTag = (raw: string) => {
		// 공백 제거, # 제거, 연속 공백 정리
		const tag = raw.trim().replace(/^#+/, "");
		return tag;
	};

	// 메모 입력 영역 확장 함수
	const expandMemo = () => {
		if (!isMemoExpanded) setIsMemoExpanded(true);
		// 다음 tick에 포커스
		setTimeout(() => memoInputRef.current?.focus(), 0);
	};

	// 태그 추가
	const addTag = (raw?: string) => {
		const candidate = normalizeTag(raw ?? tagInput);
		if (!candidate) return;

		setTagNames((prev) => {
			// 대소문자 무시, 중복 방지
			const exists = prev.some(
				(t) => t.toLowerCase() === candidate.toLowerCase(),
			);
			if (exists) return prev;
			return [...prev, candidate];
		});
		setTagInput("");
		// 태그 추가 후 계속 입력할 수 있게 유지
		setTimeout(() => tagInputRef.current?.focus(), 0);
	};

	// 태그 삭제
	const removeTag = (tag: string) => {
		setTagNames((prev) => prev.filter((t) => t !== tag));
	};

	// 메모 저장 기능 - if null is inputted, contents are deleted.
	const handleMemoSave = async () => {
		// is it a new memoContent or not?
		setIsSavingMemo(true);
		if (CURRENT_MEMO) {
			// EDIT
			// if tags are changed
			const updates: { content?: string; tagNames?: string[] } = {};
			if (tagsChanged) {
				updates.tagNames = tagNames;
			}
			// if contents are changed
			if (isContentChanged) {
				updates.content = memoContent;
			}

			if (tagsChanged || isContentChanged) {
				await updateMemo(CURRENT_MEMO.id, updates);
			}
		} else {
			// ADD
			if (!CURRENT_MEMO && memoContent.trim().length === 0) return;
			await addMemo(eventId, memoContent, tagNames);
		}

		setIsSavingMemo(false);
		setIsMemoExpanded(false);
	};

	return (
		<div
			className={`${styles.memoContent} ${isMemoExpanded ? styles.active : ""}`}
		>
			{/* 헤더 라인 (연필/메모하기/저장하기) */}
			<div className={styles.memoHeader}>
				<button
					type="button"
					onClick={expandMemo}
					className={styles.memoIconBtn}
					aria-label="메모 입력 열기"
				>
					<TiPencil size={18} color="rgba(130, 130, 130, 1)" />
				</button>
				{/* 이미 존재하는 메모 : 빈칸 입력 시 메모 삭제 */}
				{showSaveBtn ? (
					<button
						type="button"
						onMouseDown={(e) => e.stopPropagation()}
						onClick={(e) => {
							e.stopPropagation();
							handleMemoSave();
						}}
						className={styles.memoSaveBtn}
						disabled={isSavingMemo}
					>
						{isSavingMemo ? "저장 중..." : "저장하기"}
					</button>
				) : (
					<button
						type="button"
						onClick={expandMemo}
						className={styles.memoTriggerText}
					>
						메모하기
					</button>
				)}
			</div>

			{/* 메모 입력 */}
			<div className={styles.memoBody}>
				{isMemoExpanded ? (
					<textarea
						ref={memoInputRef}
						value={memoContent}
						onChange={(e) => {
							setMemoContent(e.target.value);
						}}
						disabled={isSavingMemo}
						className={styles.memoInput}
						placeholder="메모를 입력하세요"
						rows={4}
					/>
				) : (
					<input
						value={memoContent}
						onChange={(e) => {
							setMemoContent(e.target.value);
						}}
						className={styles.memoInput}
						type="text"
						placeholder="메모를 입력하세요"
						disabled={isSavingMemo}
						onFocus={expandMemo}
						onClick={(e) => {
							e.stopPropagation();
							expandMemo();
						}}
					/>
				)}
			</div>
			{/* 태그 입력 영역: 확장 시만 노출 */}
			{isMemoExpanded ? (
				<div className={styles.tagSection} role="presentation">
					<div className={styles.tagRow}>
						<input
							ref={tagInputRef}
							value={tagInput}
							onChange={(e) => setTagInput(e.target.value)}
							placeholder="태그 추가…"
							type="text"
							className={styles.tagInput}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.nativeEvent.isComposing) {
									e.preventDefault();
									addTag();
								}
								if (
									e.key === "Backspace" &&
									tagInput.length === 0 &&
									tagNames.length > 0
								) {
									removeTag(tagNames[tagNames.length - 1]);
								}
							}}
						/>

						<button
							type="button"
							onClick={() => addTag()}
							className={styles.tagAddBtn}
							disabled={normalizeTag(tagInput).length === 0}
						>
							추가
						</button>
					</div>
				</div>
			) : null}
			{/* if HAS_MEMO : tags are visible */}
			{tagNames.length > 0 ? (
				<div className={styles.tagChips}>
					{tagNames.map((t) => (
						<span key={t} className={styles.tagChip}>
							<span className={styles.tagChipText}># {t}</span>
							<button
								type="button"
								onClick={() => removeTag(t)}
								className={styles.tagChipRemove}
								aria-label={`remove tag ${t}`}
							>
								×
							</button>
						</span>
					))}
				</div>
			) : (
				CURRENT_MEMO && (
					<div className={styles.helperText}>
						Enter 또는 “추가”로 태그를 추가할 수 있어요.
					</div>
				)
			)}
		</div>
	);
};

export default DetailMemo;
