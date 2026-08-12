import { formatDateDotParsed } from "@/util/calendar/dateFormatter";
import { getDDay } from "@/util/calendar/getDday";
import type { Memo } from "@/util/types";
import {
	useEffect,
	useRef,
	useState,
	type Dispatch,
	type MouseEvent,
	type SetStateAction,
} from "react";

import styles from "./MemoCard.module.css";
import { HiOutlinePencilAlt } from "react-icons/hi";
import { IoMdAdd, IoMdClose, IoMdDoneAll } from "react-icons/io";
import { FaCheck, FaTrashCan } from "react-icons/fa6";
import { useUserData } from "@/contexts/UserDataContext";
import { useDetail } from "@/contexts/DetailContext";

const resizeTextarea = (textarea: HTMLTextAreaElement) => {
	textarea.style.height = "0px";
	const minHeight = Number.parseFloat(getComputedStyle(textarea).minHeight);
	textarea.style.height = `${Math.max(
		minHeight,
		textarea.scrollHeight,
	)}px`;
};

type MemoCardProps =
	| {
		memo: Memo;
		onDelete: Dispatch<SetStateAction<number | null>>;
		variant?: "page";
	}
	| {
		memo: Memo;
		onDelete?: never;
		variant: "widget";
	};

const MemoCard = (props: MemoCardProps) => {
	const { memo } = props;
	const isWidget = props.variant === "widget";
	const onDelete = isWidget ? undefined : props.onDelete;
	const [editMode, setEditMode] = useState<boolean>(false);
	const [content, setContent] = useState<string>(memo.content);
	const [tagNames, setTagNames] = useState<string[]>(
		memo.tags.map((m) => m.name),
	);
	const [isAddingTag, setIsAddingTag] = useState<boolean>(false);
	const [newTag, setNewTag] = useState<string>("");
	const { updateMemo, toggleBookmark } = useUserData();
	const { openDetail } = useDetail();
	const inputRef = useRef<HTMLInputElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		setContent(memo.content);
		setTagNames(memo.tags.map((m) => m.name));
		requestAnimationFrame(() => {
			const el = textareaRef.current;
			if (!el) return;
			resizeTextarea(el);
		});
	}, [memo]);

	/* on clicking '+' button, set focus on tag input */
	useEffect(() => {
		if (isAddingTag && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isAddingTag]);

	const tagsChanged =
		JSON.stringify([...tagNames].sort()) !==
		JSON.stringify(memo.tags.map((m) => m.name).sort());

	const isContentChanged = content !== memo.content;
	const memoDate = memo.createdAt ? formatDateDotParsed(memo.createdAt) : null;
	const organizationName = memo.organization?.name;

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

	const handleOpenDetail = () => {
		if (editMode || isAddingTag) return;
		openDetail(memo.eventId);
	};

	const handleToggleBookmark = async (
		event: MouseEvent<HTMLButtonElement>,
	) => {
		event.stopPropagation();
		await toggleBookmark(memo.eventId);
	};

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: page cards need a click handler but contain nested interactive controls
		<div
			className={`${styles.cardContainer} ${isWidget ? styles.widgetCardContainer : ""}`}
			onClick={isWidget ? undefined : handleOpenDetail}
			onKeyDown={
				isWidget
					? undefined
					: (e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								handleOpenDetail();
							}
						}
			}
			role={isWidget ? undefined : "button"}
			tabIndex={isWidget ? undefined : 0}
		>
			<div className={styles.cardWrapper}>
				<div className={styles.cardHeader}>
					{/* Category ID is not included in the memo response yet. */}
					<span className={styles.statusDot} aria-hidden="true" />
					<span className={styles.memoDate}>
						{memo.applyEnd ? getDDay(memo.applyEnd) : ""}
					</span>
					<button
						type="button"
						className={styles.bookmarkButton}
						onClick={handleToggleBookmark}
					>
						<img
							src={
								memo.isBookmarked
									? "/assets/Bookmarked.svg"
									: "/assets/notBookmarked.svg"
							}
							className={styles.bookmarkIcon}
							alt={memo.isBookmarked ? "찜한 행사" : "찜하지 않은 행사"}
						/>
					</button>
				</div>
				<span className={styles.memoTitle}>{memo.eventTitle}</span>
				<div className={styles.memoMetadata}>
					{memoDate && <span>{memoDate}</span>}
					{memoDate && organizationName && <span aria-hidden="true">|</span>}
					{organizationName && <span>{organizationName}</span>}
				</div>
				{isWidget ? (
					<span className={styles.memoContent}>{content}</span>
				) : (
					<textarea
						ref={textareaRef}
						className={`${styles.memoTextarea} ${editMode ? styles.activeTextarea : ""}`}
						rows={1}
						value={content}
						onChange={(e) => {
							setContent(e.currentTarget.value);
							resizeTextarea(e.currentTarget);
						}}
						onClick={(e) => e.stopPropagation()}
						disabled={!editMode}
					/>
				)}
				{!editMode && memo.tags.length > 0 && (
					<div className={styles.memoTags}>
						{memo.tags.map((tag) => (
							<span key={tag.id} className={styles.memoTag}>
								# {tag.name}
							</span>
						))}
					</div>
				)}
				{editMode && (
					<div className={styles.tagsContainer}>
						<ul className={styles.chips}>
							{tagNames.map((t) => (
								<li key={t} className={styles.chip}>
									<span>{t}</span>
									<IoMdClose
										className={styles.deleteTagIcon}
										onClick={(e) => {
											e.stopPropagation();
											handleDeleteTag(t);
										}}
									/>
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
									onClick={(e) => e.stopPropagation()}
									onKeyDown={(e) => {
										e.stopPropagation();
										if (e.key === "Enter" && !e.nativeEvent.isComposing) {
											e.preventDefault();
											handleAddTag();
										}
									}}
								/>
								<FaCheck
									onClick={(e) => {
										e.stopPropagation();
										handleAddTag();
									}}
									className={styles.addIcon}
									size={12}
									color="#666666"
									role="button"
									tabIndex={0}
									aria-label="Add tag"
									onKeyDown={(e) => {
										e.stopPropagation();
										if (e.key === "Enter" && !e.nativeEvent.isComposing) {
											e.preventDefault();
											handleAddTag();
										}
									}}
								/>
							</div>
						)}
						<button
							type="button"
							className={styles.addTagBtn}
							onClick={(e) => {
								e.stopPropagation();
								handleNewTag();
							}}
						>
							<IoMdAdd size={18} color="#666666" />
						</button>
					</div>
				)}
				{!isWidget && !editMode ? (
					<div className={styles.buttonsRow}>
						<FaTrashCan
							onClick={(e) => {
								e.stopPropagation();
								onDelete?.(memo.id);
							}}
							className={styles.deleteBtn}
							size={22}
							color="#7c7c7c"
						/>
						<HiOutlinePencilAlt
							onClick={(e) => {
								e.stopPropagation();
								setEditMode(true);
							}}
							className={styles.editIcon}
							size={25}
							color="#7c7c7c"
						/>
					</div>
				) : (
					!isWidget &&
					<IoMdDoneAll
						onClick={(e) => {
							e.stopPropagation();
							handleSave();
						}}
						className={styles.checkIcon}
						size={25}
						color="#7c7c7c"
					/>
				)}
			</div>
		</div>
	);
};

export default MemoCard;
