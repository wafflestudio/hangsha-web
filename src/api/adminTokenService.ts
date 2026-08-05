const ADMIN_ACCESS_KEY = "adminAccessToken";

let adminAccessToken: string | null = null;

export const AdminTokenService = {
	getToken: (): string | null => {
		if (adminAccessToken !== null) return adminAccessToken;

		const stored = localStorage.getItem(ADMIN_ACCESS_KEY);
		adminAccessToken = stored;
		return stored;
	},

	setToken: (accessToken: string) => {
		adminAccessToken = accessToken;
		localStorage.setItem(ADMIN_ACCESS_KEY, accessToken);
	},

	clearToken: () => {
		adminAccessToken = null;
		localStorage.removeItem(ADMIN_ACCESS_KEY);
	},
};

window.addEventListener("storage", (event) => {
	if (event.key === ADMIN_ACCESS_KEY) adminAccessToken = event.newValue;
});
