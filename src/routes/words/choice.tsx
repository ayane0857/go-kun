import { createFileRoute } from "@tanstack/react-router";
import { getQuizWords } from "../../lib/quiz";
import { Quiz } from "./-quiz";

export const Route = createFileRoute("/words/choice")({
	validateSearch: (search: Record<string, unknown>) => {
		const fromValue = Number(search.from);
		const from = Number.isFinite(fromValue)
			? Math.max(1, Math.trunc(fromValue))
			: 1;
		const toValue = Number(search.to);
		const to = Number.isFinite(toValue)
			? Math.max(from, Math.trunc(toValue))
			: 100000;
		const countValue = Number(search.count);
		const count =
			Number.isFinite(countValue) && countValue > 0
				? Math.trunc(countValue)
				: undefined;

		return { from, to, count };
	},
	loaderDeps: ({ search }) => search,
	loader: ({ deps }) => getQuizWords({ data: deps }),
	component: ChoiceQuiz,
});

function ChoiceQuiz() {
	const { words, meanings } = Route.useLoaderData();
	const { from, to, count } = Route.useSearch();
	return (
		<Quiz
			key={`${from}:${to}:${count ?? "all"}`}
			words={words}
			meanings={meanings}
			mode="choice"
			from={from}
			to={to}
			questionCount={count}
		/>
	);
}
