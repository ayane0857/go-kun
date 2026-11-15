import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { recordAnswer } from "../../lib/answer-stats";
import type { QuizWord } from "../../server/quiz";

type QuizProps = {
	words: QuizWord[];
	meanings: string[];
	mode: "choice" | "input";
	from: number;
	to: number;
};

type Direction = "english-to-japanese" | "japanese-to-english";
type AnswerResult = "correct" | "incorrect" | "gave-up";

function normalizeAnswer(value: string) {
	return value
		.normalize("NFKC")
		.trim()
		.replace(/\s+/g, " ")
		.toLocaleLowerCase();
}

function shuffle<T>(items: T[]) {
	const shuffled = [...items];
	for (let index = shuffled.length - 1; index > 0; index -= 1) {
		const randomIndex = Math.floor(Math.random() * (index + 1));
		[shuffled[index], shuffled[randomIndex]] = [
			shuffled[randomIndex],
			shuffled[index],
		];
	}
	return shuffled;
}

// 範囲(from/to)やモードが変わったら state を丸ごとリセットするため key を付ける
export function Quiz(props: QuizProps) {
	return (
		<QuizSession key={`${props.mode}:${props.from}:${props.to}`} {...props} />
	);
}

function QuizSession({ words, meanings, mode, from, to }: QuizProps) {
	const [sessionWords, setSessionWords] = useState(words);
	const [sessionAnswers, setSessionAnswers] = useState<
		{
			id: number;
			word: string;
			answer: string;
			correctMeaning: string;
			correct: boolean;
		}[]
	>([]);
	const [index, setIndex] = useState(0);
	const [answer, setAnswer] = useState<string | null>(null);
	const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
	const [input, setInput] = useState("");
	const [correctCount, setCorrectCount] = useState(0);
	const [finished, setFinished] = useState(false);
	const [direction, setDirection] = useState<Direction | null>(
		mode === "input" ? null : "english-to-japanese",
	);

	const inputRef = useRef<HTMLInputElement>(null);
	const nextButtonRef = useRef<HTMLButtonElement>(null);

	const current = sessionWords[index];
	const prompt =
		direction === "japanese-to-english"
			? (current?.meanings[0] ?? "")
			: (current?.word ?? "");
	const correctAnswers =
		direction === "japanese-to-english"
			? current
				? [current.word]
				: []
			: (current?.meanings ?? []);

	// 選択肢は「問題が変わったときだけ」作り直す。
	// (依存に毎回新しくなる配列を入れると、回答時の再レンダリングで選択肢がシャッフルされ直してしまう)
	const options = useMemo(() => {
		if (!current || !direction) return [];

		const correct =
			direction === "japanese-to-english" ? [current.word] : current.meanings;
		const correctOption = correct[0];
		if (!correctOption) return [];

		const pool =
			direction === "japanese-to-english"
				? words.map((word) => word.word)
				: meanings;

		// 正解と重複する候補・候補同士の重複を除く
		const seen = new Set(correct.map(normalizeAnswer));
		const distractors: string[] = [];
		for (const candidate of pool) {
			const key = normalizeAnswer(candidate);
			if (!key || seen.has(key)) continue;
			seen.add(key);
			distractors.push(candidate);
		}

		return shuffle([correctOption, ...shuffle(distractors).slice(0, 3)]);
	}, [current, direction, words, meanings]);

	const isAnswered = answerResult !== null;

	function next() {
		if (index === sessionWords.length - 1) {
			setFinished(true);
			return;
		}
		setIndex((value) => value + 1);
		setAnswer(null);
		setAnswerResult(null);
		setInput("");
	}

	// フォーカス管理:
	// - 回答後は「次の問題」ボタンにフォーカス → Enter で次へ進める
	// - 次の問題になったら入力欄にフォーカス
	// (window の keydown で Enter を拾うと、回答した Enter がそのまま「次へ」も
	//  実行してしまい、正誤が一瞬で消えるため、この方式にしている)
	// biome-ignore lint/correctness/useExhaustiveDependencies: index で問題切り替えを検知する
	useEffect(() => {
		if (finished || direction === null) return;
		const timer = setTimeout(() => {
			if (isAnswered) {
				nextButtonRef.current?.focus();
			} else if (mode === "input") {
				inputRef.current?.focus();
			}
		}, 0);
		return () => clearTimeout(timer);
	}, [finished, direction, isAnswered, mode, index]);

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

	if (direction === null) {
		return (
			<main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-8 p-6">
				<header className="border-b border-neutral-950 pb-4 dark:border-white">
					<p className="text-sm text-neutral-600 dark:text-neutral-400">
						#{from} - #{to}
					</p>
					<h1 className="text-2xl font-bold">出題する言語を選んでください</h1>
				</header>
				<div className="grid gap-3 sm:grid-cols-2">
					<button
						type="button"
						onClick={() => setDirection("english-to-japanese")}
						className="flex flex-col gap-2 border border-neutral-950 p-5 text-left hover:bg-neutral-100 dark:border-white dark:hover:bg-neutral-800"
					>
						<strong>英語 → 日本語</strong>
						<span className="text-sm text-neutral-600 dark:text-neutral-400">
							英単語を見て、日本語で答える
						</span>
					</button>
					<button
						type="button"
						onClick={() => setDirection("japanese-to-english")}
						className="flex flex-col gap-2 border border-neutral-950 p-5 text-left hover:bg-neutral-100 dark:border-white dark:hover:bg-neutral-800"
					>
						<strong>日本語 → 英語</strong>
						<span className="text-sm text-neutral-600 dark:text-neutral-400">
							日本語を見て、英単語で答える
						</span>
					</button>
				</div>
				<Link to="/" className="text-sm underline underline-offset-4">
					範囲選択に戻る
				</Link>
			</main>
		);
	}

	const isCorrect = answerResult === "correct";

	function submit(nextAnswer: string) {
		if (isAnswered || !current) return;
		const correct = correctAnswers.some(
			(meaning) => normalizeAnswer(meaning) === normalizeAnswer(nextAnswer),
		);
		recordAnswer(current.id, correct);
		setSessionAnswers((answers) => [
			...answers,
			{
				id: current.id,
				word: prompt,
				answer: nextAnswer,
				correctMeaning: correctAnswers.join("、"),
				correct,
			},
		]);
		if (correct) setCorrectCount((count) => count + 1);
		setAnswer(nextAnswer);
		setAnswerResult(correct ? "correct" : "incorrect");
	}

	function submitUnknown() {
		if (isAnswered || !current) return;
		recordAnswer(current.id, false);
		setSessionAnswers((answers) => [
			...answers,
			{
				id: current.id,
				word: prompt,
				answer: "わからない",
				correctMeaning: correctAnswers.join("、"),
				correct: false,
			},
		]);
		setAnswerResult("gave-up");
	}

	function retry() {
		setSessionWords(shuffle(words));
		setSessionAnswers([]);
		setIndex(0);
		setAnswer(null);
		setAnswerResult(null);
		setInput("");
		setCorrectCount(0);
		setFinished(false);
	}

	function retryIncorrect() {
		const incorrectIds = new Set(
			sessionAnswers.filter((result) => !result.correct).map((r) => r.id),
		);
		const incorrectWords = sessionWords.filter((word) =>
			incorrectIds.has(word.id),
		);
		if (incorrectWords.length === 0) return;
		setSessionWords(shuffle(incorrectWords));
		setSessionAnswers([]);
		setIndex(0);
		setAnswer(null);
		setAnswerResult(null);
		setInput("");
		setCorrectCount(0);
		setFinished(false);
	}

	if (finished) {
		const incorrectCount = sessionWords.length - correctCount;
		const score = Math.round((correctCount / sessionWords.length) * 100);
		return (
			<main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-8 p-6">
				<header className="border-b border-neutral-950 pb-4 dark:border-white">
					<p className="text-sm text-neutral-600 dark:text-neutral-400">
						#{from} - #{to}
					</p>
					<h1 className="text-2xl font-bold">学習結果</h1>
				</header>
				<section className="flex flex-col gap-6 border border-neutral-950 p-6 dark:border-white">
					<div className="text-center">
						<p className="text-sm text-neutral-600 dark:text-neutral-400">
							全{sessionWords.length}問
						</p>
						<p className="mt-2 text-5xl font-bold tabular-nums">
							{score}
							<span className="text-2xl">%</span>
						</p>
						<p className="mt-2">おつかれさまでした！</p>
					</div>
					<div className="grid grid-cols-2 border-y border-neutral-200 py-4 text-center dark:border-neutral-700">
						<div>
							<p className="text-sm text-neutral-600 dark:text-neutral-400">
								正解
							</p>
							<p className="mt-1 text-2xl font-bold tabular-nums">
								{correctCount}
							</p>
						</div>
						<div>
							<p className="text-sm text-neutral-600 dark:text-neutral-400">
								不正解
							</p>
							<p className="mt-1 text-2xl font-bold tabular-nums">
								{incorrectCount}
							</p>
						</div>
					</div>
					{sessionAnswers.some((result) => !result.correct) && (
						<div className="flex flex-col gap-3">
							<h2 className="font-bold">まちがえた問題</h2>
							<ul className="flex flex-col divide-y divide-neutral-200 border-y border-neutral-200 dark:divide-neutral-700 dark:border-neutral-700">
								{sessionAnswers
									.filter((result) => !result.correct)
									.map((result) => (
										<li key={result.id} className="flex flex-col gap-1 py-3">
											<p className="font-bold">{result.word}</p>
											<p className="text-sm text-neutral-600 dark:text-neutral-400">
												あなたの答え：{result.answer}
											</p>
											<p className="text-sm">
												正しい答え：{result.correctMeaning}
											</p>
										</li>
									))}
							</ul>
						</div>
					)}
					{incorrectCount > 0 && (
						<button
							type="button"
							onClick={retryIncorrect}
							className="border border-neutral-950 bg-neutral-950 p-4 font-bold text-white hover:bg-neutral-800 dark:border-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
						>
							まちがえた問題だけ解く（{incorrectCount}問）
						</button>
					)}
					<button
						type="button"
						onClick={retry}
						className="border border-neutral-950 p-4 font-bold hover:bg-neutral-100 dark:border-white dark:hover:bg-neutral-800"
					>
						もう一度挑戦する
					</button>
					<Link
						to="/"
						className="text-center text-sm underline underline-offset-4"
					>
						範囲選択に戻る
					</Link>
				</section>
			</main>
		);
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
					{index + 1} / {sessionWords.length}
				</p>
				<p className="text-4xl font-bold">{prompt}</p>
				<p className="text-sm text-neutral-600 dark:text-neutral-400">
					{mode === "choice"
						? "正しい答えを選んでください"
						: direction === "japanese-to-english"
							? "英語を入力してください"
							: "日本語を入力してください"}
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
								correctAnswers.some(
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
						// IME 変換確定の Enter では送信しない
						if (
							(event.nativeEvent as SubmitEvent & { isComposing?: boolean })
								.isComposing
						)
							return;
						if (normalizeAnswer(input).length === 0) return;
						submit(input);
					}}
				>
					<input
						ref={inputRef}
						value={input}
						onChange={(event) => setInput(event.target.value)}
						onKeyDown={(event) => {
							// IME 変換中の Enter は無視(変換確定のみ)。
							// それ以外の Enter は form の submit に任せる。
							if (event.nativeEvent.isComposing || event.keyCode === 229) {
								event.preventDefault();
							}
						}}
						disabled={isAnswered}
						autoComplete="off"
						autoCapitalize="off"
						spellCheck={false}
						className="border border-neutral-950 bg-transparent p-4 outline-none focus:ring-2 focus:ring-neutral-950 dark:border-white dark:focus:ring-white"
						placeholder={
							direction === "japanese-to-english"
								? "英語を入力"
								: "日本語を入力"
						}
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

			{!isAnswered && (
				<button
					type="button"
					onClick={submitUnknown}
					className="border border-neutral-500 p-3 text-sm text-neutral-700 hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-neutral-950 dark:border-neutral-400 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:focus-visible:outline-white"
				>
					わからない
				</button>
			)}

			{isAnswered && (
				<div className="flex flex-col gap-4 border-t border-neutral-950 pt-5 dark:border-white">
					{isCorrect ? (
						<p className="font-bold text-green-700 dark:text-green-400">
							正解！
						</p>
					) : (
						<div className="flex flex-col gap-3">
							<p className="font-bold text-red-700 dark:text-red-300">
								{answerResult === "gave-up" ? "答えを確認しましょう" : "不正解"}
							</p>
							<div className="flex flex-col gap-3">
								{answerResult !== "gave-up" && (
									<div className="border border-neutral-950 bg-red-100 p-4 dark:border-white dark:bg-red-950">
										<p className="mb-1 text-sm text-neutral-600 dark:text-neutral-400">
											あなたの答え
										</p>
										<p>{answer}</p>
									</div>
								)}
								<div className="border border-neutral-950 bg-green-100 p-4 dark:border-white dark:bg-green-950">
									<p className="mb-1 text-sm text-neutral-600 dark:text-neutral-400">
										正しい答え
									</p>
									<p>{correctAnswers.join("、")}</p>
								</div>
							</div>
						</div>
					)}
					<button
						ref={nextButtonRef}
						type="button"
						onClick={next}
						className="border border-neutral-950 p-4 font-bold focus-visible:outline-2 focus-visible:outline-neutral-950 dark:border-white dark:focus-visible:outline-white"
					>
						{index === sessionWords.length - 1 ? "結果を見る" : "次の問題"}
					</button>
				</div>
			)}
		</main>
	);
}
