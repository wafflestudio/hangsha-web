import api from "./axios";

interface AdminSessionResponse {
	accessToken: string;
}

export const createAdminSession = async (code: string): Promise<string> => {
	const { data } = await api.post<AdminSessionResponse>("/admin/auth/session", {
		code,
	});

	return data.accessToken;
};
