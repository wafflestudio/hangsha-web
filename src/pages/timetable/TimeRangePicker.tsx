import {
	type CSSProperties,
	type KeyboardEvent,
	type UIEvent,
	useCallback,
	useEffect,
	useId,
	useMemo,
	useRef,
} from "react";
import styles from "./TimeRangePicker.module.css";

export type TimeValue = `${number}:${number}`;

type Meridiem = "AM" | "PM";

type WheelOption<T extends string | number> = {
	value: T;
	label: string;
};

type WheelColumnProps<T extends string | number> = {
	ariaLabel: string;
	options: WheelOption<T>[];
	value: T;
	onChange: (value: T) => void;
};

export type TimeWheelProps = {
	value: TimeValue;
	onChange: (value: TimeValue) => void;
	minuteStep?: number;
	ariaLabel?: string;
};

export type TimeRangePickerProps = {
	startTime: TimeValue;
	endTime: TimeValue;
	onChange: (range: { startTime: TimeValue; endTime: TimeValue }) => void;
	minuteStep?: number;
	className?: string;
};

const ITEM_HEIGHT = 30;
const VISIBLE_ITEMS = 5;
const SCROLL_END_DELAY = 90;

const pad = (value: number) => String(value).padStart(2, "0");

function parseTime(value: TimeValue) {
	const [rawHour, rawMinute] = value.split(":").map(Number);
	const hour24 = Number.isFinite(rawHour)
		? Math.min(23, Math.max(0, rawHour))
		: 0;
	const minute = Number.isFinite(rawMinute)
		? Math.min(59, Math.max(0, rawMinute))
		: 0;

	return {
		meridiem: (hour24 < 12 ? "AM" : "PM") as Meridiem,
		hour12: hour24 % 12 || 12,
		minute,
	};
}

function toTimeValue(
	meridiem: Meridiem,
	hour12: number,
	minute: number,
): TimeValue {
	const hour24 = meridiem === "AM" ? hour12 % 12 : (hour12 % 12) + 12;
	return `${pad(hour24)}:${pad(minute)}` as TimeValue;
}

function timeToMinutes(value: TimeValue) {
	const [hour, minute] = value.split(":").map(Number);
	return hour * 60 + minute;
}

function WheelColumn<T extends string | number>({
	ariaLabel,
	options,
	value,
	onChange,
}: WheelColumnProps<T>) {
	const listRef = useRef<HTMLDivElement>(null);
	const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const idPrefix = useId().replaceAll(":", "");
	const selectedIndex = Math.max(
		0,
		options.findIndex((option) => option.value === value),
	);

	const scrollToIndex = useCallback(
		(index: number, behavior: ScrollBehavior = "smooth") => {
			const boundedIndex = Math.min(options.length - 1, Math.max(0, index));
			listRef.current?.scrollTo({
				top: boundedIndex * ITEM_HEIGHT,
				behavior,
			});
		},
		[options.length],
	);

	useEffect(() => {
		scrollToIndex(selectedIndex, "auto");
	}, [scrollToIndex, selectedIndex]);

	useEffect(
		() => () => {
			if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
		},
		[],
	);

	const commitNearestValue = (scrollTop: number) => {
		const index = Math.min(
			options.length - 1,
			Math.max(0, Math.round(scrollTop / ITEM_HEIGHT)),
		);
		const nextValue = options[index].value;

		if (nextValue !== value) onChange(nextValue);
		scrollToIndex(index);
	};

	const handleScroll = (event: UIEvent<HTMLDivElement>) => {
		const scrollTop = event.currentTarget.scrollTop;

		if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
		scrollTimerRef.current = setTimeout(
			() => commitNearestValue(scrollTop),
			SCROLL_END_DELAY,
		);
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		let nextIndex = selectedIndex;

		if (event.key === "ArrowUp") nextIndex -= 1;
		else if (event.key === "ArrowDown") nextIndex += 1;
		else if (event.key === "Home") nextIndex = 0;
		else if (event.key === "End") nextIndex = options.length - 1;
		else return;

		event.preventDefault();
		nextIndex = Math.min(options.length - 1, Math.max(0, nextIndex));
		onChange(options[nextIndex].value);
		scrollToIndex(nextIndex);
	};

	return (
		<div
			ref={listRef}
			className={styles.wheelColumn}
			role="listbox"
			aria-label={ariaLabel}
			aria-activedescendant={`${idPrefix}-${String(value)}`}
			tabIndex={0}
			onScroll={handleScroll}
			onKeyDown={handleKeyDown}
		>
			<div
				className={styles.wheelSpacer}
				style={{ height: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2) }}
				aria-hidden="true"
			/>
			{options.map((option, index) => {
				const distance = Math.abs(index - selectedIndex);

				return (
					<button
						id={`${idPrefix}-${String(option.value)}`}
						key={String(option.value)}
						type="button"
						role="option"
						aria-selected={option.value === value}
						className={styles.wheelItem}
						data-distance={Math.min(distance, 3)}
						onClick={() => {
							onChange(option.value);
							scrollToIndex(index);
						}}
					>
						{option.label}
					</button>
				);
			})}
			<div
				className={styles.wheelSpacer}
				style={{ height: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2) }}
				aria-hidden="true"
			/>
		</div>
	);
}

