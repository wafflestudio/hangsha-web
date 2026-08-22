import {
	createAdminEvent,
	deleteAdminEvent,
	deleteAllAdminEvents,
	getAdminEvent,
	parseAdminEventDraft,
	patchAdminEvent,
	syncAdminEventsFile,
	uploadAdminEventImage,
	updateAdminEventOverrides,
	type AdminEventCreateRequest,
	type AdminEventPatchRequest,
} from "@/api/adminEvent";
import { AdminTokenService } from "@/api/adminTokenService";
import { getEventStatuses, getEventTypes, getOrganizations } from "@/api/event";
import type { Category } from "@/util/types";
import { FiLogOut } from "react-icons/fi";
import { useEffect, useState } from "react";
import styles from "./AdminEvents.module.css";

const EMPTY_FORM = {
	title: "",
	imageUrl: "",

	statusId: "",
	eventTypeId: "",
	orgId: "",

	applyStart: "",
	applyEnd: "",
	eventStart: "",
	eventEnd: "",
	isPeriodEvent: false,

	organization: "",
	location: "",
	applyLink: "",

	mainContentHtml: "",
};

const OVERRIDABLE_FIELDS: { key: keyof AdminEventForm; label: string }[] = [
	{ key: "title", label: "제목" },
	{ key: "imageUrl", label: "이미지 URL" },
	{ key: "statusId", label: "모집 상태 ID" },
	{ key: "eventTypeId", label: "행사 유형" },
	{ key: "orgId", label: "주최 기관" },
	{ key: "applyStart", label: "신청 시작" },
	{ key: "applyEnd", label: "신청 종료" },
	{ key: "eventStart", label: "행사 시작" },
	{ key: "eventEnd", label: "행사 종료" },
	{ key: "isPeriodEvent", label: "모집형 행사" },
	{ key: "location", label: "장소" },
	{ key: "mainContentHtml", label: "상세 HTML" },
];

type AdminEventForm = typeof EMPTY_FORM;
type TextFormField = Exclude<keyof AdminEventForm, "isPeriodEvent">;
type SessionForm = { start: string; end: string; location: string };

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

function buildEventRequest(form: AdminEventForm): AdminEventPatchRequest {
	return {
		title: toNullableString(form.title),
		imageUrl: toNullableString(form.imageUrl),
		statusId: toNullableNumber(form.statusId),
		eventTypeId: toNullableNumber(form.eventTypeId),
		orgId: toNullableNumber(form.orgId),
		applyStart: toNullableString(form.applyStart),
		applyEnd: toNullableString(form.applyEnd),
		eventStart: toNullableString(form.eventStart),
		eventEnd: toNullableString(form.eventEnd),
		isPeriodEvent: form.isPeriodEvent,
		applyLink: toNullableString(form.applyLink),
		organization: toNullableString(form.organization),
		location: toNullableString(form.location),
	mainContentHtml: toNullableString(form.mainContentHtml),
	};
}

function buildCreateRequest(
	form: AdminEventForm,
	sessions: SessionForm[],
): AdminEventCreateRequest | null {
	const title = form.title.trim();

	if (title.length === 0) return null;

	return {
		...buildEventRequest(form),
		title,
		sessions: sessions
			.filter((session) => session.start.trim().length > 0)
			.map((session) => ({
				start: toNullableString(session.start),
				end: toNullableString(session.end),
				location: toNullableString(session.location),
			})),
	};
}

function validateEventPeriods(form: AdminEventForm): string | null {
	const periods = [
		{ label: "신청 기간", start: form.applyStart, end: form.applyEnd },
		{ label: "행사 기간", start: form.eventStart, end: form.eventEnd },
	];

	if (periods.every(({ start, end }) => !start && !end)) {
		return "신청 기간 또는 행사 기간 중 하나는 입력해주세요.";
	}

	for (const { label, start, end } of periods) {
		if (Boolean(start) !== Boolean(end)) {
			return `${label}은 시작과 종료를 모두 입력해주세요.`;
		}
		if (start && end && start > end) {
			return `${label}의 종료는 시작보다 빠를 수 없습니다.`;
		}
	}

	return null;
}

