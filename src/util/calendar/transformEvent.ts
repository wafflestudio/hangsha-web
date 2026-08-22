import type { Event, EventDTO } from "@types";
import { CATEGORY_MAX_INDEX, CATEGORY_MIN_INDEX } from "../constants";

export const transformCategoryId = (categoryId?: number | null): number =>
	categoryId &&
	categoryId <= CATEGORY_MAX_INDEX &&
	categoryId >= CATEGORY_MIN_INDEX
		? categoryId - 3
		: 6;

export const transformEvent = (dto: EventDTO): Event => {
	const today = new Date();
	return {
		...dto,
		// handle invalid img
		imageUrl: dto.imageUrl.includes("extra.snu.ac.kr/comm/cmfile/")
			? "/assets/DefaultThumbnail.png"
			: dto.imageUrl,
		eventTypeId: transformCategoryId(dto.eventTypeId),
		applyStart: dto.applyStart ? new Date(dto.applyStart) : null,
		applyEnd: dto.applyEnd ? new Date(dto.applyEnd) : null,
		eventStart: dto.eventStart ? new Date(dto.eventStart) : null,
		eventEnd: dto.eventEnd ? new Date(dto.eventEnd) : null,

		statusId: dto.statusId
			? dto.statusId
			: dto.applyEnd ?
				new Date(dto.applyEnd) < today // 모집 마감 날짜가 지남
				? 2 // 모집 마감
				: 1
			:   2, // 모집 중
	};
};