export function TimeWheel({
	value,
	onChange,
	minuteStep = 1,
	ariaLabel = "시간",
}: TimeWheelProps) {
	const safeMinuteStep =
		Number.isInteger(minuteStep) && minuteStep > 0 && minuteStep <= 30
			? minuteStep
			: 1;
	const { meridiem, hour12, minute } = parseTime(value);
	const lastMinute = Math.floor(59 / safeMinuteStep) * safeMinuteStep;
	const minuteValue = Math.min(
		lastMinute,
		Math.round(minute / safeMinuteStep) * safeMinuteStep,
	);

	const meridiemOptions: WheelOption<Meridiem>[] = [
		{ value: "AM", label: "오전" },
		{ value: "PM", label: "오후" },
	];
	const hourOptions = useMemo(
		() =>
			Array.from({ length: 12 }, (_, index) => ({
				value: index + 1,
				label: String(index + 1),
			})),
		[],
	);
	const minuteOptions = useMemo(
		() =>
			Array.from(
				{ length: Math.floor(59 / safeMinuteStep) + 1 },
				(_, index) => {
					const optionMinute = index * safeMinuteStep;
					return { value: optionMinute, label: pad(optionMinute) };
				},
			),
		[safeMinuteStep],
	);

	const update = (
		nextMeridiem = meridiem,
		nextHour = hour12,
		nextMinute = minuteValue,
	) => onChange(toTimeValue(nextMeridiem, nextHour, nextMinute));

	return (
		<fieldset
			className={styles.timeWheel}
			aria-label={ariaLabel}
			style={
				{
					"--item-height": `${ITEM_HEIGHT}px`,
					"--visible-items": VISIBLE_ITEMS,
				} as CSSProperties
			}
		>
			<div className={styles.selectionBand} aria-hidden="true" />
			<WheelColumn
				ariaLabel={`${ariaLabel} 오전 오후`}
				options={meridiemOptions}
				value={meridiem}
				onChange={(next) => update(next)}
			/>
			<WheelColumn
				ariaLabel={`${ariaLabel} 시`}
				options={hourOptions}
				value={hour12}
				onChange={(next) => update(meridiem, next)}
			/>
			<WheelColumn
				ariaLabel={`${ariaLabel} 분`}
				options={minuteOptions}
				value={minuteValue}
				onChange={(next) => update(meridiem, hour12, next)}
			/>
		</fieldset>
	);
}

export function TimeRangePicker({
	startTime,
	endTime,
	onChange,
	minuteStep = 1,
	className,
}: TimeRangePickerProps) {
	const isInvalid = timeToMinutes(endTime) <= timeToMinutes(startTime);

	return (
		<section
			className={[styles.rangePicker, className].filter(Boolean).join(" ")}
			aria-label="수업 시간 설정"
		>
			<div className={styles.pickerSection}>
				<div className={styles.sectionHeader}>
					<span className={styles.sectionLabel}>시작 시간</span>
					<output className={styles.timeOutput}>{startTime}</output>
				</div>
				<TimeWheel
					value={startTime}
					minuteStep={minuteStep}
					ariaLabel="수업 시작 시간"
					onChange={(nextStartTime) =>
						onChange({ startTime: nextStartTime, endTime })
					}
				/>
			</div>

			<div className={styles.divider} aria-hidden="true">
				<span>→</span>
			</div>

			<div className={styles.pickerSection}>
				<div className={styles.sectionHeader}>
					<span className={styles.sectionLabel}>종료 시간</span>
					<output className={styles.timeOutput}>{endTime}</output>
				</div>
				<TimeWheel
					value={endTime}
					minuteStep={minuteStep}
					ariaLabel="수업 종료 시간"
					onChange={(nextEndTime) =>
						onChange({ startTime, endTime: nextEndTime })
					}
				/>
			</div>

			{isInvalid && (
				<p className={styles.error} role="alert">
					종료 시간은 시작 시간보다 늦어야 합니다.
				</p>
			)}
		</section>
	);
}
