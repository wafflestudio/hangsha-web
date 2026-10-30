import { FaStar } from "react-icons/fa6";
import styles from "./Stars.module.css";

const FILLED = "#ffa726";
const EMPTY = "#dcdcdc";

interface StarsProps {
	/** 0~5. 소수면 반올림해서 채운다. */
	value: number;
	size?: number;
	/** 넘기면 입력 겸용이 된다. */
	onChange?: (value: number) => void;
	label?: string;
}

/** 별점. onChange가 없으면 읽기 전용 표시. */
const Stars = ({ value, size = 13, onChange, label }: StarsProps) => {
	const filled = Math.round(value);

	if (!onChange) {
		return (
			<span
				className={styles.row}
				aria-label={label ?? `별점 ${value}점`}
				role="img"
			>
				{[1, 2, 3, 4, 5].map((n) => (
					<FaStar key={n} size={size} color={n <= filled ? FILLED : EMPTY} />
				))}
			</span>
		);
	}

	return (
		<fieldset className={styles.row} aria-label={label ?? "별점 선택"}>
			{[1, 2, 3, 4, 5].map((n) => (
				<button
					key={n}
					type="button"
					aria-pressed={n === filled}
					aria-label={`${n}점`}
					className={styles.starBtn}
					onClick={() => onChange(n)}
				>
					<FaStar size={size} color={n <= filled ? FILLED : EMPTY} />
				</button>
			))}
		</fieldset>
	);
};

export default Stars;
