import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SectionCard } from "../components/SectionCard";
import { STUDY_SECTIONS } from "../data/sections";
import { readAnswerStats, summarizeAnswerStats } from "../lib/answer-stats";

export const Route = createFileRoute("/")({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: "ゴーくん｜ことばの学習" },
		],
	}),
	component: Home,
});

function Home() {
	const [answerStats, setAnswerStats] = useState<
		Record<number, { correct: number; total: number }>
	>({});
	useEffect(() => setAnswerStats(readAnswerStats()), []);

	const { answeredCount, correctCount } = summarizeAnswerStats(answerStats);
	const overallAccuracy =
		answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

	return (
		<div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 p-4 sm:p-6">
			<header className="flex flex-col gap-3 border-b border-neutral-950 pb-4 text-neutral-950 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4 dark:border-white dark:text-white">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">ゴーくん</h1>
					<p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
						範囲を選んで、学習を始めよう
					</p>
				</div>
				<div className="grid w-full max-w-xs grid-cols-2 border border-neutral-950 dark:border-white">
					<div className="flex flex-col gap-1 border-r border-neutral-950 px-4 py-3 dark:border-white">
						<span className="text-xs text-neutral-600 dark:text-neutral-400">
							問題数
						</span>
						<strong className="text-2xl leading-none font-bold tabular-nums">
							{answeredCount}
							<span className="ml-1 text-xs font-normal text-neutral-600 dark:text-neutral-400">
								問
							</span>
						</strong>
					</div>
					<div className="flex flex-col gap-1 px-4 py-3">
						<span className="text-xs text-neutral-600 dark:text-neutral-400">
							正答率
						</span>
						<strong className="text-2xl leading-none font-bold tabular-nums">
							{overallAccuracy}
							<span className="ml-1 text-xs font-normal text-neutral-600 dark:text-neutral-400">
								%
							</span>
						</strong>
					</div>
				</div>
			</header>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{STUDY_SECTIONS.map((section) => (
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
					href="mailto:info@ayane0857.net"
					className="w-fit underline underline-offset-4"
				>
					Contact
				</a>
			</footer>
		</div>
	);
}
