import axios from "axios";
import { AdminTokenService } from "./adminTokenService";

const API_URL = import.meta.env.VITE_API_URL || "";

const adminApi = axios.create({
	baseURL: API_URL,
	paramsSerializer: { indexes: null },
});

adminApi.interceptors.request.use(
	(config) => {
		const token = AdminTokenService.getToken();

		if (token && token.trim().length > 0) {
			config.headers.Authorization = `Bearer ${token}`;
		} else {
			delete config.headers.Authorization;
		}

		return config;
	},
	(error) => Promise.reject(error),
);

adminApi.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			AdminTokenService.clearToken();
		}

		return Promise.reject(error);
	},
);

export default adminApi;
