import axios from "axios";
import type React from "react";
import { useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@contexts/AuthProvider";
import CompleteSignUp from "../OnBoarding/CompleteSignUp";
import Onboarding from "../OnBoarding/Onboarding";
import ProfileSetting from "../OnBoarding/ProfileSetting";
import styles from "@styles/EmailSignUp.module.css";

export default function EmailSignUp() {
	const errorStatements = [
		"비밀번호는 8자 이상이어야 합니다.",
		"영문, 숫자, 특수문자를 포함해 주세요.",
		"비밀번호에 공백을 사용할 수 없습니다.",
	];

	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const emailRef = useRef<HTMLInputElement>(null);
	const [error, setError] = useState<string[]>([]);
	const [pwConfirmError, setPwConfirmError] = useState("");

	const [searchParams, setSearchParams] = useSearchParams();
	const step = (searchParams.get("step") as string) ?? "email";

	const { signup } = useAuth();

	switch (step) {
		case "profile":
			return <ProfileSetting />;
		case "onboarding":
			return <Onboarding />;
		case "complete":
			return <CompleteSignUp />;
	}

	const handlePwError = (value: string) => {
		const nextErrors: string[] = [];

		const hasLetter = /[A-Za-z]/.test(value);
		const hasNumber = /[0-9]/.test(value);
		const hasSpecial = /[^A-Za-z0-9\s]/.test(value);

		if (value.length < 8) nextErrors.push(errorStatements[0]);
		if (!hasLetter || !hasNumber || !hasSpecial)
			nextErrors.push(errorStatements[1]);
		if (/\s/.test(value)) nextErrors.push(errorStatements[2]);

		setError(nextErrors);
		setPassword(value);
		setConfirmPassword("");
		setPwConfirmError("");
	};

	const handlePwConfirmChange = (value: string) => {
		setConfirmPassword(value);
		if (password !== value) setPwConfirmError("비밀번호가 일치하지 않습니다.");
		else setPwConfirmError("");
	};
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (
			error.length > 0 ||
			password.length === 0 ||
			password !== confirmPassword
		) {
			alert("입력한 정보를 다시 확인해주세요.");
			return;
		}

		try {
			await signup(emailRef.current?.value || "", password);

			setSearchParams((prev) => {
				const next = new URLSearchParams(prev);
				next.set("step", "profile");
				return next;
			});
		} catch (err: unknown) {
			console.error("Signup failed:", err);

			if (axios.isAxiosError(err)) {
				const status = err.response?.status;
				const message = err.response?.data?.message;

				switch (status) {
					case 400:
						alert(message ?? "입력 형식이 올바르지 않습니다.");
						break;

					case 409:
						alert("이미 가입된 이메일입니다.");
						break;

					case 422:
						alert("비밀번호 조건을 확인해주세요.");
						break;

					case 500:
						alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
						break;

					default:
						alert("회원가입에 실패했습니다.");
				}
			} else {
				alert("네트워크 오류가 발생했습니다.");
			}
		}
	};

	const pwHasError = error.length > 0;
	const pwConfirmHasError = !!pwConfirmError;

	return (
		<div className={styles.page}>
			<div className={styles.box}>
				<div className={styles.header}>
					<h2 className={styles.title}>계정 생성</h2>
					<p className={styles.subtitle}>이메일과 비밀번호를 설정해주세요</p>
				</div>

				<form className={styles.form} onSubmit={handleSubmit}>
					<input
						className={styles.input}
						type="email"
						required
						placeholder="email@snu.ac.kr"
						ref={emailRef}
					/>

					<input
						className={`${styles.input} ${pwHasError ? styles.inputError : ""}`}
						type="password"
						required
						placeholder="비밀번호"
						value={password}
						onChange={(e) => handlePwError(e.target.value)}
					/>

					{error?.map((err) => (
						<div key={err} className={styles.errorPill} role="alert">
							{err}
						</div>
					))}

					<input
						className={`${styles.input} ${pwConfirmHasError ? styles.inputError : ""}`}
						type="password"
						required
						placeholder="비밀번호 확인"
						value={confirmPassword}
						onChange={(e) => handlePwConfirmChange(e.target.value)}
					/>

					{pwConfirmError && (
						<div className={styles.errorPill} role="alert">
							{pwConfirmError}
						</div>
					)}

					<button className={styles.submit} type="submit">
						계정 생성
					</button>
				</form>
				<div className={styles.loginLink}>
					<p className={styles.loginText}>이미 계정이 있으신가요?</p>
					<Link to="/auth/login" className={styles.loginText}>
						로그인하러 가기
					</Link>
				</div>
			</div>
		</div>
	);
}
