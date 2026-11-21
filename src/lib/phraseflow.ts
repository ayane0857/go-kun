export type PhraseQuestion = {
	id: string;
	ja: string;
	en: string;
	category: string;
	wrong: boolean;
};

export type PhraseSettings = {
	ignoreCase: boolean;
	ignorePunctuation: boolean;
	allowContractions: boolean;
};

export const QUESTIONS_KEY = "phraseflow_questions_v1";
export const SETTINGS_KEY = "phraseflow_settings_v1";

export const DEFAULT_SETTINGS: PhraseSettings = {
	ignoreCase: true,
	ignorePunctuation: true,
	allowContractions: true,
};

const CONTRACTIONS: Record<string, string> = {
	"i'm": "i am",
	"you're": "you are",
	"he's": "he is",
	"she's": "she is",
	"it's": "it is",
	"we're": "we are",
	"they're": "they are",
	"i've": "i have",
	"i'll": "i will",
	"i'd": "i would",
	"isn't": "is not",
	"aren't": "are not",
	"wasn't": "was not",
	"weren't": "were not",
	"don't": "do not",
	"doesn't": "does not",
	"didn't": "did not",
	"can't": "cannot",
	cannot: "can not",
	"couldn't": "could not",
	"won't": "will not",
	"wouldn't": "would not",
	"shouldn't": "should not",
	"let's": "let us",
	"that's": "that is",
	"there's": "there is",
	"what's": "what is",
};

export function normalizeEnglish(
	value: string,
	settings: PhraseSettings = DEFAULT_SETTINGS,
) {
	let normalized = value
		.replace(/[‘’]/g, "'")
		.replace(/[“”]/g, '"')
		.replace(/\u3000/g, " ")
		.trim()
		.replace(/\s+/g, " ");
	if (settings.ignoreCase) normalized = normalized.toLowerCase();
	if (settings.ignorePunctuation) {
		normalized = normalized
			.replace(/[.!?]+$/g, "")
			.replace(/,/g, "")
			.trim();
	}
	if (settings.allowContractions) {
		normalized = normalized
			.split(" ")
			.map((word) => CONTRACTIONS[word] ?? word)
			.join(" ");
	}
	return normalized;
}

export function sanitizeQuestions(value: unknown): PhraseQuestion[] {
	if (!Array.isArray(value))
		throw new Error("JSONは配列である必要があります。");
	return value.map((item, index) => {
		if (!item || typeof item !== "object") {
			throw new Error(`${index + 1}件目はオブジェクトではありません。`);
		}
		const raw = item as Record<string, unknown>;
		if (typeof raw.ja !== "string" || !raw.ja.trim()) {
			throw new Error(`${index + 1}件目のjaが空です。`);
		}
		if (typeof raw.en !== "string" || !raw.en.trim()) {
			throw new Error(`${index + 1}件目のenが空です。`);
		}
		const id =
			typeof raw.id === "string" && raw.id.trim()
				? raw.id.trim()
				: `q${String(index + 1).padStart(2, "0")}`;
		return {
			id,
			ja: raw.ja.trim(),
			en: raw.en.trim(),
			category:
				typeof raw.category === "string" && raw.category.trim()
					? raw.category.trim()
					: "一般",
			wrong: raw.wrong === true,
		};
	});
}

export function loadQuestions(): PhraseQuestion[] {
	if (typeof window === "undefined") return [];
	try {
		return sanitizeQuestions(
			JSON.parse(localStorage.getItem(QUESTIONS_KEY) ?? "[]"),
		);
	} catch {
		return [];
	}
}

export function saveQuestions(questions: PhraseQuestion[]) {
	if (typeof window !== "undefined") {
		localStorage.setItem(QUESTIONS_KEY, JSON.stringify(questions));
	}
}

export function loadSettings(): PhraseSettings {
	if (typeof window === "undefined") return DEFAULT_SETTINGS;
	try {
		const value = JSON.parse(
			localStorage.getItem(SETTINGS_KEY) ?? "{}",
		) as Partial<PhraseSettings> | null;
		return {
			ignoreCase: value?.ignoreCase ?? true,
			ignorePunctuation: value?.ignorePunctuation ?? true,
			allowContractions: value?.allowContractions ?? true,
		};
	} catch {
		return DEFAULT_SETTINGS;
	}
}

export function saveSettings(settings: PhraseSettings) {
	if (typeof window !== "undefined") {
		localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
	}
}

export function shuffle<T>(items: T[]): T[] {
	const result = [...items];
	for (let i = result.length - 1; i > 0; i -= 1) {
		const j = Math.floor(Math.random() * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}
	return result;
}
