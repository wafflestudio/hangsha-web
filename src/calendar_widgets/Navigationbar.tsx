import styles from "@styles/Navigationbar.module.css";
import { useNavigate } from "react-router-dom";

const Navigationbar = () => {
	const navigate = useNavigate();

	return (
		<div className={styles.navbar}>
			<button
				type="button"
				onClick={() => navigate("/main")}
				className={styles.logoButton}
			>
				<img
					src="/assets/logo.png"
					className={styles.logoImg}
					alt="calendar icon with snu mark on it"
				/>
				<div className={styles.logoText}>행샤</div>
			</button>
		</div>
	);
};

export default Navigationbar;
