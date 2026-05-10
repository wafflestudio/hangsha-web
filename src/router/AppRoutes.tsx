import { Navigate, Route, Routes } from "react-router-dom";
import Home from "../pages/auth/Home";
import Login from "../pages/auth/Login/Login";
import LoginHandler from "../pages/auth/Login/SocialLoginHandler";
import CompleteSignUp from "../pages/auth/OnBoarding/CompleteSignUp";
import EmailSignUp from "../pages/auth/Signup/EmailSignUp";
import CalendarView from "../pages/CalendarView";
import TimetablePage from "../pages/timetable/TimetablePage";
import SearchView from "@/pages/search/Search";
import BookmarksPage from "@/pages/bookmark/Bookmark";
import MemoPage from "@/pages/memo/Memo";
import MyPage from "@/pages/MyPage";
import AdminRoute from "@/router/AdminRoute";
import AdminEventsPage from "@/pages/AdminEvents";

export default function AppRoutes() {
	return (
		<Routes>
			<Route path="/" element={<Home />} />
			<Route path="/auth/login" element={<Login />} />
			<Route path="/auth/signup" element={<EmailSignUp />} />
			<Route path="/auth/complete" element={<CompleteSignUp />} />

			{/* OAuth Redirect */}
			<Route path="/auth/callback" element={<LoginHandler />} />

			{/* Main Feature page */}
			<Route path="/main" element={<CalendarView />} />

			{/* Timetable page */}
			<Route path="/timetable" element={<TimetablePage />} />

			{/* Search page */}
			<Route path="/search" element={<SearchView />} />

			{/* Mypage & bookmark & memo */}
			<Route path="/my" element={<MyPage />} />
			<Route path="/my/bookmark" element={<BookmarksPage />} />
			<Route path="/my/memo" element={<MemoPage />} />

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
	);
}
