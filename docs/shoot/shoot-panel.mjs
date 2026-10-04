import { chromium, devices } from "playwright";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * 게시글 · 후기 → 우측 사이드 패널 촬영.
 * 실행: yarn dev 띄운 뒤 `node docs/shoot/shoot-panel.mjs` (playwright 필요)
 */
const BASE = "http://localhost:5173";
const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const OUT = join(ROOT, "review_pic", "사이드패널");
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

/** 로그인 상태를 서버 건드리지 않고 브라우저 안에서만 흉내낸다. 행사 데이터는 dev API 실데이터. */
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

const settle = (page, ms = 1200) => page.waitForTimeout(ms);

async function shoot(page, kind, name) {
	await page.screenshot({ path: join(OUT, kind, `${name}.png`) });
	console.log(`  ✓ ${kind}/${name}.png   ${page.url().replace(BASE, "")}`);
}

/** URL 검증 — 패널이 "진짜" 라우트/쿼리로 열렸는지 확인한다. 틀리면 종료 코드 1. */
let failures = 0;
function expectUrl(page, pattern, what) {
	const path = page.url().replace(BASE, "");
	const ok = pattern.test(path);
	console.log(`  ${ok ? "PASS" : "FAIL"} ${what}: ${path}`);
	if (!ok) failures += 1;
}
async function expectVisible(locator, what) {
	const ok = await locator.isVisible().catch(() => false);
	console.log(`  ${ok ? "PASS" : "FAIL"} ${what}`);
	if (!ok) failures += 1;
}

const postPanel = (page) => page.getByRole("complementary", { name: "게시글" });
const eventPanel = (page) =>
	page.getByRole("complementary", { name: "행사 상세" });

async function run(browser, kind) {
	console.log(`\n=== ${kind} ===`);
	const context = await newContext(browser, kind);
	const page = await context.newPage();

	// ---------- 게시판 → 글 패널 ----------
	await page.goto(`${BASE}/board`, { waitUntil: "networkidle" });
	await settle(page, 1600);
	await shoot(page, kind, "01-board-home");

	await page.getByRole("button", { name: /39기 멘티로 해봤는데/ }).click();
	await settle(page, 1000);
	expectUrl(page, /^\/board\/1$/, "글 클릭 → /board/1");
	await expectVisible(postPanel(page), "글 패널(aside) 표시");
	await shoot(page, kind, "02-post-panel");

	if (kind === "desktop") {
		// 패널이 열린 채로 뒤쪽 목록의 다른 글을 누르면 내용만 바뀐다 (히스토리는 replace)
		await page.getByRole("button", { name: /플로깅 준비물/ }).click();
		await settle(page, 900);
		expectUrl(page, /^\/board\/4$/, "뒤쪽 목록 다른 글 → /board/4");
		await shoot(page, kind, "03-post-panel-switch");

		// 패널 안에서 댓글까지 스크롤
		const panel = postPanel(page);
		await panel
			.locator("textarea")
			.evaluate((el) => el.scrollIntoView({ block: "center" }));
		await settle(page, 500);
		await shoot(page, kind, "04-post-panel-comments");
	}

	await page.getByRole("button", { name: "글 닫기" }).click();
	await settle(page, 900);
	expectUrl(page, /^\/board$/, "글 닫기 → /board");
	await shoot(page, kind, "05-post-panel-closed");

	// ---------- 내 후기 → 행사 패널 ----------
	await page.goto(`${BASE}/review`, { waitUntil: "networkidle" });
	await settle(page, 1600);
	await shoot(page, kind, "06-my-reviews");

	// 첫 후기 카드의 행사명 버튼 (내 후기 목업: 768 동문창업네트워크, 841 플로깅)
	await page
		.locator("li")
		.filter({ hasText: "동문창업네트워크" })
		.first()
		.getByRole("button")
		.first()
		.click();
	await settle(page, 400);
	expectUrl(page, /^\/review\?event=768$/, "후기의 행사 클릭 → /review?event=768");
	await eventPanel(page)
		.getByText("지원 링크로 이동하기")
		.waitFor({ timeout: 15000 })
		.catch(() => console.log("  (행사 상세 로딩 대기 초과)"));
	await settle(page, 800);
	await expectVisible(eventPanel(page), "행사 패널(aside) 표시");
	await shoot(page, kind, "07-review-event-panel");

	if (kind === "desktop") {
		// 패널 안 후기 섹션까지 스크롤
		const panel = eventPanel(page);
		await panel
			.getByText("이 행사에 대해서 얘기하기")
			.evaluate((el) => el.scrollIntoView({ block: "center" }))
			.catch(() => {});
		await settle(page, 500);
		await shoot(page, kind, "08-review-event-panel-scrolled");
	}

	// 접기(») — 행사 패널 맨 위 첫 버튼
	await eventPanel(page).getByRole("button").first().click();
	await settle(page, 900);
	expectUrl(page, /^\/review$/, "행사 패널 닫기 → /review");
	await shoot(page, kind, "09-review-panel-closed");

	await context.close();
}

const browser = await chromium.launch();
await run(browser, "desktop");
await run(browser, "mobile");
await browser.close();
console.log(`\ndone -> ${OUT}  (${failures} failure${failures === 1 ? "" : "s"})`);
process.exit(failures ? 1 : 0);
