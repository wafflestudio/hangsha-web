import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import * as userService from "@api/user";
import type { Category, Event, Memo } from "@types";
import { useAuth } from "./AuthProvider";

interface UserDataContextType {
	bookmarkedEvents: Event[];
	interestCategories: Category[];
	excludedKeywords: { id: number; keyword: string }[];
	eventMemos: Memo[];

	memoLoading: boolean;
	excludedKeywordLoading: boolean;
	
	refreshUserData: () => Promise<void>;
	// fetchInterestCategories: () => void;
	saveInterestPreferences: (categories: Category[]) => Promise<void>;
	addExcludedKeyword: (keyword: string) => Promise<void>;
	deleteExcludedKeyword: (id: number) => Promise<void>;
	toggleBookmark: (event: Event) => Promise<void>;
	getMemoByTag: (tagId: number) => Promise<Memo[]>;
	addMemo: (
		eventId: number,
		content: string,
		tagNames: string[],
	) => Promise<void>;
	deleteMemo: (id: number) => Promise<void>;
	updateMemo: (
		id: number,
		updates: {
			content?: string | undefined;
			tagNames?: string[] | undefined;
		},
	) => Promise<Memo | null>;
}

const UserDataContext = createContext<UserDataContextType | undefined>(
	undefined,
);

export const UserDataProvider = ({ children }: { children: ReactNode }) => {
	const { isAuthenticated } = useAuth();
	const [excludedKeywords, setExcludedKeywords] = useState<
		{ id: number; keyword: string }[]
	>([]);
	const [bookmarkedEvents, setBookmarkedEvents] = useState<Event[]>([]);
	const [interestCategories, setInterestCategories] = useState<Category[]>([]);
	const [eventMemos, setEventMemos] = useState<Memo[]>([]);
	const [memoLoading, setMemoLoading] = useState<boolean>(false);
	const [excludedKeywordLoading, setExcludedKeywordLoading] = useState<boolean>(false);

	const fetchAll = useCallback(async () => {
		if (!isAuthenticated) return;
		try {
			setMemoLoading(true);
			// Parallel fetch
			const [excludedData, bookmarksData, interestsData, memoData] =
				await Promise.all([
					userService.getExcludedKeywords(),
					userService.getBookmarks(1), // Fetch first page/all
					userService.getInterestCategories(),
					userService.getMemos(),
				]);
			setExcludedKeywords(excludedData);
			setBookmarkedEvents(bookmarksData);
			setInterestCategories(interestsData);
			setEventMemos(memoData);
		} catch (error) {
			console.error("Failed to load user data", error);
		} finally {
			setMemoLoading(false);
		}
	}, [isAuthenticated]);

	useEffect(() => {
		if (isAuthenticated) {
			fetchAll();
		} else {
			setExcludedKeywords([]);
			setBookmarkedEvents([]);
			setInterestCategories([]);
			setEventMemos([]);
		}
	}, [isAuthenticated, fetchAll]);

	// get interestCategories & update
	/*		
	const fetchInterestCategories = async () => {
		try {
			const newInterestCategories = await userService.getInterestCategories();
			setInterestCategories(newInterestCategories);
		} catch (e) {
			console.error("error in fetching interest categories", e);
		}
	}
		*/

	const toggleBookmark = async (event: Event) => {
		const isBookmarked = bookmarkedEvents.some((b) => b.id === event.id);
		try {
			if (isBookmarked) {
				await userService.removeBookmark(event.id);
			} else {
				await userService.addBookmark(event.id);
			}

			const newBookmarks = await userService.getBookmarks(1);
			setBookmarkedEvents(newBookmarks);

		} catch (error) {
			console.error(error);
		}
	};

	const saveInterestPreferences = async (categories: Category[]) => {
		const items = categories.map((category, index) => ({
			categoryId: category.id,
			priority: index + 1,
		}));

		await userService.addInterestCategories(items);
		await fetchAll();
	};

	const addExcludedKeyword = async (keyword: string) => {
		try {
			setExcludedKeywordLoading(true);

			await userService.addExcludedKeywords(keyword);
			const excludedData: { id: number; keyword: string }[] =
				await userService.getExcludedKeywords();
			setExcludedKeywords(excludedData);
		} catch (error) {
			console.error("error in adding excluded keyword", error);
		} finally {
			setExcludedKeywordLoading(false);
		}
	};

	const deleteExcludedKeyword = async (id: number) => {
		try {
			await userService.deleteExcludedKeywords(id);
			const excludedData: { id: number; keyword: string }[] =
				await userService.getExcludedKeywords();
			setExcludedKeywords(excludedData);
		} catch (error) {
			console.error("error in deleting excluded keyword", error);
		}
	};

	/* --- Memo --- */
	const getMemoByTag = async (tagId: number) => {
		try {
			const resultMemos: Memo[] = await userService.getMemoByTag(tagId);
			return resultMemos;
		} catch (error) {
			console.error("error in getting memos by Tag", error);
			return [];
		}
	};

	const addMemo = async (eventId: number, content: string, tags: string[]) => {
		try {
			await userService.addMemo(eventId, content, tags);
			// refresh on add
			const newMemos = await userService.getMemos();
			setEventMemos(newMemos);
		} catch (error) {
			console.error("error in adding memos", error);
		}
	};

	const deleteMemo = async (id: number) => {
		try {
			await userService.deleteMemo(id);
			const newMemos = await userService.getMemos();
			setEventMemos(newMemos);
		} catch (error) {
			console.error("error in deleting memos", error);
		}
	};

	const updateMemo = async (
		id: number,
		updates: { content?: string; tagNames?: string[] },
	) => {
		try {
			const newMemo: Memo = await userService.editMemo(id, updates);

			setEventMemos((prevMemos) =>
				prevMemos.map((memo) => (memo.id === id ? newMemo : memo)),
			);

			return newMemo;
		} catch (error) {
			console.error("error in updating memo", error);
			return null;
		}
	};

	return (
		<UserDataContext.Provider
			value={{
				excludedKeywords,
				bookmarkedEvents,
				interestCategories,
				eventMemos,
				memoLoading,
				excludedKeywordLoading,
				refreshUserData: fetchAll,
				// fetchInterestCategories,
				saveInterestPreferences,
				toggleBookmark,
				getMemoByTag,
				addMemo,
				deleteMemo,
				updateMemo,
				addExcludedKeyword,
				deleteExcludedKeyword,
			}}
		>
			{children}
		</UserDataContext.Provider>
	);
};

export const useUserData = () => {
	const context = useContext(UserDataContext);
	if (!context) throw new Error("useUserData error");
	return context;
};
