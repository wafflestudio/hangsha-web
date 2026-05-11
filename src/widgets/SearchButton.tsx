import { useState } from "react";
import { IoIosSearch } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useSearch } from "@contexts/SearchContext";
import styles from "@styles/Toolbar.module.css";

const SearchButton = () => {
	const [active, setActive] = useState<boolean>(false);
	const [searchText, setSearchText] = useState<string>("");
	const { setPage, setQuery } = useSearch();
	const navigate = useNavigate();

	const handleSearch = () => {
		const trimmedSearchText = searchText.trim();

		if (trimmedSearchText) {
			setQuery(trimmedSearchText);
			setPage(1);
		}

		navigate("/search");
	};

	return (
		<form
			className={styles.searchContainer}
			onMouseEnter={() => setActive(true)}
			onMouseLeave={() => setActive(false)}
			onFocus={() => setActive(true)}
			onBlur={() => setActive(false)}
			onSubmit={(e) => {
				e.preventDefault();
				handleSearch();
			}}
		>
			<input
				type="text"
				className={`${styles.searchInput} ${active ? styles.active : ""}`}
				placeholder="검색어를 입력하세요"
				value={searchText}
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
