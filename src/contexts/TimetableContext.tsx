import {
	createContext,
	useContext,
	useEffect,
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

interface TimetableContextType {
	// state
	timetables: Timetable[];
	currentTimetable: Timetable | null;
	courses: GetCoursesResponse[] | null;
	isLoading: boolean;

	// actions
	loadTimetable: (year: number, semester: Semester) => Promise<void>;
	selectTimetable: (timetable: Timetable) => void;

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
	const [courses, setCourses] = useState<GetCoursesResponse[]>([]);
	const [isLoading, setIsLoading] = useState(false);

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
					setCurrentTimetable(res[0]);
				} else {
					setCurrentTimetable(null);
				}
			} finally {
				setIsLoading(false);
			}
		},
		[isAuthenticated],
	);

	const selectTimetable = (timetable: Timetable) => {
		setCurrentTimetable(timetable);
	};

	const createTimetable = async (body: CreateTimetableRequest) => {
		const newTimetable = await timetableApi.addTimetable(body);
		setTimetables((prev) => [...prev, newTimetable]);
		setCurrentTimetable(newTimetable);
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
	};

	// --- Courses / Enrolls ---
	const loadCourses = useCallback(async (timetableId: number) => {
		const data = await timetableApi.getTimetableCourses(timetableId);
		setCourses(data);
	}, []);

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

	// --- Auth change reset ---
	useEffect(() => {
		if (!isAuthenticated) {
			setTimetables([]);
			setCurrentTimetable(null);
			setCourses([]);
		}
	}, [isAuthenticated]);

	return (
		<TimetableContext.Provider
			value={{
				timetables,
				currentTimetable,
				courses,
				isLoading,

				loadTimetable,
				selectTimetable,

				createTimetable,
				updateTimetableName,
				deleteTimetable,

				loadCourses,
				addCustomCourse,
				updateCustomCourse,
				deleteCourse,
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
