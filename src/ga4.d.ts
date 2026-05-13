type GtagCommand = "js" | "config" | "set" | "event";

type GtagParams =
	| Date
	| string
	| Record<string, string | number | boolean | null | undefined>;

declare global {
	interface Window {
		dataLayer?: unknown[];
		gtag?: (command: GtagCommand, target: string | Date, params?: GtagParams) => void;
	}

	interface ImportMetaEnv {
		readonly VITE_GA_MEASUREMENT_ID?: string;
	}
}

export {};
