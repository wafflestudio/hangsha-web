import { useRef, useState } from "react";
import {
	FaAnglesLeft,
	FaAnglesRight,
	FaChevronDown,
	FaChevronUp,
} from "react-icons/fa6";
import { IoIosClose } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthProvider";
import { useUserData } from "@/contexts/UserDataContext";
import styles from "./Sidebar.module.css";
import { SidebarLogoutButton } from "./LogoutButton";

/** Search results sidebar without calendar filter controls. */
export const SearchSidebar = () => {
	const { user } = useAuth();
	const {
		excludedKeywords,
		addExcludedKeyword,
		deleteExcludedKeyword,
		excludedKeywordLoading,
	} = useUserData();
	const navigate = useNavigate();
	const ref = useRef<HTMLDivElement>(null);
	const [excludeInput, setExcludeInput] = useState("");
	const [isExcludeExpanded, setIsExcludeExpanded] = useState(true);
	const [isHidden, setIsHidden] = useState(false);
	const isComposingRef = useRef(false);
	const commitOnComposeEndRef = useRef(false);

	const commitKeyword = (raw: string) => {
		const value = raw.trim();
		if (!value) return;
		addExcludedKeyword(value);
		setExcludeInput("");
	};

	const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key !== "Enter") return;
		if (e.nativeEvent.isComposing || isComposingRef.current) {
			commitOnComposeEndRef.current = true;
			return;
		}
		e.stopPropagation();
		e.preventDefault();
		commitKeyword(e.currentTarget.value);
	};

	const handleKeywordCompositionEnd = (
		e: React.CompositionEvent<HTMLInputElement>,
	) => {
		isComposingRef.current = false;
		if (commitOnComposeEndRef.current) {
			commitOnComposeEndRef.current = false;
			commitKeyword(e.currentTarget.value);
		}
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
						onClick={() => navigate(user ? "/main" : "/")}
						className={styles.header}
					>
						{user ? `${user.username}의 캘린더` : "로그인하고 이용하기"}
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

			<div className={styles.filterGroup}>
				<div className={styles.labelRow}>
					<button
						type="button"
						className={styles.labelLeftBtn}
						onClick={() => setIsExcludeExpanded((prev) => !prev)}
					>
						<img
							src="/assets/except.svg"
							alt="exclude icon"
							className={styles.icon}
						/>
						<span className={styles.labelText}>제외</span>
						<span className={styles.chevron}>
							{isExcludeExpanded ? <FaChevronUp /> : <FaChevronDown />}
						</span>
					</button>
				</div>
				{isExcludeExpanded && (
					<>
						<div className={styles.inputContainer}>
							<input
								type="text"
								className={styles.excludeInput}
								onKeyDown={handleKeywordKeyDown}
								onCompositionStart={() => {
									isComposingRef.current = true;
								}}
								onCompositionEnd={handleKeywordCompositionEnd}
								value={excludeInput}
								onChange={(e) => setExcludeInput(e.currentTarget.value)}
							/>
							<button
								type="button"
								className={styles.applyBtn}
								onClick={() => commitKeyword(excludeInput)}
								disabled={excludedKeywordLoading}
							>
								적용
							</button>
						</div>
						<div className={styles.tagContainer}>
							{excludedKeywords.map((tag) => (
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

			<div className={styles.tourTargetGroup}>
				<div className={styles.sectionTitle} style={{ marginTop: "20px" }}>
					페이지
				</div>
				<button
					className={styles.pageLink}
					type="button"
					onClick={() => navigate("/bookmark")}
				>
					<img
						className={styles.icon}
						src="/assets/bookmark.svg"
						alt="bookmark icon"
					/>
					<span>찜한 행사</span>
				</button>
				<button
					className={styles.pageLink}
					type="button"
					onClick={() => navigate("/timetable")}
				>
					<img
						className={styles.icon}
						src="/assets/timetable.svg"
						alt="timetable icon"
					/>
					<span>시간표</span>
				</button>
			</div>
			<SidebarLogoutButton onLogout={() => ref.current?.scrollTo(0, 0)} />
		</div>
	);
};
