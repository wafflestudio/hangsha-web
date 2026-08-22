import {
	transformCategoryId,
	transformEvent,
} from "@/util/calendar/transformEvent";
import type { Category, EventDTO, Memo } from "@types";
import api from "./axios";

// --- Excluded Keywords ---
export const getExcludedKeywords = async () => {
	interface Keywords {
		id: number;
		keyword: string;
		createdAt: string;
	}
	const res = await api.get<{ items: Keywords[] }>(
		"/users/me/excluded-keywords",
	);
	const keywords: { id: number; keyword: string }[] = res.data.items.map(
		(item: Keywords) => ({ id: item.id, keyword: item.keyword }),
	);

	return keywords;
};

export const addExcludedKeywords = async (keyword: string) => {
	await api.post("/users/me/excluded-keywords", {
		keyword,
	});
};

export const deleteExcludedKeywords = async (id: number) => {
	await api.delete(`/users/me/excluded-keywords/${id}`);
};

// --- Bookmarks ---
export const getBookmarks = async (page = 1, size = 20) => {
	const res = await api.get<{ items: EventDTO[] }>("/users/me/bookmarks", {
		params: { page, size },
	});

	const result = res.data.items.map(transformEvent);

	return result;
};

export const addBookmark = async (eventId: number) => {
	await api.post(`/events/${eventId}/bookmark`);
};

export const removeBookmark = async (eventId: number) => {
	await api.delete(`/events/${eventId}/bookmark`);
};

// --- Interests ---
export const getInterestCategories = async () => {
	const res = await api.get<{
		items: { category: Category; priority: number }[];
	}>("/users/me/interest-categories");
	const sortedCategories = res.data.items
		.sort((a, b) => a.priority - b.priority)
		.map((item) => item.category);
	return sortedCategories;
};

export const addInterestCategories = async (
	items: { categoryId: number; priority: number }[],
) => {
	return api.put("/users/me/interest-categories", { items });
};

/*
export const removeInterestCategory = async (categoryId: number) => {
	await api.delete(`/users/me/interest-categories/${categoryId}`);
};
*/

// --- Memos ---
type MemoDTO = Omit<Memo, "createdAt" | "updatedAt" | "applyEnd"> & {
	createdAt?: string;
	updatedAt?: string;
	applyEnd?: string | null;
};

// helper mapping func
const mapMemoDTO = (m: MemoDTO): Memo => {
	return {
		...m,
		categoryId: transformCategoryId(m.categoryId),
		createdAt: m.createdAt ? new Date(m.createdAt) : undefined,
		updatedAt: m.updatedAt ? new Date(m.updatedAt) : undefined,
		applyEnd:
			m.applyEnd === null
				? null
				: m.applyEnd
					? new Date(m.applyEnd)
					: undefined,
	};
};

export const getMemos = async () => {
	const res = await api.get<{ items: MemoDTO[] }>("/memos");
	const memos: Memo[] = res.data.items.map(mapMemoDTO);

	return memos;
};

// 특정 태그를 가진 메모 목록 반환
export const getMemoByTag = async (id: number) => {
	const res = await api.get<{ items: MemoDTO[] }>(`/memos/by-tag/${id}`);
	const memos: Memo[] = res.data.items.map(mapMemoDTO);
	return memos;
};

export const addMemo = async (
	eventId: number,
	content: string,
	tagNames: string[],
) => {
	await api.post(`/memos`, { eventId, content, tagNames });
};

export const deleteMemo = async (id: number) => {
	await api.delete(`/memos/${id}`);
};

export const editMemo = async (
	id: number,
	updates: { content?: string | null; tagNames?: string[] },
) => {
	const { data: newMemoDTO } = await api.patch<MemoDTO>(`/memos/${id}`, {
		content: updates.content,
		tagNames: updates.tagNames,
	});

	const newMemo = mapMemoDTO(newMemoDTO);
	return newMemo;
};
