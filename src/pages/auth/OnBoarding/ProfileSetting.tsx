import type React from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthProvider";
import defaultProfile from "/assets/defaultProfile.png";
import styles from "@styles/ProfileSetting.module.css";

export default function ProfileSetting() {
	const [, setSearchParams] = useSearchParams();
	const { updateUser } = useAuth();

	const defaultName = "푱푱한 토끼";
	const [name, setName] = useState<string>("");
	const [previewUrl, setPreviewUrl] = useState(defaultProfile);
	const [imgFile, setImgFile] = useState<File | null>(null);

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setImgFile(file);
		setPreviewUrl(URL.createObjectURL(file));
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const finalName = name.trim() === "" ? defaultName : name.trim();

		await updateUser(finalName, imgFile);

		setSearchParams((prev) => {
			const next = new URLSearchParams(prev);
			next.set("step", "onboarding");
			return next;
		});
	};

	useEffect(() => {
		return () => {
			if (previewUrl?.startsWith("blob:")) {
				URL.revokeObjectURL(previewUrl);
			}
		};
	}, [previewUrl]);

	return (
		<div className={styles.page}>
			<div className={styles.box}>
				<header className={styles.header}>
					<h1 className={styles.title}>프로필 설정</h1>
					<p className={styles.subtitle}>프로필 사진과 이름을 설정해주세요</p>
				</header>

				<form className={styles.form} onSubmit={handleSubmit}>
					{/* 이미지 클릭하면 파일 선택 */}
					<label className={styles.avatarWrap} htmlFor="profile-image">
						<img
							className={styles.avatar}
							src={previewUrl}
							alt="프로필 사진 미리보기"
						/>
					</label>
					<input
						id="profile-image"
						className={styles.file}
						type="file"
						accept="image/*"
						onChange={handleImageChange}
					/>

					<input
						className={styles.input}
						type="text"
						placeholder="푱푱한 토끼"
						value={name}
						onChange={(e) => setName(e.currentTarget.value)}
					/>

					<button className={styles.submit} type="submit">
						완료
					</button>
				</form>
			</div>
		</div>
	);
}
