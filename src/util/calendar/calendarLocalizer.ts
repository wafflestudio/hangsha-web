import { format, getDay, parse, startOfWeek } from "date-fns";
import { ko } from "date-fns/locale";
import { dateFnsLocalizer } from "react-big-calendar";

export const localizer = dateFnsLocalizer({
	format,
	parse,
	startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
	getDay,
	locales: { ko: ko },
});
