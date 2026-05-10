import {
	createAdminEvent,
	deleteAdminEvent,
	deleteAllAdminEvents,
	getAdminEvent,
	patchAdminEvent,
	syncAdminEventsFile,
	updateAdminEventOverrides,
	type AdminEventCreateRequest,
	type AdminEventPatchRequest,
} from "@/api/adminEvent";
import { useState } from "react";

const EMPTY_FORM = {
	title: "",
	imageUrl: "",
	operationMode: "",

	statusId: "",
	eventTypeId: "",
	orgId: "",

	applyStart: "",
	applyEnd: "",
	eventStart: "",
	eventEnd: "",

	capacity: "",
	applyCount: "",

	organization: "",
	location: "",
	applyLink: "",

	tags: "",
	mainContentHtml: "",
};

const OVERRIDABLE_FIELDS: { key: keyof AdminEventForm; label: string }[] = [
	{ key: "title", label: "제목" },
	{ key: "imageUrl", label: "이미지 URL" },
	{ key: "operationMode", label: "운영 방식" },
	{ key: "statusId", label: "모집 상태 ID" },
	{ key: "eventTypeId", label: "행사 유형 ID" },
	{ key: "orgId", label: "기관 ID" },
	{ key: "applyStart", label: "신청 시작" },
	{ key: "applyEnd", label: "신청 종료" },
	{ key: "eventStart", label: "행사 시작" },
	{ key: "eventEnd", label: "행사 종료" },
	{ key: "capacity", label: "정원" },
	{ key: "applyCount", label: "신청자 수" },
	{ key: "organization", label: "기관명" },
	{ key: "location", label: "장소" },
	{ key: "tags", label: "태그" },
	{ key: "mainContentHtml", label: "상세 HTML" },
];

type AdminEventForm = typeof EMPTY_FORM;

function toNullableString(value: string): string | null {
	const trimmed = value.trim();
	return trimmed.length === 0 ? null : trimmed;
}

function toNullableNumber(value: string): number | null {
	const trimmed = value.trim();
	if (trimmed.length === 0) return null;

	const parsed = Number(trimmed);
	return Number.isFinite(parsed) ? parsed : null;
}

function toDateTime(value: string): string | null {
	const trimmed = value.trim();
	return trimmed.length === 0 ? null : trimmed;
}

function toDateTimeInputValue(value?: string | null): string {
	if (!value) return "";
	return value.slice(0, 16);
}

function toTags(value: string): string[] {
	return value
		.split(",")
		.map((tag) => tag.trim())
		.filter((tag) => tag.length > 0);
}

function buildEventRequest(form: AdminEventForm): AdminEventPatchRequest {
	return {
		title: toNullableString(form.title),
		imageUrl: toNullableString(form.imageUrl),
		operationMode: toNullableString(form.operationMode),
		statusId: toNullableNumber(form.statusId),
		eventTypeId: toNullableNumber(form.eventTypeId),
		orgId: toNullableNumber(form.orgId),
		applyStart: toNullableString(form.applyStart),
		applyEnd: toNullableString(form.applyEnd),
		eventStart: toNullableString(form.eventStart),
		eventEnd: toNullableString(form.eventEnd),
		capacity: toNullableNumber(form.capacity),
		applyCount: toNullableNumber(form.applyCount),
		applyLink: toNullableString(form.applyLink),
		organization: toNullableString(form.organization),
		location: toNullableString(form.location),
		tags: toTags(form.tags),
		mainContentHtml: toNullableString(form.mainContentHtml),
	};
}

function buildCreateRequest(form: AdminEventForm): AdminEventCreateRequest | null {
	const title = form.title.trim();

	if (title.length === 0) return null;

	return {
		...buildEventRequest(form),
		title,
	};
}

