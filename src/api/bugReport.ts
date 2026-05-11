import api from "./axios";

export interface CreateBugReportRequest {
	title: string;
	content: string;
}

export const createBugReport = async (body: CreateBugReportRequest) => {
	await api.post("/api/v1/bug-reports", body);
};
