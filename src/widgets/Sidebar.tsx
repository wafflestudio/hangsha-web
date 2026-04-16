import { useRef, useState } from "react";
import {
	FaAnglesLeft,
	FaAnglesRight,
	FaChevronDown,
	FaChevronUp,
} from "react-icons/fa6";
import { MdCheckBox, MdCheckBoxOutlineBlank, MdRefresh } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthProvider";
import { useFilter } from "@contexts/FilterContext";
import styles from "@styles/Sidebar.module.css";
import type { Category } from "@types";
import { useUserData } from "@/contexts/UserDataContext";
import { IoIosClose } from "react-icons/io";
import { CATEGORY_BUTTON_COLORS } from "@/util/constants";

export const Sidebar = () => {
	type FilterType = "status" | "org" | "category";
	interface Filter {
		name: FilterType;
		label: string;
		list: Category[];
		state: Category[];
		setter: React.Dispatch<React.SetStateAction<Category[]>>;
		globalSetter: React.Dispatch<React.SetStateAction<Category[]>>;
	}

	const { user, logout } = useAuth();
	const { excludedKeywords, addExcludedKeyword, deleteExcludedKeyword } =
		useUserData();
	const { categoryGroups, isLoadingMeta } = useFilter();
	const {
		globalCategory,
		globalOrg,
		globalStatus,
		setGlobalCategory,
		setGlobalOrg,
		setGlobalStatus,
	} = useFilter();

	// state : filter 값들 저장 - context에서 값 가져오기
	const [status, setStatus] = useState<Category[]>(globalStatus);
	const [org, setOrg] = useState<Category[]>(globalOrg);
	const [category, setCategory] = useState<Category[]>(globalCategory);

	// 제외 키워드
	const [excludeInput, setExcludeInput] = useState<string>("");

	// toggle show/hide state
	const [expandedSections, setExpandedSections] = useState<
		Record<string, boolean>
	>({
		category: true,
		org: true,
		status: true,
		exclude: true,
	});
	// if the category itself is hidden
	const [isHidden, setIsHidden] = useState<boolean>(false);

	const ref = useRef<HTMLDivElement>(null);

	// 모집중, 등
	const STATUS_LIST =
		categoryGroups.find((g) => g.group.id === 1)?.categories || [];
	// 행사 카테고리
	const CATEGORY_LIST =
		categoryGroups.find((g) => g.group.id === 3)?.categories || [];
	// 주체 기관
	const ORG_LIST =
		categoryGroups.find((g) => g.group.id === 2)?.categories || [];

	const filterDict: Filter[] = [
		{
			name: "category",
			label: "행사 종류",
			list: CATEGORY_LIST,
			state: category,
			setter: setCategory,
			globalSetter: setGlobalCategory,
		},
		{
			name: "org",
			label: "주체 기관",
			list: ORG_LIST,
			state: org,
			setter: setOrg,
			globalSetter: setGlobalOrg,
		},
		{
			name: "status",
			label: "모집 현황",
			list: STATUS_LIST,
			state: status,
			setter: setStatus,
			globalSetter: setGlobalStatus,
		},
	];

	// toggle function
	const toggleSection = (name: string) => {
		setExpandedSections((prev) => ({
			...prev,
			[name]: !prev[name],
		}));
	};

	// 클릭하자마자 로직 적용 & - 바로 context로 write
	const handleToggle = (item: Category, type: FilterType) => {
		const obj = filterDict.find((obj) => obj.name === type);
		if (!obj) return;

		// check if item is already selected (to remove or to add)
		const isSelected = obj.state.some((selected) => selected.id === item.id);
		let newState: Category[];

		if (isSelected) {
			// remove
			newState = obj.state.filter((selected) => selected.id !== item.id);
		} else {
			// Add
			newState = [...obj.state, item];
		}
		obj.setter(newState);
		obj.globalSetter(newState);
	};
	// reset specific group
	const handleResetGroup = (type: FilterType) => {
		const obj = filterDict.find((obj) => obj.name === type);
		if (!obj) return;
		obj.setter([]);
		obj.globalSetter([]);
	};

	const navigate = useNavigate();

	const handleHeaderClick = () => {
		// if user exists: refresh page
		if (user) {
			navigate("/main");
		} else {
			// else : go to login page
			navigate("/auth/login");
		}
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

	const handleTimetableClick = () => {
		navigate("/timetable");
	};

	if (isHidden) {
		return (
			<div className={styles.hiddenSidebar}>
				<button
					className={styles.expandBtn}
					type="button"
					onClick={() => setIsHidden(false)}
				>
					<FaAnglesRight width={20} color="rgba(171,171,171,1)" />
				</button>
			</div>
		);
	}

	return (
		<div className={styles.sidebarContainer} ref={ref}>
			<div className={styles.headerRow}>
				<div className={styles.topButtons}>
					<button
						type="button"
						onClick={() => navigate("/main")}
						className={styles.header}
					>
						<img
							src="/assets/logo.png"
							alt="calendar with sha on it, app logo"
						/>
					</button>
					<button
						type="button"
						onClick={handleHeaderClick}
						className={styles.header}
					>
						{user ? `${user?.username}의 캘린더` : "로그인하고 이용하기"}
					</button>
				</div>
				<button
					className={styles.collapseBtn}
					type="button"
					onClick={() => setIsHidden(true)}
				>
					<FaAnglesLeft width={20} color="rgba(171,171,171,1)" />
				</button>
			</div>

			<div className={styles.sectionTitle}>필터</div>
			{isLoadingMeta ? (
				<span className={styles.filterTitle}>필터 로딩중 ...</span>
			) : (
				filterDict.map(({ name, label, list, state }) => (
					<div key={name} className={styles.filterGroup}>
						<div className={styles.labelRow}>
							<button
								type="button"
								className={styles.labelLeftBtn}
								onClick={() => toggleSection(name)}
							>
								<img
									alt={`${name} icon`}
									className={styles.icon}
									src={`/assets/${name}.svg`}
								/>
								<span className={styles.labelText}>{label}</span>
								<span className={styles.chevron}>
									{expandedSections[name] ? <FaChevronUp /> : <FaChevronDown />}
								</span>
							</button>

							{/* Reset button */}
							{state.length > 0 && (
								<button
									type="button"
									className={styles.resetBtn}
									onClick={() => handleResetGroup(name)}
									title="전체 선택"
								>
									<MdRefresh />
								</button>
							)}
						</div>

						{/* toggle list */}
						{expandedSections[name] && (
							<div className={styles.toggleListWrapper}>
								{list.map((option, idx) => {
									const isChecked = state.some((s) => s.id === option.id);

									return (
										<button
											key={option.id}
											type="button"
											style={
												option.groupId === 3
													? {
															backgroundColor: CATEGORY_BUTTON_COLORS[idx + 1],
														}
													: {}
											}
											className={`${styles.toggleItem} ${
												isChecked ? styles.active : ""
											}`}
											onClick={() => handleToggle(option, name)}
										>
											<span className={styles.checkIcon}>
												{isChecked ? (
													<MdCheckBox color="#3b82f6" />
												) : (
													<MdCheckBoxOutlineBlank color="#9d9d9dff" />
												)}
											</span>
											<span className={styles.toggleText}>{option.name}</span>
										</button>
									);
								})}
							</div>
						)}
					</div>
				))
			)}

			<div className={styles.filterGroup}>
				<div className={styles.labelRow}>
					<button
						type="button"
						className={styles.labelLeftBtn}
						onClick={() => toggleSection("exclude")}
					>
						<img
							src="/assets/except.svg"
							alt="exclude icon"
							className={styles.icon}
						/>
						<span className={styles.labelText}>제외</span>
						<span className={styles.chevron}>
							{expandedSections.exclude ? <FaChevronUp /> : <FaChevronDown />}
						</span>
					</button>
				</div>
				{expandedSections.exclude && (
					<>
						<div className={styles.inputContainer}>
							<input
								type="text"
								className={styles.excludeInput}
								onKeyDown={handleAddKeyword}
								value={excludeInput}
								onChange={(e) => setExcludeInput(e.currentTarget.value)}
							/>
							<button
								type="button"
								className={styles.applyBtn}
								onClick={handleAddKeyword}
							>
								적용
							</button>
						</div>
						<div className={styles.tagContainer}>
							{excludedKeywords.map((tag: { id: number; keyword: string }) => (
								<span key={tag.id} className={styles.tag}>
									{tag.keyword}{" "}
									<button
										type="button"
										className={styles.tagClose}
										onClick={() => deleteExcludedKeyword(tag.id)}
									>
										<IoIosClose size={20} />
									</button>
								</span>
							))}
						</div>
						<span className={styles.explanationText}>
							엔터로 제외할 키워드를 추가해주세요.
						</span>
					</>
				)}
			</div>

			{/* TODO : 찜한 행사 */}
			<div className={styles.sectionTitle} style={{ marginTop: "20px" }}>
				페이지
			</div>
			<button
				className={styles.pageLink}
				type="button"
				onClick={() => navigate("/my/bookmark")}
			>
				<img
					className={styles.icon}
					src="/assets/bookmark.svg"
					alt="bookmark icon"
				/>
				<span>찜한 행사</span>
			</button>
			<button
				type="button"
				className={styles.pageLink}
				onClick={() => handleTimetableClick()}
			>
				<img
					className={styles.icon}
					src="/assets/timetable.svg"
					alt="timetable icon"
				/>
				<span>시간표</span>
			</button>
			{user && (
				<button
					type="button"
					onClick={() => {
						logout();
						ref?.current?.scrollTo(0, 0);
					}}
					className={styles.logout}
				>
					로그아웃
				</button>
			)}
		</div>
	);
};
