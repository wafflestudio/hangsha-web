import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AdminRoute from "@/router/AdminRoute";
import PageViewTracker from "@/router/PageViewTracker";
import Loading from "@/components/ui/Loading";

const Home = lazy(() => import("../pages/auth/Home"));
const LoginHandler = lazy(
	() => import("../pages/auth/Signup/SocialLoginHandler"),
);
const SignupSource = lazy(
	() => import("../pages/auth/OnBoarding/SignUpSource"),
);
const EmailSignUp = lazy(() => import("../pages/auth/Signup/EmailSignUp"));
const CalendarView = lazy(() => import("../pages/calendar/CalendarView"));
const MainDay = lazy(() => import("../pages/calendar/MainDay"));
const TimetablePage = lazy(() => import("../pages/timetable/TimetablePage"));
const EventDetailPage = lazy(() => import("@/pages/event/EventDetailPage"));
const SearchView = lazy(() => import("@/pages/search/Search"));
const BookmarksPage = lazy(() => import("@/pages/bookmark/Bookmark"));
const MyPage = lazy(() => import("@/pages/mypage/MyPage"));
const AdminEventsPage = lazy(() => import("@/pages/admin/AdminEvents"));
const MyReviews = lazy(() => import("@/pages/review/MyReviews"));

export default function AppRoutes() {
	return (
		<>
			<PageViewTracker />
			<Suspense fallback={<Loading />}>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/auth/login" element={<Home />} />
					<Route path="/auth/signup" element={<EmailSignUp />} />
					<Route
						path="/auth/onbording/sign-up-source"
						element={<SignupSource />}
					/>
					{/* <Route path="/auth/complete" element={<CompleteSignUp />} /> */}

					{/* OAuth Redirect */}
					<Route path="/auth/callback" element={<LoginHandler />} />

					{/* Main Feature page */}
					<Route path="/main" element={<CalendarView />} />
					<Route path="/main/day" element={<MainDay />} />

					{/* Timetable page */}
					<Route path="/timetable" element={<TimetablePage />} />
					<Route path="/events/:eventId" element={<EventDetailPage />} />

					{/* Search page */}
					<Route path="/search" element={<SearchView />} />

					{/* Mypage & bookmark & 내 후기 */}
					<Route path="/my" element={<MyPage />} />
					<Route path="/bookmark" element={<BookmarksPage />} />
					<Route path="/review" element={<MyReviews />} />
					{/* 기존 메모 경로는 후기 모음으로 흘려보낸다 */}
					<Route path="/memo" element={<Navigate to="/review" replace />} />

					{/* Admin page */}
					<Route
						path="/sync"
						element={
							<AdminRoute>
								<AdminEventsPage />
							</AdminRoute>
						}
					/>

					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</Suspense>
		</>
	);
}
