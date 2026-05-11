import { useEffect, useRef, useState, useCallback, /*useMemo*/ } from "react";
import { MdRefresh } from "react-icons/md";
import { IoIosClose } from "react-icons/io";
import { FiPlus } from "react-icons/fi";
// import { useEvents } from "@/contexts/EventContext";
import { useFilter } from "@contexts/FilterContext";
import { useUserData } from "@/contexts/UserDataContext";
import styles from "@styles/FilterSheet.module.css";
import type { Category } from "@types";
import { CATEGORY_BUTTON_COLORS } from "@/util/constants";
import { ClipLoader } from "react-spinners";
import { useAuth } from "@/contexts/AuthProvider";
import { useNavigate } from "react-router-dom";

type TabKey = "category" | "org" | "status" | "exclude";


interface TabDef {
	key: TabKey;
	label: string;
}
 
const TABS: TabDef[] = [
	{ key: "category", label: "행사 종류" },
	{ key: "org", label: "주최 기관" },
	{ key: "status", label: "모집 현황" },
	{ key: "exclude", label: "제외" },
];

// Distance in px the user must drag down to trigger a close
const CLOSE_DRAG_THRESHOLD = 120;

export const FilterSheet = () => {
	const {
        filterSheetShowing,
        setFilterSheetShowing,
        categoryGroups,
        isLoadingMeta,
		globalCategory,
		globalOrg,
		globalStatus,
		setGlobalCategory,
		setGlobalOrg,
		setGlobalStatus,
	} = useFilter();
    const { excludedKeywords, addExcludedKeyword, deleteExcludedKeyword, excludedKeywordLoading } = useUserData();
    // const { monthViewData } = useEvents();
    const [activeTab, setActiveTab] = useState<TabKey>("category");
	const [excludeInput, setExcludeInput] = useState<string>("");
	const { user } = useAuth();
	const navigate = useNavigate();

	// Drag-to-dismiss state
	const [dragY, setDragY] = useState<number>(0);
	const [isDragging, setIsDragging] = useState<boolean>(false);
	const dragStartY = useRef<number>(0);
	const sheetRef = useRef<HTMLDivElement>(null);

	// Mount / unmount animation control
	const [shouldRender, setShouldRender] = useState<boolean>(filterSheetShowing);
	const [isVisible, setIsVisible] = useState<boolean>(false);

	useEffect(() => {
		if (filterSheetShowing) {
			setShouldRender(true);
			// Next frame -> trigger slide-up transition
			const id = requestAnimationFrame(() => setIsVisible(true));
			return () => cancelAnimationFrame(id);
		}
		setIsVisible(false);
		const timer = window.setTimeout(() => setShouldRender(false), 280);
		return () => window.clearTimeout(timer);
	}, [filterSheetShowing]);

	// Lock background scroll while the sheet is open
	useEffect(() => {
		if (!filterSheetShowing) return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = prev;
		};
	}, [filterSheetShowing]);

	// Lists from context
	const STATUS_LIST = categoryGroups.find((g) => g.group.id === 1)?.categories || [];
	const ORG_LIST = categoryGroups.find((g) => g.group.id === 2)?.categories || [];
	const CATEGORY_LIST = categoryGroups.find((g) => g.group.id === 3)?.categories || [];

    const getListForTab = (tab: TabKey): Category[] => {
		if (tab === "category") return CATEGORY_LIST;
		if (tab === "org") return ORG_LIST;
		if (tab === "status") return STATUS_LIST;
		return [];
	};

    const getStateForTab = (tab: TabKey): Category[] => {
		if (tab === "category") return globalCategory;
		if (tab === "org") return globalOrg;
		if (tab === "status") return globalStatus;
		return [];
	};

    const setStateForTab = (tab: TabKey, next: Category[]) => {
		if (tab === "category") setGlobalCategory(next);
		else if (tab === "org") setGlobalOrg(next);
		else if (tab === "status") setGlobalStatus(next);
	};

    const handleToggle = (item: Category) => {
		if (activeTab === "exclude") return;
		const current = getStateForTab(activeTab);
		const isSelected = current.some((c) => c.id === item.id);
		const next = isSelected
			? current.filter((c) => c.id !== item.id)
			: [...current, item];
		setStateForTab(activeTab, next);
	};

    // '전체 선택' 토글
	const handleToggleAll = () => {
		if (activeTab === "exclude") return;
		const list = getListForTab(activeTab);
		const current = getStateForTab(activeTab);
		if (current.length === list.length) {
			setStateForTab(activeTab, []);
		} else {
			setStateForTab(activeTab, [...list]);
		}
	};

    const handleResetAll = () => {
		setGlobalCategory([]);
		setGlobalOrg([]);
		setGlobalStatus([]);
		
	};

	const handleAddKeyword = (e: React.KeyboardEvent | React.MouseEvent) => {
		if (!excludeInput.trim()) return;
		if ("key" in e) {
			if (e.key !== "Enter" || e.nativeEvent.isComposing) return;
			e.stopPropagation();
			e.preventDefault();
		}
		addExcludedKeyword(excludeInput);
		setExcludeInput("");
	};

    // const MONTH_EVENTS = useMemo(
    // () => [
    //     ...new Map(
    //     Object.values(monthViewData?.byDate ?? {})
    //         .flatMap((b) => b.events)
    //         .map((e) => [e.id, e] as const),
    //     ).values(),
    // ],
    // [monthViewData],
    // );

    const totalEventsLabel = /*`${MONTH_EVENTS.length}개의 행사 보기`*/ '적용';

	// --- Drag handlers (touch + mouse) -------------------------------------
	const onDragStart = useCallback((clientY: number) => {
		setIsDragging(true);
		dragStartY.current = clientY;
	}, []);

	const onDragMove = useCallback(
		(clientY: number) => {
			if (!isDragging) return;
			const delta = clientY - dragStartY.current;
			// Only allow dragging downward
			setDragY(Math.max(0, delta));
		},
		[isDragging],
	);

	const onDragEnd = useCallback(() => {
		if (!isDragging) return;
		setIsDragging(false);
		if (dragY > CLOSE_DRAG_THRESHOLD) {
			setFilterSheetShowing(false);
		}
		setDragY(0);
	}, [dragY, isDragging, setFilterSheetShowing]);

	const handleTouchStart = (e: React.TouchEvent) => {
		onDragStart(e.touches[0].clientY);
	};
	const handleTouchMove = (e: React.TouchEvent) => {
		onDragMove(e.touches[0].clientY);
	};
	const handleTouchEnd = () => onDragEnd();
 
	const handleMouseDown = (e: React.MouseEvent) => {
		onDragStart(e.clientY);
	};

	useEffect(() => {
		if (!isDragging) return;
		const move = (e: MouseEvent) => onDragMove(e.clientY);
		const up = () => onDragEnd();
		window.addEventListener("mousemove", move);
		window.addEventListener("mouseup", up);
		return () => {
			window.removeEventListener("mousemove", move);
			window.removeEventListener("mouseup", up);
		};
	}, [isDragging, onDragMove, onDragEnd]);
 
	if (!shouldRender) return null;

	const sheetStyle: React.CSSProperties = isDragging
		? { transform: `translateY(${dragY}px)`, transition: "none" }
		: {};
    
    /** Renderers for each tab body */
	const renderCheckboxList = () => {
		const list = getListForTab(activeTab);
		const state = getStateForTab(activeTab);
		const allLabel =
			activeTab === "category"
				? "행사 전체"
				: activeTab === "org"
					? "주최 기관 전체"
					: "모집 현황 전체";

		const allSelected = list.length > 0 && state.length === list.length;
		const colored = activeTab === "category";

		return (
			<div className={styles.optionList}>
				<button
					type="button"
					className={`${styles.optionRow} ${styles.allRow}`}
					onClick={handleToggleAll}
				>
					<span
						className={`${styles.checkbox} ${
							allSelected ? styles.checkboxChecked : ""
						}`}
						aria-hidden
					/>
					<span className={styles.optionText}>{allLabel}</span>
				</button>
 
				{list.map((option, idx) => {
					const isChecked = state.some((s) => s.id === option.id);
					const rowStyle: React.CSSProperties = colored
						? { backgroundColor: CATEGORY_BUTTON_COLORS[idx + 1] }
						: {};
					return (
						<button
							key={option.id}
							type="button"
							className={`${styles.optionRow} ${
								colored ? styles.coloredRow : ""
							}`}
							style={rowStyle}
							onClick={() => handleToggle(option)}
						>
							<span
								className={`${styles.checkbox} ${
									isChecked ? styles.checkboxChecked : ""
								}`}
								aria-hidden
							/>
							<span className={styles.optionText}>{option.name}</span>
						</button>
					);
				})}
			</div>
		);
	};
    
	const renderExclude = () => (
		<div className={styles.excludePanel}>
		{user ?
			<>
			<p className={styles.excludeHelp}>
				해당 단어를 포함하는 행사는 표시되지 않습니다.
			</p>
			<div className={styles.excludeInputRow}>
				{excludedKeywordLoading ? <ClipLoader size={20} /> : <FiPlus className={styles.excludeInputIcon} onClick={handleAddKeyword}/>}
				<input
					type="text"
					className={styles.excludeInput}
					placeholder="제외 키워드 입력"
					value={excludeInput}
					onChange={(e) => setExcludeInput(e.currentTarget.value)}
					onKeyDown={handleAddKeyword}
				/>
			</div>
			<ul className={styles.excludeList}>
				{excludedKeywords.map((tag: { id: number; keyword: string }) => (
					<li key={tag.id} className={styles.excludeItem}>
						<button
							type="button"
							className={styles.excludeRemove}
							onClick={() => deleteExcludedKeyword(tag.id)}
							aria-label={`${tag.keyword} 제거`}
						>
							<IoIosClose size={22} />
						</button>
						<span>{tag.keyword}</span>
					</li>
				))}
			</ul>
			</>
		:
				<div className={styles.authPrompt}>
					<p className={styles.authPromptText}>
						제외 키워드 기능을 이용하려면 로그인을 해주세요.
					</p>
					<div className={styles.authButtons}>
						<button
							type="button"
							className={`${styles.authButton} ${styles.authButtonPrimary}`}
							onClick={() => {
								setFilterSheetShowing(false);
								navigate("/auth/login");
							}}
						>
							로그인
						</button>
						<button
							type="button"
							className={styles.authButton}
							onClick={() => {
								setFilterSheetShowing(false);
								navigate("/auth/signup");
							}}
						>
							회원가입
						</button>
					</div>
				</div>
		}
		</div>
	);
 
	return (
        // biome-ignore lint/a11y/noStaticElementInteractions: overlay uses role="presentation" and click-to-dismiss is a standard modal pattern
        <div
			className={`${styles.overlay} ${isVisible ? styles.overlayVisible : ""}`}
            onClick={(e) => { 
                if (e.target === e.currentTarget) setFilterSheetShowing(false) }}			
                role="presentation"
		>
			<div
				className={`${styles.sheet} ${isVisible ? styles.sheetVisible : ""}`}
				style={sheetStyle}
				ref={sheetRef}
				role="dialog"
				aria-modal="true"
			>
				{/* Drag handle */}
                {/* biome-ignore lint/a11y/noStaticElementInteractions: drag-to-dismiss handle; touch/mouse events implement dragging, not click activation */}
				<div
					className={styles.handleArea}
					onTouchStart={handleTouchStart}
					onTouchMove={handleTouchMove}
					onTouchEnd={handleTouchEnd}
					onMouseDown={handleMouseDown}
				>
					<div className={styles.handle} />
				</div>
 
				{/* Tabs */}
				<div className={styles.tabBar} role="tablist">
					{TABS.map((t) => (
						<button
							key={t.key}
							type="button"
							role="tab"
							aria-selected={activeTab === t.key}
							className={`${styles.tab} ${
								activeTab === t.key ? styles.tabActive : ""
							}`}
							onClick={() => setActiveTab(t.key)}
						>
							{t.label}
						</button>
					))}
				</div>
				<div className={styles.tabDivider} />
 
				{/* Body */}
				<div className={styles.body}>
					{isLoadingMeta && activeTab !== "exclude" ? (
						<div className={styles.loading}>필터 로딩중 ...</div>
					) : activeTab === "exclude" ? (
						renderExclude()
					) : (
						renderCheckboxList()
					)}
				</div>
 
				{/* Footer */}
				<div className={styles.footer}>
					<button
						type="button"
						className={styles.resetButton}
						onClick={handleResetAll}
					>
						<MdRefresh size={18} />
						<span>초기화</span>
					</button>
					<button
						type="button"
						className={styles.applyButton}
						onClick={() => { setFilterSheetShowing(false) }}
					>
						{totalEventsLabel}
					</button>
				</div>
			</div>
		</div>
	);
    
}
