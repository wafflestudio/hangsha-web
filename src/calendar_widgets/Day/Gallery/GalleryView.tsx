import type { CalendarEvent } from "@types";
import styles from "@styles/GalleryView.module.css";
import GalleryCard from "./GalleryCard";

const GalleryView = ({ events }: { events: CalendarEvent[] }) => {
	return (
		<div className={styles.galleryContainer}>
			{events.map((event) => (
				<div key={event.resource.event.id}>
					<GalleryCard event={event.resource.event} />
				</div>
			))}
		</div>
	);
};
export default GalleryView;
