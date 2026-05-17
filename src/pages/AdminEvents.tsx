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
import styles from "@/styles/AdminEvents.module.css";

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

		["tags", "태그 (쉼표 구분)", "text"],
	];

	return (
		<div className={styles.page}>
			<div className={styles.inner}>
				<h1 className={styles.pageTitle}>행샤 어드민</h1>

				<div className={styles.layout}>
					{/* ── 왼쪽 패널 ── */}
					<div className={styles.leftPanel}>
						{/* 행사 관리 */}
						<div className={styles.card}>
							<p className={styles.cardTitle}>행사 관리</p>
							<div className={styles.idBar}>
								<input
									className={styles.idInput}
									value={eventId}
									onChange={(e) => setEventId(e.currentTarget.value)}
									placeholder="행사 ID"
								/>

								<button
									type="button"
									className={`${styles.btn} ${styles.btnPrimary}`}
									onClick={handleLoad}
									disabled={isLoading}
								>
									불러오기
								</button>

								<button
									type="button"
									className={`${styles.btn} ${styles.btnPrimary}`}
									onClick={handlePatch}
									disabled={isLoading}
								>
									수정
								</button>

								<button
									type="button"
									className={`${styles.btn} ${styles.btnPrimary}`}
									onClick={handleCreate}
									disabled={isLoading}
								>
									신규 생성
								</button>

								<div className={styles.divider} />

								<button
									type="button"
									className={`${styles.btn} ${styles.btnDanger}`}
									onClick={handleDelete}
									disabled={isLoading}
								>
									단건 삭제
								</button>

								<button
									type="button"
									className={`${styles.btn} ${styles.btnDanger}`}
									onClick={handleDeleteAll}
									disabled={isLoading}
								>
									전체 삭제
								</button>
							</div>
						</div>

						{/* 피드백 메시지 */}
						{message && <p className={styles.message}>{message}</p>}

						{/* JSON 파일 Sync */}
						<div className={styles.card}>
							<p className={styles.cardTitle}>JSON 파일 Sync</p>
							<div className={styles.fileRow}>
								<label className={styles.fileLabel}>
									파일 선택
									<input
										type="file"
										accept=".json,application/json"
										className={styles.fileInput}
										onChange={(e) => {
											setSelectedFile(e.currentTarget.files?.[0] ?? null);
										}}
									/>
								</label>

								<span className={styles.fileName}>
									{selectedFile ? selectedFile.name : "선택된 파일 없음"}
								</span>

								<button
									type="button"
									className={`${styles.btn} ${styles.btnSecondary}`}
									onClick={handleSyncFile}
									disabled={isLoading}
								>
									업로드
								</button>
							</div>
						</div>

						{/* adminOverriddenFields lock/unlock */}
						<div className={`${styles.card} ${styles.cardGrow}`}>
							<p className={styles.cardTitle}>Override Fields</p>

							<div className={styles.overrideMeta}>
								<span className={styles.overrideMetaLabel}>현재 lock</span>
								{overrideFields.length > 0 ? (
									overrideFields.map((f) => (
										<span key={f} className={styles.lockedBadge}>
											{f}
										</span>
									))
								) : (
									<span className={styles.overrideMetaLabel}>없음</span>
								)}
							</div>

							<div className={styles.checkboxGrid}>
								{OVERRIDABLE_FIELDS.map(({ key, label }) => {
									const checked = selectedOverrideFields.includes(key);
									return (
										<label
											key={key}
											className={`${styles.checkboxLabel} ${checked ? styles.checkboxLabelChecked : ""}`}
										>
											<input
												type="checkbox"
												className={styles.checkboxNative}
												checked={checked}
												onChange={() => toggleOverrideField(key)}
											/>
											{label}
											<span className={styles.checkboxKey}>({key})</span>
										</label>
									);
								})}
							</div>

							<div className={styles.overrideActions}>
								<button
									type="button"
									className={`${styles.btn} ${styles.btnLock}`}
									onClick={() => handleUpdateOverrides("lock")}
									disabled={isLoading}
								>
									선택 필드 lock
								</button>

								<button
									type="button"
									className={`${styles.btn} ${styles.btnSecondary}`}
									onClick={() => handleUpdateOverrides("unlock")}
									disabled={isLoading}
								>
									선택 필드 unlock
								</button>
							</div>
						</div>
					</div>

					{/* ── 오른쪽 패널 ── */}
					<div className={styles.rightPanel}>
						<div className={styles.formCard}>
							<p className={styles.cardTitle}>행사 데이터</p>
							<div className={styles.formGrid}>
								{fields.map(([key, label, type]) => (
									<div key={key} className={styles.formField}>
										<label className={styles.formLabel}>{label}</label>
										<input
											type={type}
											className={styles.formInput}
											value={form[key]}
											onChange={(e) => updateForm(key, e.currentTarget.value)}
										/>
									</div>
								))}

								<div className={`${styles.formField} ${styles.formFieldFull}`}>
									<label className={styles.formLabel}>상세 HTML</label>
									<textarea
										className={styles.formTextarea}
										value={form.mainContentHtml}
										onChange={(e) => updateForm("mainContentHtml", e.currentTarget.value)}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
