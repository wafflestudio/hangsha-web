import Chip from "@/components/ui/Chip";
import { getDDay } from "@/util/calendar/getDday";
import { CATEGORY_COLORS, CATEGORY_LIST } from "@constants";

interface EventChipProps {
	as?: "li" | "span";
	className?: string;
	compact?: boolean;
}

interface DdayChipProps extends EventChipProps {
	prefix?: string;
	targetDate: Date | string;
}

interface CategoryChipProps extends EventChipProps {
	categoryId: number;
}

export const DdayChip = ({
	as,
	className,
	compact = false,
	prefix = "지원 ",
	targetDate,
}: DdayChipProps) => (
	<Chip
		as={as}
		className={className}
		size={compact ? "compact" : "default"}
		variant="outlined"
	>
		{`${prefix}${getDDay(targetDate)}`}
	</Chip>
);

export const CategoryChip = ({
	as,
	categoryId,
	className,
	compact = false,
}: CategoryChipProps) => (
	<Chip
		as={as}
		className={className}
		size={compact ? "compact" : "default"}
		style={{ backgroundColor: CATEGORY_COLORS[categoryId] }}
	>
		{CATEGORY_LIST[categoryId]}
	</Chip>
);
