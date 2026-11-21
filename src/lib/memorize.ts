export type MemorizeSentence = {
	id: string;
	ja: string;
	en: string;
};

export const MEMORIZE_KEY = "go-kun_memorize_sentences_v1";

export const SAMPLE_SENTENCES: MemorizeSentence[] = [
	{
		id: "m01",
		ja: "毎朝、私は英語を勉強します。\nコツコツ続けることで、自信がついてきます。",
		en: "I study English every morning.\nBy continuing little by little, I am gaining confidence.",
	},
	{
		id: "m02",
		ja: "失敗しても諦めないでください。\n失敗は次の成功のための準備です。",
		en: "Do not give up, even if you fail.\nFailure is preparation for your next success.",
	},
	{
		id: "m03",
		ja: "毎日少しずつ練習すれば、必ず上達します。\n小さな進歩を積み重ねることが大切です。",
		en: "If you practice a little every day, you will surely improve.\nIt is important to build small improvements step by step.",
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
		if (typeof raw.en !== "string" || !raw.en.trim()) {
			throw new Error(`${index + 1}件目のenが空です。`);
		}
		return {
			id:
				typeof raw.id === "string" && raw.id.trim()
					? raw.id.trim()
					: `m${String(index + 1).padStart(2, "0")}`,
			ja: typeof raw.ja === "string" && raw.ja.trim() ? raw.ja.trim() : "",
			en: raw.en.trim(),
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
