import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navigationbar from "@/components/layout/Navigationbar";
import BottomNav from "@/components/layout/BottomNav";
import { useBoard } from "@/contexts/BoardContext";
import { MOCK_EVENT_TITLES } from "@/components/feature/board/boardMock";
import EventSelect from "@/components/feature/board/EventSelect";
import styles from "./PostWrite.module.css";

const MIN_CONTENT = 10;

const PostWrite = () => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const { addPost } = useBoard();

	// ?eventId=768 이면 그 행사를 미리 고른 상태로 연다. 행사 상세의
	// "이 행사에 대해서 얘기하기"가 이 경로로 들어온다. 열고 나서 바꿀 수 있다.
	const eventIdParam = searchParams.get("eventId");
	const [eventId, setEventId] = useState<number | null>(
		eventIdParam ? Number(eventIdParam) : null,
	);
	const eventTitle = eventId ? (MOCK_EVENT_TITLES[eventId] ?? null) : null;

	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [tagInput, setTagInput] = useState("");
	const [isAnonymous, setIsAnonymous] = useState(false);

	const canSubmit =
		title.trim().length > 0 && content.trim().length >= MIN_CONTENT;

	const handleSubmit = () => {
		if (!canSubmit) return;
		const tags = tagInput
			.split(",")
			.map((t) => t.trim().replace(/^#/, ""))
			.filter(Boolean);
		const id = addPost(
			{ title, content, tags, isAnonymous },
			eventId,
			eventTitle,
		);
		navigate(`/board/${id}`, { replace: true });
	};

	return (
		<div className={styles.page}>
			<Navigationbar />
			<div className={styles.scroll}>
				<div className={styles.form}>
					<h1 className={styles.heading}>글쓰기</h1>

					<span className={styles.label}>행사 선택</span>
					<EventSelect value={eventId} onChange={setEventId} />
					<span className={styles.hint}>
						행사를 고르면 그 행사 게시판에 올라갑니다. 고르지 않아도 됩니다.
					</span>

					<span className={styles.label}>제목</span>
					<input
						className={styles.titleInput}
						value={title}
						placeholder="제목을 입력하세요"
						onChange={(e) => setTitle(e.currentTarget.value)}
					/>

					<span className={styles.label}>내용</span>
					<textarea
						className={styles.contentInput}
						value={content}
						placeholder="다녀온 후기, 신청 전 궁금한 점, 팀원 모집까지 자유롭게 남겨주세요."
						onChange={(e) => setContent(e.currentTarget.value)}
					/>
					<span className={styles.hint}>
						{MIN_CONTENT}자 이상 입력해주세요. (현재 {content.trim().length}자)
					</span>

					<span className={styles.label}>태그</span>
					<input
						className={styles.titleInput}
						value={tagInput}
						placeholder="#태그 (쉼표로 구분)"
						onChange={(e) => setTagInput(e.currentTarget.value)}
					/>

					<div className={styles.footer}>
						<label className={styles.anonToggle}>
							<input
								type="checkbox"
								checked={isAnonymous}
								onChange={(e) => setIsAnonymous(e.currentTarget.checked)}
							/>
							<span>익명으로 작성</span>
						</label>
						<button
							type="button"
							className={styles.cancelBtn}
							onClick={() => navigate(-1)}
						>
							취소
						</button>
						<button
							type="button"
							className={styles.submitBtn}
							disabled={!canSubmit}
							onClick={handleSubmit}
						>
							등록
						</button>
					</div>
					<span className={styles.visibilityNote}>
						{isAnonymous ? "익명으로 공개됩니다." : "내 이름으로 공개됩니다."}
					</span>
				</div>
			</div>
			<BottomNav />
		</div>
	);
};

export default PostWrite;
