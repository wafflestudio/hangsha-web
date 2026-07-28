import { createAdminSession } from "@/api/adminAuth";
import { TokenService } from "@/api/tokenService";
import type { FormEvent } from "react";
import { useState } from "react";
import styles from "./AdminAccess.module.css";

interface AdminAccessPageProps {
	onAuthorized: () => void;
}

export default function AdminAccessPage({
	onAuthorized,
}: AdminAccessPageProps) {
	const [code, setCode] = useState("");
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const trimmedCode = code.trim();
		if (trimmedCode.length === 0) {
			setError("액세스 코드를 입력해주세요.");
			return;
		}

		setIsSubmitting(true);
		setError("");

		try {
			const accessToken = await createAdminSession(trimmedCode);
			TokenService.setToken(accessToken);
			onAuthorized();
		} catch {
			setError("액세스 코드가 올바르지 않습니다.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<main className={styles.page}>
			<form className={styles.panel} onSubmit={handleSubmit}>
				<h1 className={styles.title}>Admin Access</h1>
				<input
					className={styles.input}
					value={code}
					onChange={(event) => setCode(event.target.value)}
					type="password"
					autoComplete="off"
					placeholder="Access code"
				/>
				{error && <p className={styles.error}>{error}</p>}
				<button className={styles.button} type="submit" disabled={isSubmitting}>
					{isSubmitting ? "확인 중" : "입장"}
				</button>
			</form>
		</main>
	);
}
