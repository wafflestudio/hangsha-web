import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getCategoryGroups, getOrganizations } from "@api/event";
import { addInterestCategories } from "@api/user";
import type { Category } from "@types";
import styles from "@styles/Onboarding.module.css";
import { useUserData } from "@/contexts/UserDataContext";

export default function Onboarding({
	isEditing = false,
	onFinishEdit,
}: {
	isEditing?: boolean;
	onFinishEdit?: () => void;
}) {
	const { refreshUserData, interestCategories } = useUserData();

	const [, setSearchParams] = useSearchParams();

	const [categories, setCategories] = useState<Category[]>([]);
	const [selectedPreferences, setSelectedPreferences] = useState<Category[]>(
		interestCategories || [],
	);
	const [organizations, setOrganizations] = useState<Category[] | null>(null);

	useEffect(() => {
		getCategoryGroups().then((categoryGroups) => {
			const safe = Array.isArray(categoryGroups) ? categoryGroups : [];

			// 프로그램 유형(groupId === 3)만 추출
			const programTypes = safe
				.flatMap((item) => item.categories ?? [])
				.filter((c) => c.groupId === 3);

			setCategories(programTypes);
		});
	}, []);

	useEffect(() => {
		getOrganizations().then((orgs) => {
			setOrganizations(Array.isArray(orgs) ? orgs : []);
		});
	}, []);

	const MAX_PREFERENCE = 3;

	const togglePreference = (pref: Category) => {
		setSelectedPreferences((prev) => {
			const exists = prev.some(
				(p) => p.id === pref.id && p.groupId === pref.groupId,
			);

			if (exists) {
				return prev.filter(
					(p) => !(p.id === pref.id && p.groupId === pref.groupId),
				);
			}

			if (prev.length >= MAX_PREFERENCE) {
				alert(`최대 ${MAX_PREFERENCE}개까지 선택할 수 있습니다.`);
				return prev;
			}

			return [...prev, pref];
		});
	};

	const handleSubmit = async () => {
		try {
			const items = selectedPreferences.map((p, index) => ({
				categoryId: p.id,
				priority: index + 1,
			}));

			await addInterestCategories(items);
			refreshUserData();

			if (isEditing && onFinishEdit) {
				onFinishEdit();
			}
			setSearchParams((prev) => {
				const next = new URLSearchParams(prev);
				next.set("step", "complete");
				return next;
			});
		} catch (e) {
			console.error(e);
			alert("저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
		}
	};

	return (
		<div className={`${styles.onbPage} ${isEditing ? styles.inMypage : ""}`}>
			<header className={styles.onbHeader}>
				<h1 className={styles.onbTitle}>관심사 설정</h1>
				<p className={styles.onbSubtitle}>
					먼저 보고 싶은 행사의 카테고리 또는 주체기관을 선택해주세요.
				</p>
			</header>

			<div className={styles.onbSelectedWrap}>
				{selectedPreferences.map((preference, index) => (
					<span
						key={`${preference.groupId}-${preference.id}`}
						className={styles.onbRankPill}
					>
						<span className={styles.onbRankLabel}>{index + 1}순위:</span>
						<span>{preference.name}</span>
					</span>
				))}
			</div>

			<main className={styles.onbSections}>
				<section className={styles.onbSection}>
					<h2
						className={`${styles.onbSectionTitle} ${styles.onbSectionTitleCategory}`}
					>
						카테고리
					</h2>

					<div className={styles.onbOptions}>
						{categories.map((category) => {
							const checked = selectedPreferences.some(
								(p) => p.id === category.id,
							);
							const id = `category-${category.id}`;

							return (
								<div key={category.id} className={styles.onbOption}>
									<input
										className={styles.onbCheckbox}
										type="checkbox"
										id={id}
										checked={checked}
										onChange={() => togglePreference(category)}
									/>
									<label
										className={`${styles.onbPill} ${styles.onbPillCategory}`}
										htmlFor={id}
									>
										{category.name}
									</label>
								</div>
							);
						})}
					</div>
				</section>

				<section className={styles.onbSection}>
					<h2
						className={`${styles.onbSectionTitle} ${styles.onbSectionTitleOrg}`}
					>
						주최기관
					</h2>

					<div className={styles.onbOptions}>
						{organizations?.map((org) => {
							const checked = selectedPreferences.some((p) => p.id === org.id);
							const id = `organization-${org.id}`;

							return (
								<div key={org.id} className={styles.onbOption}>
									<input
										className={styles.onbCheckbox}
										type="checkbox"
										id={id}
										checked={checked}
										onChange={() => togglePreference(org)}
									/>
									<label
										className={`${styles.onbPill} ${styles.onbPillOrg}`}
										htmlFor={id}
									>
										{org.name}
									</label>
								</div>
							);
						})}

						{!organizations && <div>로딩 중..</div>}
					</div>
				</section>

				<div className={styles.onbActions}>
					<button
						className={styles.onbSubmit}
						type="button"
						onClick={handleSubmit}
					>
						완료
					</button>
				</div>
			</main>
		</div>
	);
}
