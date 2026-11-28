export type StudyKind = "words" | "memorize" | "phraseflow";
type DailyStudy = Record<StudyKind, number>;
type StudyHistory = Record<string, DailyStudy>;

const STORAGE_KEY = "go-kun-study-history-v1";
const emptyDay = (): DailyStudy => ({ words: 0, memorize: 0, phraseflow: 0 });

function dayKey(date: Date) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function readStudyHistory(): StudyHistory {
	if (typeof window === "undefined") return {};
	try {
		const value: unknown = JSON.parse(
			localStorage.getItem(STORAGE_KEY) ?? "{}",
		);
		return value && typeof value === "object" && !Array.isArray(value)
			? (value as StudyHistory)
			: {};
	} catch {
		return {};
	}
}

export function recordStudy(kind: StudyKind, count = 1) {
	if (typeof window === "undefined" || count <= 0) return;
	const history = readStudyHistory();
	const key = dayKey(new Date());
	const today = { ...emptyDay(), ...history[key] };
	today[kind] = (today[kind] ?? 0) + count;
	history[key] = today;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function summarizeStudy(history: StudyHistory, now = new Date()) {
	const todayKey = dayKey(now);
	const today = { ...emptyDay(), ...history[todayKey] };
	const week = emptyDay();
	for (let offset = 0; offset < 7; offset += 1) {
		const date = new Date(now);
		date.setDate(now.getDate() - offset);
		const daily = history[dayKey(date)];
		if (!daily) continue;
		for (const kind of Object.keys(week) as StudyKind[]) {
			week[kind] += daily[kind] ?? 0;
		}
	}
	return {
		today,
		week,
		todayTotal: today.words + today.memorize + today.phraseflow,
		weekTotal: week.words + week.memorize + week.phraseflow,
	};
}
