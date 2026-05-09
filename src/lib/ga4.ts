const GA_SCRIPT_URL = "https://www.googletagmanager.com/gtag/js";
const GA_SCRIPT_ID = "ga4-script";
const DEFAULT_USER_PROPERTIES = {
	signed_in: "false",
} as const;

type GtagEventParams = {
	[key: string]: string | number | boolean | null | undefined;
};

const getMeasurementId = () => import.meta.env.VITE_GA_MEASUREMENT_ID?.trim() ?? "";

const isAnalyticsEnabled = () => getMeasurementId().length > 0;

const ensureDataLayer = () => {
	window.dataLayer = window.dataLayer ?? [];
};

const ensureGtag = () => {
	if (typeof window.gtag === "function") {
		return window.gtag;
	}

	window.gtag = function gtag(...args: unknown[]) {
		window.dataLayer?.push(args);
	};

	return window.gtag;
};

const loadGtagScript = (measurementId: string) => {
	if (document.getElementById(GA_SCRIPT_ID) !== null) {
		return;
	}

	const script = document.createElement("script");
	script.id = GA_SCRIPT_ID;
	script.async = true;
	script.src = `${GA_SCRIPT_URL}?id=${measurementId}`;
	document.head.appendChild(script);
};

let initialized = false;

export const initGA4 = () => {
	if (initialized || typeof window === "undefined" || !isAnalyticsEnabled()) {
		return;
	}

	const measurementId = getMeasurementId();

	ensureDataLayer();
	const gtag = ensureGtag();
	loadGtagScript(measurementId);

	gtag("js", new Date());
	gtag("config", measurementId, {
		send_page_view: false,
	});
	gtag("set", "user_properties", DEFAULT_USER_PROPERTIES);

	initialized = true;
};

export const trackPageView = (
	pagePath: string,
	options?: {
		pageLocation?: string;
		pageTitle?: string;
	},
) => {
	if (
		typeof window === "undefined" ||
		!isAnalyticsEnabled() ||
		typeof window.gtag !== "function"
	) {
		return;
	}

	window.gtag("event", "page_view", {
		page_path: pagePath,
		page_location: options?.pageLocation ?? window.location.href,
		page_title: options?.pageTitle ?? document.title,
	});
};

export const setAnalyticsUserId = (userId: string) => {
	if (
		typeof window === "undefined" ||
		!isAnalyticsEnabled() ||
		typeof window.gtag !== "function" ||
		userId.trim().length === 0
	) {
		return;
	}

	window.gtag("config", getMeasurementId(), {
		user_id: userId,
	});
};

export const clearAnalyticsUserId = () => {
	if (
		typeof window === "undefined" ||
		!isAnalyticsEnabled() ||
		typeof window.gtag !== "function"
	) {
		return;
	}

	window.gtag("config", getMeasurementId(), {
		user_id: null,
	});
};

export const setSignedInState = (isSignedIn: boolean) => {
	if (
		typeof window === "undefined" ||
		!isAnalyticsEnabled() ||
		typeof window.gtag !== "function"
	) {
		return;
	}

	window.gtag("set", "user_properties", {
		signed_in: isSignedIn ? "true" : "false",
	});
};

export const trackEvent = (eventName: string, params?: GtagEventParams) => {
	if (
		typeof window === "undefined" ||
		!isAnalyticsEnabled() ||
		typeof window.gtag !== "function" ||
		eventName.trim().length === 0
	) {
		return;
	}

	window.gtag("event", eventName, params);
};

export const isGA4Ready = () => initialized && isAnalyticsEnabled();