export default function AdminEventsPage() {
	const [eventId, setEventId] = useState("");
	const [form, setForm] = useState<AdminEventForm>(EMPTY_FORM);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [draftText, setDraftText] = useState("");
	const [draftImage, setDraftImage] = useState<File | null>(null);
	const [useDraftImageAsEventImage, setUseDraftImageAsEventImage] = useState(true);
	const [sessions, setSessions] = useState<SessionForm[]>([]);
	const [organizationMode, setOrganizationMode] = useState<"select" | "custom">(
		"select",
	);
	const [eventStatuses, setEventStatuses] = useState<Category[]>([]);
	const [eventTypes, setEventTypes] = useState<Category[]>([]);
	const [organizations, setOrganizations] = useState<Category[]>([]);
	const [message, setMessage] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [overrideFields, setOverrideFields] = useState<string[]>([]);
	const [selectedOverrideFields, setSelectedOverrideFields] = useState<string[]>([]);

	const updateForm = (key: TextFormField, value: string) => {
		setForm((prev) => ({ ...prev, [key]: value }));
	};

	useEffect(() => {
		void Promise.all([getEventStatuses(), getEventTypes(), getOrganizations()])
			.then(([statuses, types, orgs]) => {
				setEventStatuses(statuses);
				setEventTypes(types);
				setOrganizations(orgs);
			})
			.catch(() => {
				setMessage("카테고리 목록을 불러오지 못했습니다.");
			});
	}, []);

	const updateSession = (index: number, key: keyof SessionForm, value: string) => {
		setSessions((prev) =>
			prev.map((session, sessionIndex) =>
				sessionIndex === index ? { ...session, [key]: value } : session,
			),
		);
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

				statusId: String(event.statusId ?? ""),
				eventTypeId: String(event.eventTypeId ?? ""),
				orgId: String(event.orgId ?? ""),

				applyStart: toDateTimeInputValue(event.applyStart),
				applyEnd: toDateTimeInputValue(event.applyEnd),
				eventStart: toDateTimeInputValue(event.eventStart),
				eventEnd: toDateTimeInputValue(event.eventEnd),
				isPeriodEvent: event.isPeriodEvent ?? false,

				organization: event.organization ?? "",
				location: event.location ?? "",
				applyLink: event.applyLink ?? "",

				mainContentHtml: event.detail ?? "",
			});
			setSessions([]);
			setOrganizationMode(event.orgId ? "select" : "custom");

			setMessage(`${id}번 행사를 불러왔습니다.`);
		} catch {
			setMessage("행사 조회에 실패했습니다.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleCreate = async () => {
		const body = buildCreateRequest(form, sessions);

		if (body === null) {
			setMessage("생성할 행사 제목을 입력해주세요.");
			return;
		}
		const periodError = validateEventPeriods(form);
		if (periodError) {
			setMessage(periodError);
			return;
		}

		setIsLoading(true);

		try {
			const imageUrl =
				draftImage && useDraftImageAsEventImage
					? await uploadAdminEventImage(draftImage)
					: body.imageUrl;
			const result = await createAdminEvent({ ...body, imageUrl });
			const createdEventId = result.eventId;

			if (typeof createdEventId === "number") {
				setEventId(String(createdEventId));
			}

			const eventIds = Array.isArray(result.eventIds) ? result.eventIds : [];
			setMessage(
				eventIds.length > 1
					? `${eventIds.length}개 회차 생성 완료: ${eventIds.join(", ")}`
					: `생성 완료: ${JSON.stringify(result)}`,
			);
		} catch {
			setMessage("생성 요청에 실패했습니다.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleParseDraft = async () => {
		if (!draftText.trim() && !draftImage) {
			setMessage("행사 안내 텍스트 또는 이미지 중 하나를 입력해주세요.");
			return;
		}

		setIsLoading(true);
		try {
			const draft = await parseAdminEventDraft(draftText, draftImage);
			setForm((prev) => ({
				...prev,
				title: draft.title ?? prev.title,
				applyStart: toDateTimeInputValue(draft.applyStart) || prev.applyStart,
				applyEnd: toDateTimeInputValue(draft.applyEnd) || prev.applyEnd,
				eventStart: toDateTimeInputValue(draft.eventStart) || prev.eventStart,
				eventEnd: toDateTimeInputValue(draft.eventEnd) || prev.eventEnd,
				isPeriodEvent:
					draft.sessions.length > 0 ? false : draft.isPeriodEvent ?? prev.isPeriodEvent,
				organization: draft.organization ?? prev.organization,
				location: draft.location ?? prev.location,
				eventTypeId:
					draft.eventTypeId === null || draft.eventTypeId === undefined
						? prev.eventTypeId
						: String(draft.eventTypeId),
				mainContentHtml: draft.mainContentHtml ?? prev.mainContentHtml,
			}));
			const matchedOrganization = organizations.find(
				(organization) => organization.name === draft.organization,
			);
			setOrganizationMode(matchedOrganization ? "select" : "custom");
			if (matchedOrganization) {
				setForm((prev) => ({
					...prev,
					orgId: String(matchedOrganization.id),
					organization: matchedOrganization.name,
				}));
			}
			setSessions(
				draft.sessions.map((session) => ({
					start: toDateTimeInputValue(session.start),
					end: toDateTimeInputValue(session.end),
					location: session.location ?? "",
				})),
			);
			setMessage(
				draft.warnings.length > 0
					? `AI 초안을 반영했습니다. 확인 사항: ${draft.warnings.join(" / ")}`
					: "AI 초안을 폼에 반영했습니다. 내용을 검토한 뒤 신규 생성해주세요.",
			);
		} catch {
			setMessage("AI 행사 초안 생성에 실패했습니다.");
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
		const periodError = validateEventPeriods(form);
		if (periodError) {
			setMessage(periodError);
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

	const handleAdminLogout = () => {
		AdminTokenService.clearToken();
		window.location.replace("/sync");
	};

	const fields: [TextFormField, string, string][] = [
		["title", "제목", "text"],
		["imageUrl", "이미지 URL", "text"],

		["applyStart", "신청 시작", "datetime-local"],
		["applyEnd", "신청 종료", "datetime-local"],
		["eventStart", "행사 시작", "datetime-local"],
		["eventEnd", "행사 종료", "datetime-local"],

		["location", "장소", "text"],
		["applyLink", "신청 링크", "text"],
	];

	const categorySelectFields: [TextFormField, string, Category[]][] = [
		["statusId", "모집 상태", eventStatuses],
		["eventTypeId", "행사 유형", eventTypes],
	];
	const organizationOptions = organizations;

	return (
		<div className={styles.page}>
			<div className={styles.inner}>
				<div className={styles.pageHeader}>
					<h1 className={styles.pageTitle}>행샤 어드민</h1>
					<button
						type="button"
						className={styles.logoutButton}
						onClick={handleAdminLogout}
						aria-label="어드민 로그아웃"
						title="어드민 로그아웃"
					>
						<FiLogOut aria-hidden="true" />
					</button>
				</div>

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
							<p className={styles.cardTitle}>AI 행사 초안</p>
							<textarea
								className={styles.draftTextInput}
								value={draftText}
								onChange={(e) => setDraftText(e.currentTarget.value)}
								placeholder="행사 안내문을 붙여넣으세요 (선택)"
							/>
							<div className={styles.fileRow}>
								<label className={styles.fileLabel}>
									이미지 선택
									<input
										type="file"
										accept="image/jpeg,image/png,image/webp,image/gif"
										className={styles.fileInput}
										onChange={(e) => setDraftImage(e.currentTarget.files?.[0] ?? null)}
									/>
								</label>
								<span className={styles.fileName}>
									{draftImage ? draftImage.name : "이미지 없음"}
								</span>
								<button
									type="button"
									className={`${styles.btn} ${styles.btnPrimary}`}
									onClick={handleParseDraft}
									disabled={isLoading}
								>
									AI로 채우기
								</button>
							</div>
							{draftImage && (
								<label className={styles.draftImageOption}>
									<input
										type="checkbox"
										checked={useDraftImageAsEventImage}
										onChange={(e) =>
											setUseDraftImageAsEventImage(e.currentTarget.checked)
										}
									/>
									이 이미지를 대표로 등록
								</label>
							)}
						</div>

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
								{fields.map(([key, label, type]) => {
									const inputId = `admin-event-${key}`;

									return (
										<div key={key} className={styles.formField}>
											<label className={styles.formLabel} htmlFor={inputId}>
												{label}
											</label>
											<input
												id={inputId}
												type={type}
											className={styles.formInput}
											value={form[key]}
											disabled={
												key === "imageUrl" &&
												Boolean(draftImage && useDraftImageAsEventImage)
											}
											onChange={(e) => updateForm(key, e.currentTarget.value)}
											/>
										</div>
									);
								})}

								{categorySelectFields.map(([key, label, options]) => {
									const inputId = `admin-event-${key}`;
									return (
										<div key={key} className={styles.formField}>
											<label className={styles.formLabel} htmlFor={inputId}>
												{label}
											</label>
											<select
												id={inputId}
												className={styles.formInput}
												value={form[key]}
												onChange={(e) => updateForm(key, e.currentTarget.value)}
											>
												<option value="">선택 안 함</option>
												{options.map((option) => (
													<option key={option.id} value={option.id}>
														{option.name}
													</option>
												))}
											</select>
										</div>
									);
								})}

								<div className={styles.formField}>
									<label className={styles.formLabel} htmlFor="admin-event-organization-mode">
										주최 기관
									</label>
									<select
										id="admin-event-organization-mode"
										className={styles.formInput}
										value={organizationMode}
										onChange={(e) => {
											const mode = e.currentTarget.value as "select" | "custom";
											setOrganizationMode(mode);
											setForm((prev) => ({
												...prev,
												orgId: "",
												organization: "",
											}));
										}}
									>
										<option value="select">목록에서 선택</option>
										<option value="custom">직접 입력</option>
									</select>
								</div>

								<div className={styles.formField}>
									<label className={styles.formLabel} htmlFor="admin-event-organization">
										{organizationMode === "select" ? "주최 기관 목록" : "주최 기관명"}
									</label>
									{organizationMode === "select" ? (
										<select
											id="admin-event-organization"
											className={styles.formInput}
											value={form.orgId}
											onChange={(e) => {
												const selected = organizationOptions.find(
													(option) => option.id === Number(e.currentTarget.value),
												);
												setForm((prev) => ({
													...prev,
													orgId: e.currentTarget.value,
													organization: selected?.name ?? "",
												}));
											}}
										>
											<option value="">선택 안 함</option>
											{organizationOptions.map((option) => (
												<option key={option.id} value={option.id}>
													{option.name}
												</option>
											))}
										</select>
									) : (
										<input
											id="admin-event-organization"
											type="text"
											className={styles.formInput}
											value={form.organization}
											onChange={(e) => updateForm("organization", e.currentTarget.value)}
											placeholder="새 주최 기관명을 입력하세요"
										/>
									)}
								</div>

								<div className={styles.formField}>
									<span className={styles.formLabel}>행사 구분</span>
									<label className={styles.booleanField}>
										<input
											type="checkbox"
											checked={form.isPeriodEvent}
											onChange={(e) =>
												setForm((prev) => ({
													...prev,
													isPeriodEvent: e.currentTarget.checked,
												}))
											}
										/>
										모집형 행사
									</label>
								</div>

								<div className={`${styles.formField} ${styles.formFieldFull}`}>
									<div className={styles.sessionsHeader}>
										<span className={styles.formLabel}>회차 일정</span>
										<button
											type="button"
											className={`${styles.btn} ${styles.btnSecondary}`}
											onClick={() =>
												setSessions((prev) => [
													...prev,
													{ start: "", end: "", location: form.location },
												])
											}
										>
											회차 추가
										</button>
									</div>
									{sessions.length === 0 ? (
										<p className={styles.sessionHint}>
											AI가 여러 회차를 찾으면 여기에 표시됩니다.
										</p>
									) : (
										<div className={styles.sessionList}>
											{sessions.map((session, index) => (
												<div key={`${index}-${session.start}`} className={styles.sessionRow}>
													<input
														type="datetime-local"
														className={styles.formInput}
														value={session.start}
														onChange={(e) => updateSession(index, "start", e.currentTarget.value)}
														aria-label={`${index + 1}회차 시작`}
													/>
													<input
														type="datetime-local"
														className={styles.formInput}
														value={session.end}
														onChange={(e) => updateSession(index, "end", e.currentTarget.value)}
														aria-label={`${index + 1}회차 종료`}
													/>
													<input
														type="text"
														className={styles.formInput}
														placeholder="장소"
														value={session.location}
														onChange={(e) => updateSession(index, "location", e.currentTarget.value)}
													/>
													<button
														type="button"
														className={`${styles.btn} ${styles.btnDanger}`}
														onClick={() =>
															setSessions((prev) => prev.filter((_, i) => i !== index))
														}
													>
														삭제
													</button>
												</div>
											))}
										</div>
									)}
								</div>

								<div className={`${styles.formField} ${styles.formFieldFull}`}>
									<label
										className={styles.formLabel}
										htmlFor="admin-event-main-content-html"
									>
										상세 HTML
									</label>
									<textarea
										id="admin-event-main-content-html"
										className={styles.formTextarea}
										value={form.mainContentHtml}
										onChange={(e) =>
											updateForm("mainContentHtml", e.currentTarget.value)
										}
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
