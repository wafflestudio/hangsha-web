import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthProvider";

const LoginHandler = () => {
	const navigate = useNavigate();
	const { completeSocialLogin } = useAuth();

	useEffect(() => {
		const url = new URL(window.location.href);
		const accessToken =
			url.searchParams.get("accessToken") ?? url.searchParams.get("token");
		const isNewUser = url.searchParams.get("isNewUser") === "true";

		if (!accessToken) {
			navigate("/auth/login", { replace: true });
			return;
		}

		const run = async () => {
			try {
				await completeSocialLogin(accessToken);
				navigate(
					isNewUser ? "/auth/signup?step=onboarding" : "/auth/complete",
					{
						replace: true,
					},
				);
			} catch (e) {
				console.error(e);
				navigate("/auth/login", { replace: true });
			}
		};

		run();
	}, [completeSocialLogin, navigate]);

	return <div>로그인 처리 중...</div>;
};

export default LoginHandler;
