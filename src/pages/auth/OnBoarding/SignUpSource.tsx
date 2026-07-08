import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import signupStyles from "../Signup/EmailSignUp.module.css";
import styles from "./SignUpSource.module.css";

const SIGN_UP_SOURCES = [
	"검색",
	"커뮤니티/카페",
	"인스타그램",
	"지인을 통해",
	"기타",
] as const;

type SignUpSource = (typeof SIGN_UP_SOURCES)[number];

export default function SignUpSource() {
	const navigate = useNavigate();
	const [, setSearchParams] = useSearchParams();
	const [selectedSources, setSelectedSources] = useState<SignUpSource[]>([]);

	const toggleSource = (source: SignUpSource) => {
		setSelectedSources((prev) =>
			prev.includes(source)
				? prev.filter((selected) => selected !== source)
				: [...prev, source],
		);
	};

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (selectedSources.length === 0) {
			alert("가입 경로를 하나 이상 선택해주세요.");
			return;
		}

		setSearchParams((prev) => {
			const next = new URLSearchParams(prev);
			next.set("step", "complete");
			return next;
		});
		navigate("/auth/signup?step=complete");
	};

	return (
		<div className={signupStyles.page}>
			<div className={signupStyles.box}>
				<header className={signupStyles.header}>
					<h2 className={signupStyles.title}>가입 경로</h2>
					<p className={signupStyles.subtitle}>
						행사를 어떻게 알게 되었나요?
					</p>
				</header>

				<form
					className={`${signupStyles.form} ${styles.sourceList}`}
					onSubmit={handleSubmit}
				>
					{SIGN_UP_SOURCES.map((source) => {
						const inputId = `sign-up-source-${source}`;

						return (
							<label
								key={source}
								className={`${signupStyles.input} ${styles.sourceOption}`}
								htmlFor={inputId}
							>
								<input
									id={inputId}
									className={styles.checkbox}
									type="checkbox"
									checked={selectedSources.includes(source)}
									onChange={() => toggleSource(source)}
								/>
								<span className={styles.labelText}>{source}</span>
							</label>
						);
					})}

					<button className={signupStyles.submit} type="submit">
						완료
					</button>
				</form>
			</div>
		</div>
	);
}
