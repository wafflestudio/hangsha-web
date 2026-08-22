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
import { getEventStatuses, getEventTypes, getOrganizations } from "@api/event";
import type { Category } from "@types";

interface FilterContextType {
	filterSheetShowing: boolean;
	setFilterSheetShowing: (value: boolean) => void;

	eventStatuses: Category[];
	eventTypes: Category[];
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
	const [eventStatuses, setEventStatuses] = useState<Category[]>([]);
	const [eventTypes, setEventTypes] = useState<Category[]>([]);
	const [organizations, setOrganizations] = useState<Category[]>([]);
	const [isLoadingMeta, setIsLoadingMeta] = useState(false);

	const [globalStatus, setGlobalStatus] = useState<Category[]>([
		{ id: 2, name: "모집중", sortOrder: 2, categoryType: "EVENT_STATUS" },
	]);
	const [globalOrg, setGlobalOrg] = useState<Category[]>([]);
	const [globalCategory, setGlobalCategory] = useState<Category[]>([]);

	const [filterSheetShowing, setFilterSheetShowing] = useState<boolean>(false);
	const [filterError, setFilterError] = useState<string | null>(null);

	// Fetch category & organizations (metadata)
	const refreshMetadata = useCallback(async () => {
		setIsLoadingMeta(true);
		try {
			const [statusesData, typesData, orgsData] = await Promise.all([
				getEventStatuses(),
				getEventTypes(),
				getOrganizations(),
			]);
			setEventStatuses(statusesData);
			setEventTypes(typesData);
			setOrganizations(orgsData);
			setGlobalStatus((current) =>
				current.length === 1 && current[0].id === 2
					? [statusesData.find((status) => status.id === 2) ?? current[0]]
					: current,
			);
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
				filterSheetShowing,
				setFilterSheetShowing,
				eventStatuses,
				eventTypes,
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
