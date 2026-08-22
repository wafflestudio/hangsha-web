import {
	createContext,
	useContext,
	useEffect,
	useRef,
	useState,
	useCallback,
	type ReactNode,
} from "react";
import type {
	Semester,
	Timetable,
	GetCoursesResponse,
	CreateTimetableRequest,
	PatchTimetableRequest,
	CreateCustomCourseRequest,
} from "../util/types";
import * as timetableApi from "../api/timetable";
import { useAuth } from "./AuthProvider";
import {
	toSnuttImportData,
	type SnuttFullTimetable,
} from "../util/snuttTimetable";

export type SnuttImportResult = {
	importedTimetable: Timetable;
	importedCourseCount: number;
	excludedCourseCount: number;
};

interface TimetableContextType {
	// state
	timetables: Timetable[];
	currentTimetable: Timetable | null;
	courses: GetCoursesResponse[] | null;
	selectedOverlayTimetable: Timetable | null;
	selectedOverlayCourses: GetCoursesResponse[];
	isLoading: boolean;

	// actions
	loadTimetable: (year: number, semester: Semester) => Promise<void>;
	initializeDefaultOverlay: (year: number, semester: Semester) => Promise<void>;
	selectTimetable: (timetable: Timetable) => void;
	selectCurrentTimetableForOverlay: () => Promise<void>;

	createTimetable: (body: CreateTimetableRequest) => Promise<void>;
	updateTimetableName: (
		timetableId: number,
		body: PatchTimetableRequest,
	) => Promise<void>;
	deleteTimetable: (timetableId: number) => Promise<void>;

	loadCourses: (timetableId: number) => Promise<void>;
	addCustomCourse: (
		timetableId: number,
		body: CreateCustomCourseRequest,
	) => Promise<void>;
	updateCustomCourse: (
		timetableId: number,
		enrollId: number,
		body: string,
	) => Promise<void>;
	deleteCourse: (timetableId: number, enrollId: number) => Promise<void>;
	importSnuttTimetable: (
		timetable: SnuttFullTimetable,
	) => Promise<SnuttImportResult>;
}

const TimetableContext = createContext<TimetableContextType | undefined>(
	undefined,
);

