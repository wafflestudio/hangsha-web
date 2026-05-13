import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { initGA4 } from "./lib/ga4";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";

const rootElement = document.getElementById("root");
if (rootElement === null) {
	throw new Error("Root element not found");
}

initGA4();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,        // 5 min: cache hit returns instantly, no refetch
      gcTime: 24 * 60 * 60 * 1000,     // 24h: keep in memory
      refetchOnWindowFocus: false,
    },
  },
});

const asyncStoragePersister = createAsyncStoragePersister({
	storage: window.localStorage,
	key: "calendar-sha-query-cache",
	throttleTime: 1000,
});

createRoot(rootElement).render(
	<StrictMode>
		<PersistQueryClientProvider
			client={queryClient}
			persistOptions={{
				persister: asyncStoragePersister,
				maxAge: 24 * 60 * 60 * 1000,
				buster: "v1",
			}}
		>
		<BrowserRouter>
			<App />
		</BrowserRouter>
		</PersistQueryClientProvider>
	</StrictMode>,
);
