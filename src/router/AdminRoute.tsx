import { TokenService } from "@/api/tokenService";
import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

interface AdminRouteProps {
	children: ReactNode;
}

function isAdminToken(token: string): boolean {
	try {
		const payload = JSON.parse(atob(token.split(".")[1]));
		return payload?.type === "ACCESS" && payload?.isAdmin === true;
	} catch {
		return false;
	}
}

export default function AdminRoute({ children }: AdminRouteProps) {
	const token = TokenService.getToken();

	if (!token) {
		return <Navigate to="/auth/login" replace />;
	}

	if (!isAdminToken(token)) {
		return <Navigate to="/main" replace />;
	}

	return <>{children}</>;
}