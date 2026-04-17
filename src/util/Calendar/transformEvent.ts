import type { Event, EventDTO } from "@types";
import { CATEGORY_MAX_INDEX, CATEGORY_MIN_INDEX } from "../constants";

export const transformEvent = (dto: EventDTO): Event => {
	const today = new Date();
	return {
		...dto,
		// handle invalid img
		imageUrl: dto.imageUrl.includes("extra.snu.ac.kr/comm/cmfile/")
			? "/assets/DefaultThumbnail.png"
			: dto.imageUrl,
		eventTypeId:
			dto.eventTypeId &&
			dto.eventTypeId <= CATEGORY_MAX_INDEX &&
			dto.eventTypeId >= CATEGORY_MIN_INDEX
				? dto.eventTypeId - 3
				: 6,
		applyStart: new Date(dto.applyStart),
		applyEnd: new Date(dto.applyEnd),
		eventStart: dto.eventStart ? new Date(dto.eventStart) : null,
		eventEnd: dto.eventEnd ? new Date(dto.eventEnd) : null,

		statusId: dto.statusId
			? dto.statusId
			: new Date(dto.applyEnd) < today
				? 3
				: 1,
	};
};
