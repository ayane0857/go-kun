import { createFileRoute } from "@tanstack/react-router";
import { getQuizWords } from "../../server/quiz";
import { Quiz } from "./-quiz";

export const Route = createFileRoute("/quiz/choice")({
	validateSearch: (search: Record<string, unknown>) => {
		const fromValue = Number(search.from);
		const from = Number.isFinite(fromValue)
			? Math.max(1, Math.trunc(fromValue))
			: 1;
		const toValue = Number(search.to);
		const to = Number.isFinite(toValue)
			? Math.max(from, Math.trunc(toValue))
			: 100000;

		return { from, to };
	},
	loaderDeps: ({ search }) => search,
	loader: ({ deps }) => getQuizWords({ data: deps }),
	component: ChoiceQuiz,
});

function ChoiceQuiz() {
	const { words, meanings } = Route.useLoaderData();
	const { from, to } = Route.useSearch();
	return (
		<Quiz
			key={`${from}:${to}`}
			words={words}
			meanings={meanings}
			mode="choice"
			from={from}
			to={to}
		/>
	);
}
