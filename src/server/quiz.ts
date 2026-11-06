import { createServerFn } from "@tanstack/react-start";

export type QuizWord = {
	id: number;
	word: string;
	meanings: string[];
};

type QuizRange = {
	from?: number;
	to?: number;
};

export type QuizData = {
	words: QuizWord[];
	meanings: string[];
};

function normalizeRange(input: QuizRange) {
	const rawFrom = Number(input?.from);
	const rawTo = Number(input?.to);
	const from = Number.isFinite(rawFrom) ? Math.max(1, Math.trunc(rawFrom)) : 1;
	const to = Number.isFinite(rawTo)
		? Math.max(from, Math.trunc(rawTo))
		: 100000;

	return { from, to };
}

export const getQuizWords = createServerFn({ method: "GET" })
	.validator((input: QuizRange) => normalizeRange(input))
	.handler(async ({ data }) => {
		const { getQuizWordsFromDatabase } = await import("./quiz-database.server");
		return getQuizWordsFromDatabase(data);
	});
