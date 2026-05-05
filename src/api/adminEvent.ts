import api from "./axios";

export interface AdminActionResponse {
	ok: boolean;
	[key: string]: unknown;
}

export interface AdminEventDetailResponse {
	id: number;
	title: string;
	imageUrl?: string | null;
	operationMode?: string | null;

	statusId?: number | null;
	eventTypeId?: number | null;
	orgId?: number | null;

	applyStart?: string | null;
	applyEnd?: string | null;
	eventStart?: string | null;
	eventEnd?: string | null;
	isPeriodEvent?: boolean;

	capacity?: number | null;
	applyCount?: number | null;

	organization?: string | null;
	location?: string | null;
	applyLink?: string | null;

	tags?: string | null;
	detail?: string | null;
}

export interface AdminEventPatchRequest {
	title?: string | null;
	imageUrl?: string | null;
	operationMode?: string | null;

	tags?: string[] | null;
	mainContentHtml?: string | null;

	statusId?: number | null;
	eventTypeId?: number | null;
	orgId?: number | null;

	applyStart?: string | null;
	applyEnd?: string | null;
	eventStart?: string | null;
	eventEnd?: string | null;

	capacity?: number | null;
	applyCount?: number | null;

	organization?: string | null;
	location?: string | null;
	applyLink?: string | null;
}

export const getAdminEvent = async (
	eventId: number,
): Promise<AdminEventDetailResponse> => {
	const res = await api.get<AdminEventDetailResponse>(`/events/${eventId}`);
	return res.data;
};

export const patchAdminEvent = async (
	eventId: number,
	body: AdminEventPatchRequest,
): Promise<AdminActionResponse> => {
	const res = await api.patch<AdminActionResponse>(
		`/admin/events/${eventId}`,
		body,
		{ baseURL: "" },
	);
	return res.data;
};

export const deleteAdminEvent = async (
	eventId: number,
): Promise<AdminActionResponse> => {
	const res = await api.delete<AdminActionResponse>(`/admin/events/${eventId}`, {
		baseURL: "",
	});
	return res.data;
};

export const deleteAllAdminEvents = async (): Promise<AdminActionResponse> => {
	const res = await api.delete<AdminActionResponse>("/admin/events/delete", {
		baseURL: "",
	});
	return res.data;
};

export const syncAdminEventsFile = async (
	file: File,
): Promise<AdminActionResponse> => {
	const formData = new FormData();
	formData.append("file", file);

	const res = await api.post<AdminActionResponse>(
		"/admin/events/sync-file",
		formData,
		{ baseURL: "" },
	);

	return res.data;
};