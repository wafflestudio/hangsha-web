import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { initGA4 } from "./lib/ga4";

const rootElement = document.getElementById("root");
if (rootElement === null) {
	throw new Error("Root element not found");
}

initGA4();

createRoot(rootElement).render(
	<StrictMode>
		<BrowserRouter>
			<App />
		</BrowserRouter>
	</StrictMode>,
);
