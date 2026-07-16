import type React from "react";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthProvider";
import homeImg from "/assets/homeImg.svg";
import styles from "./Home.module.css";

const SOCIAL_LOGIN_BASE_URL =
	import.meta.env.VITE_SOCIAL_LOGIN_BASE_URL ||
	"https://hangsha-api-dev.wafflestudio.com";

const SOCIAL_LOGIN_ENTRY = {
	google: `${SOCIAL_LOGIN_BASE_URL}/oauth2/authorization/google`,
	kakao: `${SOCIAL_LOGIN_BASE_URL}/oauth2/authorization/kakao`,
	naver: `${SOCIAL_LOGIN_BASE_URL}/oauth2/authorization/naver`,
} as const;

export default function Home() {
	const navigate = useNavigate();
	const { isAuthenticated, isLoading, login } = useAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoginValid, setIsLoginValid] = useState(true);

	// 세션 복원 중에는 판단을 보류
	if (isLoading) return null;

	// 이미 로그인된 사용자는 /main 으로
	if (isAuthenticated) return <Navigate to="/main" replace />;

	const toSignUp = () => navigate("/auth/signup");
	const toGuestMain = () => navigate("/main");

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (email.trim() === "") {
			alert("이메일을 입력하세요");
			return;
		}

		if (password.trim() === "") {
			alert("비밀번호를 입력하세요");
			return;
		}

		try {
			await login(email, password);
			setIsLoginValid(true);
			navigate("/main");
		} catch {
			setIsLoginValid(false);
		}
	};

	const moveToSocialLogin = (provider: keyof typeof SOCIAL_LOGIN_ENTRY) => {
		window.location.href = SOCIAL_LOGIN_ENTRY[provider];
	};

	return (
		<div className={styles.page}>
			<section className={styles.visualPanel} aria-hidden="true">
				<img className={styles.heroImage} src={homeImg} alt="" />
			</section>

			<aside className={styles.authPanel}>
				<div className={styles.box}>
					<div className={styles.brand}>
						<p className={styles.tagline}>행사 찾느라 헤매지 말고</p>
						<h1 className={styles.title}>행샤</h1>
					</div>

					<form className={styles.loginForm} onSubmit={handleSubmit}>
						<label className={styles.field}>
							<input
								name="email"
								className={styles.input}
								type="email"
								placeholder="아이디"
								value={email}
								onChange={(event) => setEmail(event.target.value)}
							/>
						</label>

						<label className={styles.field}>
							<input
								name="password"
								className={styles.input}
								type="password"
								placeholder="비밀번호"
								value={password}
								onChange={(event) => setPassword(event.target.value)}
							/>
						</label>

						{!isLoginValid && (
							<p className={styles.loginError}>
								이메일 또는 비밀번호가 일치하지 않습니다.
							</p>
						)}

						<button
							className={`${styles.btn} ${styles.primary}`}
							type="submit"
						>
							로그인
						</button>
					</form>

					<div className={styles.actions}>
						<button
							className={`${styles.btn} ${styles.social}`}
							data-provider="google"
							type="button"
							onClick={() => moveToSocialLogin("google")}
						>
							<span>구글 계정으로 계속하기</span>
						</button>

						<button
							className={`${styles.btn} ${styles.social}`}
							data-provider="kakao"
							type="button"
							onClick={() => moveToSocialLogin("kakao")}
						>
							<span>카카오톡 계정으로 계속하기</span>
						</button>

						<button
							className={`${styles.btn} ${styles.social}`}
							data-provider="naver"
							type="button"
							onClick={() => moveToSocialLogin("naver")}
						>
							<span>네이버 계정으로 계속하기</span>
						</button>

						<button
							className={`${styles.btn} ${styles.signup}`}
							type="button"
							onClick={toSignUp}
						>
							회원가입
						</button>

						<button
							className={styles.guestLink}
							type="button"
							onClick={toGuestMain}
						>
							로그인 없이 게스트로 계속하기
						</button>
					</div>
				</div>
			</aside>
		</div>
	);
}
