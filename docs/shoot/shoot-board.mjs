import { chromium, devices } from "playwright";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const BASE = "http://localhost:5173";
const OUT = "/Users/byunmingyu/Desktop/와플/hangsha-web/review_pic/게시판";
for (const k of ["desktop", "mobile"]) {
	rmSync(join(OUT, k), { recursive: true, force: true });
	mkdirSync(join(OUT, k), { recursive: true });
}

const MOCK_USER = {
	id: 1,
	username: "행샤테스터",
	email: "tester@hangsha.dev",
	profileImageUrl: "",
};

async function stubAuth(context) {
	await context.route("**/api/v1/auth/refresh", (r) =>
		r.fulfill({ json: { accessToken: "mock-access-token" } }),
	);
	await context.route("**/api/v1/auth/session", (r) =>
		r.fulfill({ status: 204, body: "" }),
	);
	await context.route("**/api/v1/users/me", (r) =>
		r.fulfill({ json: MOCK_USER }),
	);
	await context.route("**/api/v1/users/me/excluded-keywords", (r) =>
		r.fulfill({ json: { items: [] } }),
	);
	await context.route("**/api/v1/users/me/bookmarks*", (r) =>
		r.fulfill({ json: { items: [] } }),
	);
	await context.route("**/api/v1/users/me/interest-categories", (r) =>
		r.fulfill({ json: { items: [] } }),
	);
	await context.route("**/api/v1/memos*", (r) =>
		r.fulfill({ json: { items: [] } }),
	);
}

const SEEN_TUTORIALS = JSON.stringify({
	"main-route-tutorial": true,
	"mobile-main-route-tutorial": true,
	"detail-view-actions-tutorial": true,
	"week-view-events-tutorial": true,
	"day-view-mode-tutorial": true,
	"side-panel-resize-tutorial": true,
});

async function newContext(browser, kind) {
	const context = await browser.newContext(
		kind === "mobile"
			? { ...devices["iPhone 14 Pro"] }
			: { viewport: { width: 1440, height: 950 }, deviceScaleFactor: 2 },
	);
	await context.addInitScript((state) => {
		localStorage.setItem("tutorialState", state);
		localStorage.setItem("accessToken", "mock-access-token");
	}, SEEN_TUTORIALS);
	await stubAuth(context);
	return context;
}

const settle = (page, ms = 1400) => page.waitForTimeout(ms);

async function shoot(page, kind, name) {
	await page.screenshot({ path: join(OUT, kind, `${name}.png`) });
	console.log(`  ✓ ${kind}/${name}.png`);
}
async function safeClick(locator) {
	await locator.scrollIntoViewIfNeeded().catch(() => {});
	await locator
		.evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }))
		.catch(() => {});
	await locator.click({ force: true });
}
async function crop(locator, kind, name) {
	await locator.screenshot({ path: join(OUT, kind, `${name}.png`) });
	console.log(`  ✓ ${kind}/${name}.png`);
}

async function run(browser, kind) {
	console.log(`\n=== ${kind} ===`);
	const context = await newContext(browser, kind);
	const page = await context.newPage();

	if (kind === "desktop") {
		// --- 좌측 사이드바의 "자유게시판" 탭 ---
		await page.goto(`${BASE}/main`, { waitUntil: "networkidle" });
		await settle(page, 2500);
		await shoot(page, kind, "01-sidebar-tab");
		const sidebar = page.getByText("자유게시판", { exact: true }).first();
		if (await sidebar.count()) {
			await sidebar.evaluate((el) =>
				el.scrollIntoView({ block: "center", behavior: "instant" }),
			);
			await settle(page, 400);
			await shoot(page, kind, "02-sidebar-tab-scrolled");
			await sidebar.click();
			await settle(page, 1800);
		} else {
			await page.goto(`${BASE}/board`, { waitUntil: "networkidle" });
			await settle(page, 1800);
		}
	} else {
		// --- 모바일: 후기 모아보기의 후기/게시판 토글 ---
		await page.goto(`${BASE}/review`, { waitUntil: "networkidle" });
		await settle(page, 2000);
		await shoot(page, kind, "01-toggle-review");
		await safeClick(page.getByRole("tab", { name: "게시판" }));
		await settle(page, 900);
		await shoot(page, kind, "02-toggle-board");
		await page.goto(`${BASE}/board`, { waitUntil: "networkidle" });
		await settle(page, 1800);
	}

	// --- 게시판 홈 (원본 15) ---
	await shoot(page, kind, "03-board-home");

	// --- 검색 (원본 16) ---
	await page.getByPlaceholder("행사나 궁금한 내용을 검색해보세요!").fill("멘토");
	await settle(page, 700);
	await shoot(page, kind, "04-board-search");
	await page.getByPlaceholder("행사나 궁금한 내용을 검색해보세요!").fill("");
	await settle(page, 500);

	// --- 글 상세 (원본 17) ---
	await page.goto(`${BASE}/board/1`, { waitUntil: "networkidle" });
	await settle(page, 1600);
	await shoot(page, kind, "05-post-detail");

	const article = page.locator("article").first();
	await crop(article, kind, "06-post-detail-full");

	// --- 댓글 등록 (원본 18) ---
	await page.getByPlaceholder("댓글을 남겨주세요.").fill(
		"저도 40기 신청했는데 매칭 기다리는 중이에요. 후기 도움 됐습니다!",
	);
	await settle(page, 400);
	await shoot(page, kind, "07-comment-typing");
	await safeClick(page.getByRole("button", { name: "등록", exact: true }).first());
	await settle(page, 900);
	await crop(article, kind, "08-comment-added");

	// --- 대댓글 (게시판은 1단 대댓글 유지) ---
	await safeClick(page.getByRole("button", { name: "답글", exact: true }).first());
	await settle(page, 600);
	await crop(article, kind, "09-reply-form");

	// --- 글쓰기: 행사 게시판 고정 (원본 19) ---
	await page.goto(`${BASE}/board/write?eventId=768`, {
		waitUntil: "networkidle",
	});
	await settle(page, 1500);
	await shoot(page, kind, "10-post-write-event");

	await page.getByPlaceholder("제목을 입력하세요").fill("같이 갈 사람 구해요");
	await page
		.getByPlaceholder(/자유롭게 남겨주세요/)
		.fill(
			"창업 아이템 얘기 들어보고 싶어서 가려는데 혼자 가기 좀 그래서요. 관심 있으면 댓글 주세요!",
		);
	await page.getByPlaceholder("#태그 (쉼표로 구분)").fill("팀빌딩, 창업");
	await safeClick(page.getByText("익명으로 작성"));
	await settle(page, 400);
	await shoot(page, kind, "11-post-write-filled");

	// --- 글쓰기: 주제 채널 선택 ---
	await page.goto(`${BASE}/board/write`, { waitUntil: "networkidle" });
	await settle(page, 1500);
	await shoot(page, kind, "12-post-write-channel");

	await context.close();
}

const browser = await chromium.launch();
await run(browser, "desktop");
await run(browser, "mobile");
await browser.close();
console.log("\ndone ->", OUT);
