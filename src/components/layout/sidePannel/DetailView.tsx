import { useEvents } from "@contexts/EventContext";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./DetailView.module.css";
import {
	FaAnglesRight,
	FaLocationDot,
	FaTriangleExclamation,
} from "react-icons/fa6";
import type { CalendarEvent, EventDetail } from "@types";
import parse from "html-react-parser";
import { sanitizeDetail } from "@/util/sanitizeDetail";
import { useUserData } from "@/contexts/UserDataContext";
import { useDetail } from "@/contexts/DetailContext";
import { useAuth } from "@/contexts/AuthProvider";
import DetailMemo from "./DetailMemo";
import Modal, { ErrorModal } from "../../ui/Modal";
import Loading from "../../ui/Loading";
import calendarEventMapper from "@/util/calendar/calendarEventMapper";
import EventDate from "../../feature/eventDate/EventDate";
import { CategoryChip, DdayChip } from "../../feature/eventChip/EventChip";
import BugReportModal from "@/components/feature/bugReport/BugReportModal";

const DetailView = ({ eventId }: { eventId: number }) => {
	const [event, setEvent] = useState<EventDetail>();
	const [calendarEvent, setCalendarEvent] = useState<CalendarEvent | null>(
		event ? calendarEventMapper(event, "day") : null,
	);
	const { toggleBookmark } = useUserData();
	const { fetchEventById, detailError, isLoadingDetail, clearError } =
		useEvents();
	const { closeDetail } = useDetail();
	const { user } = useAuth();
	const navigate = useNavigate();

	// for scrolling to top on re-render
	const scrollRef = useRef<HTMLDivElement>(null);

	const [isMemoExpanded, setIsMemoExpanded] = useState<boolean>(false);
	const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
	const [isBugReportModalOpen, setIsBugReportModalOpen] = useState(false);
	const memoWrapperRef = useRef<HTMLDivElement>(null);

	// detect outside clicks - expand memo
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (!memoWrapperRef.current) return;

			const isInside = memoWrapperRef.current.contains(event.target as Node);

			if (isInside) {
				setIsMemoExpanded(true);
			} else {
				setIsMemoExpanded(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	// load events
	useEffect(() => {
		const loadEvent = async () => {
			const event = await fetchEventById(eventId);
			setEvent(event ?? undefined);
			if (event) setCalendarEvent(calendarEventMapper(event, "day"));
		};
		loadEvent();
		// scroll to top of component
		if (scrollRef.current) {
			scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
		}
	}, [eventId, fetchEventById]);

	// 디데이 계산할 기준 날짜
	const ddayTargetDate = calendarEvent?.resource.event.applyEnd || null;

	const [isBookmarked, setIsBookmarked] = useState<boolean>(
		!!event?.isBookmarked,
	);

	useEffect(() => {
		if (event) {
			setIsBookmarked(event.isBookmarked ? event.isBookmarked : false);
		}
	}, [event]);

	if (!event) return <Loading />;

	const handleToggleBookmark = async () => {
		if (!user) {
			setIsLoginModalOpen(true);
			return;
		}

		const previousState = isBookmarked;

		// optimistic update
		setIsBookmarked(!previousState);

		try {
			await toggleBookmark(event.id);
		} catch (e) {
			console.error("Failed to toggle bookmark", e);
			setIsBookmarked(previousState);
		}
	};

	return (
		<div className={styles.container} ref={scrollRef}>
			{detailError && (
				<ErrorModal
					content={detailError}
					refresh={() => window.location.reload()}
					onClose={() => clearError("detail")}
				/>
			)}
			{isLoadingDetail && (
				/* Loading spinner */
				<Loading />
			)}
			{isLoginModalOpen && (
				<Modal
					content="로그인 이후 이용해주세요"
					leftText="로그인"
					rightText="닫기"
					onLeftClick={() => navigate("/")}
					onRightClick={() => setIsLoginModalOpen(false)}
					onClose={() => setIsLoginModalOpen(false)}
				/>
			)}
			{isBugReportModalOpen && (
				<BugReportModal onClose={() => setIsBugReportModalOpen(false)} />
			)}
			<button type="button" className={styles.foldBtn} onClick={closeDetail}>
				<FaAnglesRight width={28} height={28} color="rgba(171, 171, 171, 1)" />
			</button>

			<img
				className={styles.thumbnail}
				src={event.imageUrl}
				alt="thumbnail of event"
			/>
			<button
				className={styles.bookmarkBtn}
				type="button"
				data-tour-id="detail-tour-bookmark"
				onClick={handleToggleBookmark}
			>
				<img
					src={
						isBookmarked
							? "/assets/Bookmarked.svg"
							: "/assets/notBookmarked.svg"
					}
					alt={isBookmarked ? "Remove bookmark" : "Add bookmark"}
				/>
			</button>
			<h1 className={styles.title}>{event.title}</h1>
			<EventDate event={event} />
			{event.location && (
				<div className={styles.locationRow}>
					<FaLocationDot color="#555555" />
					<span>{event.location}</span>
				</div>
			)}
			<ul className={styles.chipsList}>
				{ddayTargetDate && <DdayChip as="li" targetDate={ddayTargetDate} />}
				<CategoryChip as="li" categoryId={event.eventTypeId} />
			</ul>
			<span className={styles.orgText}>{event.organization}</span>
			<button
				type="button"
				className={styles.applyBtn}
				onClick={() => window.open(event.applyLink, "_blank")}
			>
				지원 링크로 이동하기
			</button>
			<div className={`${styles.contentText} html-viewer`}>
				<hr style={{ borderWidth: "0.5px" }} />
				{parse(sanitizeDetail(event.detail))}
			</div>

			{/* ----- Memo & Tag Section ----- */}
			{/* biome-ignore lint/a11y/noStaticElementInteractions: memo wrapper handles pointer events to prevent the parent panel's outside-click handler from closing it */}
			<div
				ref={memoWrapperRef}
				data-tour-id="detail-tour-memo"
				onMouseDown={(event) => {
					event.stopPropagation();
					setIsMemoExpanded(true);
				}}
			>
				<DetailMemo
					eventId={eventId}
					isMemoExpanded={isMemoExpanded}
					setIsMemoExpanded={setIsMemoExpanded}
				/>
			</div>
			<button
				type="button"
				className={styles.eventInfoErrorButton}
				onClick={() => setIsBugReportModalOpen(true)}
			>
				<FaTriangleExclamation size={17} />
				행사 정보 오류 제보하기
			</button>
		</div>
	);
};

export default DetailView;
