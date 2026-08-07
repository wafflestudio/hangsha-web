import type { Event } from "@types";

/**
 * 의도 : 비교과 웹 크롤링 행사에서 참여형 행사가 여러 회차로 나뉘어져 있을때,
 * 날짜를 더 정확하게 표시하기 위해 각 회차를 별개의 행사로 인식해서 표시하도록 되어 있음
 * 그러나 동일한 날짜, 다른 시간대로 회차가 구분되는 경우, 월별 뷰와 검색 결과에서는 두 행사 모두 표시하는 것이 UI 상 중복 초래.
 * (표시되는 UI 상 시간대만 다르고, 나머지 행사 제목 - 내용 - 신청 링크 모두 같으므로)
 * 따라서 클라이언트에서 같은 제목 및 내용이 행사 && 같은 날짜 && 시간만 다름일때 월별뷰 / 검색 결과에서는 하나만 보이도록 필터링 진행.
 */

type EventRange = {
	start: Date;
	end: Date;
};

const normalizeRange = (
	start: Date | null,
	end: Date | null,
): EventRange | null => {
	const fallback = start ?? end;
	if (!fallback) return null;

	return {
		start: start ?? fallback,
		end: end ?? fallback,
	};
};

const getDisplayedRange = (event: Event): EventRange | null => {
	const eventRange = normalizeRange(event.eventStart, event.eventEnd);
	const applyRange = normalizeRange(event.applyStart, event.applyEnd);

	return event.isPeriodEvent
		? (applyRange ?? eventRange)
		: (eventRange ?? applyRange);
};

const getLocalDateKey = (date: Date) =>
	`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

const getGroupKey = (event: Event, range: EventRange) => {
	const contentIdentity = event.applyLink?.trim();
	if (!contentIdentity) return null;

	return JSON.stringify([
		event.title.trim(),
		contentIdentity,
		getLocalDateKey(range.start),
		getLocalDateKey(range.end),
	]);
};

const getTimeKey = (range: EventRange) =>
	`${range.start.getTime()}-${range.end.getTime()}`;


export const filterEventTimeVariants = <T>(
	items: T[],
	getEvent: (item: T) => Event,
): T[] => {
	const itemMetadata = items.map((item) => {
		const event = getEvent(item);
		const range = getDisplayedRange(event);
		if (!range) return { groupKey: null, timeKey: null };

		return {
			groupKey: getGroupKey(event, range),
			timeKey: getTimeKey(range),
		};
	});

	const timeKeysByGroup = new Map<string, Set<string>>();
	for (const { groupKey, timeKey } of itemMetadata) {
		if (!groupKey || !timeKey) continue;

		const timeKeys = timeKeysByGroup.get(groupKey) ?? new Set<string>();
		timeKeys.add(timeKey);
		timeKeysByGroup.set(groupKey, timeKeys);
	}

	const keptVariantGroups = new Set<string>();
	return items.filter((_, index) => {
		const { groupKey } = itemMetadata[index];
		if (!groupKey || (timeKeysByGroup.get(groupKey)?.size ?? 0) <= 1) {
			return true;
		}
		if (keptVariantGroups.has(groupKey)) return false;

		keptVariantGroups.add(groupKey);
		return true;
	});
};
