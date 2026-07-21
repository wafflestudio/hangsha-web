import { AuthProvider } from "@contexts/AuthProvider";
import { EventProvider } from "@contexts/EventContext";
import { FilterContextProvider } from "@contexts/FilterContext";
import { UserDataProvider } from "@contexts/UserDataContext";
import { DayViewContextProvider } from "@contexts/DayViewContext";
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
						<DayViewContextProvider>
							<DetailContextProvider>
								<TimetableProvider>
									<SidePanelResizeProvider>
										<AppRoutes />
									</SidePanelResizeProvider>
								</TimetableProvider>
							</DetailContextProvider>
						</DayViewContextProvider>
					</FilterContextProvider>
				</UserDataProvider>
			</EventProvider>
		</AuthProvider>
	);
}

export default App;
