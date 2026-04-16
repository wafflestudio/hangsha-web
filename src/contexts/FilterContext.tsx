import {
	createContext,
	type Dispatch,
	type ReactNode,
	type SetStateAction,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import { getCategoryGroups, getOrganizations } from "@api/event";
import type { Category, CategoryGroupWithCategories } from "@types";

interface FilterContextType {
	categoryGroups: CategoryGroupWithCategories[];
	organizations: Category[];
	refreshMetadata: () => Promise<void>;
	isLoadingMeta: boolean;

	globalStatus: Category[];
	globalOrg: Category[];
	globalCategory: Category[];

	setGlobalStatus: Dispatch<SetStateAction<Category[]>>;
	setGlobalOrg: Dispatch<SetStateAction<Category[]>>;
	setGlobalCategory: Dispatch<SetStateAction<Category[]>>;

	filterError: string | null;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterContextProvider = ({
	children,
}: {
	children: ReactNode;
}) => {
	const [categoryGroups, setCategoryGroups] = useState<
		CategoryGroupWithCategories[]
	>([]);
	// 모집중
	const isApplying: Category = 
		categoryGroups.find((g) => g.group.id===1)?.categories.find(c => c.id === 1) 
		|| {
          "id": 1,
          "groupId": 1,
          "name": "모집중",
          "sortOrder": 1
        };
	const [organizations, setOrganizations] = useState<Category[]>([]);
	const [isLoadingMeta, setIsLoadingMeta] = useState(false);

	const [globalStatus, setGlobalStatus] = useState<Category[]>([isApplying]);
	const [globalOrg, setGlobalOrg] = useState<Category[]>([]);
	const [globalCategory, setGlobalCategory] = useState<Category[]>([]);

	const [filterError, setFilterError] = useState<string | null>(null);

	// Fetch category & organizations (metadata)
	const refreshMetadata = useCallback(async () => {
		setIsLoadingMeta(true);
		try {
			const [groupsData, orgsData] = await Promise.all([
				getCategoryGroups(),
				getOrganizations(),
			]);
			setCategoryGroups(groupsData);
			setOrganizations(orgsData);
		} catch (err) {
			console.error("Failed to load metadata", err);
			setFilterError("Failed to load categories.");
		} finally {
			setIsLoadingMeta(false);
		}
	}, []);

	// metadata initial load
	useEffect(() => {
		refreshMetadata();
	}, [refreshMetadata]);
	

	return (
		<FilterContext.Provider
			value={{
				categoryGroups,
				organizations,
				isLoadingMeta,
				refreshMetadata,
				globalStatus,
				globalOrg,
				globalCategory,
				setGlobalStatus,
				setGlobalOrg,
				setGlobalCategory,
				filterError
			}}
		>
			{children}
		</FilterContext.Provider>
	);
};

export const useFilter = () => {
	const ctx = useContext(FilterContext);
	if (!ctx) {
		throw new Error("useFilter must be used within FilterProvider");
	}
	return ctx;
};
