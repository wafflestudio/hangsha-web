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
	const [organizations, setOrganizations] = useState<Category[]>([]);
	const [isLoadingMeta, setIsLoadingMeta] = useState(false);

	const [globalStatus, setGlobalStatus] = useState<Category[]>([]);
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
