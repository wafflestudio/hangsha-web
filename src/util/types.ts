export interface AuthTokens {
	accessToken: string;
}

export interface User {
	username: string;
	email: string;
	profileImageUrl: string;

	// excluded_keywords: string[];
	// interest_categories: Category[];
	// bookmarks: string[]; // list of event id's
	// memos: Memo[];
}

interface EventBase {
	id: number;
	title: string;
	imageUrl: string;

	operationMode: string; // 온라인 오프라인 온오프라인 병행

	statusId: number; // 1 : 모집중, 2 : 마감 임박, 3 : 마감
	eventTypeId: number; // 1: 교육(특강/세미나) 2:공모전/경진대회 3:현장학습/인턴 4:사회공헌/봉사 5:학습/진로상담 6:레크리에이션 6:기타
	orgId: number; // 주체기관 id - FE에서는 사용 X
	organization: string; // 주체기관 id

	applyLink: string; // 지원 url
	tags?: string;

	// following properties are only on BlockEvents
	capacity: number;
	location: string;

	applyCount: number;
	isInterested?: boolean;
	matchedInterestPriority?: number;
	isBookmarked?: boolean; // 백엔드 요청 부분
}

export interface EventDTO extends EventBase {
	applyStart: string; //  지원 시작 날짜
	applyEnd: string; // 지원 마감 날짜
	eventStart: string; // 활동 시작 날짜일시
	eventEnd: string; // 활동 끝 날짜일시
}

export interface Event extends EventBase {
	applyStart: Date; //  지원 시작 날짜
	applyEnd: Date; // 지원 마감 날짜
	eventStart: Date | null; // 활동 시작 날짜일시
	eventEnd: Date | null; // 활동 끝 날짜일시
}

interface EventDetailExtras {
	bookmarkCount: number;
	detail: string;
}

export interface EventDetailDTO extends EventDTO, EventDetailExtras {}
export interface EventDetail extends Event, EventDetailExtras {}

export interface CalendarEvent {
	start: Date;
	end: Date;
	title: string;
	// 'block' event( 행사) : allDay===true
	allDay: boolean;
	resource: {
		event: Event;
		isPeriodEvent: boolean;
	};
}

export interface Category {
	id: number;
	groupId: number; // 1: 모집현황, 2: 주체기관, 3: 프로그램 유형
	name: string;
	sortOrder: number;
}

export interface CategoryGroup {
	id: number;
	name: string; // 모집현황 | 주체기관 | 프로그램 유형
	sortOrder: number; // 각각 1, 2, 3
}

export interface CategoryGroupWithCategories {
	group: CategoryGroup; // 대분류 이름, 우선순위, 아이디 등
	categories: Category[]; // 실제 분류에 속하는 카테고리
}

export interface CategoryGroupWithCategoriesResponse {
	items: CategoryGroupWithCategories[];
}

export interface OrgsResponse {
	items: Category[];
}

export interface MemoTag {
	id: number;
	name: string;
}

export interface Memo {
	id: number;
	eventId: number;
	eventTitle: string;
	content: string;
	tags: MemoTag[];
	createdAt: Date;
}

// 시간표 전체

export type Semester = "SPRING" | "SUMMER" | "FALL" | "WINTER";

interface CourseBase {
	year: number;
	semester: Semester;
	courseTitle: string;
	source: "CUSTOM" | "CRAWLED";
	timeSlots: TimeSlot[];
	courseNumber?: string;
	lectureNumber?: string;
	credit?: number;
	instructor?: string;
}

export interface Course extends CourseBase {
	id: number;
}

export interface CreateCustomCourseRequest extends CourseBase {}

interface TimetableBase {
	name: string;
	year: number;
	semester: Semester;
}

export interface Timetable extends TimetableBase {
	id: number;
}

// export interface TimetableWithCourse extends Timetable {
// 	courses: Course[];
// }

export interface CreateTimetableRequest extends TimetableBase {}

export interface PatchTimetableRequest {
	name: string;
}

export interface GetCoursesResponse {
	enrollId: number;
	course: Course;
}

export type Day = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0: 일요일, 1: 월요일, ..., 6: 토요일

export type DayOfWeek = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";

export type TimeSlot = {
	dayOfweek: DayOfWeek;
	startAt: number;
	endAt: number;
};

export type SlotRow = TimeSlot & { rowId: string };

export const DAY_LABELS_KO: Record<Day, string> = {
	0: "일",
	1: "월",
	2: "화",
	3: "수",
	4: "목",
	5: "금",
	6: "토",
};

// interface EventFilters {
// 	from: string;
// 	to: string;
// 	statusId?: number;
// 	eventTypeId?: number;
// 	orgId?: number;
// }

export interface MonthViewResponseDTO {
	range: {
		from: string; // YYYY-MM-DD (Start of the view)
		to: string; // YYYY-MM-DD (End of the view)
	};

	byDate: Record<string, { events: EventDTO[] }>;
}

export interface MonthViewResponse {
	range: {
		from: Date;
		to: Date;
	};

	byDate: Record<string, { events: Event[] }>;
}

export interface MonthViewParams {
	from: string; // YYYY-MM-DD
	to: string;
	// 아래 : 필터링
	statusId?: number[]; // 모집 상태
	eventTypeId?: number[]; // 카테고리
	orgId?: number[]; // 주체 기관
}

export interface DayViewParams {
	date: string;
	page?: number;
	size?: number;
	statusId?: number[];
	eventTypeId?: number[];
	orgId?: number[];
}

export interface DayViewResponse {
	page: number;
	size: number;
	total: number;
	date: string; // yyyy-mm-dd
	items: EventDTO[];
}

export interface SearchParams {
	query: string;
	page?: number;
	size?: number;
}
export interface SearchResultDTO {
	page: number;
	size: number;
	total: number;
	items: EventDTO[];
}
export interface SearchResult {
	page: number;
	size: number;
	total: number;
	items: Event[];
}

export interface FetchMonthEventArgs {
	start?: Date; // optional - default to today
	statusId?: number[];
	eventTypeId?: number[];
	orgId?: number[];
}
export interface FetchWeekEventArgs {
	from: string;
	to: string;
	statusId?: number[];
	eventTypeId?: number[];
	orgId?: number[];
}

export interface FetchDayEventArgs {
	date?: Date;
	page?: number;
	size?: number;
	statusId?: number[];
	eventTypeId?: number[];
	orgId?: number[];
}

export type DayViewMode = "List" | "Grid" | "Calendar";

export interface ApiErrorResponse {
	code: string;
	message: string;
}
