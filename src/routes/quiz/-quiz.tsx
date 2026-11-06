import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import type { QuizWord } from "../../server/quiz";
import { recordAnswer } from "../../lib/answer-stats";

type QuizProps = {
	words: QuizWord[];
	meanings: string[];
	mode: "choice" | "input";
	from: number;
	to: number;
};

function normalizeAnswer(value: string) {
	return value
		.normalize("NFKC")
		.trim()
		.replace(/\s+/g, " ")
		.toLocaleLowerCase();
}

export function Quiz({ words, meanings, mode, from, to }: QuizProps) {
	const [index, setIndex] = useState(0);
	const [answer, setAnswer] = useState<string | null>(null);
	const [input, setInput] = useState("");

	const current = words[index];
	const correctMeaning = current?.meanings[0] ?? "";
	const options = useMemo(() => {
		if (!current) return [];

		const validMeanings = new Set(current.meanings.map(normalizeAnswer));
		const distractors = meanings.filter(
			(meaning) => !validMeanings.has(normalizeAnswer(meaning)),
		);
		const selected = [correctMeaning, ...distractors].slice(0, 4);
		if (selected.length === 0) return [];
		const offset = index % selected.length;
		return [...selected.slice(offset), ...selected.slice(0, offset)];
	}, [current, correctMeaning, index, meanings]);

	if (words.length === 0) {
		return (
			<main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 p-6">
				<p>この範囲には問題がありません。</p>
				<Link to="/" className="underline underline-offset-4">
					範囲選択に戻る
				</Link>
			</main>
		);
	}

	const isAnswered = answer !== null;
	const isCorrect =
		answer !== null &&
		(current?.meanings.some(
			(meaning) => normalizeAnswer(meaning) === normalizeAnswer(answer),
		) ??
			false);

	function submit(nextAnswer: string) {
		if (!isAnswered) {
			const correct =
				current?.meanings.some(
					(meaning) => normalizeAnswer(meaning) === normalizeAnswer(nextAnswer),
				) ?? false;
			if (current) recordAnswer(current.id, correct);
			setAnswer(nextAnswer);
		}
	}

	function next() {
		setIndex((value) => (value + 1) % words.length);
		setAnswer(null);
		setInput("");
	}

	return (
		<main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-8 p-6">
			<header className="flex items-center justify-between border-b border-neutral-950 pb-4 dark:border-white">
				<div>
					<p className="text-sm text-neutral-600 dark:text-neutral-400">
						#{from} - #{to}
					</p>
					<h1 className="text-2xl font-bold">
						{mode === "choice" ? "四択問題" : "入力問題"}
					</h1>
				</div>
				<Link to="/" className="text-sm underline underline-offset-4">
					終了
				</Link>
			</header>

			<div className="flex flex-col gap-3">
				<p className="text-sm text-neutral-600 dark:text-neutral-400">
					{index + 1} / {words.length}
				</p>
				<p className="text-4xl font-bold">{current?.word}</p>
				<p className="text-sm text-neutral-600 dark:text-neutral-400">
					{mode === "choice"
						? "正しい意味を選んでください"
						: "意味を入力してください"}
				</p>
			</div>

			{mode === "choice" ? (
				<div className="grid gap-3">
					{options.map((option) => (
						<button
							type="button"
							key={option}
							onClick={() => submit(option)}
							disabled={isAnswered}
							className={`border border-neutral-950 p-4 text-left hover:bg-neutral-100 disabled:cursor-default dark:border-white dark:hover:bg-neutral-800 ${
								isAnswered &&
								current?.meanings.some(
									(meaning) =>
										normalizeAnswer(meaning) === normalizeAnswer(option),
								)
									? "bg-green-100 dark:bg-green-950"
									: isAnswered && option === answer
										? "bg-red-100 dark:bg-red-950"
										: ""
							}`}
						>
							{option}
						</button>
					))}
				</div>
			) : (
				<form
					className="flex flex-col gap-3"
					onSubmit={(event) => {
						event.preventDefault();
						submit(input);
					}}
				>
					<input
						value={input}
						onChange={(event) => setInput(event.target.value)}
						disabled={isAnswered}
						className="border border-neutral-950 bg-transparent p-4 outline-none focus:ring-2 focus:ring-neutral-950 dark:border-white dark:focus:ring-white"
						placeholder="意味を入力"
					/>
					<button
						type="submit"
						disabled={isAnswered || normalizeAnswer(input).length === 0}
						className="border border-neutral-950 p-4 font-bold disabled:opacity-50 dark:border-white"
					>
						回答する
					</button>
				</form>
			)}

			{isAnswered && (
				<div className="flex flex-col gap-4 border-t border-neutral-950 pt-5 dark:border-white">
					<p
						className={
							isCorrect
								? "text-green-700 dark:text-green-400"
								: "text-red-700 dark:text-red-400"
						}
					>
						{isCorrect ? "正解！" : `不正解。正解は「${correctMeaning}」`}
					</p>
					<button
						type="button"
						onClick={next}
						className="border border-neutral-950 p-4 font-bold dark:border-white"
					>
						次の問題
					</button>
				</div>
			)}
		</main>
	);
}
