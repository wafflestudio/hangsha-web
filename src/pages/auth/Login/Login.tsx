import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthProvider";
import styles from "@styles/Login.module.css";

export default function Login() {
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [check, setCheck] = useState<boolean>(true);

	const { login } = useAuth();
	const navigate = useNavigate();

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
			setCheck(true);
			navigate("/main");
		} catch {
			setCheck(false);
		}
	};

	return (
		<div className={styles.loginPage}>
			<div className={styles.loginBox}>
				<h2 className={styles.loginTitle}>로그인</h2>

				<form className={styles.loginForm} onSubmit={handleSubmit}>
					<label className={styles.loginField}>
						<input
							name="email"
							className={styles.loginInput}
							type="email"
							placeholder="이메일"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
					</label>

					<label className={styles.loginField}>
						<input
							name="password"
							className={styles.loginInput}
							type="password"
							placeholder="비밀번호"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
					</label>

					{!check && (
						<p className={styles.loginError}>
							이메일 또는 비밀번호가 일치하지 않습니다.
						</p>
					)}

					<button className={styles.loginButton} type="submit">
						로그인 하기
					</button>

					<div className={styles.loginSignup}>
						<span className={styles.loginSignupText}>
							회원가입을 하시겠어요?
						</span>
						<Link to="/auth/signup" className={styles.loginSignupText}>
							회원가입
						</Link>
					</div>
				</form>
			</div>
		</div>
	);
}
