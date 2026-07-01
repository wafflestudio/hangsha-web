import { useEffect, useRef, useState } from "react";
import { IoIosSearch } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useSearch } from "@contexts/SearchContext";
import styles from "@styles/Toolbar.module.css";

const SearchButton = () => {
	const [hovered, setHovered] = useState<boolean>(false);
	const [focused, setFocused] = useState<boolean>(false);
	const [searchText, setSearchText] = useState<string>("");
	const inputRef = useRef<HTMLInputElement>(null);
	const { setPage, setQuery } = useSearch();
	const navigate = useNavigate();

	// 입력 중이거나 포커스돼 있으면 마우스를 떼도 닫히지 않음
	const active = hovered || focused || searchText.length > 0;

	// 펼쳐지면 바로 타이핑 가능하게 자동 포커스
	useEffect(() => {
		if (active) inputRef.current?.focus();
	}, [active]);

	const handleSearch = () => {
		// 빈 값이어도 query를 덮어써서 이전 검색어가 다시 검색되지 않도록 함
		setQuery(searchText.trim());
		setPage(1);
		navigate("/search");
	};

	return (
		<form
			className={styles.searchContainer}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			onSubmit={(e) => {
				e.preventDefault();
				handleSearch();
			}}
		>
			<input
				ref={inputRef}
				type="text"
				maxLength={50}
				className={`${styles.searchInput} ${active ? styles.active : ""}`}
				placeholder="검색어를 입력하세요"
				value={searchText}
				onFocus={() => setFocused(true)}
				onBlur={() => setFocused(false)}
				onChange={(e) => setSearchText(e.currentTarget.value)}
			/>
			<button
				type="submit"
				className={styles.searchIconButton}
				aria-label="검색"
			>
				<IoIosSearch size={20} color="rgba(130, 130, 130, 1)" />
			</button>
		</form>
	);
};

export default SearchButton;
