import { Button } from "@base-ui/react/button";
import { Dialog } from "@base-ui/react/dialog";
import { Progress } from "@base-ui/react/progress";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TbDotsVertical, TbListCheck, TbPencil, TbX } from "react-icons/tb";
import { readAnswerStats } from "../lib/answer-stats";

export const Route = createFileRoute("/")({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "ページのタイトル",
			},
		],
	}),
	component: Home,
});

type Section = {
	id: string;
	from: number;
	to: number;
};

const SECTIONS: Section[] = [
	{ id: "column-1", from: 240, to: 340 },
	{ id: "column-2", from: 341, to: 440 },
	{ id: "column-3", from: 441, to: 540 },
];

const QUIZ_MODES = [
	{
		id: "choice",
		label: "四択問題",
		description: "4つの選択肢から正解を選ぶ",
		to: "/quiz/choice",
		icon: TbListCheck,
	},
	{
		id: "input",
		label: "入力問題",
		description: "答えを自分で入力する",
		to: "/quiz/input",
		icon: TbPencil,
	},
] as const;

function Home() {
	const [answerStats, setAnswerStats] = useState<
		Record<number, { correct: number; total: number }>
	>({});
	useEffect(() => setAnswerStats(readAnswerStats()), []);

	return (
		<div className="flex flex-col h-full w-full gap-4 p-4">
			<header className="flex flex-col gap-1 border-b border-neutral-950 pb-4 text-neutral-950 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4 dark:border-white dark:text-white">
				<h1 className="text-3xl font-bold tracking-tight">ゴーくん</h1>
				<p className="text-sm text-neutral-600 dark:text-neutral-400">
					範囲を選んで、学習を始めよう
				</p>
			</header>

			<div className="flex flex-row gap-4">
				{SECTIONS.map((section) => (
					<SectionCard
						key={section.id}
						section={section}
						answerStats={answerStats}
					/>
				))}
			</div>

			<footer className="mt-auto flex flex-col gap-2 border-t border-neutral-950 pt-4 text-sm text-neutral-600 sm:flex-row sm:items-center sm:justify-between dark:border-white dark:text-neutral-400">
				<p className="font-bold text-neutral-950 dark:text-white">ゴーくん</p>
				<p>© 2026 Ayane. All rights reserved.</p>
				<a
					href="#contact"
					className="w-fit underline underline-offset-4 hover:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:hover:text-white dark:focus-visible:outline-white"
				>
					Contact
				</a>
			</footer>
		</div>
	);
}

function SectionCard({
	section,
	answerStats,
}: {
	section: Section;
	answerStats: Record<number, { correct: number; total: number }>;
}) {
	const correctCount = Object.entries(answerStats).reduce(
		(count, [id, stat]) =>
			Number(id) >= section.from && Number(id) <= section.to && stat.correct > 0
				? count + 1
				: count,
		0,
	);
	const questionCount = section.to - section.from + 1;
	const accuracy = correctCount / questionCount;
	return (
		<div className="flex min-w-0 flex-1 flex-col gap-4 border border-neutral-950 p-6 dark:border-white">
			<div className="flex items-center justify-between gap-4">
				<p className="text-lg">
					#{section.from} - #{section.to}
				</p>
				<Button
					className="flex size-8 items-center justify-center rounded-none text-neutral-950 hover:bg-neutral-100 active:bg-neutral-200 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:text-white dark:hover:bg-neutral-800 dark:active:bg-neutral-700 dark:focus-visible:outline-white"
					aria-label="メニューを開く"
				>
					<TbDotsVertical className="text-lg" aria-hidden="true" />
				</Button>
			</div>

			<Progress.Root
				className="grid w-full grid-cols-2 gap-y-2"
				value={accuracy}
				max={1}
				format={{ style: "percent" }}
			>
				<Progress.Label className="text-sm font-normal text-neutral-950 dark:text-white">
					正答率
				</Progress.Label>
				<Progress.Value className="text-right text-sm text-neutral-950 tabular-nums dark:text-white">
					{Math.round(accuracy * 100)}%
				</Progress.Value>
				<Progress.Track className="col-span-2 h-1 overflow-hidden bg-neutral-200 dark:bg-neutral-800">
					<Progress.Indicator className="bg-neutral-950 transition-[width] duration-500 dark:bg-white" />
				</Progress.Track>
			</Progress.Root>

			<StartDialog section={section} />
		</div>
	);
}

function StartDialog({ section }: { section: Section }) {
	return (
		<Dialog.Root>
			<Dialog.Trigger className="flex h-8 items-center justify-center gap-2 rounded-none border border-neutral-950 bg-white px-3 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 select-none hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400">
				学習を開始する
			</Dialog.Trigger>

			<Dialog.Portal>
				<Dialog.Backdrop className="fixed inset-0 bg-neutral-950/50 transition-opacity duration-150 data-starting-style:opacity-0 data-ending-style:opacity-0 motion-reduce:transition-none" />
				<Dialog.Popup className="fixed top-1/2 left-1/2 flex w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col gap-6 border border-neutral-950 bg-white p-6 text-neutral-950 transition-opacity duration-150 data-starting-style:opacity-0 data-ending-style:opacity-0 motion-reduce:transition-none dark:border-white dark:bg-neutral-950 dark:text-white">
					<div className="flex items-start justify-between gap-4">
						<div className="flex flex-col gap-1">
							<Dialog.Title className="text-xl font-bold">
								出題形式を選ぶ
							</Dialog.Title>
							<Dialog.Description className="text-sm text-neutral-600 tabular-nums dark:text-neutral-400">
								#{section.from} - #{section.to} の問題に挑戦します。
							</Dialog.Description>
						</div>
						<Dialog.Close
							className="-mt-1 -mr-2 flex size-8 shrink-0 items-center justify-center rounded-none text-neutral-950 hover:bg-neutral-100 active:bg-neutral-200 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:text-white dark:hover:bg-neutral-800 dark:active:bg-neutral-700 dark:focus-visible:outline-white"
							aria-label="閉じる"
						>
							<TbX className="text-lg" aria-hidden="true" />
						</Dialog.Close>
					</div>

					<div className="flex flex-col gap-3">
						{QUIZ_MODES.map((mode) => (
							<Link
								key={mode.id}
								to={mode.to}
								search={{ from: section.from, to: section.to }}
								className="flex items-center gap-4 border border-neutral-950 p-4 text-neutral-950 hover:bg-neutral-100 active:bg-neutral-200 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:border-white dark:text-white dark:hover:bg-neutral-800 dark:active:bg-neutral-700 dark:focus-visible:outline-white"
							>
								<mode.icon className="shrink-0 text-2xl" aria-hidden="true" />
								<span className="flex flex-col gap-0.5">
									<span className="font-bold">{mode.label}</span>
									<span className="text-sm text-neutral-600 dark:text-neutral-400">
										{mode.description}
									</span>
								</span>
							</Link>
						))}
					</div>
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
