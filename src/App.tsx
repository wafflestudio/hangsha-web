import { AuthProvider } from "@contexts/AuthProvider";
import { EventProvider } from "@contexts/EventContext";
import { FilterContextProvider } from "@contexts/FilterContext";
import { UserDataProvider } from "@contexts/UserDataContext";
import { CalendarViewModeProvider } from "@contexts/CalendarViewModeContext";

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
							<TimetableProvider>
								<SidePanelResizeProvider>
									<AppRoutes />
								</SidePanelResizeProvider>
							</TimetableProvider>
						</CalendarViewModeProvider>
					</FilterContextProvider>
				</UserDataProvider>
			</EventProvider>
		</AuthProvider>
	);
}

export default App;
