import { useCallback, useState } from "react";

/**
 * 프런트 레벨 프로토타입용 게시판 모델.
 * 백엔드에 게시판 API가 없어 화면/인터랙션만 먼저 검증한다.
 * 연동 시 이 파일의 훅만 교체하면 된다.
 *
 * 후기(`feature/review`)와는 별개 기능이다. 후기는 행사 상세 패널에 붙고,
 * 게시판은 행사와 무관한 글까지 받는 자유 게시판이다.
 */

export interface Comment {
	id: number;
	postId: number;
	/** null이면 최상위 댓글, 값이 있으면 대댓글. 깊이는 1단으로 제한한다. */
	parentId: number | null;
	author: string;
	isAnonymous: boolean;
	/** 글 작성자가 단 댓글이면 '작성자' 배지를 붙인다. */
	isPostAuthor: boolean;
	isMine: boolean;
	content: string;
	createdAt: Date;
	likeCount: number;
	isLiked: boolean;
}

export interface Post {
	id: number;
	/** 행사에 붙은 글이면 행사 id, 행사와 무관한 글이면 null. */
	eventId: number | null;
	eventTitle: string | null;
	title: string;
	content: string;
	author: string;
	isAnonymous: boolean;
	isMine: boolean;
	tags: string[];
	createdAt: Date;
	likeCount: number;
	isLiked: boolean;
	commentCount: number;
}

interface PostDraft {
	title: string;
	content: string;
	tags: string[];
	isAnonymous: boolean;
}

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const ago = (ms: number) => new Date(Date.now() - ms);

/**
 * 목업 글이 붙는 행사. dev 서버의 실제 행사 id를 사용해
 * 캘린더에서 그 행사를 열면 게시판에 글이 보이도록 맞춰뒀다.
 */
export const MOCK_EVENT_TITLES: Record<number, string> = {
	809: "캠퍼스 멘토링 프로그램(CMP) 40기(2026학년도 2학기) 멘티",
	768: "2026 서울대학교 동문창업네트워크(SAEN) 개최 안내",
	841: "샤로수길 플로깅 with 중앙환경동아리 씨알",
};