export const TimetableProvider = ({ children }: { children: ReactNode }) => {
	const { isAuthenticated } = useAuth();

	const [timetables, setTimetables] = useState<Timetable[]>([]);
	const [currentTimetable, setCurrentTimetable] = useState<Timetable | null>(
		null,
	);
	const preferredTimetableIdRef = useRef<number | null>(null);
	const [courses, setCourses] = useState<GetCoursesResponse[]>([]);
	const [selectedOverlayTimetable, setSelectedOverlayTimetable] =
		useState<Timetable | null>(null);
	const [selectedOverlayCourses, setSelectedOverlayCourses] = useState<
		GetCoursesResponse[]
	>([]);
	const [isLoading, setIsLoading] = useState(false);

	const loadCoursesByTimetableId = useCallback(async (timetableId: number) => {
		return timetableApi.getTimetableCourses(timetableId);
	}, []);

	// --- Timetable ---
	const loadTimetable = useCallback(
		async (year: number, semester: Semester) => {
			if (!isAuthenticated) return;

			setIsLoading(true);
			try {
				const res = await timetableApi.getTimetable(year, semester);
				setTimetables(res);

				// 기본 선택
				if (res.length > 0) {
					const defaultTimetable =
						res.find((timetable) => timetable.id === preferredTimetableIdRef.current) ??
						res[0];
					const defaultCourses = await loadCoursesByTimetableId(
						defaultTimetable.id,
					);

					setCurrentTimetable(defaultTimetable);
					setCourses(defaultCourses);
					console.log(
						`Loaded timetable for ${year} ${semester}:`,
						defaultTimetable,
					);
				} else {
					console.log(
						"No timetable found for the specified year and semester.",
					);
					setCurrentTimetable(null);
					setCourses([]);
				}
			} finally {
				setIsLoading(false);
			}
		},
		[isAuthenticated, loadCoursesByTimetableId],
	);

	const initializeDefaultOverlay = useCallback(
		async (year: number, semester: Semester) => {
			if (!isAuthenticated || selectedOverlayTimetable) return;

			const availableTimetables = await timetableApi.getTimetable(
				year,
				semester,
			);
			const defaultTimetable = availableTimetables[0];
			if (!defaultTimetable) return;

			const defaultCourses = await loadCoursesByTimetableId(
				defaultTimetable.id,
			);
			setSelectedOverlayTimetable(defaultTimetable);
			setSelectedOverlayCourses(defaultCourses);
		},
		[isAuthenticated, loadCoursesByTimetableId, selectedOverlayTimetable],
	);

	const selectTimetable = (timetable: Timetable) => {
		setCurrentTimetable(timetable);
	};

	const selectCurrentTimetableForOverlay = async () => {
		if (!currentTimetable) {
			setSelectedOverlayTimetable(null);
			setSelectedOverlayCourses([]);
			return;
		}

		const selectedCourses = await loadCoursesByTimetableId(currentTimetable.id);
		setSelectedOverlayTimetable(currentTimetable);
		setSelectedOverlayCourses(selectedCourses);
	};

	const createTimetable = async (body: CreateTimetableRequest) => {
		const newTimetable = await timetableApi.addTimetable(body);
		setTimetables((prev) => [...prev, newTimetable]);
		setCurrentTimetable(newTimetable);
		setCourses([]);
		setSelectedOverlayTimetable(newTimetable);
		setSelectedOverlayCourses([]);
	};

	const updateTimetableName = async (
		timetableId: number,
		body: PatchTimetableRequest,
	) => {
		const updated = await timetableApi.patchTimetableName(timetableId, body);

		setTimetables((prev) =>
			prev.map((t) => (t.id === timetableId ? updated : t)),
		);

		if (currentTimetable?.id === timetableId) {
			setCurrentTimetable(updated);
		}
	};

	const deleteTimetable = async (timetableId: number) => {
		await timetableApi.deleteTimetable(timetableId);

		setTimetables((prev) => prev.filter((t) => t.id !== timetableId));

		if (currentTimetable?.id === timetableId) {
			setCurrentTimetable(null);
			setCourses([]);
		}
		if (selectedOverlayTimetable?.id === timetableId) {
			setSelectedOverlayTimetable(null);
			setSelectedOverlayCourses([]);
		}
	};

	// --- Courses / Enrolls ---
	const loadCourses = useCallback(
		async (timetableId: number) => {
			const data = await loadCoursesByTimetableId(timetableId);
			setCourses(data);
			setSelectedOverlayCourses((prev) =>
				selectedOverlayTimetable?.id === timetableId ? data : prev,
			);
		},
		[loadCoursesByTimetableId, selectedOverlayTimetable],
	);

	const addCustomCourse = async (
		timetableId: number,
		body: CreateCustomCourseRequest,
	) => {
		await timetableApi.addCustomCourse(timetableId, body);
		await loadCourses(timetableId);
	};

	const updateCustomCourse = async (
		timetableId: number,
		enrollId: number,
		body: string,
	) => {
		await timetableApi.updateCustomCourse(timetableId, enrollId, body);
		await loadCourses(timetableId);
	};

	const deleteCourse = async (timetableId: number, enrollId: number) => {
		await timetableApi.deleteCourse(timetableId, enrollId);
		await loadCourses(timetableId);
	};

	const importSnuttTimetable = async (snuttTimetable: SnuttFullTimetable) => {
		const { timetable, courses: coursesToImport, excludedCourseCount } =
			toSnuttImportData(snuttTimetable);
		const newTimetable = await timetableApi.addTimetable(timetable);

		try {
			for (const course of coursesToImport) {
				await timetableApi.addCustomCourse(newTimetable.id, course);
			}

			const importedCourses = await loadCoursesByTimetableId(newTimetable.id);
			preferredTimetableIdRef.current = newTimetable.id;
			setTimetables((prev) => [...prev, newTimetable]);
			setCurrentTimetable(newTimetable);
			setCourses(importedCourses);
			setSelectedOverlayTimetable(newTimetable);
			setSelectedOverlayCourses(importedCourses);

			return {
				importedTimetable: newTimetable,
				importedCourseCount: coursesToImport.length,
				excludedCourseCount,
			};
		} catch (error) {
			try {
				await timetableApi.deleteTimetable(newTimetable.id);
			} catch {
				// The original import error is more useful to the user.
			}
			throw error;
		}
	};

	// --- Auth change reset ---
	useEffect(() => {
		if (!isAuthenticated) {
			setTimetables([]);
			setCurrentTimetable(null);
			setCourses([]);
			setSelectedOverlayTimetable(null);
			setSelectedOverlayCourses([]);
		}
	}, [isAuthenticated]);

	return (
		<TimetableContext.Provider
			value={{
				timetables,
				currentTimetable,
				courses,
				selectedOverlayTimetable,
				selectedOverlayCourses,
				isLoading,

				loadTimetable,
				initializeDefaultOverlay,
				selectTimetable,
				selectCurrentTimetableForOverlay,

				createTimetable,
				updateTimetableName,
				deleteTimetable,

				loadCourses,
				addCustomCourse,
				updateCustomCourse,
				deleteCourse,
				importSnuttTimetable,
			}}
		>
			{children}
		</TimetableContext.Provider>
	);
};

export const useTimetable = () => {
	const context = useContext(TimetableContext);
	if (!context) {
		throw new Error("useTimetable must be used within TimetableProvider");
	}
	return context;
};
