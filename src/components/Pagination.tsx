import styles from "@styles/Pagination.module.css";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

interface PaginationProps {
	page: number;
	totalPages: number;
	currentGroupStart: number;
	currentGroupEnd: number;
	onPrev: () => void;
	onNext: () => void;
	handlePageChange: (page: number) => void;
	getPageNumbers: () => number[];
}

const Pagination = ({
	page,
	totalPages,
	currentGroupStart,
	currentGroupEnd,
	onPrev,
	onNext,
	handlePageChange,
	getPageNumbers,
}: PaginationProps) => {
	return (
		<div className={styles.paginationContainer}>
			<button
				type="button"
				className={styles.pageButton}
				onClick={onPrev}
				disabled={currentGroupStart === 1}
			>
				<IoChevronBack />
			</button>
			{getPageNumbers().map((pageNum) => (
				<button
					type="button"
					key={pageNum}
					className={`${styles.pageButton} ${pageNum === page ? styles.activePage : ""}`}
					onClick={() => handlePageChange(pageNum)}
				>
					{pageNum}
				</button>
			))}
			<button
				type="button"
				className={styles.pageButton}
				onClick={onNext}
				disabled={currentGroupEnd === totalPages}
			>
				<IoChevronForward />
			</button>
		</div>
	);
};

export default Pagination;
