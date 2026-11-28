import type { QuizWord } from "./quiz";

export const WORD_JSON_KEY = "go-kun_words_v1";

export function sanitizeWords(value: unknown): QuizWord[] {
	if (!Array.isArray(value))
		throw new Error("JSONは配列である必要があります。");

	return value.map((item, index) => {
		if (!item || typeof item !== "object") {
			throw new Error(`${index + 1}件目はオブジェクトではありません。`);
		}
		const raw = item as Record<string, unknown>;
		if (typeof raw.id !== "number" || !Number.isInteger(raw.id)) {
			throw new Error(`${index + 1}件目のidが不正です。`);
		}
		if (typeof raw.word !== "string" || !raw.word.trim()) {
			throw new Error(`${index + 1}件目のwordが空です。`);
		}
		if (
			!Array.isArray(raw.meanings) ||
			raw.meanings.some((meaning) => typeof meaning !== "string")
		) {
			throw new Error(`${index + 1}件目のmeaningsが不正です。`);
		}
		return {
			id: raw.id,
			word: raw.word.trim(),
			meanings: raw.meanings
				.filter((meaning): meaning is string => typeof meaning === "string")
				.map((meaning) => meaning.trim())
				.filter(Boolean),
		};
	});
}

export function loadWordsJson(): QuizWord[] | null {
	if (typeof window === "undefined") return null;
	try {
		const stored = localStorage.getItem(WORD_JSON_KEY);
		return stored ? sanitizeWords(JSON.parse(stored)) : null;
	} catch {
		return null;
	}
}

export function saveWordsJson(words: QuizWord[]) {
	if (typeof window !== "undefined") {
		localStorage.setItem(WORD_JSON_KEY, JSON.stringify(words));
	}
}
