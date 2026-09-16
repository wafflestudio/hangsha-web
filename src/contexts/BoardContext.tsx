import { createContext, useContext, type ReactNode } from "react";
import { useMockBoard } from "@/components/feature/board/boardMock";

/**
 * 게시판 프로토타입 상태를 화면 간에 공유한다.
 * 목업이라 새로고침하면 초기화된다. 백엔드 연동 시 이 Provider 내부만 교체한다.
 */
type BoardValue = ReturnType<typeof useMockBoard>;

const BoardContext = createContext<BoardValue | null>(null);

export const BoardProvider = ({ children }: { children: ReactNode }) => {
	const value = useMockBoard();
	return (
		<BoardContext.Provider value={value}>{children}</BoardContext.Provider>
	);
};

export const useBoard = (): BoardValue => {
	const ctx = useContext(BoardContext);
	if (!ctx) throw new Error("useBoard must be used within BoardProvider");
	return ctx;
};
