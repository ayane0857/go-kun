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

export const DEFAULT_QUESTIONS: PhraseQuestion[] = [
	{
		id: "q1795282475828",
		ja: "割れたガラスに注意しなさい。",
		en: "Be careful of the broken glass.",
		category: "カスタム",
		wrong: false,
	},
	{
		id: "q1795282497623",
		ja: "サリーと話している少女を知っていますか。",
		en: "Do you know the girl talking to Sally.",
		category: "カスタム",
		wrong: false,
	},
	{
		id: "q1795282513854",
		ja: "彼女は私を一時間待たせた。",
		en: "She kept me waiting for an hour.",
		category: "カスタム",
		wrong: false,
	},
	{
		id: "q1795282531439",
		ja: "私はスティーブがバスを待っているのを見かけた。",
		en: "I saw Steve waiting for a bus.",
		category: "カスタム",
		wrong: false,
	},
	{
		id: "q1795282545828",
		ja: "彼女はバッグを盗まれた。",
		en: "She had her bag stolen.",
		category: "カスタム",
		wrong: false,
	},
	{
		id: "q1795282567265",
		ja: "英語で自分の言いたいことを伝えられますか。",
		en: "Can you make yourself understood in English?",
		category: "カスタム",
		wrong: false,
	},
	{
		id: "q1795282597552",
		ja: "電話で話しながら、私たちは夜を明かした。",
		en: "We sat up all night, talking on the phone.",
		category: "カスタム",
		wrong: false,
	},
	{
		id: "q1795282622527",
		ja: "サッカーをしているとき、彼は脚をけがした。",
		en: "Playing soccer, he hurt his leg.",
		category: "カスタム",
		wrong: false,
	},
	{
		id: "q1795282645290",
		ja: "わかりやすい英語で書かれているので、この本は読みやすい。",
		en: "Written in plain English, this book is easy to read.",
		category: "カスタム",
		wrong: false,
	},
	{
		id: "q1795282666673",
		ja: "何をしていいかわからないので、私はただそこに立っていた。",
		en: "I just stood there, not knowing what to do.",
		category: "カスタム",
		wrong: false,
	},
	{
		id: "q1795282689938",
		ja: "宿題を終えてから、私は寝ました。",
		en: "Having finished my homework, I went to bed.",
		category: "カスタム",
		wrong: false,
	},
	{
		id: "q1795282715817",
		ja: "この写真から判断すると、彼はとても背が高い。",
		en: "Judging from this picture, he is very tall.",
		category: "カスタム",
		wrong: false,
	},
	{
		id: "q1795282738178",
		ja: "その女性は脚を組んで座った。",
		en: "The woman was sitting with her legs crossed.",
		category: "カスタム",
		wrong: false,
	},
	{
		id: "q1795282756251",
		ja: "この箱は重すぎて私は持ちあげられない。",
		en: "This box is too heavy for me to lift.",
		category: "カスタム",
		wrong: false,
	},
	{
		id: "q1795282784674",
		ja: "私はフランス語を上手に話す女性に出会った。",
		en: "I met a woman who spoke French well.",
		category: "カスタム",
		wrong: false,
	},
	{
		id: "q1795282815094",
		ja: "彼女は10代に人気がある小説を読んでいた。",
		en: "She was reading a novel which was popular with teenagers.",
		category: "カスタム",
		wrong: false,
	},
	{
		id: "q1795282838212",
		ja: "私が韓国で出会った人々は親切だった。",
		en: "The people whom I met in Korea were nice.",
		category: "カスタム",
		wrong: false,
	},
	{
		id: "q1795282854756",
		ja: "これが、彼が書いた本です。",
		en: "This is the book which he wrote.",
		category: "カスタム",
		wrong: false,
	},
	{
		id: "q1795282879941",
		ja: "私は姉が漫画家である女性に会った。",
		en: "I met a woman whose sister is a cartoonist.",
		category: "カスタム",
		wrong: false,
	},
	{
		id: "q1795282909781",
		ja: "これは私が今まで見たなかで最も高いビルです。",
		en: "This is the tallest building that I've ever seen.",
		category: "カスタム",
		wrong: false,
	},
];

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
		const stored = localStorage.getItem(QUESTIONS_KEY);
		return stored ? sanitizeQuestions(JSON.parse(stored)) : DEFAULT_QUESTIONS;
	} catch {
		return DEFAULT_QUESTIONS;
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
