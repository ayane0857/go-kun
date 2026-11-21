export type MemorizeSentence = {
	id: string;
	ja: string;
	en: string;
};

export const MEMORIZE_KEY = "go-kun_memorize_sentences_v1";

export const SAMPLE_SENTENCES: MemorizeSentence[] = [
	{
		id: "m1795281631160",
		ja: "What is the most important thing for communication with people from other countries?\nPlease explain your opinion in about 30 words and describe the reason why you think so.",
		en: "I think listing is the most important thing when communicating with people from other countries.\nThis is because a written message can be difficult to understand when we do not know the language well.",
	},
	{
		id: "m1795281982496",
		ja: "Who do you often communicate with on social media?\nPlease answer the question in about 30 words.",
		en: "I often communicate with my friend on social media.\nShe is a smart and kind student, so I enjoy talking with her.\nWe often discuss tests and homework, and she helps me.",
	},
];

export function sanitizeSentences(value: unknown): MemorizeSentence[] {
	if (!Array.isArray(value)) {
		throw new Error("JSONは配列である必要があります。");
	}
	return value.map((item, index) => {
		if (!item || typeof item !== "object") {
			throw new Error(`${index + 1}件目はオブジェクトではありません。`);
		}
		const raw = item as Record<string, unknown>;
		const question =
			typeof raw.question === "string"
				? raw.question
				: typeof raw.ja === "string"
					? raw.ja
					: "";
		const answer =
			typeof raw.answer === "string"
				? raw.answer
				: typeof raw.en === "string"
					? raw.en
					: "";
		if (!answer.trim()) {
			throw new Error(`${index + 1}件目のanswerが空です。`);
		}
		return {
			id:
				typeof raw.id === "string" && raw.id.trim()
					? raw.id.trim()
					: `m${String(index + 1).padStart(2, "0")}`,
			ja: question.trim(),
			en: answer.trim(),
		};
	});
}

export function loadSentences(): MemorizeSentence[] {
	if (typeof window === "undefined") return [];
	try {
		const stored = localStorage.getItem(MEMORIZE_KEY);
		if (stored === null) return SAMPLE_SENTENCES;
		return sanitizeSentences(JSON.parse(stored));
	} catch {
		return SAMPLE_SENTENCES;
	}
}

export function saveSentences(sentences: MemorizeSentence[]) {
	if (typeof window !== "undefined") {
		localStorage.setItem(MEMORIZE_KEY, JSON.stringify(sentences));
	}
}
