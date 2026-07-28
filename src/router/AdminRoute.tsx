import { AdminTokenService } from "@/api/adminTokenService";
import type { ReactNode } from "react";
import { useState } from "react";
import AdminAccessPage from "@/pages/AdminAccess";

interface AdminRouteProps {
	children: ReactNode;
}

function isAdminToken(token: string): boolean {
	try {
		const payloadSegment = token.split(".")[1];
		const normalized = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
		const padded = normalized.padEnd(
			normalized.length + ((4 - (normalized.length % 4)) % 4),
			"=",
		);
		const payload = JSON.parse(atob(padded));
		const expiresAtSeconds = typeof payload?.exp === "number" ? payload.exp : 0;

		return (
			payload?.type === "ACCESS" &&
			payload?.isAdmin === true &&
			expiresAtSeconds * 1000 > Date.now()
		);
	} catch {
		return false;
	}
}

export default function AdminRoute({ children }: AdminRouteProps) {
	const [, refreshRoute] = useState(0);
	const token = AdminTokenService.getToken();

	if (!token || !isAdminToken(token)) {
		return (
			<AdminAccessPage
				onAuthorized={() => refreshRoute((value) => value + 1)}
			/>
		);
	}

	return <>{children}</>;
}
