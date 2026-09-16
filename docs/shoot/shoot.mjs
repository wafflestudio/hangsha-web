import { chromium, devices } from "playwright";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const BASE = "http://localhost:5173";
const OUT = "/Users/byunmingyu/Desktop/와플/hangsha-web/review_pic";
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

/** 로그인 상태를 서버 건드리지 않고 브라우저 안에서만 흉내낸다. */
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
		r.fulfill({
			json: {
				items: [
					{
						priority: 1,
						category: { id: 3, groupId: 3, name: "교육(특강/세미나)" },
					},
					{ priority: 2, category: { id: 7, groupId: 2, name: "학생처" } },
				],
			},
		}),
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
	await locator.evaluate((el) =>
		el.scrollIntoView({ block: "center", behavior: "instant" }),
	).catch(() => {});
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
	const section = page.getByTestId("event-reviews");

	// --- 1. 상세 패널: 후기 섹션 ---
	await page.goto(`${BASE}/events/809`, {
		waitUntil: "networkidle",
	});
	await settle(page, 2500);
	await section.scrollIntoViewIfNeeded();
	await settle(page, 500);
	await shoot(page, kind, "01-detail-reviews");
	await crop(section, kind, "02-review-section");

	// --- 2. 후기 작성 폼 (익명 체크박스) ---
	await safeClick(page.getByRole("button", { name: "후기 달기" }));
	await settle(page, 700);
	await section.scrollIntoViewIfNeeded();
	await crop(section, kind, "03-composer-open");

	await safeClick(page.getByRole("button", { name: "4점" }));
	await page
		.locator("textarea")
		.first()
		.fill(
			"멘토님이 같은 과 선배셔서 수강 계획까지 물어볼 수 있었어요. 한 학기에 네 번은 짧게 느껴질 만큼 알찼습니다.",
		);
	await settle(page, 300);
	await crop(section, kind, "04-composer-filled");

	await safeClick(page.getByText("익명으로 남기기"));
	await settle(page, 300);
	await crop(section, kind, "05-composer-anonymous");

	await safeClick(page.getByRole("button", { name: "후기 등록" }));
	await settle(page, 900);
	await section.scrollIntoViewIfNeeded();
	await crop(section, kind, "06-submitted-anonymous");

	// --- 3. 댓글 펼치기 (입력창이 목록 위 · 익명 번호 · 작성자 배지) ---
	await page
		.getByRole("button", { name: /^댓글 \d+$/ })
		.nth(1)
		.click();
	await settle(page, 700);
	await section.scrollIntoViewIfNeeded();
	await crop(section, kind, "07-comments-open");

	// --- 4. 댓글 달기 (익명 체크) — 대댓글은 없다 ---
	const commentBox = page.getByPlaceholder("이 후기에 댓글 남기기").first();
	await commentBox.fill("저도 같은 게 궁금했어요. 답변 감사합니다!");
	const form = commentBox.locator("xpath=..");
	await form.locator('input[type="checkbox"]').check();
	await settle(page, 300);
	await crop(section, kind, "08-comment-anonymous");

	await form.getByRole("button", { name: "등록" }).click();
	await settle(page, 900);
	await section.scrollIntoViewIfNeeded();
	await crop(section, kind, "09-comment-submitted");

	// --- 5. 후기 없는 행사 ---
	await page.goto(`${BASE}/events/800`, {
		waitUntil: "networkidle",
	});
	await settle(page, 2500);
	if (await section.count()) {
		await section.scrollIntoViewIfNeeded();
		await settle(page, 400);
		await crop(section, kind, "10-review-empty");
	}

	// --- 6. 내 후기 목록 (익명/공개 배지) ---
	await page.goto(`${BASE}/review`, { waitUntil: "networkidle" });
	await settle(page, 1800);
	await shoot(page, kind, "11-my-reviews");

	// --- 7. 마이페이지 "후기 보기" 위젯 ---
	await page.goto(`${BASE}/my`, { waitUntil: "networkidle" });
	await settle(page, 2000);
	const widgetHeader = page.getByText("후기 보기", { exact: true }).first();
	if (await widgetHeader.count()) {
		await widgetHeader.evaluate((el) =>
			el.scrollIntoView({ block: "center", behavior: "instant" }),
		);
		await settle(page, 600);
		await shoot(page, kind, "12-mypage-widget");
	}

	// --- 8. 구 /memo 리다이렉트 ---
	await page.goto(`${BASE}/memo`, { waitUntil: "networkidle" });
	await settle(page, 1500);
	console.log(`  /memo -> ${new URL(page.url()).pathname}`);

	// --- 9. 하단 탭 (모바일) ---
	if (kind === "mobile") {
		await page.goto(`${BASE}/main`, { waitUntil: "networkidle" });
		await settle(page, 2200);
		await shoot(page, kind, "13-bottom-nav");
	}

	await context.close();
}

const browser = await chromium.launch();
await run(browser, "desktop");
await run(browser, "mobile");
await browser.close();
console.log("\ndone ->", OUT);
