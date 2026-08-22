import { AuthProvider } from "@contexts/AuthProvider";
import { EventProvider } from "@contexts/EventContext";
import { FilterContextProvider } from "@contexts/FilterContext";
import { UserDataProvider } from "@contexts/UserDataContext";
import { CalendarViewModeProvider } from "@contexts/CalendarViewModeContext";
import { DetailContextProvider } from "./contexts/DetailContext";

import AppRoutes from "./router/AppRoutes";
import { TimetableProvider } from "./contexts/TimetableContext";
import { SidePanelResizeProvider } from "./components/layout/sidePannel/SidePanelResize";

function App() {
	return (
		<AuthProvider>
			<EventProvider>
				<UserDataProvider>
					<FilterContextProvider>
						<CalendarViewModeProvider>
							<DetailContextProvider>
								<TimetableProvider>
									<SidePanelResizeProvider>
										<AppRoutes />
									</SidePanelResizeProvider>
								</TimetableProvider>
							</DetailContextProvider>
						</CalendarViewModeProvider>
					</FilterContextProvider>
				</UserDataProvider>
			</EventProvider>
		</AuthProvider>
	);
}

export default App;
