import styles from "@styles/Modal.module.css";
import { IoIosClose } from "react-icons/io";

interface ModalProps {
	content: string;
	leftText: string;
	rightText: string;
	onLeftClick: () => void;
	onRightClick: () => void;
	onClose: (() => void) | null;
}

const Modal = ({
	content,
	leftText,
	rightText,
	onLeftClick,
	onRightClick,
	onClose,
}: ModalProps) => {
	return (
		<div className={styles.modalContainer}>
			<div className={styles.modalWrapper}>
				{onClose && (
					<button
						className={styles.closeButton}
						type="button"
						onClick={onClose}
					>
						<IoIosClose size={25} color="gray" />
					</button>
				)}
				<span className={styles.modalContent}>{content}</span>
				<div className={styles.buttonsRow}>
					<button
						className={styles.leftBtn}
						type="button"
						onClick={onLeftClick}
					>
						{leftText}
					</button>
					<button
						className={styles.rightBtn}
						type="button"
						onClick={onRightClick}
					>
						{rightText}
					</button>
				</div>
			</div>
		</div>
	);
};

interface ErrorModal {
	content: string;
	refresh?: () => void;
	onClose: () => void;
}

export const ErrorModal = ({
	content,
	refresh = () => window.location.reload(),
	onClose,
}: ErrorModal) => {
	return (
		<div className={styles.modalContainer} id={styles.error}>
			<div className={styles.modalWrapper}>
				<button className={styles.closeButton} type="button" onClick={onClose}>
					<IoIosClose size={25} color="gray" />
				</button>
				<span className={styles.modalContent}>{content}</span>
				<div className={styles.buttonsRow}>
					<button className={styles.leftBtn} type="button" onClick={refresh}>
						다시 시도하기
					</button>
				</div>
			</div>
		</div>
	);
};

export default Modal;
