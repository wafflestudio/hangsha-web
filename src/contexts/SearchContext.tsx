// ItemGenContext.tsx
import type { SearchResult } from "@/util/types";
import {
	type Dispatch,
	type ReactNode,
	type SetStateAction,
	createContext,
	useCallback,
	useContext,
	useState,
} from "react";
import { getEventSearch } from "@/api/event";

interface SearchContextType {
	query: string;
	setQuery: Dispatch<SetStateAction<string>>;
	page: number;
	size: number;
	setPage: Dispatch<SetStateAction<number>>;
	setSize: Dispatch<SetStateAction<number>>;
	fetchSearchResult: (q: string, page: number, size: number) => Promise<void>;
	searchResults: SearchResult | null;
	emptySearchResults: () => void;
	// fetchSearchResult: (q: string, page: number, size: number) => Promise<void>;
	searchLoading: boolean;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider = ({ children }: { children: ReactNode }) => {
	const [query, setQuery] = useState<string>("");
	const [page, setPage] = useState<number>(1);
	const [size, setSize] = useState<number>(10);

	const [searchLoading, setSearchLoading] = useState<boolean>(false);
	const [searchResults, setSearchResults] = useState<SearchResult | null>(null);

	// use fetch at Search page
	const fetchSearchResult = useCallback(
		async (q: string, page: number, size: number) => {
			setSearchLoading(true);
			try {
				const result = await getEventSearch({ query: q, page, size });
				setSearchResults(result);
			} catch (e) {
				setSearchResults(null);
				console.error("Error in getting search results", e);
			} finally {
				setSearchLoading(false);
			}
		},
		[],
	);

	const emptySearchResults = () => {
		setSearchResults(null);
	};

	// useEffect(() => {
	//     fetchSearchResult(query, page, size);
	// }, [fetchSearchResult, query, page, size])

	return (
		<SearchContext.Provider
			value={{
				query,
				page,
				size,
				setQuery,
				setPage,
				setSize,
				searchResults,
				searchLoading,
				fetchSearchResult,
				emptySearchResults,
			}}
		>
			{children}
		</SearchContext.Provider>
	);
};

export const useSearch = () => {
	const ctx = useContext(SearchContext);
	if (!ctx) {
		throw new Error("useSearch must be used within SearchProvider");
	}
	return ctx;
};
