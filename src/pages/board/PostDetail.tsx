import { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
	FaArrowRightArrowLeft,
	FaChevronRight,
	FaHeart,
	FaRegComment,
	FaRegHeart,
} from "react-icons/fa6";
import Navigationbar from "@/components/layout/Navigationbar";
import BottomNav from "@/components/layout/BottomNav";
import DetailView from "@/components/layout/sidePannel/DetailView";
import SidePanel from "@/components/layout/sidePannel/SidePanel";
import { useBoard } from "@/contexts/BoardContext";
import {
	formatRelative,
	type Comment,
} from "@/components/feature/board/boardMock";
import styles from "./PostDetail.module.css";

type SortMode = "top" | "new";

const CommentForm = ({
	placeholder,
	onSubmit,
	onCancel,
}: {
	placeholder: string;
	onSubmit: (content: string) => void;
	onCancel?: () => void;
}) => {
	const [content, setContent] = useState("");

	return (
		<div className={styles.commentForm}>
			<textarea
				className={styles.commentInput}
				value={content}
				placeholder={placeholder}
				onChange={(e) => setContent(e.currentTarget.value)}
			/>
			<div className={styles.commentFormActions}>
				{onCancel && (
					<button type="button" className={styles.textBtn} onClick={onCancel}>
						취소
					</button>
				)}
				<button
					type="button"
					className={styles.commentSubmit}
					disabled={!content.trim()}
					onClick={() => {
						if (!content.trim()) return;
						onSubmit(content);
						setContent("");
					}}
				>
					등록
				</button>
			</div>
		</div>
	);
};

const CommentRow = ({
	comment,
	isReply,
	onReply,
	onToggleLike,
}: {
	comment: Comment;
	isReply: boolean;
	onReply?: () => void;
	onToggleLike: (id: number) => void;
}) => (
	<div className={`${styles.comment} ${isReply ? styles.reply : ""}`}>
		<div className={styles.commentHead}>
			<span className={styles.commentAuthor}>{comment.author}</span>
			{comment.isPostAuthor && (
				<span className={styles.authorBadge}>작성자</span>
			)}
			<span className={styles.commentTime}>
				{formatRelative(comment.createdAt)}
			</span>
		</div>
		<p className={styles.commentBody}>{comment.content}</p>
		<div className={styles.commentActions}>
			<button
				type="button"
				className={`${styles.miniStat} ${comment.isLiked ? styles.liked : ""}`}
				onClick={() => onToggleLike(comment.id)}
				aria-pressed={comment.isLiked}
				aria-label={`좋아요 ${comment.likeCount}개`}
			>
				{comment.isLiked ? <FaHeart size={12} /> : <FaRegHeart size={12} />}
				{comment.likeCount}
			</button>
			{onReply && (
				<button type="button" className={styles.textBtn} onClick={onReply}>
					답글
				</button>
			)}
		</div>
	</div>
);

