import { createBugReport } from "@/api/bugReport";
import { useState, type FormEvent } from "react";
import { FaBug } from "react-icons/fa6";
import styles from "./BugReportForm.module.css";

interface BugReportFormProps {
	onSubmitted?: () => void;
	showTopBorder?: boolean;
}

const BugReportForm = ({
	onSubmitted,
	showTopBorder = false,
}: BugReportFormProps) => {
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const trimmedTitle = title.trim();
		const trimmedContent = content.trim();

		if (!trimmedTitle || !trimmedContent) {
			alert("제목과 내용을 모두 입력해주세요.");
			return;
		}

		if (isSubmitting) return;

		try {
			setIsSubmitting(true);
			await createBugReport({
				title: trimmedTitle,
				content: trimmedContent,
			});
			setTitle("");
			setContent("");
			alert("버그 신고가 접수되었습니다.");
			onSubmitted?.();
		} catch (error) {
			console.error("Bug report submission failed:", error);
			alert("버그 신고 접수에 실패했습니다. 잠시 후 다시 시도해주세요.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<section
			className={`${styles.bugReportSection} ${showTopBorder ? styles.withTopBorder : ""}`}
		>
			<div className={styles.bugReportHeader}>
				<div className={styles.bugReportTitle}>
					<FaBug size={20} />
					<strong>버그 신고</strong>
				</div>
				<span>이용 중 발견한 문제를 알려주세요.</span>
			</div>
			<form className={styles.bugReportForm} onSubmit={handleSubmit}>
				<input
					className={styles.bugReportInput}
					type="text"
					value={title}
					placeholder="제목"
					maxLength={100}
					onChange={(event) => setTitle(event.currentTarget.value)}
					disabled={isSubmitting}
				/>
				<textarea
					className={styles.bugReportTextarea}
					value={content}
					placeholder="문제가 발생한 상황을 자세히 적어주세요."
					rows={5}
					maxLength={1000}
					onChange={(event) => setContent(event.currentTarget.value)}
					disabled={isSubmitting}
				/>
				<button
					className={styles.bugReportSubmitButton}
					type="submit"
					disabled={isSubmitting}
				>
					{isSubmitting ? "접수 중" : "신고하기"}
				</button>
			</form>
		</section>
	);
};

export default BugReportForm;
