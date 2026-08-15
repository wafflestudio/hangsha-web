import axios from "axios";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
	sendEmailVerificationCode,
	verifyEmailVerificationCode,
} from "@/api/auth";
import { useAuth } from "@contexts/AuthProvider";
import CompleteSignUp from "../OnBoarding/CompleteSignUp";
import Onboarding from "../OnBoarding/Onboarding";
import ProfileSetting from "../OnBoarding/ProfileSetting";
import SignUpSource from "../OnBoarding/SignUpSource";
import styles from "./EmailSignUp.module.css";

type SignupStep = "email" | "verify" | "password";

const PASSWORD_ERRORS = [
	"비밀번호는 8자 이상이어야 합니다.",
	"영문, 숫자, 특수문자를 포함해 주세요.",
	"비밀번호에 공백을 사용할 수 없습니다.",
];
const RESEND_COOLDOWN_SECONDS = 60;
const CODE_INPUT_IDS = [
	"verification-code-1",
	"verification-code-2",
	"verification-code-3",
	"verification-code-4",
	"verification-code-5",
	"verification-code-6",
];

const getErrorCode = (error: unknown) => {
	if (!axios.isAxiosError(error)) return undefined;
	const data = error.response?.data as { error?: string } | undefined;
	return data?.error;
};

const getErrorMessage = (error: unknown, fallback: string) => {
	if (!axios.isAxiosError(error)) return "네트워크 오류가 발생했습니다.";
	const data = error.response?.data as { message?: string } | undefined;
	return data?.message ?? fallback;
};

const getPasswordErrors = (value: string) => {
	const errors: string[] = [];
	if (value.length < 8) errors.push(PASSWORD_ERRORS[0]);
	if (
		!/[A-Za-z]/.test(value) ||
		!/[0-9]/.test(value) ||
		!/[^A-Za-z0-9\s]/.test(value)
	) {
		errors.push(PASSWORD_ERRORS[1]);
	}
	if (/\s/.test(value)) errors.push(PASSWORD_ERRORS[2]);
	return errors;
};

export default function EmailSignUp() {
	const [searchParams] = useSearchParams();
	const routeStep = searchParams.get("step");
	if (routeStep === "profile") return <ProfileSetting />;
	if (routeStep === "onboarding") return <Onboarding />;
	if (routeStep === "sign-up-source") return <SignUpSource />;
	if (routeStep === "complete") return <CompleteSignUp />;
	return <EmailSignupForm />;
}

