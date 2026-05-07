import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "@/lib/ga4";

let lastTrackedPage = "";

export default function PageViewTracker() {
	const location = useLocation();

	useEffect(() => {
		const pagePath = `${location.pathname}${location.search}`;

		if (lastTrackedPage === pagePath) {
			return;
		}

		trackPageView(pagePath);
		lastTrackedPage = pagePath;
	}, [location.pathname, location.search]);

	return null;
}
