import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
	FaChevronRight,
	FaHeart,
	FaMagnifyingGlass,
	FaPencil,
	FaRegComment,
	FaRegHeart,
} from "react-icons/fa6";
import Navigationbar from "@/components/layout/Navigationbar";
import BottomNav from "@/components/layout/BottomNav";
import { useBoard } from "@/contexts/BoardContext";
import {
	formatRelative,
	MOCK_EVENT_TITLES,
	MOCK_HOT_EVENTS,
	MOCK_UPCOMING,
	type Post,
} from "@/components/feature/board/boardMock";
import EventSelect from "@/components/feature/board/EventSelect";
import styles from "./BoardHome.module.css";

const PostRow = ({
	post,
	onOpen,
}: {
	post: Post;
	onOpen: (id: number) => void;
}) => (
	<li className={styles.row}>
		<button
			type="button"
			className={styles.rowBtn}
			onClick={() => onOpen(post.id)}
		>
			{post.eventTitle && (
				<span className={styles.event}>{post.eventTitle}</span>
			)}
			<span className={styles.titleCol}>
				<span className={styles.title}>{post.title}</span>
				{post.tags.length > 0 && (
					<span className={styles.tags}>
						{post.tags.map((tag) => (
							<span key={tag} className={styles.tag}>
								#{tag}
							</span>
						))}
					</span>
				)}
			</span>
			<span className={styles.rowMeta}>
				{post.isAnonymous && <span className={styles.anonBadge}>익명</span>}
				<span className={`${styles.stat} ${post.isLiked ? styles.liked : ""}`}>
					{post.isLiked ? <FaHeart size={12} /> : <FaRegHeart size={12} />}
					{post.likeCount}
				</span>
				<span className={styles.stat}>
					<FaRegComment size={12} />
					{post.commentCount}
				</span>
				<span className={styles.time}>{formatRelative(post.createdAt)}</span>
			</span>
		</button>
	</li>
);

const TrendMark = ({ trend }: { trend: "up" | "new" | "flat" }) => {
	if (trend === "up") return <span className={styles.trendUp}>▲</span>;
	if (trend === "new") return <span className={styles.trendNew}>N</span>;
	return null;
};

/**
 * 게시판 피드. 검색 + 인기 글 목록 + 사이드 레일.
 * `/board` 페이지와 모바일 후기 페이지의 "게시판" 탭이 같이 쓴다.
 */
export const BoardFeed = ({ hideRail = false }: { hideRail?: boolean }) => {
	const navigate = useNavigate();
	const location = useLocation();
	const { posts } = useBoard();
	// 글 패널이 이미 열린 채로 다른 글을 누르면 히스토리를 쌓지 않고 바꿔친다 (닫기 = 뒤로 한 번)
	const isPostOpen = /^\/board\/\d+$/.test(location.pathname);
	const [query, setQuery] = useState("");
	// 검색어와 별개로 "이 행사 글만" 좁혀 보는 필터 (피드백: 행사별 검색)
	const [eventFilter, setEventFilter] = useState<number | null>(null);

	const keyword = query.trim();
	const byEvent = eventFilter
		? posts.filter((p) => p.eventId === eventFilter)
		: posts;
	const filtered = keyword
		? byEvent.filter(
				(p) =>
					p.title.includes(keyword) ||
					p.content.includes(keyword) ||
					p.tags.some((t) => t.includes(keyword)) ||
					(p.eventTitle?.includes(keyword) ?? false),
			)
		: byEvent;

	const eventName = eventFilter ? MOCK_EVENT_TITLES[eventFilter] : null;
	const listTitle = keyword
		? `'${keyword}' 검색 결과`
		: eventName
			? `'${eventName}' 글`
			: "인기 글";

	return (
		<div className={`${styles.layout} ${hideRail ? styles.noRail : ""}`}>
			<div className={styles.mainCol}>
				<div className={styles.searchWrap}>
					<FaMagnifyingGlass className={styles.searchIcon} size={17} />
					<input
						className={styles.searchInput}
						value={query}
						placeholder="행사나 궁금한 내용을 검색해보세요!"
						onChange={(e) => setQuery(e.currentTarget.value)}
					/>
				</div>

				<div className={styles.filterRow}>
					<span className={styles.filterLabel}>행사</span>
					<div className={styles.filterSelect}>
						<EventSelect
							value={eventFilter}
							onChange={setEventFilter}
							placeholder="행사로 좁혀보기"
							emptyLabel="전체 행사"
						/>
					</div>
				</div>

				<div className={styles.listHeader}>
					<h2 className={styles.listTitle}>{listTitle}</h2>
					<button
						type="button"
						className={styles.writeBtn}
						onClick={() => navigate("/board/write")}
					>
						<FaPencil size={13} />
						글쓰기
					</button>
				</div>

				{filtered.length > 0 ? (
					<ul className={styles.list}>
						{filtered.map((post) => (
							<PostRow
								key={post.id}
								post={post}
								onOpen={(id) =>
									navigate(`/board/${id}`, { replace: isPostOpen })
								}
							/>
						))}
					</ul>
				) : (
					<p className={styles.empty}>검색 결과가 없어요.</p>
				)}
			</div>

			{!hideRail && (
				<aside className={styles.rail}>
					<section className={styles.railSection}>
						<h3 className={styles.railTitle}>다가오는 행사</h3>
						<ol className={styles.railList}>
							{MOCK_UPCOMING.map((e, i) => (
								<li key={e.id} className={styles.railRow}>
									<span className={styles.rank}>{i + 1}</span>
									<span className={styles.railName}>{e.title}</span>
									<span className={styles.dday}>D-{e.dday}</span>
								</li>
							))}
						</ol>
						<p className={styles.railCaption}>신청 마감이 가까운 행사 순</p>
					</section>

					<section className={styles.railSection}>
						<h3 className={styles.railTitle}>이야기 많은 행사</h3>
						<ol className={styles.railList}>
							{MOCK_HOT_EVENTS.map((e, i) => (
								<li key={e.id} className={styles.railRow}>
									<span className={styles.rank}>{i + 1}</span>
									<span className={styles.railName}>{e.title}</span>
									<TrendMark trend={e.trend} />
									<span className={styles.postCount}>글 {e.postCount}</span>
								</li>
							))}
						</ol>
						<p className={styles.railCaption}>
							북마크와 신청 수를 함께 반영한 순위
						</p>
					</section>

					<button
						type="button"
						className={styles.railLink}
						onClick={() => navigate("/main")}
					>
						캘린더에서 전체 행사 보기
						<FaChevronRight size={12} />
					</button>
				</aside>
			)}
		</div>
	);
};

const BoardHome = () => (
	<div className={styles.page}>
		<Navigationbar />
		<div className={styles.scroll}>
			<BoardFeed />
		</div>
		<BottomNav />
	</div>
);

export default BoardHome;
