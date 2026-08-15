import type { AuthTokens, User } from "@types";
import api from "./axios";
import { TokenService } from "./tokenService";

export const getUser = async (): Promise<User> => {
	const res = await api.get<User>("/users/me");
	return res.data;
};

export const updateUsername = async (username: string) => {
	await api.patch("/users/me", {
		username,
	});
};

export const clearProfileImg = async () => {
	await api.patch("/users/me", {
		profileImageUrl: null,
	});
};

export const uploadProfileImg = async (file: File) => {
	const fd = new FormData();
	fd.append("file", file);

	const { data } = await api.post<{ url: string }>(
		"/users/me/profile-image",
		fd,
	);

	return data;
};

export interface EmailVerificationCodeResponse {
	expiresAt: string;
}

export interface EmailVerificationResult {
	signupToken: string;
	expiresAt: string;
}

export const sendEmailVerificationCode = async (email: string) => {
	const response = await api.post<EmailVerificationCodeResponse>(
		"/auth/email/send-code",
		{ email },
	);
	return response.data;
};

export const verifyEmailVerificationCode = async (
	email: string,
	code: string,
) => {
	const response = await api.post<EmailVerificationResult>(
		"/auth/email/verify-code",
		{ email, code },
	);
	return response.data;
};

export const signup = async (
	email: string,
	password: string,
	signupToken: string,
) => {
	const response = await api.post<AuthTokens>("/auth/register", {
		email,
		password,
		signupToken,
	});

	TokenService.setToken(response.data.accessToken);
};

export const login = async (email: string, password: string) => {
	const response = await api.post("/auth/login", {
		email,
		password,
	});

	TokenService.setToken(response.data.accessToken);
};

export const logout = async () => {
	// delete tokens
	await api.post("/auth/logout");
	TokenService.clearTokens();
};

export const deleteAccount = async () => {
	await api.delete("/users/me");
	TokenService.clearTokens();
};

export const refresh = async () => {
	const res = await api.post<AuthTokens>("/auth/refresh");
	TokenService.setToken(res.data.accessToken);
	const user = await getUser();

	return user;
};

export const establishSession = async () => {
	await api.post("/auth/session");
};

// health check
export const healthCheck = async () => {
	const res = await api.get("/health");
	console.log(res.data);
};
