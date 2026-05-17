import { useAuth } from "@contexts/AuthProvider";
import styles from "@styles/Sidebar.module.css";

interface SidebarLogoutButtonProps {
	onLogout?: () => void;
}

export const SidebarLogoutButton = ({ onLogout }: SidebarLogoutButtonProps) => {
	const { user, logout } = useAuth();

	if (!user) return null;

	return (
		<button
			type="button"
			onClick={() => {
				void logout();
				onLogout?.();
			}}
			className={styles.logout}
		>
			로그아웃
		</button>
	);
};
