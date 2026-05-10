import { formatDateDotParsed } from "@/util/Calendar/dateFormatter";
import type { Memo } from "@/util/types";
import {
	useEffect,
	useRef,
	useState,
	type Dispatch,
	type SetStateAction,
} from "react";

import styles from "@styles/MemoPageCard.module.css";
import { HiOutlinePencilAlt } from "react-icons/hi";
import { IoMdAdd, IoMdClose, IoMdDoneAll } from "react-icons/io";
import { FaCheck, FaTrashCan } from "react-icons/fa6";
import { useUserData } from "@/contexts/UserDataContext";

const MemoPageCard = ({
	memo,
	onDelete,
}: {
	memo: Memo;
	onDelete: Dispatch<SetStateAction<number | null>>;
}) => {
	const [editMode, setEditMode] = useState<boolean>(false);
	const [content, setContent] = useState<string>(memo.content);
	const [tagNames, setTagNames] = useState<string[]>(
		memo.tags.map((m) => m.name),
	);
	const [isAddingTag, setIsAddingTag] = useState<boolean>(false);
	const [newTag, setNewTag] = useState<string>("");
	const { updateMemo } = useUserData();
	const inputRef = useRef<HTMLInputElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		setContent(memo.content);
		setTagNames(memo.tags.map((m) => m.name));
		requestAnimationFrame(() => {
			const el = textareaRef.current;
			if (!el) return;
			el.style.height = "auto";
			el.style.height = `${Math.min(el.scrollHeight, 150)}px`;
		});
	}, [memo]);

	/* on clicking '+' button, set focus on tag input */
	useEffect(() => {
		if (isAddingTag && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isAddingTag]);

	const tagsChanged =
		JSON.stringify(tagNames.sort()) !==
		JSON.stringify(memo.tags.map((m) => m.name).sort());

	const isContentChanged = content !== memo.content;

	const handleDeleteTag = (tagName: string) => {
		setTagNames((prev) => prev.filter((t) => t !== tagName));
	};

	const handleNewTag = () => {
		// on clicking '+' button : show tag input
		setIsAddingTag(true);
	};

	const handleAddTag = () => {
		// if newTag content exists & newTag is unique
		if (newTag.trim() && !tagNames.includes(newTag)) {
			setTagNames([...tagNames, newTag]);
		}
		setNewTag("");
		setIsAddingTag(false);
	};

	const handleSave = async () => {
		setEditMode(false);

		const updates: { content?: string; tagNames?: string[] } = {};
		if (tagsChanged) {
			updates.tagNames = tagNames;
		}
		// if contents are changed
		if (isContentChanged) {
			updates.content = content;
		}

		if (tagsChanged || isContentChanged) {
			await updateMemo(memo.id, updates);
		}
	};

	return (
		<div className={styles.cardContainer}>
			<span className={styles.memoDate}>
				{formatDateDotParsed(memo.createdAt)}
			</span>
			<div className={styles.cardWrapper}>
				<textarea
					ref={textareaRef}
					className={`${styles.memoTextarea} ${editMode ? styles.activeTextarea : ""}`}
					value={content}
					onChange={(e) => {
						setContent(e.currentTarget.value);
						e.currentTarget.style.height = "auto";
						e.currentTarget.style.height = `${Math.min(e.currentTarget.scrollHeight, 150)}px`;
					}}
					disabled={!editMode}
				/>
				<span className={styles.memoTitle}>{memo.eventTitle}</span>
				<div className={styles.tagsContainer}>
					<ul className={styles.chips}>
						{tagNames.map((t) => (
							<li key={t} className={styles.chip}>
								<span>{t}</span>
								{editMode && (
									<IoMdClose
										className={styles.deleteTagIcon}
										onClick={() => handleDeleteTag(t)}
									/>
								)}
							</li>
						))}
					</ul>
					{isAddingTag && (
						<div className={styles.addLabel}>
							<input
								ref={inputRef}
								className={styles.addInput}
								value={newTag}
								onChange={(e) => setNewTag(e.currentTarget.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter" && !e.nativeEvent.isComposing) {
										e.preventDefault();
										handleAddTag();
									}
								}}
							/>
							<FaCheck
								onClick={handleAddTag}
								className={styles.addIcon}
								size={12}
								color="#666666"
								role="button"
								tabIndex={0}
								aria-label="Add tag"
								onKeyDown={(e) => {
									if (e.key === "Enter" && !e.nativeEvent.isComposing) {
										e.preventDefault();
										handleAddTag();
									}
								}}
							/>
						</div>
					)}
					{editMode && (
						<button
							type="button"
							className={styles.addTagBtn}
							onClick={handleNewTag}
						>
							<IoMdAdd size={18} color="#666666" />
						</button>
					)}
				</div>
				{!editMode ? (
					<div className={styles.buttonsRow}>
						<FaTrashCan
							onClick={() => onDelete(memo.id)}
							className={styles.deleteBtn}
							size={22}
							color="#7c7c7c"
						/>
						<HiOutlinePencilAlt
							onClick={() => setEditMode(true)}
							className={styles.editIcon}
							size={25}
							color="#7c7c7c"
						/>
					</div>
				) : (
					<IoMdDoneAll
						onClick={handleSave}
						className={styles.checkIcon}
						size={25}
						color="#7c7c7c"
					/>
				)}
			</div>
		</div>
	);
};

export default MemoPageCard;
