const STORAGE_KEY = "go-kun-answer-stats";

export type AnswerStats = Record<number, { correct: number; total: number }>;

export function readAnswerStats(): AnswerStats {
	try {
		const value: unknown = JSON.parse(
			localStorage.getItem(STORAGE_KEY) ?? "{}",
		);
		if (!value || typeof value !== "object" || Array.isArray(value)) return {};
		return value as AnswerStats;
	} catch {
		return {};
	}
}

export function recordAnswer(wordId: number, isCorrect: boolean) {
	const stats = readAnswerStats();
	const current = stats[wordId] ?? { correct: 0, total: 0 };
	stats[wordId] = {
		correct: current.correct + Number(isCorrect),
		total: current.total + 1,
	};
	localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}
