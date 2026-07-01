import { useNavigate } from "react-router-dom";
import star1 from "/assets/Star1.svg";
import star2 from "/assets/Star2.svg";
import styles from "./CompleteSignUp.module.css";

const STARS = [star1, star2];

function random(min: number, max: number) {
	return Math.random() * (max - min) + min;
}

export default function CompleteSignUp() {
	const navigate = useNavigate();

	const handleToCalendar = () => navigate("/main");
	const handleToMyPage = () => navigate("/my");

	const stars = Array.from({ length: 40 }).map((_, i) => {
		const size = random(10, 80);
		return {
			id: i,
			src: STARS[Math.floor(Math.random() * STARS.length)],
			top: `${random(5, 90)}%`,
			left: `${random(5, 90)}%`,
			size,
			rotate: `rotate(${random(0, 360)}deg)`,
			opacity: random(0.25, 0.6),
		};
	});

	return (
		<div className={styles.page}>
			<div className={styles.starLayer}>
				{stars.map((star) => (
					<img
						key={star.id}
						src={star.src}
						className={styles.star}
						style={{
							top: star.top,
							left: star.left,
							width: star.size,
							height: star.size,
							transform: star.rotate,
							opacity: star.opacity,
						}}
						alt=""
						aria-hidden
					/>
				))}
			</div>

			{/* 콘텐츠 */}
			<div className={styles.center}>
				<h1 className={styles.title}>환영합니다!</h1>

				<div className={styles.actions}>
					<button
						type="button"
						className={styles.pill}
						onClick={handleToMyPage}
					>
						마이페이지로 가기
					</button>
					<button
						type="button"
						className={styles.pill}
						onClick={handleToCalendar}
					>
						캘린더로 가기
					</button>
				</div>
			</div>
		</div>
	);
}
