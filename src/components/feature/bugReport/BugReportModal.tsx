import { IoIosClose } from "react-icons/io";
import BugReportForm from "./BugReportForm";
import styles from "./BugReportModal.module.css";

interface BugReportModalProps {
	onClose: () => void;
}

const BugReportModal = ({ onClose }: BugReportModalProps) => (
	// biome-ignore lint/a11y/noStaticElementInteractions: the backdrop closes only when clicked outside the dialog
	<div className={styles.overlay} role="presentation" onMouseDown={onClose}>
		<div
			className={styles.modal}
			role="dialog"
			aria-modal="true"
			aria-label="버그 신고"
			onMouseDown={(event) => event.stopPropagation()}
		>
			<button
				className={styles.closeButton}
				type="button"
				onClick={onClose}
				aria-label="버그 신고 닫기"
			>
				<IoIosClose size={28} color="#777777" />
			</button>
			<BugReportForm onSubmitted={onClose} />
		</div>
	</div>
);

export default BugReportModal;
