import { useUserData } from "@/contexts/UserDataContext";
import { useAuth } from "@/contexts/AuthProvider";
import styles from "@styles/Memo.module.css";
import type { Memo } from "@/util/types";
import { formatDateDotParsed } from "@/util/Calendar/dateFormatter";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import Navigationbar from "@/widgets/Navigationbar";
import { useNavigate } from "react-router-dom";
import MemoPageCard from "./MemoPageCard";
import { useEffect, useRef, useState } from "react";
import Modal from "@/widgets/Modal";
import Loading from "@/widgets/Loading";
import BottomNav from "@/widgets/BottomNav";
import { useDetail } from "@/contexts/DetailContext";
import DetailView from "@/widgets/DetailView";
import {
	SidePanelResizeHandle,
	useResizableSidePanel,
} from "@/widgets/SidePanelResize";

const MemoWidgetCard = ({ memo }: { memo: Memo }) => {
	return (
		<div className={styles.cardWrapper}>
			<span className={styles.memoContent}>{memo.content}</span>
			<span className={styles.memoTitle}>{memo.eventTitle}</span>
			<span className={styles.memoDate}>
				{formatDateDotParsed(memo.createdAt)}
			</span>
			<ul className={styles.chips}>
				{memo.tags.map((t) => (
					<li key={t.id} className={styles.chip}>
						{t.name}
					</li>
				))}
			</ul>
		</div>
	);
};

export const MemoWidget = () => {
	const { eventMemos } = useUserData();
	const navigate = useNavigate();
	return (
		<div className={styles.memosContainer}>
			<div className={styles.memosHeader}>
				<div className={styles.memosLeft}>
					<span>내 메모 목록</span>
					<img src="/assets/pencil.svg" alt="pencil icon" />
				</div>
				<FaChevronRight
					className={styles.backBtn}
					color="ABABAB"
					size={18}
					onClick={() => navigate("/memo")}
				/>
			</div>
			<div className={styles.cardsRow}>
				{eventMemos.map((m: Memo) => (
					<MemoWidgetCard key={m.id} memo={m} />
				))}
			</div>
			{(!eventMemos || eventMemos.length === 0) && (
				<span
					className={styles.noneText}
				>{`아직 메모가 없습니다.\n다녀온 행사나 관심있는 행사에 대한 메모를 작성해보세요!`}</span>
			)}
		</div>
	);
};

const MemoPage = () => {
	const { eventMemos, deleteMemo, memoLoading } = useUserData();
	const [deletingMemoId, setDeletingMemoId] = useState<number | null>(null);
	const { user } = useAuth();
	const navigate = useNavigate();
	const { showDetail, setShowDetail, clickedEventId } = useDetail();
	const { isMobile, handleResizeStart, sidePanelStyle } =
		useResizableSidePanel();

	const sidePanelRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (!sidePanelRef.current) return;
			const isInside = sidePanelRef.current.contains(event.target as Node);
			if (!isInside) {
				setShowDetail(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [setShowDetail]);

	const handleDelete = async () => {
		if (deletingMemoId) await deleteMemo(deletingMemoId);
		setDeletingMemoId(null);
	};
	if (memoLoading) return <Loading />;
	if (!user) {
		return (
			<div className={styles.notFound}>
				<Navigationbar />
				<Modal
					content={"메모 이용을 위해서는\n로그인이 필요해요."}
					leftText="로그인 ·회원가입 페이지로 이동"
					onLeftClick={() => navigate("/")}
					onClose={null}
				/>
				<BottomNav />
			</div>
		);
	}

	return (
		<div className={styles.main}>
			<div className={styles.memosPage}>
				<Navigationbar />
				<div className={styles.memosHeader}>
					<FaChevronLeft
						className={styles.backBtn}
						color="ABABAB"
						size={18}
						onClick={() =>
							window.history.length > 1 ? navigate(-1) : navigate("/my")
						}
					/>
					<div className={styles.row}>
						<span>내 메모 목록</span>
						<img src="/assets/pencil.svg" alt="pencil icon" />
					</div>
				</div>
				<div className={styles.cardsColumn}>
					{eventMemos.map((m: Memo) => (
						<MemoPageCard memo={m} onDelete={setDeletingMemoId} key={m.id} />
					))}
				</div>
				{(!eventMemos || eventMemos.length === 0) && (
					<span
						className={styles.noneText}
					>{`아직 메모가 없습니다.\n다녀온 행사나 관심있는 행사에 대한 메모를 작성해보세요!`}</span>
				)}
			</div>
			{deletingMemoId && (
				<Modal
					content="메모를 정말로 삭제하시겠습니까?"
					leftText="삭제"
					onLeftClick={handleDelete}
					rightText="취소"
					onRightClick={() => setDeletingMemoId(null)}
					onClose={() => setDeletingMemoId(null)}
				/>
			)}
			{showDetail && clickedEventId !== undefined && (
				<div
					className={styles.sidePanel}
					ref={sidePanelRef}
					style={sidePanelStyle}
				>
					{!isMobile && (
						<SidePanelResizeHandle onMouseDown={handleResizeStart} />
					)}
					<DetailView eventId={clickedEventId} />
				</div>
			)}
			<BottomNav />
		</div>
	);
};

export default MemoPage;
