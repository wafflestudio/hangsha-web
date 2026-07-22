import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Home from "../pages/auth/Home";
import Login from "../pages/auth/Login/Login";
import LoginHandler from "../pages/auth/Login/SocialLoginHandler";
import SignUpSource from "../pages/auth/OnBoarding/SignUpSource";
import EmailSignUp from "../pages/auth/Signup/EmailSignUp";
import CalendarView from "../pages/calendar/CalendarView";
import MainDay from "../pages/calendar/MainDay";
import TimetablePage from "../pages/timetable/TimetablePage";
import SearchView from "@/pages/search/Search";
import BookmarksPage from "@/pages/bookmark/Bookmark";
import MemoPage from "@/pages/memo/Memo";
import MyPage from "@/pages/mypage/MyPage";
import AdminRoute from "@/router/AdminRoute";
import PageViewTracker from "@/router/PageViewTracker";
import Loading from "@/components/ui/Loading";

const Home = lazy(() => import("../pages/auth/Home"));
const Login = lazy(() => import("../pages/auth/Login/Login"));
const LoginHandler = lazy(
	() => import("../pages/auth/Login/SocialLoginHandler"),
);
const EmailSignUp = lazy(() => import("../pages/auth/Signup/EmailSignUp"));
const CalendarView = lazy(() => import("../pages/calendar/CalendarView"));
const MainDay = lazy(() => import("../pages/calendar/MainDay"));
const TimetablePage = lazy(() => import("../pages/timetable/TimetablePage"));
const SearchView = lazy(() => import("@/pages/search/Search"));
const BookmarksPage = lazy(() => import("@/pages/bookmark/Bookmark"));
const MemoPage = lazy(() => import("@/pages/memo/Memo"));
const MyPage = lazy(() => import("@/pages/mypage/MyPage"));
const AdminEventsPage = lazy(() => import("@/pages/admin/AdminEvents"));

export default function AppRoutes() {
	return (
		<>
			<PageViewTracker />
<<<<<<< HEAD
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/auth/login" element={<Login />} />
				<Route path="/auth/signup" element={<EmailSignUp />} />
				<Route
					path="/auth/onbording/sign-up-source"
					element={<SignUpSource />}
				/>
				{/* <Route path="/auth/complete" element={<CompleteSignUp />} /> */}
=======
			<Suspense fallback={<Loading />}>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/auth/login" element={<Login />} />
					<Route path="/auth/signup" element={<EmailSignUp />} />
					{/* <Route path="/auth/complete" element={<CompleteSignUp />} /> */}
>>>>>>> 42f9b27 (fix: PR check)

					{/* OAuth Redirect */}
					<Route path="/auth/callback" element={<LoginHandler />} />

					{/* Main Feature page */}
					<Route path="/main" element={<CalendarView />} />
					<Route path="/main/day" element={<MainDay />} />

					{/* Timetable page */}
					<Route path="/timetable" element={<TimetablePage />} />

					{/* Search page */}
					<Route path="/search" element={<SearchView />} />

					{/* Mypage & bookmark & memo */}
					<Route path="/my" element={<MyPage />} />
					<Route path="/bookmark" element={<BookmarksPage />} />
					<Route path="/memo" element={<MemoPage />} />

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
