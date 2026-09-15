/** 아바타 배경색. 작성자 키 해시로 고정 배정해 같은 사람은 늘 같은 색. */
const AVATAR_COLORS = [
	{ bg: "#ede7f6", fg: "#7e57c2" },
	{ bg: "#fce4ec", fg: "#ec407a" },
	{ bg: "#e3f2fd", fg: "#42a5f5" },
	{ bg: "#e8f5e9", fg: "#66bb6a" },
	{ bg: "#fff3e0", fg: "#ffa726" },
];

/** 익명은 색으로도 구분되지 않도록 회색 하나로 통일한다. */
const ANON_COLOR = { bg: "#f0f0f0", fg: "#9a9a9a" };

export const avatarColor = (authorKey: string, isAnonymous: boolean) => {
	if (isAnonymous) return ANON_COLOR;
	let hash = 0;
	for (const ch of authorKey) hash = (hash + ch.charCodeAt(0)) % 997;
	return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};
