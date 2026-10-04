import { Navigate, useNavigate, useParams } from "react-router-dom";
import PostDetailView from "@/components/feature/board/PostDetailView";
import SidePanel from "@/components/layout/sidePannel/SidePanel";
import { useResizableSidePanel } from "@/components/layout/sidePannel/SidePanelResize";
import BoardHome from "./BoardHome";
import styles from "./PostDetail.module.css";

/**
 * 글 상세. URL(/board/:postId)은 그대로 두고, 행사 상세(EventDetailPage)와 같은 방식으로
 * 데스크톱은 게시판 위에 우측 패널로, 모바일은 화면 전체로 띄운다.
 */
const PostDetail = () => {
	const { postId } = useParams();
	const navigate = useNavigate();
	const { isMobile } = useResizableSidePanel();
	const id = Number(postId);

	if (!Number.isSafeInteger(id) || id <= 0) {
		return <Navigate to="/board" replace />;
	}

	return (
		<main className={styles.page}>
			{!isMobile && <BoardHome />}
			<SidePanel label="게시글">
				{/* 글이 바뀌면 key로 다시 마운트해 정렬·답글 상태와 스크롤을 초기화한다 */}
				<PostDetailView
					key={id}
					postId={id}
					onClose={() =>
						window.history.length > 1 ? navigate(-1) : navigate("/board")
					}
				/>
			</SidePanel>
		</main>
	);
};

export default PostDetail;
