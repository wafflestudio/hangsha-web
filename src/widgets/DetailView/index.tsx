import { useEvents } from "@contexts/EventContext";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "@styles/DetailView.module.css";
import { getDDay } from "../../util/Calendar/getDday";
import { CATEGORY_COLORS, CATEGORY_LIST } from "@constants";
import { FaAnglesRight } from "react-icons/fa6";
import type { CalendarEvent, EventDetail } from "@types";
import DOMPurify from "isomorphic-dompurify";
import parse from "html-react-parser";
import { useUserData } from "@/contexts/UserDataContext";
import { useDetail } from "@/contexts/DetailContext";
import { useAuth } from "@/contexts/AuthProvider";
import DetailMemo from "./DetailMemo";
import Modal, { ErrorModal } from "../Modal";
import Loading from "../Loading";
import calendarEventMapper from "@/util/Calendar/calendarEventMapper";
import EventDate from "../EventDate";

const DetailView = ({ eventId }: { eventId: number }) => {
	const [event, setEvent] = useState<EventDetail>();
	const [calendarEvent, setCalendarEvent] = useState<CalendarEvent | null>(
		event ? calendarEventMapper(event, "day") : null,
	);
	const { toggleBookmark } = useUserData();
	const { fetchEventById, detailError, isLoadingDetail, clearError } =
		useEvents();
	const { setShowDetail } = useDetail();
	const { user } = useAuth();
	const navigate = useNavigate();

	// for scrolling to top on re-render
	const scrollRef = useRef<HTMLDivElement>(null);

	const [isMemoExpanded, setIsMemoExpanded] = useState<boolean>(false);
	const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
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
	const ddayTargetDate = calendarEvent?.resource.isPeriodEvent
		? calendarEvent.end
		: calendarEvent?.start;
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
			await toggleBookmark(event);
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
			<button
				type="button"
				className={styles.foldBtn}
				onClick={() => setShowDetail(false)}
			>
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
			<ul className={styles.chipsList}>
				<li className={styles.deadlineChip}>{getDDay(ddayTargetDate)}</li>
				<li
					className={styles.categoryChip}
					style={{
						backgroundColor: CATEGORY_COLORS[event.eventTypeId],
					}}
				>
					{CATEGORY_LIST[event.eventTypeId]}
				</li>
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
				{parse(DOMPurify.sanitize(event.detail))}
			</div>

			{/* ----- Memo & Tag Section ----- */}
			<div ref={memoWrapperRef}>
				<DetailMemo
					eventId={eventId}
					isMemoExpanded={isMemoExpanded}
					setIsMemoExpanded={setIsMemoExpanded}
				/>
			</div>
		</div>
	);
};

export default DetailView;
