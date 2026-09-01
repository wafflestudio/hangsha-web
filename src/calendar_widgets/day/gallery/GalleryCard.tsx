import EventCard from "@/components/layout/sidePannel/EventCard";
import type { Event } from "@types";
import { useNavigate } from "react-router-dom";
import styles from "../../../components/layout/sidePannel/CardView.module.css";

const GalleryCard = ({ event }: { event: Event }) => {
	const navigate = useNavigate();

	const handleClick = () => {
		navigate(`/events/${event.id}`);
	};

	return (
		// biome-ignore lint/a11y/useSemanticElements: div cannot be button because CardView inside has a button in it, and button nested inside buttons are more to be avoided
		<div
			role="button"
			key={event.id}
			tabIndex={0}
			onClick={handleClick}
			onKeyDown={(e) => e.key === "Enter" && handleClick()}
			className={styles.galleryCardWrapper}
		>
			<div className={styles.thumbnail}>
				<img
					alt={`thumbnail of ${event.title}`}
					src={event.imageUrl}
					className={styles.thumbnailImage}
				/>
			</div>
			<EventCard event={event} />
		</div>
	);
};

export default GalleryCard;
