import adminApi from "./adminAxios";

interface AdminSessionResponse {
	accessToken: string;
}

export const createAdminSession = async (code: string): Promise<string> => {
	const { data } = await adminApi.post<AdminSessionResponse>(
		"/admin/auth/session",
		{
			code,
		},
	);

	return data.accessToken;
};