const SEED_POSTS: Post[] = [
	{
		id: 1,
		eventId: 809,
		eventTitle: MOCK_EVENT_TITLES[809],
		title: "39기 멘티로 해봤는데 후기 남겨요",
		content:
			"멘토님이 같은 과 선배셔서 수강 계획이랑 인턴 얘기까지 다 물어볼 수 있었어요.\n한 학기에 4번 만나는 게 최소인데 저희는 카톡으로도 계속 얘기했습니다.\n신청할 때 희망 분야를 구체적으로 쓰면 매칭이 잘 되는 것 같아요.",
		author: "감자밭관리인",
		isAnonymous: false,
		isMine: false,
		tags: ["멘토링", "선배매칭"],
		createdAt: ago(2 * HOUR),
		likeCount: 12,
		isLiked: false,
		commentCount: 3,
	},
	{
		id: 2,
		eventId: 768,
		eventTitle: MOCK_EVENT_TITLES[768],
		title: "같이 갈 사람 있나요? 팀 3명 구해요",
		content:
			"창업 아이템 얘기 들어보고 싶어서 가려는데 혼자 가기 좀 그래서요.\n캠퍼스 생활 관련 아이디어 생각 중인데 관심 있으면 댓글 주세요!",
		author: "익명",
		isAnonymous: true,
		isMine: false,
		tags: ["팀빌딩"],
		createdAt: ago(5 * HOUR),
		likeCount: 3,
		isLiked: true,
		commentCount: 5,
	},
	{
		id: 3,
		eventId: null,
		eventTitle: null,
		title: "비교과 뭐부터 신청하는 게 좋아요?",
		content:
			"1학년인데 비교과 프로그램이 너무 많아서 뭐부터 해야 할지 모르겠어요.\n다들 처음에 뭐 들으셨나요?",
		author: "서울대붕어빵",
		isAnonymous: false,
		isMine: false,
		tags: ["비교과", "새내기"],
		createdAt: ago(9 * HOUR),
		likeCount: 7,
		isLiked: false,
		commentCount: 4,
	},
	{
		id: 4,
		eventId: 841,
		eventTitle: MOCK_EVENT_TITLES[841],
		title: "플로깅 준비물 뭐 챙겨가야 하나요?",
		content: "봉투랑 집게는 주는 건가요? 장갑만 챙기면 될지 궁금해서요.",
		author: "익명",
		isAnonymous: true,
		isMine: false,
		tags: ["준비물"],
		createdAt: ago(1 * DAY),
		likeCount: 1,
		isLiked: false,
		commentCount: 2,
	},
	{
		id: 5,
		eventId: 809,
		eventTitle: MOCK_EVENT_TITLES[809],
		title: "멘토 매칭 결과는 언제 나와요?",
		content:
			"신청은 지난주에 했는데 아직 연락이 없어서요. 보통 얼마나 걸리나요?",
		author: "나",
		isAnonymous: false,
		isMine: true,
		tags: ["신청문의"],
		createdAt: ago(30 * MINUTE),
		likeCount: 0,
		isLiked: false,
		commentCount: 0,
	},
	{
		id: 6,
		eventId: 841,
		eventTitle: MOCK_EVENT_TITLES[841],
		title: "작년에 갔다가 비 와서 취소됐어요",
		content:
			"작년엔 우천으로 당일 취소됐는데 공지가 늦게 떠서 헛걸음했어요. 이번엔 미리 확인하고 가시는 게 좋겠습니다.",
		author: "익명",
		isAnonymous: true,
		isMine: true,
		tags: ["우천취소"],
		createdAt: ago(2 * DAY),
		likeCount: 8,
		isLiked: false,
		commentCount: 1,
	},
];

const SEED_COMMENTS: Comment[] = [
	{
		id: 1,
		postId: 1,
		parentId: null,
		author: "서울대붕어빵",
		isAnonymous: false,
		isPostAuthor: false,
		isMine: false,
		content: "41기도 열리나요? 이번에 놓쳐서요",
		createdAt: ago(2 * HOUR),
		likeCount: 2,
		isLiked: false,
	},
	{
		id: 2,
		postId: 1,
		parentId: 1,
		author: "감자밭관리인",
		isAnonymous: false,
		isPostAuthor: true,
		isMine: false,
		content: "매 학기 열려서 다음 학기에 또 모집할 거예요",
		createdAt: ago(1 * HOUR),
		likeCount: 5,
		isLiked: true,
	},
	{
		id: 3,
		postId: 1,
		parentId: null,
		author: "익명",
		isAnonymous: true,
		isPostAuthor: false,
		isMine: false,
		content:
			"멘토는 같은 과에서만 배정되나요? 다른 과 선배도 가능한지 궁금해요",
		createdAt: ago(40 * MINUTE),
		likeCount: 0,
		isLiked: false,
	},
	{
		id: 4,
		postId: 3,
		parentId: null,
		author: "나",
		isAnonymous: false,
		isPostAuthor: false,
		isMine: true,
		content:
			"저는 멘토링부터 시작했어요. 부담 적고 학교 생활 전반을 물어볼 수 있어서 첫 비교과로 괜찮았습니다.",
		createdAt: ago(3 * HOUR),
		likeCount: 3,
		isLiked: false,
	},
];

let nextPostId = 100;
let nextCommentId = 100;