export default function AdminEventsPage() {
	const [eventId, setEventId] = useState("");
	const [form, setForm] = useState<AdminEventForm>(EMPTY_FORM);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [message, setMessage] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [overrideFields, setOverrideFields] = useState<string[]>([]);
	const [selectedOverrideFields, setSelectedOverrideFields] = useState<string[]>([]);

	const updateForm = (key: keyof AdminEventForm, value: string) => {
		setForm((prev) => ({ ...prev, [key]: value }));
	};

	const toggleOverrideField = (field: string) => {
		setSelectedOverrideFields((prev) =>
			prev.includes(field)
				? prev.filter((item) => item !== field)
				: [...prev, field],
		);
	};

	const getNumericEventId = (): number | null => {
		const parsed = Number(eventId);
		return Number.isFinite(parsed) ? parsed : null;
	};

	const handleLoad = async () => {
		const id = getNumericEventId();

		if (id === null) {
			setMessage("행사 ID를 숫자로 입력해주세요.");
			return;
		}

		setIsLoading(true);

		try {
			const event = await getAdminEvent(id);

			setForm({
				title: event.title ?? "",
				imageUrl: event.imageUrl ?? "",
				operationMode: event.operationMode ?? "",

				statusId: String(event.statusId ?? ""),
				eventTypeId: String(event.eventTypeId ?? ""),
				orgId: String(event.orgId ?? ""),

				applyStart: toDateTimeInputValue(event.applyStart),
				applyEnd: toDateTimeInputValue(event.applyEnd),
				eventStart: toDateTimeInputValue(event.eventStart),
				eventEnd: toDateTimeInputValue(event.eventEnd),

				capacity: String(event.capacity ?? ""),
				applyCount: String(event.applyCount ?? ""),

				organization: event.organization ?? "",
				location: event.location ?? "",
				applyLink: event.applyLink ?? "",

				tags: event.tags ?? "",
				mainContentHtml: event.detail ?? "",
			});

			setMessage(`${id}번 행사를 불러왔습니다.`);
		} catch {
			setMessage("행사 조회에 실패했습니다.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleCreate = async () => {
		const body = buildCreateRequest(form);

		if (body === null) {
			setMessage("생성할 행사 제목을 입력해주세요.");
			return;
		}

		setIsLoading(true);

		try {
			const result = await createAdminEvent(body);
			const createdEventId = result.eventId;

			if (typeof createdEventId === "number") {
				setEventId(String(createdEventId));
			}

			setMessage(`생성 완료: ${JSON.stringify(result)}`);
		} catch {
			setMessage("생성 요청에 실패했습니다.");
		} finally {
			setIsLoading(false);
		}
	};

	const handlePatch = async () => {
		const id = getNumericEventId();

		if (id === null) {
			setMessage("수정할 행사 ID를 숫자로 입력해주세요.");
			return;
		}

		setIsLoading(true);

		try {
			const result = await patchAdminEvent(id, buildEventRequest(form));
			setMessage(`수정 완료: ${JSON.stringify(result)}`);
			setSelectedOverrideFields([]);
		} catch {
			setMessage("수정 요청에 실패했습니다.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleDelete = async () => {
		const id = getNumericEventId();

		if (id === null) {
			setMessage("삭제할 행사 ID를 숫자로 입력해주세요.");
			return;
		}

		const confirmed = window.confirm(`${id}번 행사를 삭제할까요?`);
		if (!confirmed) return;

		setIsLoading(true);

		try {
			const result = await deleteAdminEvent(id);
			setMessage(`삭제 완료: ${JSON.stringify(result)}`);
		} catch {
			setMessage("삭제 요청에 실패했습니다.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleDeleteAll = async () => {
		const typed = window.prompt(
			"전체 행사를 삭제하려면 DELETE를 정확히 입력해주세요.",
		);

		if (typed !== "DELETE") {
			setMessage("전체 삭제를 취소했습니다.");
			return;
		}

		setIsLoading(true);

		try {
			const result = await deleteAllAdminEvents();
			setMessage(`전체 삭제 완료: ${JSON.stringify(result)}`);
		} catch {
			setMessage("전체 삭제 요청에 실패했습니다.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleUpdateOverrides = async (mode: "lock" | "unlock") => {
		const id = getNumericEventId();

		if (id === null) {
			setMessage("override를 변경할 행사 ID를 숫자로 입력해주세요.");
			return;
		}

		if (selectedOverrideFields.length === 0) {
			setMessage("lock/unlock할 필드를 선택해주세요.");
			return;
		}

		setIsLoading(true);

		try {
			const result = await updateAdminEventOverrides(id, {
				lockFields: mode === "lock" ? selectedOverrideFields : [],
				unlockFields: mode === "unlock" ? selectedOverrideFields : [],
			});

			setOverrideFields(result.adminOverriddenFields);
			setSelectedOverrideFields([]);
			setMessage(
				`override ${mode === "lock" ? "lock" : "unlock"} 완료: ${JSON.stringify(result)}`,
			);
		} catch {
			setMessage("override 변경 요청에 실패했습니다.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleSyncFile = async () => {
		if (!selectedFile) {
			setMessage("업로드할 JSON 파일을 선택해주세요.");
			return;
		}

		setIsLoading(true);

		try {
			const result = await syncAdminEventsFile(selectedFile);
			setMessage(`파일 sync 완료: ${JSON.stringify(result)}`);
		} catch {
			setMessage("파일 sync 요청에 실패했습니다.");
		} finally {
			setIsLoading(false);
		}
	};

	const fields: [keyof AdminEventForm, string, string][] = [
		["title", "제목", "text"],
		["imageUrl", "이미지 URL", "text"],
		["operationMode", "운영 방식", "text"],

		["statusId", "모집 상태 ID", "number"],
		["eventTypeId", "행사 유형 ID", "number"],
		["orgId", "기관 ID", "number"],

		["applyStart", "신청 시작", "datetime-local"],
		["applyEnd", "신청 종료", "datetime-local"],
		["eventStart", "행사 시작", "datetime-local"],
		["eventEnd", "행사 종료", "datetime-local"],

		["capacity", "정원", "number"],
		["applyCount", "신청자 수", "number"],

		["organization", "기관명", "text"],
		["location", "장소", "text"],
		["applyLink", "신청 링크", "text"],

		["tags", "태그, 쉼표 구분", "text"],
	];

	return (
		<main
			style={{
				width: "100vw",
				height: "100dvh",
				overflowY: "auto",
				boxSizing: "border-box",
				maxWidth: 1080,
				margin: "0 auto",
				padding: 24,
			}}
		>
			<h1>행샤 어드민</h1>

			<section style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
				<input
					value={eventId}
					onChange={(e) => setEventId(e.currentTarget.value)}
					placeholder="행사 ID"
				/>

				<button type="button" onClick={handleLoad} disabled={isLoading}>
					불러오기
				</button>

				<button type="button" onClick={handlePatch} disabled={isLoading}>
					수정
				</button>

				<button type="button" onClick={handleDelete} disabled={isLoading}>
					단건 삭제
				</button>

				<button type="button" onClick={handleDeleteAll} disabled={isLoading}>
					전체 삭제
				</button>

				<button type="button" onClick={handleCreate} disabled={isLoading}>
					신규 생성
				</button>
			</section>

			<section style={{ marginTop: 20 }}>
				<h2>JSON 파일 Sync</h2>

				<input
					type="file"
					accept=".json,application/json"
					onChange={(e) => {
						setSelectedFile(e.currentTarget.files?.[0] ?? null);
					}}
				/>

				<button
					type="button"
					onClick={handleSyncFile}
					disabled={isLoading}
					style={{ marginLeft: 8 }}
				>
					sync-file 업로드
				</button>
			</section>

			<section style={{ marginTop: 20 }}>
				<h2>adminOverriddenFields lock/unlock</h2>

				<p style={{ margin: "8px 0" }}>
					마지막 응답 기준 lock: {overrideFields.length > 0 ? overrideFields.join(", ") : "없음"}
				</p>

				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
						gap: 8,
					}}
				>
					{OVERRIDABLE_FIELDS.map(({ key, label }) => (
						<label key={key} style={{ display: "flex", gap: 6 }}>
							<input
								type="checkbox"
								checked={selectedOverrideFields.includes(key)}
								onChange={() => toggleOverrideField(key)}
							/>
							{label} ({key})
						</label>
					))}
				</div>

				<div style={{ display: "flex", gap: 8, marginTop: 12 }}>
					<button
						type="button"
						onClick={() => handleUpdateOverrides("lock")}
						disabled={isLoading}
					>
						선택 필드 lock
					</button>

					<button
						type="button"
						onClick={() => handleUpdateOverrides("unlock")}
						disabled={isLoading}
					>
						선택 필드 unlock
					</button>
				</div>
			</section>

			{message && <p style={{ marginTop: 16 }}>{message}</p>}

			<section
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
					gap: 12,
					marginTop: 20,
				}}
			>
				{fields.map(([key, label, type]) => (
					<label
						key={key}
						style={{ display: "flex", flexDirection: "column", gap: 4 }}
					>
						{label}
						<input
							type={type}
							value={form[key]}
							onChange={(e) => updateForm(key, e.currentTarget.value)}
						/>
					</label>
				))}

				<label
					style={{
						display: "flex",
						flexDirection: "column",
						gap: 4,
						gridColumn: "1 / -1",
					}}
				>
					상세 HTML
					<textarea
						value={form.mainContentHtml}
						onChange={(e) => updateForm("mainContentHtml", e.currentTarget.value)}
						rows={12}
					/>
				</label>
			</section>
		</main>
	);
}