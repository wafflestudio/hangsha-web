import DOMPurify from "isomorphic-dompurify";

// 모듈 로드 시 1회만 등록
// DOMPurify는 기본 설정에서 target="_blank" 를 제거하므로 href가 살아있는 <a>에 한해 새 탭 + 안전한 rel을 다시 붙여준다.
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
	if (node.tagName === "A" && node.getAttribute("href")) {
		node.setAttribute("target", "_blank");
		node.setAttribute("rel", "noopener noreferrer");
	}
});

/** 크롤링한 행사 상세 HTML 정제 */
export const sanitizeDetail = (html: string): string =>
	DOMPurify.sanitize(html, { ADD_ATTR: ["target"] });
