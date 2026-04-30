// Home.tsx
import { useNavigate } from "react-router-dom";
import logo from "/assets/logo.png";
import styles from "@styles/Home.module.css";

const API_URL = import.meta.env.VITE_API_URL || "";

const SOCIAL_LOGIN_ENTRY = {
	google: `${API_URL}/auth/login/google`,
	kakao: `${API_URL}/auth/login/kakao`,
	naver: `${API_URL}/auth/login/naver`,
} as const;

export default function Home() {
	const navigate = useNavigate();

	const toLogin = () => navigate("/auth/login");
	const toSignUp = () => navigate("/auth/signup");

	const moveToSocialLogin = (provider: keyof typeof SOCIAL_LOGIN_ENTRY) => {
		window.location.href = SOCIAL_LOGIN_ENTRY[provider];
	};

	return (
		<div className={styles.page}>
			<div className={styles.box}>
				<div className={styles.brand}>
					<img className={styles.logo} src={logo} alt="Logo" />
					<h1 className={styles.title}>행샤</h1>
				</div>

				<div className={styles.actions}>
					<button className={styles.btn} type="button" onClick={toLogin}>
						로그인
					</button>

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
						className={`${styles.btn} ${styles.primary}`}
						type="button"
						onClick={toSignUp}
					>
						회원가입
					</button>
				</div>
			</div>
		</div>
	);
}
