import { type KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import styles from "./TimeSelect.module.css";

type TimeOption = {
	value: number;
	label: string;
};

type Props = {
	ariaLabel: string;
	value: number;
	options: TimeOption[];
	onChange: (value: number) => void;
};

export function TimeSelect({ ariaLabel, value, options, onChange }: Props) {
	const [isOpen, setIsOpen] = useState(false);
	const [focusedIndex, setFocusedIndex] = useState(0);
	const rootRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLButtonElement>(null);
	const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
	const listId = useId();
	const selectedIndex = Math.max(
		0,
		options.findIndex((option) => option.value === value),
	);
	const selectedOption = options[selectedIndex];

	useEffect(() => {
		if (!isOpen) return;

		const handlePointerDown = (event: PointerEvent) => {
			if (!rootRef.current?.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		document.addEventListener("pointerdown", handlePointerDown);
		return () => document.removeEventListener("pointerdown", handlePointerDown);
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen) return;

		requestAnimationFrame(() => {
			optionRefs.current[focusedIndex]?.focus({ preventScroll: true });
			optionRefs.current[focusedIndex]?.scrollIntoView({ block: "center" });
		});
	}, [focusedIndex, isOpen]);

	const closeAndFocusTrigger = () => {
		setIsOpen(false);
		requestAnimationFrame(() => triggerRef.current?.focus());
	};

	const selectOption = (index: number) => {
		const option = options[index];
		if (!option) return;

		onChange(option.value);
		closeAndFocusTrigger();
	};

	const openAt = (index: number) => {
		setFocusedIndex(index);
		setIsOpen(true);
	};

	const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
		if (event.key === "ArrowDown") {
			event.preventDefault();
			openAt(Math.min(options.length - 1, selectedIndex + 1));
		} else if (event.key === "ArrowUp") {
			event.preventDefault();
			openAt(Math.max(0, selectedIndex - 1));
		}
	};

	const handleOptionKeyDown = (
		event: KeyboardEvent<HTMLButtonElement>,
		index: number,
	) => {
		let nextIndex = index;

		if (event.key === "ArrowDown") {
			nextIndex = Math.min(options.length - 1, index + 1);
		} else if (event.key === "ArrowUp") {
			nextIndex = Math.max(0, index - 1);
		} else if (event.key === "Home") {
			nextIndex = 0;
		} else if (event.key === "End") {
			nextIndex = options.length - 1;
		} else if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			selectOption(index);
			return;
		} else if (event.key === "Escape" || event.key === "Tab") {
			if (event.key === "Escape") event.preventDefault();
			setIsOpen(false);
			if (event.key === "Escape") {
				requestAnimationFrame(() => triggerRef.current?.focus());
			}
			return;
		} else {
			return;
		}

		event.preventDefault();
		setFocusedIndex(nextIndex);
		optionRefs.current[nextIndex]?.focus();
		optionRefs.current[nextIndex]?.scrollIntoView({ block: "nearest" });
	};

	return (
		<div className={styles.timeSelect} ref={rootRef}>
			<button
				ref={triggerRef}
				type="button"
				className={styles.trigger}
				aria-label={ariaLabel}
				aria-haspopup="listbox"
				aria-expanded={isOpen}
				aria-controls={isOpen ? listId : undefined}
				onClick={() => (isOpen ? setIsOpen(false) : openAt(selectedIndex))}
				onKeyDown={handleTriggerKeyDown}
			>
				<span>{selectedOption?.label}</span>
				<span className={styles.chevron} aria-hidden="true" />
			</button>

			{isOpen && (
				<div id={listId} className={styles.optionList} role="listbox">
					{options.map((option, index) => {
						const isSelected = option.value === value;

						return (
							<button
								key={option.value}
								ref={(element) => {
									optionRefs.current[index] = element;
								}}
								type="button"
								role="option"
								aria-selected={isSelected}
								className={`${styles.option} ${
									isSelected ? styles.selectedOption : ""
								}`}
								tabIndex={index === focusedIndex ? 0 : -1}
								onClick={() => selectOption(index)}
								onKeyDown={(event) => handleOptionKeyDown(event, index)}
							>
								{option.label}
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
}