function EmailSignupForm() {
	const [, setSearchParams] = useSearchParams();
	const [step, setStep] = useState<SignupStep>("email");
	const [email, setEmail] = useState("");
	const [code, setCode] = useState(Array(6).fill(""));
	const [codeExpiresAt, setCodeExpiresAt] = useState<string | null>(null);
	const [signupToken, setSignupToken] = useState<string | null>(null);
	const [signupTokenExpiresAt, setSignupTokenExpiresAt] = useState<
		string | null
	>(null);
	const [resendAvailableAt, setResendAvailableAt] = useState<number | null>(
		null,
	);
	const [now, setNow] = useState(Date.now());
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [privacyAgreed, setPrivacyAgreed] = useState(false);
	const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const codeInputRefs = useRef<Array<HTMLInputElement | null>>([]);
	const { signup } = useAuth();

	useEffect(() => {
		if (step !== "verify") return;
		const timer = window.setInterval(() => setNow(Date.now()), 1000);
		return () => window.clearInterval(timer);
	}, [step]);

	const moveToEmailStep = (message = "") => {
		setStep("email");
		setCode(Array(6).fill(""));
		setCodeExpiresAt(null);
		setSignupToken(null);
		setSignupTokenExpiresAt(null);
		setErrorMessage(message);
	};

	const codeRemainingSeconds = codeExpiresAt
		? Math.max(0, Math.ceil((new Date(codeExpiresAt).getTime() - now) / 1000))
		: 0;
	const resendRemainingSeconds = resendAvailableAt
		? Math.max(0, Math.ceil((resendAvailableAt - now) / 1000))
		: 0;
	const formattedCodeRemaining = `${Math.floor(codeRemainingSeconds / 60)}:${String(
		codeRemainingSeconds % 60,
	).padStart(2, "0")}`;

	useEffect(() => {
		if (step === "verify" && codeExpiresAt && codeRemainingSeconds === 0) {
			setStep("email");
			setCode(Array(6).fill(""));
			setCodeExpiresAt(null);
			setSignupToken(null);
			setSignupTokenExpiresAt(null);
			setErrorMessage("인증번호가 만료되었습니다. 다시 요청해주세요.");
		}
	}, [codeExpiresAt, codeRemainingSeconds, step]);

	const sendCode = async () => {
		const normalizedEmail = email.trim();
		if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
			setErrorMessage("올바른 이메일 주소를 입력해주세요.");
			return;
		}

		setIsSubmitting(true);
		setErrorMessage("");
		try {
			const { expiresAt } = await sendEmailVerificationCode(normalizedEmail);
			setEmail(normalizedEmail);
			setCode(Array(6).fill(""));
			setCodeExpiresAt(expiresAt);
			setResendAvailableAt(Date.now() + RESEND_COOLDOWN_SECONDS * 1000);
			setNow(Date.now());
			setStep("verify");
			window.setTimeout(() => codeInputRefs.current[0]?.focus(), 0);
		} catch (error) {
			setErrorMessage(getErrorMessage(error, "인증번호 발송에 실패했습니다."));
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleVerify = async () => {
		const verificationCode = code.join("");
		if (verificationCode.length !== 6) {
			setErrorMessage("인증번호 6자리를 입력해주세요.");
			return;
		}

		setIsSubmitting(true);
		setErrorMessage("");
		try {
			const result = await verifyEmailVerificationCode(email, verificationCode);
			setSignupToken(result.signupToken);
			setSignupTokenExpiresAt(result.expiresAt);
			setStep("password");
		} catch (error) {
			const errorCode = getErrorCode(error);
			if (
				errorCode === "EMAIL_VERIFICATION_EXPIRED" ||
				errorCode === "EMAIL_VERIFICATION_TOO_MANY_ATTEMPTS"
			) {
				moveToEmailStep(
					"인증번호가 만료되었거나 시도 횟수를 초과했습니다. 다시 요청해주세요.",
				);
				return;
			}
			setErrorMessage(
				errorCode === "EMAIL_VERIFICATION_CODE_MISMATCH"
					? "인증번호가 일치하지 않습니다."
					: getErrorMessage(error, "인증번호 확인에 실패했습니다."),
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCodeChange = (index: number, value: string) => {
		const digits = value.replace(/\D/g, "");
		const nextCode = [...code];
		if (digits.length > 1) {
			digits
				.slice(0, 6 - index)
				.split("")
				.forEach((digit, offset) => {
					nextCode[index + offset] = digit;
				});
			setCode(nextCode);
			codeInputRefs.current[Math.min(5, index + digits.length)]?.focus();
		} else {
			nextCode[index] = digits;
			setCode(nextCode);
			if (digits && index < 5) codeInputRefs.current[index + 1]?.focus();
		}
		setErrorMessage("");
	};

	const handleCodeKeyDown = (
		index: number,
		event: React.KeyboardEvent<HTMLInputElement>,
	) => {
		if (event.key === "Backspace" && !code[index] && index > 0) {
			codeInputRefs.current[index - 1]?.focus();
		}
	};

	const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const passwordErrors = getPasswordErrors(password);
		if (
			passwordErrors.length ||
			password !== confirmPassword ||
			!privacyAgreed
		) {
			setErrorMessage("입력한 정보를 다시 확인해주세요.");
			return;
		}
		if (
			!signupToken ||
			!signupTokenExpiresAt ||
			new Date(signupTokenExpiresAt).getTime() <= Date.now()
		) {
			moveToEmailStep("인증 정보가 만료되었습니다. 다시 인증해주세요.");
			return;
		}

		setIsSubmitting(true);
		setErrorMessage("");
		try {
			await signup(email, password, signupToken);
			setSearchParams((previous) => {
				const next = new URLSearchParams(previous);
				next.set("step", "profile");
				return next;
			});
		} catch (error) {
			if (getErrorCode(error) === "EMAIL_VERIFICATION_REQUIRED") {
				moveToEmailStep("인증 정보가 만료되었습니다. 다시 인증해주세요.");
				return;
			}
			setErrorMessage(getErrorMessage(error, "회원가입에 실패했습니다."));
		} finally {
			setIsSubmitting(false);
		}
	};

	const passwordErrors = getPasswordErrors(password);
	const isPasswordValid = password.length > 0 && passwordErrors.length === 0;
	const passwordsMatch =
		confirmPassword.length > 0 && password === confirmPassword;

	return (
		<div className={styles.page}>
			<div className={styles.box}>
				<header className={styles.header}>
					<h1 className={styles.title}>계정 생성</h1>
					<p className={styles.subtitle}>
						{step === "password"
							? "비밀번호를 설정해주세요"
							: "이메일을 설정해주세요"}
					</p>
				</header>

				{step === "email" && (
					<form
						className={styles.form}
						onSubmit={(event) => {
							event.preventDefault();
							void sendCode();
						}}
					>
						<label className={styles.srOnly} htmlFor="signup-email">
							이메일 주소
						</label>
						<input
							id="signup-email"
							className={styles.input}
							type="email"
							autoComplete="email"
							placeholder="email@snu.ac.kr"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
						/>
						{errorMessage && (
							<p className={styles.validation} role="alert">
								{errorMessage}
							</p>
						)}
						<button
							className={styles.submit}
							type="submit"
							disabled={isSubmitting}
						>
							{isSubmitting ? "발송 중..." : "이메일 인증"}
						</button>
					</form>
				)}

				{step === "verify" && (
					<div className={styles.form}>
						<input
							className={styles.input}
							value={email}
							readOnly
							aria-label="인증할 이메일 주소"
						/>
						<button
							className={styles.resend}
							type="button"
							onClick={() => void sendCode()}
							disabled={isSubmitting || resendRemainingSeconds > 0}
						>
							{resendRemainingSeconds > 0
								? `${resendRemainingSeconds}초 후 다시 받기`
								: "인증번호 다시 받기"}
						</button>
						<p className={styles.guide}>이메일로 온 인증번호를 확인해주세요!</p>
						<p className={styles.timer} aria-live="polite">
							{formattedCodeRemaining}
						</p>
						<fieldset className={styles.codeInputs}>
							<legend className={styles.srOnly}>인증번호 6자리</legend>
							{code.map((digit, index) => (
								<input
									key={CODE_INPUT_IDS[index]}
									ref={(element) => {
										codeInputRefs.current[index] = element;
									}}
									className={styles.codeInput}
									value={digit}
									onChange={(event) =>
										handleCodeChange(index, event.target.value)
									}
									onKeyDown={(event) => handleCodeKeyDown(index, event)}
									inputMode="numeric"
									autoComplete={index === 0 ? "one-time-code" : "off"}
									maxLength={6}
									aria-label={`인증번호 ${index + 1}번째 자리`}
								/>
							))}
						</fieldset>
						{errorMessage && (
							<p className={styles.validation} role="alert">
								{errorMessage}
							</p>
						)}
						<button
							className={styles.submit}
							type="button"
							onClick={() => void handleVerify()}
							disabled={isSubmitting}
						>
							{isSubmitting ? "확인 중..." : "인증하기"}
						</button>
					</div>
				)}

				{step === "password" && (
					<form className={styles.form} onSubmit={handleSignup}>
						<input
							className={styles.input}
							value={email}
							readOnly
							aria-label="인증된 이메일 주소"
						/>
						<label className={styles.srOnly} htmlFor="signup-password">
							비밀번호
						</label>
						<input
							id="signup-password"
							className={`${styles.input} ${password && !isPasswordValid ? styles.inputError : ""}`}
							type="password"
							autoComplete="new-password"
							placeholder="비밀번호"
							value={password}
							onChange={(event) => {
								setPassword(event.target.value);
								setErrorMessage("");
							}}
						/>
						{password.length > 0 &&
							passwordErrors.map((message) => (
								<p className={styles.validation} key={message}>
									{message}
								</p>
							))}
						<label className={styles.srOnly} htmlFor="signup-password-confirm">
							비밀번호 확인
						</label>
						<input
							id="signup-password-confirm"
							className={`${styles.input} ${confirmPassword && !passwordsMatch ? styles.inputError : ""}`}
							type="password"
							autoComplete="new-password"
							placeholder="비밀번호 확인"
							value={confirmPassword}
							onChange={(event) => {
								setConfirmPassword(event.target.value);
								setErrorMessage("");
							}}
						/>
						{confirmPassword && !passwordsMatch && (
							<p className={styles.validation}>비밀번호가 일치하지 않습니다.</p>
						)}
						<div className={styles.agreement}>
							<label className={styles.checkboxLabel}>
								<input
									type="checkbox"
									checked={privacyAgreed}
									onChange={(event) => setPrivacyAgreed(event.target.checked)}
								/>{" "}
								<span>개인정보 약관 동의(필수)</span>
							</label>
							<button
								className={styles.policyButton}
								type="button"
								onClick={() => setShowPrivacyPolicy(true)}
							>
								상세 내용 보기
							</button>
						</div>
						{errorMessage && (
							<p className={styles.validation} role="alert">
								{errorMessage}
							</p>
						)}
						<button
							className={styles.submit}
							type="submit"
							disabled={isSubmitting}
						>
							{isSubmitting ? "계정 생성 중..." : "계정 생성"}
						</button>
					</form>
				)}

				<div className={styles.loginLink}>
					<span>이미 계정이 있으신가요?</span>
					<Link to="/auth/login">로그인하러 가기</Link>
				</div>
			</div>

			{showPrivacyPolicy && (
				<div className={styles.modalBackdrop}>
					<section
						className={styles.modal}
						role="dialog"
						aria-modal="true"
						aria-labelledby="privacy-policy-title"
					>
						<div className={styles.modalHeader}>
							<h2 id="privacy-policy-title">개인정보 수집·이용 동의</h2>
							<button
								type="button"
								aria-label="개인정보 약관 닫기"
								onClick={() => setShowPrivacyPolicy(false)}
							>
								×
							</button>
						</div>
						<div className={styles.policyContent}>
							<h3>개인정보 수집 및 이용에 대한 동의</h3>
							<p>
								서비스는 회원가입 및 서비스 제공을 위해 아래와 같이 개인정보를
								수집·이용합니다.
							</p>
							<table>
								<thead>
									<tr>
										<th>수집 항목</th>
										<th>수집 목적</th>
										<th>보유 및 이용 기간</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td>이메일 주소</td>
										<td>회원 식별, 로그인, 계정 관리, 서비스 이용 안내</td>
										<td>
											회원 탈퇴 시까지 (단, 관계 법령에 따라 보관이 필요한 경우
											해당 기간 동안 보관)
										</td>
									</tr>
									<tr>
										<td>비밀번호(암호화 저장)</td>
										<td>회원 인증 및 계정 보호</td>
										<td>회원 탈퇴 시까지</td>
									</tr>
									<tr>
										<td>닉네임(선택)</td>
										<td>서비스 내 사용자 식별</td>
										<td>회원 탈퇴 시까지</td>
									</tr>
								</tbody>
							</table>
							<h3>수집 목적</h3>
							<ul>
								<li>회원가입 및 본인 식별</li>
								<li>로그인 및 계정 관리</li>
								<li>서비스 제공 및 운영</li>
							</ul>
							<h3>보유 및 이용 기간</h3>
							<p>원칙적으로 회원 탈퇴 시 개인정보를 지체 없이 파기합니다.</p>
							<p>
								다만, 다음의 경우 관련 법령에 따라 일정 기간 보관할 수 있습니다.
							</p>
							<ul>
								<li>계약 또는 청약철회 등에 관한 기록: 5년</li>
								<li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년</li>
								<li>전자적 접속기록: 관련 법령에 따른 보관 기간</li>
							</ul>
							<p>
								※ 귀하는 개인정보 수집·이용에 대한 동의를 거부할 권리가
								있습니다. 다만, 필수 항목에 대한 동의를 거부하는 경우 회원가입
								및 서비스 이용이 제한될 수 있습니다.
							</p>
						</div>
						<button
							className={styles.modalConfirm}
							type="button"
							onClick={() => setShowPrivacyPolicy(false)}
						>
							확인
						</button>
					</section>
				</div>
			)}
		</div>
	);
}
