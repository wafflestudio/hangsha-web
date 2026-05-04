import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import { getCategoryGroups, getOrganizations } from "@api/event";
import { addInterestCategories } from "@api/user";
import type { Category } from "@types";
import { useUserData } from "./UserDataContext";

interface UserPreferenceContextType {
	programTypes: Category[];
	organizations: Category[];
	isLoading: boolean;
	error: string | null;
	refreshPreferenceOptions: () => Promise<void>;
	saveInterestPreferences: (categories: Category[]) => Promise<void>;
}

const UserPreferenceContext = createContext<
	UserPreferenceContextType | undefined
>(undefined);

export const UserPreferenceProvider = ({
	children,
}: {
	children: ReactNode;
}) => {
	const { refreshUserData } = useUserData();
	const [programTypes, setProgramTypes] = useState<Category[]>([]);
	const [organizations, setOrganizations] = useState<Category[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const refreshPreferenceOptions = useCallback(async () => {
		setIsLoading(true);
		setError(null);

		try {
			const [categoryGroups, orgs] = await Promise.all([
				getCategoryGroups(),
				getOrganizations(),
			]);
			const safeGroups = Array.isArray(categoryGroups) ? categoryGroups : [];
			const safeOrganizations = Array.isArray(orgs) ? orgs : [];

			const nextProgramTypes = safeGroups
				.flatMap((item) => item.categories ?? [])
				.filter((category) => category.groupId === 3);

			setProgramTypes(nextProgramTypes);
			setOrganizations(safeOrganizations);
		} catch (fetchError) {
			console.error("Failed to load user preference options", fetchError);
			setError("관심사 옵션을 불러오는 데 실패했습니다.");
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		refreshPreferenceOptions();
	}, [refreshPreferenceOptions]);

	const saveInterestPreferences = useCallback(
		async (categories: Category[]) => {
			const items = categories.map((category, index) => ({
				categoryId: category.id,
				priority: index + 1,
			}));

			await addInterestCategories(items);
			await refreshUserData();
		},
		[refreshUserData],
	);

	return (
		<UserPreferenceContext.Provider
			value={{
				programTypes,
				organizations,
				isLoading,
				error,
				refreshPreferenceOptions,
				saveInterestPreferences,
			}}
		>
			{children}
		</UserPreferenceContext.Provider>
	);
};

export const useUserPreferences = () => {
	const context = useContext(UserPreferenceContext);

	if (!context) {
		throw new Error(
			"useUserPreferences must be used within a UserPreferenceProvider",
		);
	}

	return context;
};
