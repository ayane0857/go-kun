export const FULL_BACKUP_KEY = "go-kun_full_backup_v1";

const BACKUP_KEYS = [
	"go-kun_words_v1",
	"go-kun_word_migration_v1",
	"go-kun_study_sections_v1",
	"go-kun_app_settings_v1",
	"go-kun_memorize_sentences_v1",
	"phraseflow_questions_v1",
	"phraseflow_settings_v1",
	"go-kun-answer-stats",
] as const;

export function collectAllData() {
	if (typeof window === "undefined") return {};
	return Object.fromEntries(
		BACKUP_KEYS.flatMap((key) => {
			const raw = localStorage.getItem(key);
			if (raw === null) return [];
			try {
				return [[key, JSON.parse(raw)]];
			} catch {
				return [[key, raw]];
			}
		}),
	);
}

export function exportAllData() {
	const payload = {
		format: "go-kun-full-backup",
		version: 1,
		exportedAt: new Date().toISOString(),
		data: collectAllData(),
	};
	const blob = new Blob([JSON.stringify(payload, null, 2)], {
		type: "application/json",
	});
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = "go-kun_full_backup.json";
	anchor.click();
	URL.revokeObjectURL(url);
}

export function importAllData(payload: unknown) {
	if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
		throw new Error("バックアップJSONの形式が不正です。");
	}
	const root = payload as Record<string, unknown>;
	const data =
		root.format === "go-kun-full-backup" && root.data ? root.data : root;
	if (!data || typeof data !== "object" || Array.isArray(data)) {
		throw new Error("バックアップデータが不正です。");
	}
	for (const key of BACKUP_KEYS) {
		const value = (data as Record<string, unknown>)[key];
		if (value === undefined) continue;
		localStorage.setItem(
			key,
			typeof value === "string" ? value : JSON.stringify(value),
		);
	}
	localStorage.setItem(FULL_BACKUP_KEY, JSON.stringify(payload));
}
