import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	const apiTarget =
		mode === "production"
			? "http://hangsha-api-dev.wafflestudio.com"
			: "http://hangsha-api.wafflestudio.com";
	return {
		plugins: [react(), tsconfigPaths()],
		server: {
			proxy: {
				"/api": {
					target: apiTarget,
					changeOrigin: true,
					secure: false,
				},
			},
		},
	};
});
