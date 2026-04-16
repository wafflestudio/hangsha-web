import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import * as auth from "@api/auth";
import type { Provider, User } from "@types";
import { TokenService } from "@/api/tokenService";

interface AuthContextType {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	login: (email: string, password: string) => Promise<void>;
	signup: (email: string, password: string) => Promise<void>;
	socialLogin: (
		provider: Provider,
		code: string,
		codeVerifier?: string,
	) => Promise<void>;
	logout: () => Promise<void>;
	updateUsername: (username: string) => Promise<void>;
	clearProfileImg: () => Promise<void>;
	setProfileImg: (file: File) => Promise<void>;
	updateUser: (username: string, file: File | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	/**
	 * INIT : check for existing session on page load
	 */
	useEffect(() => {
		const initAuth = async () => {
			try {
				const restoredUser = await auth.refresh();

				if (restoredUser) {
					setUser(restoredUser);
					setIsAuthenticated(true);
				}
			} catch (e) {
				console.error(e);
				setUser(null);
				setIsAuthenticated(false);
			} finally {
				setIsLoading(false);
			}
		};
		initAuth();
		auth.healthCheck();
	}, []);

	/**
	 * Login Function
	 */
	const login = async (email: string, password: string) => {
		try {
			await auth.login(email, password);
			const userData = await auth.getUser();

			setUser(userData);
			setIsAuthenticated(true);
		} catch (err) {
			console.error("Login failed:", err);
			throw err;
		}
	};

	const socialLogin = async (
		provider: Provider,
		code: string,
		codeVerifier?: string,
	) => {
		try {
			await auth.socialLogin(provider, code, codeVerifier);
			if (!TokenService.getToken()) {
				throw new Error("Social login did not set access token");
			}
			const userData = await auth.getUser();
			setUser(userData);
			setIsAuthenticated(true);
		} catch (err) {
			console.error("Social Login failed:", err);
			throw err;
		}
	};

	/**
	 * Signup Function
	 */
	const signup = async (email: string, password: string) => {
		try {
			await auth.signup(email, password);
			const userData = await auth.getUser();
			setUser(userData);
			setIsAuthenticated(true);
		} catch (err) {
			console.error("Signup failed:", err);
			throw err;
		}
	};

	/**
	 * Logout Func
	 */
	const logout = async () => {
		try {
			await auth.logout();
		} catch (error) {
			console.error("Server error at logout", error);
		} finally {
			setUser(null);
			setIsAuthenticated(false);
			// logoout function already clears the TokenService
		}
	};

	/**
	 * Update username
	 */
	const updateUsername = async (username: string) => {
		try {
			await auth.updateUsername(username);
			const updatedUser = await auth.getUser();
			setUser(updatedUser);
		} catch (error) {
			console.error("server error at username edit", error);
		}
	};

	/**
	 * clear profileImg
	 */
	const clearProfileImg = async () => {
		try {
			await auth.clearProfileImg();
			const updatedUser = await auth.getUser();
			setUser(updatedUser);
		} catch (error) {
			console.error("server error at clearing profile image", error);
		}
	};

	/**
	 * post profileimg
	 */
	const setProfileImg = async (file: File) => {
		try {
			await auth.uploadProfileImg(file);
			const updatedUser = await auth.getUser();
			setUser(updatedUser);
		} catch (error) {
			console.error("server error at setting profile image", error);
		}
	};

	const updateUser = async (username: string, file: File | null) => {
		try {
			await auth.updateUsername(username);
			if (file) {
				await auth.uploadProfileImg(file);
			}
			const updatedUser = await auth.getUser();
			setUser(updatedUser);
		} catch (error) {
			console.error("server error at updating user", error);
		}
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				isAuthenticated,
				isLoading,
				login,
				signup,
				socialLogin,
				logout,
				updateUsername,
				clearProfileImg,
				setProfileImg,
				updateUser,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
