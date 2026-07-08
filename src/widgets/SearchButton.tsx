import { useEffect, useRef, useState } from "react";
import { IoIosSearch } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import styles from "@styles/Toolbar.module.css";

const SearchButton = () => {
	const [hovered, setHovered] = useState<boolean>(false);
	const [focused, setFocused] = useState<boolean>(false);
	const [searchText, setSearchText] = useState<string>("");
	const inputRef = useRef<HTMLInputElement>(null);
	const navigate = useNavigate();

	const active = hovered || focused || searchText.length > 0;

	useEffect(() => {
		if (active) inputRef.current?.focus();
	}, [active]);

	const handleSearch = () => {
		const q = searchText.trim();
		navigate(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
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