export const useMockBoard = () => {
	const [posts, setPosts] = useState<Post[]>(SEED_POSTS);
	const [comments, setComments] = useState<Comment[]>(SEED_COMMENTS);

	const addPost = useCallback(
		(draft: PostDraft, eventId: number | null, eventTitle: string | null) => {
			nextPostId += 1;
			setPosts((prev) => [
				{
					id: nextPostId,
					eventId,
					eventTitle,
					title: draft.title.trim(),
					content: draft.content.trim(),
					author: draft.isAnonymous ? "익명" : "나",
					isAnonymous: draft.isAnonymous,
					isMine: true,
					tags: draft.tags,
					createdAt: new Date(),
					likeCount: 0,
					isLiked: false,
					commentCount: 0,
				},
				...prev,
			]);
			return nextPostId;
		},
		[],
	);

	const togglePostLike = useCallback((id: number) => {
		setPosts((prev) =>
			prev.map((p) =>
				p.id === id
					? {
							...p,
							isLiked: !p.isLiked,
							likeCount: p.likeCount + (p.isLiked ? -1 : 1),
						}
					: p,
			),
		);
	}, []);

	const removePost = useCallback((id: number) => {
		setPosts((prev) => prev.filter((p) => p.id !== id));
		setComments((prev) => prev.filter((c) => c.postId !== id));
	}, []);

	const addComment = useCallback(
		(postId: number, content: string, parentId: number | null) => {
			nextCommentId += 1;
			setComments((prev) => [
				...prev,
				{
					id: nextCommentId,
					postId,
					parentId,
					author: "나",
					isAnonymous: false,
					isPostAuthor: false,
					isMine: true,
					content: content.trim(),
					createdAt: new Date(),
					likeCount: 0,
					isLiked: false,
				},
			]);
			setPosts((prev) =>
				prev.map((p) =>
					p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p,
				),
			);
		},
		[],
	);

	const toggleCommentLike = useCallback((id: number) => {
		setComments((prev) =>
			prev.map((c) =>
				c.id === id
					? {
							...c,
							isLiked: !c.isLiked,
							likeCount: c.likeCount + (c.isLiked ? -1 : 1),
						}
					: c,
			),
		);
	}, []);

	return {
		posts,
		comments,
		addPost,
		removePost,
		togglePostLike,
		addComment,
		toggleCommentLike,
	};
};

export const formatRelative = (date: Date): string => {
	const diff = Date.now() - date.getTime();
	const minutes = Math.floor(diff / MINUTE);
	if (minutes < 1) return "방금 전";
	if (minutes < 60) return `${minutes}분 전`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}시간 전`;
	const days = Math.floor(hours / 24);
	if (days < 7) return `${days}일 전`;
	return `${date.getMonth() + 1}.${date.getDate()}`;
};

interface UpcomingEvent {
	id: number;
	title: string;
	dday: number;
}

/** events.apply_end 기준 마감 임박순. 연동 시 서버 쿼리로 교체. */
export const MOCK_UPCOMING: UpcomingEvent[] = [
	{ id: 2, title: "제12회 CALS 창업경진대회", dday: 3 },
	{ id: 6, title: "제12회 휴먼튜브 영상 공모전", dday: 5 },
	{ id: 3, title: "SQLD X ADsP 자격증 특강", dday: 8 },
	{ id: 7, title: "2026 서울대학교 동문창업인의 밤", dday: 12 },
	{ id: 8, title: "글로벌사회공헌단 5~6차 파견", dday: 19 },
];

interface HotEvent {
	id: number;
	title: string;
	postCount: number;
	trend: "up" | "new" | "flat";
}

/** bookmarks + apply_count 기반 인기 행사. 글이 0건일 때도 순위가 나온다. */
export const MOCK_HOT_EVENTS: HotEvent[] = [
	{
		id: 1,
		title: "2026 여름 데이터 분석 부트캠프",
		postCount: 14,
		trend: "up",
	},
	{ id: 2, title: "제12회 CALS 창업경진대회", postCount: 9, trend: "new" },
	{ id: 3, title: "SQLD X ADsP 자격증 특강", postCount: 6, trend: "flat" },
	{ id: 9, title: "Physical AI Forum 2026", postCount: 4, trend: "new" },
	{ id: 10, title: "학관밥 대선생 24기 모집", postCount: 2, trend: "up" },
];
