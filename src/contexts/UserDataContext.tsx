import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import * as userService from "@api/user";
import type { Category, Event } from "@types";
import { useAuth } from "./AuthProvider";

interface UserDataContextType {
	bookmarkedEvents: Event[];
	isBookmarksLoaded: boolean;
	interestCategories: Category[];
	excludedKeywords: { id: number; keyword: string }[];

	excludedKeywordLoading: boolean;

	refreshUserData: () => Promise<void>;
	saveInterestPreferences: (categories: Category[]) => Promise<void>;
	addExcludedKeyword: (keyword: string) => Promise<void>;
	deleteExcludedKeyword: (id: number) => Promise<void>;
	toggleBookmark: (event: Event | number) => Promise<void>;
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
	const [isBookmarksLoaded, setIsBookmarksLoaded] = useState(false);
	const [interestCategories, setInterestCategories] = useState<Category[]>([]);
	const [excludedKeywordLoading, setExcludedKeywordLoading] =
		useState<boolean>(false);

	const fetchAll = useCallback(async () => {
		if (!isAuthenticated) return;
		setIsBookmarksLoaded(false);
		try {
			// Parallel fetch
			const [excludedData, bookmarksData, interestsData] = await Promise.all([
				userService.getExcludedKeywords(),
				userService.getBookmarks(1), // Fetch first page/all
				userService.getInterestCategories(),
			]);
			setExcludedKeywords(excludedData);
			setBookmarkedEvents(bookmarksData);
			setInterestCategories(interestsData);
			setIsBookmarksLoaded(true);
		} catch (error) {
			console.error("Failed to load user data", error);
		}
	}, [isAuthenticated]);

	useEffect(() => {
		if (isAuthenticated) {
			fetchAll();
		} else {
			setExcludedKeywords([]);
			setBookmarkedEvents([]);
			setIsBookmarksLoaded(false);
			setInterestCategories([]);
		}
	}, [isAuthenticated, fetchAll]);

	const toggleBookmark = async (event: Event | number) => {
		const eventId = typeof event === "number" ? event : event.id;
		const isBookmarked = isBookmarksLoaded
			? bookmarkedEvents.some(
					(bookmarkedEvent) => bookmarkedEvent.id === eventId,
				)
			: typeof event === "number"
				? false
				: Boolean(event.isBookmarked);
		const previousBookmarks = bookmarkedEvents;
		setBookmarkedEvents((current) =>
			isBookmarked
				? current.filter((bookmarkedEvent) => bookmarkedEvent.id !== eventId)
				: typeof event === "number"
					? current
					: [...current, { ...event, isBookmarked: true }],
		);
		try {
			if (isBookmarked) {
				await userService.removeBookmark(eventId);
			} else {
				await userService.addBookmark(eventId);
			}

			const newBookmarks = await userService.getBookmarks(1);
			setBookmarkedEvents(newBookmarks);
		} catch (error) {
			setBookmarkedEvents(previousBookmarks);
			console.error(error);
			throw error;
		}
	};

	const saveInterestPreferences = async (categories: Category[]) => {
		const items = categories.map((category, index) => ({
			categoryType: category.categoryType,
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

	return (
		<UserDataContext.Provider
			value={{
				excludedKeywords,
				bookmarkedEvents,
				isBookmarksLoaded,
				interestCategories,
				excludedKeywordLoading,
				refreshUserData: fetchAll,
				saveInterestPreferences,
				toggleBookmark,
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

export const useBookmarkStatus = (
	event: Pick<Event, "id" | "isBookmarked"> | undefined,
) => {
	const { bookmarkedEvents, isBookmarksLoaded } = useUserData();
	if (!event) return false;
	return isBookmarksLoaded
		? bookmarkedEvents.some(
				(bookmarkedEvent) => bookmarkedEvent.id === event.id,
			)
		: Boolean(event.isBookmarked);
};