const PostDetail = () => {
	const { postId } = useParams();
	const navigate = useNavigate();
	const { posts, comments, togglePostLike, addComment, toggleCommentLike } =
		useBoard();

	const [sort, setSort] = useState<SortMode>("top");
	const [replyingTo, setReplyingTo] = useState<number | null>(null);
	const [copied, setCopied] = useState(false);

	// 글에 걸린 행사를 누르면 페이지를 떠나지 않고 우측 패널로 띄운다 (?event=ID).
	// URL에 담아 두므로 새로고침·공유해도 같은 패널이 열린다.
	const [searchParams, setSearchParams] = useSearchParams();
	const openEventId = Number(searchParams.get("event"));
	const hasOpenEvent = Number.isSafeInteger(openEventId) && openEventId > 0;
	const openEvent = (eventId: number) =>
		setSearchParams((prev) => {
			const next = new URLSearchParams(prev);
			next.set("event", String(eventId));
			return next;
		});
	const closeEvent = () =>
		setSearchParams(
			(prev) => {
				const next = new URLSearchParams(prev);
				next.delete("event");
				return next;
			},
			{ replace: true },
		);

	const id = Number(postId);
	const post = posts.find((p) => p.id === id);

	const thread = useMemo(
		() => comments.filter((c) => c.postId === id),
		[comments, id],
	);

	const roots = useMemo(() => {
		const list = thread.filter((c) => c.parentId === null);
		return sort === "top"
			? [...list].sort((a, b) => b.likeCount - a.likeCount)
			: [...list].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
	}, [thread, sort]);

	if (!post) {
		return (
			<div className={styles.page}>
				<Navigationbar />
				<div className={styles.scroll}>
					<div className={styles.article}>
						<p className={styles.notFound}>글을 찾을 수 없어요.</p>
						<button
							type="button"
							className={styles.textBtn}
							onClick={() => navigate("/board")}
						>
							게시판으로 돌아가기
						</button>
					</div>
				</div>
				<BottomNav />
			</div>
		);
	}

	const handleCopy = () => {
		navigator.clipboard?.writeText(window.location.href).catch(() => {});
		setCopied(true);
		window.setTimeout(() => setCopied(false), 1500);
	};

	return (
		<div className={styles.page}>
			<Navigationbar />
			<div className={styles.scroll}>
				<article className={styles.article}>
					<nav className={styles.breadcrumb}>
						<button
							type="button"
							className={styles.crumb}
							onClick={() => navigate("/board")}
						>
							게시판
						</button>
					</nav>

					<h1 className={styles.postTitle}>{post.title}</h1>

					{post.eventTitle && post.eventId !== null && (
						<button
							type="button"
							className={styles.eventBtn}
							onClick={() => openEvent(post.eventId as number)}
						>
							<span className={styles.eventBtnText}>{post.eventTitle}</span>
							<FaChevronRight size={11} />
						</button>
					)}
					<div className={styles.postMeta}>
						<span className={styles.postAuthor}>{post.author}</span>
						<span className={styles.dot}>·</span>
						<span>{formatRelative(post.createdAt)}</span>
					</div>

					<div className={styles.postBody}>{post.content}</div>

					{post.tags.length > 0 && (
						<ul className={styles.tagRow}>
							{post.tags.map((tag) => (
								<li key={tag} className={styles.tag}>
									#{tag}
								</li>
							))}
						</ul>
					)}

					<div className={styles.actionBar}>
						<button
							type="button"
							className={`${styles.pill} ${post.isLiked ? styles.pillOn : ""}`}
							onClick={() => togglePostLike(post.id)}
							aria-pressed={post.isLiked}
						>
							{post.isLiked ? <FaHeart size={14} /> : <FaRegHeart size={14} />}
							좋아요 {post.likeCount}
						</button>
						<button type="button" className={styles.pill} disabled>
							<FaRegComment size={14} />
							댓글 {post.commentCount}
						</button>
						<button
							type="button"
							className={`${styles.pill} ${styles.copyBtn}`}
							onClick={handleCopy}
						>
							{copied ? "복사됨" : "URL 복사"}
						</button>
					</div>

					<hr className={styles.divider} />

					<div className={styles.commentsHeader}>
						<h2 className={styles.commentsTitle}>댓글 {thread.length}</h2>
						<button
							type="button"
							className={styles.sortBtn}
							onClick={() => setSort((s) => (s === "top" ? "new" : "top"))}
						>
							{sort === "top" ? "추천순" : "최신순"}
							<FaArrowRightArrowLeft size={11} className={styles.sortIcon} />
						</button>
					</div>

					<CommentForm
						placeholder="댓글을 남겨주세요."
						onSubmit={(content) => addComment(post.id, content, null)}
					/>

					<div className={styles.commentList}>
						{roots.map((root) => (
							<div key={root.id} className={styles.commentGroup}>
								<CommentRow
									comment={root}
									isReply={false}
									onReply={() =>
										setReplyingTo((cur) => (cur === root.id ? null : root.id))
									}
									onToggleLike={toggleCommentLike}
								/>
								{thread
									.filter((c) => c.parentId === root.id)
									.map((child) => (
										<CommentRow
											key={child.id}
											comment={child}
											isReply
											onToggleLike={toggleCommentLike}
										/>
									))}
								{replyingTo === root.id && (
									<div className={styles.replyForm}>
										<CommentForm
											placeholder={`${root.author}님에게 답글 남기기`}
											onCancel={() => setReplyingTo(null)}
											onSubmit={(content) => {
												addComment(post.id, content, root.id);
												setReplyingTo(null);
											}}
										/>
									</div>
								)}
							</div>
						))}
						{roots.length === 0 && (
							<p className={styles.noComments}>첫 댓글을 남겨보세요.</p>
						)}
					</div>
				</article>
			</div>
			{hasOpenEvent && (
				<SidePanel label="행사 상세">
					<DetailView eventId={openEventId} onClose={closeEvent} />
				</SidePanel>
			)}
			<BottomNav />
		</div>
	);
};

export default PostDetail;
