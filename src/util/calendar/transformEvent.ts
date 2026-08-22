import type { Event, EventDTO } from "@types";

export const transformEvent = (dto: EventDTO): Event => {
	const today = new Date();
	return {
		...dto,
		// handle invalid img
		imageUrl: dto.imageUrl.includes("extra.snu.ac.kr/comm/cmfile/")
			? "/assets/DefaultThumbnail.png"
			: dto.imageUrl,
		// eventTypeId is now the ID returned by /event-types; do not remap it.
		eventTypeId: dto.eventTypeId,
		applyStart: dto.applyStart ? new Date(dto.applyStart) : null,
		applyEnd: dto.applyEnd ? new Date(dto.applyEnd) : null,
		eventStart: dto.eventStart ? new Date(dto.eventStart) : null,
		eventEnd: dto.eventEnd ? new Date(dto.eventEnd) : null,

		statusId: dto.statusId
			? dto.statusId
			: dto.applyStart && new Date(dto.applyStart) > today
				? 1 // 모집대기
				: dto.applyEnd && new Date(dto.applyEnd) < today
					? 3 // 모집마감
					: 2, // 모집중
	};
};
