import parse from "html-react-parser";
import { sanitizeDetail } from "@/util/sanitizeDetail";

export const renderHighlight = (html: string) => parse(sanitizeDetail(html));
