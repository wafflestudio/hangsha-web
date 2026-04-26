import { useAuth } from "@/contexts/AuthProvider";
import Navigationbar from "@/widgets/Navigationbar";
import styles from "@styles/MyPage.module.css";
import { BookmarkWidget } from "./bookmark/Bookmark";
import { MemoWidget } from "./memo/Memo";
import { useNavigate } from "react-router-dom";
import { useTimetable } from "@/contexts/TimetableContext";
import { useEffect, useState } from "react";
import { RiPencilFill } from "react-icons/ri";
import { FaCamera, FaStar } from "react-icons/fa6";
import { IoMdDoneAll } from "react-icons/io";
import { useUserData } from "@/contexts/UserDataContext";
import Onboarding from "./auth/OnBoarding/Onboarding";
import Modal from "@/widgets/Modal";
import Loading from "@/widgets/Loading";
import defaultProfile from "/assets/defaultProfile.png";
import BottomNav from "@/widgets/BottomNav";

const ProfileCard = ({ onClickInterest }: { onClickInterest: () => void }) => {
	const { user, updateUsername, setProfileImg } = useAuth();
	const { interestCategories } = useUserData();
	const { timetables } = useTimetable();
	const [profilePreviewUrl, setProfilePreviewUrl] = useState<string>(
		user?.profileImageUrl && user.profileImageUrl !== ""
			? user.profileImageUrl
			: defaultProfile,
	);
	const [imgFile, setImgFile] = useState<File | null>(null);
	const [, setIsDefaultProfile] = useState<boolean>(false);
	const [username, setUsername] = useState<string>(
		user ? user.username : "유저",
	);
	const [isEditmode, setIsEditmode] = useState<boolean>(false);
	const navigate = useNavigate();

	const handleImageError = () => {
		setProfilePreviewUrl(defaultProfile);
	};

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setImgFile(file);
		setProfilePreviewUrl(URL.createObjectURL(file));
		setIsDefaultProfile(false);
	};

	const handleChangesSave = () => {
		setIsEditmode(false);
		// name change
		if (username.trim() && username !== user?.username) {
			updateUsername(username);
		}
		if (imgFile) {
			// if file input is null : no changes, don't call functions
			setProfileImg(imgFile);
		}
		setImgFile(null);
	};

	useEffect(() => {
		if (user?.profileImageUrl && user.profileImageUrl.trim() !== "") {
			setProfilePreviewUrl(user.profileImageUrl);
		} else {
			setProfilePreviewUrl(defaultProfile);
		}
	}, [user?.profileImageUrl]);
	// profile image preview url cleanup (cleanup callback is executed before next effect / component unmount)
	useEffect(() => {
		return () => {
			if (profilePreviewUrl?.startsWith("blob:")) {
				URL.revokeObjectURL(profilePreviewUrl);
			}
		};
	}, [profilePreviewUrl]);

	return (
		<div className={styles.profileContainer}>
			<div className={styles.profileRow}>
				<div className={styles.profileImgWrapper}>
					<img
						alt="profile img"
						src={profilePreviewUrl}
						onError={handleImageError}
					/>
					{isEditmode && (
						<label htmlFor="profile-image" className={styles.editButton}>
							<input
								id="profile-image"
								className={styles.editInput}
								type="file"
								accept="image/*"
								onChange={handleImageChange}
							/>
							<FaCamera color="ABABAB" size={13} />
						</label>
					)}
				</div>
				<div className={styles.nameEmailCol}>
					{isEditmode ? (
						<input
							className={styles.nameInput}
							type="text"
							value={username}
							placeholder="이름을 입력하세요"
							onChange={(e) => setUsername(e.currentTarget.value)}
							onKeyDown={(e: React.KeyboardEvent) => {
								if (e.key === "Enter" && !e.nativeEvent.isComposing) {
									e.stopPropagation();
									e.preventDefault();
									handleChangesSave();
								}
							}}
						/>
					) : (
						<span className={styles.nameText}>{user?.username}</span>
					)}
					<span
						className={`${styles.emailText} ${isEditmode ? styles.edit : ""}`}
					>
						{user?.email}
					</span>
				</div>
				{isEditmode ? (
					<IoMdDoneAll
						onClick={handleChangesSave}
						className={styles.editBtn}
						size={20}
						color="ABABAB"
					/>
				) : (
					<RiPencilFill
						className={styles.editBtn}
						color="ABABAB"
						size={24}
						onClick={() => setIsEditmode(true)}
					/>
				)}
			</div>
			<button
				className={styles.preferenceCol}
				type="button"
				onClick={onClickInterest}
			>
				<div className={styles.preferenceHeader}>
					<FaStar size={24} color="#828282" style={{ marginRight: 12 }} />
					<span>행사 보기 우선순위</span>
				</div>
				{interestCategories && interestCategories.length > 0 ? (
						<ul className={styles.preferenceChips}>
							{interestCategories.map((cat, idx) => (
								<li
									className={`${styles.preferenceChip} ${cat.groupId === 3 && styles.category} ${cat.groupId === 2 && styles.organization}`}
									key={cat.id}
								>
									{`${idx + 1}순위: ${cat.name}`}
								</li>
							))}
						</ul>
				) : (
					<span className={styles.notYetText}>
						클릭해서 우선순위로 확인할 행사를 설정해보세요!
					</span>
				)}
			</button>
			<button
				type="button"
				className={styles.timeTableBtn}
				onClick={() => navigate("/timetable")}
			>
				{timetables && timetables.length === 0 ? (
					<>
						<img src="/assets/radio.svg" alt="a plus button" />
						<span>내 시간표 등록하기</span>
					</>
				) : (
					<>
						<img
							src="/assets/timetableActive.png"
							alt="a colored timetable icon"
						/>
						<span>내 시간표 수정하기</span>
					</>
				)}
			</button>
		</div>
	);
};

const MyPage = () => {
	const { user, isLoading } = useAuth();
	const [isEditingInterest, setIsEditingInterest] = useState<boolean>(false);
	const navigate = useNavigate();

	return (
		<div className={styles.main}>
			<Navigationbar />
			{isLoading ? (
				<Loading />
			) : isEditingInterest ? (
				<Onboarding
					isEditing={true}
					onFinishEdit={() => setIsEditingInterest(false)}
				/>
			) : user ? (
				<div className={styles.mypageContainer}>
					<ProfileCard
						onClickInterest={() => setIsEditingInterest(() => true)}
					/>
					<div className={styles.widgetsWrapper}>
						<BookmarkWidget />
						<MemoWidget />
					</div>
				</div>
			) : (
				<div className={styles.notFound}>
					<Modal
						content="마이페이지 이용을 위해서는 로그인을 해주세요."
						leftText="로그인"
						rightText="회원가입"
						onLeftClick={() => navigate("/auth/login")}
						onRightClick={() => navigate("/auth/signup")}
						onClose={null}
					/>
				</div>
			)}
			<BottomNav />
		</div>
	);
};

export default MyPage;
