import adminApi from "./adminAxios";

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

export interface AdminEventRequest {
	title?: string | null;
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
	applyLink?: string | null;
	organization?: string | null;
	location?: string | null;
	tags?: string[];
	mainContentHtml?: string | null;
	sessions?: AdminEventSessionRequest[];
}

export interface AdminEventSessionRequest {
	start?: string | null;
	end?: string | null;
	location?: string | null;
}

export interface AdminEventDraftResponse {
	title?: string | null;
	applyStart?: string | null;
	applyEnd?: string | null;
	eventStart?: string | null;
	eventEnd?: string | null;
	isPeriodEvent?: boolean | null;
	organization?: string | null;
	location?: string | null;
	eventType?: string | null;
	eventTypeId?: number | null;
	sessions: AdminEventSessionRequest[];
	mainContentHtml?: string | null;
	warnings: string[];
}

export const getAdminEvent = async (
	eventId: number,
): Promise<AdminEventDetailResponse> => {
	const res = await adminApi.get<AdminEventDetailResponse>(
		`/events/${eventId}`,
	);
	return res.data;
};

export interface AdminEventCreateRequest extends AdminEventRequest {
	title: string;
}

export type AdminEventPatchRequest = AdminEventRequest;

export interface AdminEventOverrideUpdateRequest {
	lockFields?: string[];
	unlockFields?: string[];
}

export interface AdminEventOverrideUpdateResponse extends AdminActionResponse {
	eventId: number;
	adminOverriddenFields: string[];
}

export const createAdminEvent = async (
	body: AdminEventCreateRequest,
): Promise<AdminActionResponse> => {
	const res = await adminApi.post<AdminActionResponse>("/admin/events", body);
	return res.data;
};

export const parseAdminEventDraft = async (
	text?: string,
	image?: File | null,
): Promise<AdminEventDraftResponse> => {
	const formData = new FormData();
	if (text?.trim()) formData.append("text", text.trim());
	if (image) formData.append("image", image);

	const res = await adminApi.post<AdminEventDraftResponse>(
		"/admin/events/parse-draft",
		formData,
	);
	return res.data;
};

export const uploadAdminEventImage = async (file: File): Promise<string> => {
	const formData = new FormData();
	formData.append("file", file);
	formData.append("prefix", "events");

	const res = await adminApi.post<{ url: string }>("/uploads/oci", formData);
	return res.data.url;
};

export const patchAdminEvent = async (
	eventId: number,
	body: AdminEventPatchRequest,
): Promise<AdminActionResponse> => {
	const res = await adminApi.patch<AdminActionResponse>(
		`/admin/events/${eventId}`,
		body,
	);
	return res.data;
};

export const deleteAdminEvent = async (
	eventId: number,
): Promise<AdminActionResponse> => {
	const res = await adminApi.delete<AdminActionResponse>(
		`/admin/events/${eventId}`,
	);
	return res.data;
};

export const deleteAllAdminEvents = async (): Promise<AdminActionResponse> => {
	const res = await adminApi.delete<AdminActionResponse>(
		"/admin/events/delete",
	);
	return res.data;
};

export const syncAdminEventsFile = async (
	file: File,
): Promise<AdminActionResponse> => {
	const formData = new FormData();
	formData.append("file", file);

	const res = await adminApi.post<AdminActionResponse>(
		"/admin/events/sync-file",
		formData,
	);

	return res.data;
};

export const updateAdminEventOverrides = async (
	eventId: number,
	body: AdminEventOverrideUpdateRequest,
): Promise<AdminEventOverrideUpdateResponse> => {
	const res = await adminApi.patch<AdminEventOverrideUpdateResponse>(
		`/admin/events/${eventId}/overrides`,
		body,
	);
	return res.data;
};
