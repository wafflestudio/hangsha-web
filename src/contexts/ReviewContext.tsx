import { createContext, useContext, type ReactNode } from "react";
import { useMockReviews } from "@/components/feature/review/reviewMock";

/**
 * 후기 프로토타입 상태를 화면 간에 공유한다.
 * 목업이라 새로고침하면 초기화된다. 백엔드 연동 시 이 Provider 내부만 교체한다.
 */
type ReviewValue = ReturnType<typeof useMockReviews>;

const ReviewContext = createContext<ReviewValue | null>(null);

export const ReviewProvider = ({ children }: { children: ReactNode }) => {
	const value = useMockReviews();
	return (
		<ReviewContext.Provider value={value}>{children}</ReviewContext.Provider>
	);
};

export const useReviews = (): ReviewValue => {
	const ctx = useContext(ReviewContext);
	if (!ctx) throw new Error("useReviews must be used within ReviewProvider");
	return ctx;
};
