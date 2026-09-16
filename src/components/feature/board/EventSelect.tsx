import { useEffect, useMemo, useRef, useState } from "react";
import { FaChevronDown, FaXmark } from "react-icons/fa6";
import { MOCK_EVENT_TITLES } from "./boardMock";
import styles from "./EventSelect.module.css";

/**
 * 행사 선택 콤보박스.
 *
 * 행사 수가 계속 늘어나는 목록이라 고정 드롭다운으로는 못 고른다.
 * 입력창에 친 글자로 좁혀 고르고, 고른 뒤에는 칩으로 보여준다.
 *
 * 글쓰기(어느 행사에 쓸지)와 게시판 검색(어느 행사 글만 볼지)이 같이 쓴다.
 */
const EventSelect = ({
	value,
	onChange,
	placeholder = "행사 이름을 검색해 선택하세요",
	allowEmpty = true,
	emptyLabel = "행사 선택 안 함",
}: {
	value: number | null;
	onChange: (eventId: number | null) => void;
	placeholder?: string;
	allowEmpty?: boolean;
	emptyLabel?: string;
}) => {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const wrapRef = useRef<HTMLDivElement>(null);

	const entries = useMemo(
		() =>
			Object.entries(MOCK_EVENT_TITLES).map(([id, title]) => ({
				id: Number(id),
				title,
			})),
		[],
	);

	const matched = useMemo(() => {
		const q = query.trim();
		if (!q) return entries;
		return entries.filter((e) => e.title.includes(q));
	}, [entries, query]);

	// 바깥을 누르면 닫는다. 목록이 열린 채 남아 다른 입력을 가리지 않도록.
	useEffect(() => {
		if (!open) return;
		const onDown = (e: MouseEvent) => {
			if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
		};
		document.addEventListener("mousedown", onDown);
		return () => document.removeEventListener("mousedown", onDown);
	}, [open]);

	const selectedTitle = value ? MOCK_EVENT_TITLES[value] : null;

	const pick = (id: number | null) => {
		onChange(id);
		setQuery("");
		setOpen(false);
	};

	return (
		<div className={styles.wrap} ref={wrapRef}>
			{selectedTitle ? (
				<div className={styles.selected}>
					<span className={styles.selectedText}>{selectedTitle}</span>
					{allowEmpty && (
						<button
							type="button"
							className={styles.clear}
							aria-label="선택한 행사 지우기"
							onClick={() => pick(null)}
						>
							<FaXmark size={12} />
						</button>
					)}
					<button
						type="button"
						className={styles.change}
						onClick={() => setOpen((v) => !v)}
					>
						변경
					</button>
				</div>
			) : (
				<div className={styles.control}>
					<input
						className={styles.input}
						value={query}
						placeholder={placeholder}
						onChange={(e) => {
							setQuery(e.currentTarget.value);
							setOpen(true);
						}}
						onFocus={() => setOpen(true)}
					/>
					<button
						type="button"
						className={styles.toggle}
						aria-label="행사 목록 열기"
						onClick={() => setOpen((v) => !v)}
					>
						<FaChevronDown size={12} />
					</button>
				</div>
			)}

			{open && (
				<ul className={styles.menu}>
					{allowEmpty && (
						<li>
							<button
								type="button"
								className={styles.option}
								onClick={() => pick(null)}
							>
								{emptyLabel}
							</button>
						</li>
					)}
					{matched.map((e) => (
						<li key={e.id}>
							<button
								type="button"
								className={`${styles.option} ${
									e.id === value ? styles.optionOn : ""
								}`}
								onClick={() => pick(e.id)}
							>
								{e.title}
							</button>
						</li>
					))}
					{matched.length === 0 && (
						<li className={styles.noMatch}>검색 결과가 없어요.</li>
					)}
				</ul>
			)}
		</div>
	);
};

export default EventSelect;
