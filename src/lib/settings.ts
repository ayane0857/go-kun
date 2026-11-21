import { STUDY_SECTIONS as DEFAULT_SECTIONS_VALUE } from "../data/sections";

export type StudySection = {
	id: string;
	title: string;
	from: number;
	to: number;
};

export type AppSettings = {
	defaultQuestionCount: "all" | "5";
};

export const STUDY_SECTIONS_KEY = "go-kun_study_sections_v1";
export const APP_SETTINGS_KEY = "go-kun_app_settings_v1";

export const DEFAULT_APP_SETTINGS: AppSettings = {
	defaultQuestionCount: "all",
};

export const DEFAULT_SECTIONS: StudySection[] = DEFAULT_SECTIONS_VALUE;

export function sanitizeStudySections(value: unknown): StudySection[] {
	if (!Array.isArray(value)) {
		throw new Error("JSONは範囲配列である必要があります。");
	}
	return value.map((item, index) => {
		if (!item || typeof item !== "object") {
			throw new Error(`${index + 1}件目はオブジェクトではありません。`);
		}
		const raw = item as Record<string, unknown>;
		if (typeof raw.title !== "string" || !raw.title.trim()) {
			throw new Error(`${index + 1}件目のtitleが空です。`);
		}
		if (
			typeof raw.from !== "number" ||
			typeof raw.to !== "number" ||
			!Number.isInteger(raw.from) ||
			!Number.isInteger(raw.to) ||
			raw.from < 1 ||
			raw.to < raw.from
		) {
			throw new Error(`${index + 1}件目のfromまたはtoが不正です。`);
		}
		return {
			id:
				typeof raw.id === "string" && raw.id.trim()
					? raw.id.trim()
					: `section-${index + 1}`,
			title: raw.title.trim(),
			from: raw.from,
			to: raw.to,
		};
	});
}

export function loadStudySections(): StudySection[] {
	if (typeof window === "undefined") return DEFAULT_SECTIONS;
	try {
		const stored = localStorage.getItem(STUDY_SECTIONS_KEY);
		return stored
			? sanitizeStudySections(JSON.parse(stored))
			: DEFAULT_SECTIONS;
	} catch {
		return DEFAULT_SECTIONS;
	}
}

export function saveStudySections(sections: StudySection[]) {
	if (typeof window !== "undefined") {
		localStorage.setItem(STUDY_SECTIONS_KEY, JSON.stringify(sections));
	}
}

export function loadAppSettings(): AppSettings {
	if (typeof window === "undefined") return DEFAULT_APP_SETTINGS;
	try {
		const stored = localStorage.getItem(APP_SETTINGS_KEY);
		if (!stored) return DEFAULT_APP_SETTINGS;
		const value = JSON.parse(stored) as Partial<AppSettings>;
		return {
			defaultQuestionCount: value.defaultQuestionCount === "5" ? "5" : "all",
		};
	} catch {
		return DEFAULT_APP_SETTINGS;
	}
}

export function saveAppSettings(settings: AppSettings) {
	if (typeof window !== "undefined") {
		localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(settings));
	}
}
