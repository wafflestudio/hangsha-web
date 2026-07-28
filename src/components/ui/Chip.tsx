import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import styles from "./Chip.module.css";

type ChipElement = "li" | "span";
type ChipVariant = "filled" | "outlined";
type ChipSize = "compact" | "default";

interface ChipProps extends HTMLAttributes<HTMLElement> {
	as?: ChipElement;
	children: ReactNode;
	className?: string;
	size?: ChipSize;
	style?: CSSProperties;
	variant?: ChipVariant;
}

const Chip = ({
	as: Element = "span",
	children,
	className,
	size = "default",
	variant = "filled",
	...props
}: ChipProps) => {
	const classNames = [
		styles.chip,
		styles[variant],
		size === "compact" ? styles.compact : "",
		className,
	]
		.filter(Boolean)
		.join(" ");

	return (
		<Element className={classNames} {...props}>
			{children}
		</Element>
	);
};

export default Chip;
