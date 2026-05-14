import api from "./axios";

export interface CreateBugReportRequest {
	title: string;
	content: string;
}

export const createBugReport = async (body: CreateBugReportRequest) => {
	await api.post("/bug-reports", body);
};
