import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { Category } from "@types";
import styles from "@styles/Onboarding.module.css";
import { useUserData } from "@/contexts/UserDataContext";
import { useUserPreferences } from "@/contexts/UserPreferenceContext";

export default function Onboarding({
	isEditing = false,
	onFinishEdit,
}: {
	isEditing?: boolean;
	onFinishEdit?: () => void;
}) {
	const { interestCategories } = useUserData();
	const {
		programTypes,
		organizations,
		isLoading,
		error,
		saveInterestPreferences,
	} = useUserPreferences();

	const [, setSearchParams] = useSearchParams();

	const [selectedPreferences, setSelectedPreferences] = useState<Category[]>(
		interestCategories || [],
	);

	useEffect(() => {
		setSelectedPreferences(interestCategories || []);
	}, [interestCategories]);

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
			await saveInterestPreferences(selectedPreferences);

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
						{programTypes.map((category) => {
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

						{isLoading && <div>로딩 중..</div>}
						{error && <div>{error}</div>}
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
