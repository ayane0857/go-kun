import { words as wordList } from "../data/word-list";

export type QuizWord = {
	id: number;
	word: string;
	meanings: string[];
};

export type QuizRange = {
	from?: number;
	to?: number;
	count?: number;
};

export type QuizData = {
	words: QuizWord[];
	meanings: string[];
};

function normalizeRange(input: QuizRange = {}) {
	const rawFrom = Number(input?.from);
	const rawTo = Number(input?.to);
	const from = Number.isFinite(rawFrom) ? Math.max(1, Math.trunc(rawFrom)) : 1;
	const to = Number.isFinite(rawTo)
		? Math.max(from, Math.trunc(rawTo))
		: 100000;
	const rawCount = Number(input?.count);
	const count =
		Number.isFinite(rawCount) && rawCount > 0
			? Math.trunc(rawCount)
			: undefined;

	return { from, to, count };
}

export function getQuizWords({ data }: { data: QuizRange }): QuizData {
	const { from, to } = normalizeRange(data);
	const words = wordList
		.map((word, index) => ({ ...word, id: index + 1 }))
		.filter((word) => word.id >= from && word.id <= to);
	const meanings = [...new Set(wordList.flatMap((word) => word.meanings))];
	for (let index = words.length - 1; index > 0; index -= 1) {
		const randomIndex = Math.floor(Math.random() * (index + 1));
		[words[index], words[randomIndex]] = [words[randomIndex], words[index]];
	}
	return { words, meanings };
}
