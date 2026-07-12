// local storage getter - settter
export type SeenTutorialIDs = Record<string, true>;

const STORAGE_KEY = "tutorialState";

export function getTutorialState(): SeenTutorialIDs {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return {};

		const parsed = JSON.parse(raw);

		if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
			return {};
		}

		return parsed as SeenTutorialIDs;
	} catch {
		return {};
	}
}

export function setTutorialState(state: SeenTutorialIDs) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function hasSeenTutorial(id: string): boolean {
	return getTutorialState()[id] === true;
}

export function markTutorialSeen(id: string) {
	const state = getTutorialState();
	setTutorialState({
		...state,
		[id]: true,
	});
}
