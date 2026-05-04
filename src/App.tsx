import { AuthProvider } from "@contexts/AuthProvider";
import { EventProvider } from "@contexts/EventContext";
import { FilterContextProvider } from "@contexts/FilterContext";
import { UserDataProvider } from "@contexts/UserDataContext";
import { DayViewContextProvider } from "@contexts/DayViewContext";
import { DetailContextProvider } from "./contexts/DetailContext";

import AppRoutes from "./router/AppRoutes";
import { SearchProvider } from "./contexts/SearchContext";
import { TimetableProvider } from "./contexts/TimetableContext";

function App() {
	return (
		<AuthProvider>
			<EventProvider>
				<UserDataProvider>
					<FilterContextProvider>
						<SearchProvider>
							<DayViewContextProvider>
								<DetailContextProvider>
									<TimetableProvider>
										<AppRoutes />
									</TimetableProvider>
								</DetailContextProvider>
							</DayViewContextProvider>
						</SearchProvider>
					</FilterContextProvider>
				</UserDataProvider>
			</EventProvider>
		</AuthProvider>
	);
}

export default App;
