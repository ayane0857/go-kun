import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TbArrowRight, TbPencil, TbRepeat } from "react-icons/tb";
import { SectionCard } from "../components/SectionCard";
import { readAnswerStats } from "../lib/answer-stats";
import { loadStudySections, type StudySection } from "../lib/settings";

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
	const [studySections, setStudySections] = useState<StudySection[]>([]);
	const [answerStats, setAnswerStats] = useState<
		Record<number, { correct: number; total: number }>
	>({});
	useEffect(() => {
		setAnswerStats(readAnswerStats());
	}, []);
	useEffect(() => setStudySections(loadStudySections()), []);

	return (
		<div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 p-4 sm:p-6">
			<header className="flex flex-col gap-3 border-b border-neutral-950 pb-4 text-neutral-950 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4 dark:border-white dark:text-white">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">ゴーくん</h1>
					<p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
						範囲を選んで、学習を始めよう
					</p>
				</div>
				<nav className="flex gap-4 text-sm" aria-label="Main navigation">
					<a href="/stats" className="underline underline-offset-4">
						Summary
					</a>
					<a href="/settings" className="underline underline-offset-4">
						Settings
					</a>
				</nav>
			</header>

			<section className="flex flex-col gap-3">
				<div>
					<h2 className="text-sm font-bold tracking-wider text-neutral-950 dark:text-white">
						暗記・作文
					</h2>
					<p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
						文章を覚えたり、自分で英語にしてみたり
					</p>
				</div>
				<div className="grid gap-4 sm:grid-cols-2">
					<a
						href="/memorize"
						className="group flex min-h-44 flex-col border border-neutral-950 p-5 transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-neutral-950 dark:border-white dark:hover:bg-neutral-900 dark:focus-visible:outline-white"
					>
						<div className="flex items-start justify-between gap-4">
							<div className="flex size-11 items-center justify-center border border-neutral-950 dark:border-white">
								<TbRepeat className="text-2xl" aria-hidden="true" />
							</div>
							<TbArrowRight
								className="mt-1 text-xl transition-transform group-hover:translate-x-1"
								aria-hidden="true"
							/>
						</div>
						<div className="mt-auto pt-6">
							<h3 className="text-xl font-bold tracking-tight">
								英語暗記カード
							</h3>
							<p className="mt-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
								問題を見て英文で答え、答えと照合する
							</p>
						</div>
					</a>

					<a
						href="/phraseflow"
						className="group flex min-h-44 flex-col border border-neutral-950 p-5 transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-neutral-950 dark:border-white dark:hover:bg-neutral-900 dark:focus-visible:outline-white"
					>
						<div className="flex items-start justify-between gap-4">
							<div className="flex size-11 items-center justify-center border border-neutral-950 dark:border-white">
								<TbPencil className="text-2xl" aria-hidden="true" />
							</div>
							<TbArrowRight
								className="mt-1 text-xl transition-transform group-hover:translate-x-1"
								aria-hidden="true"
							/>
						</div>
						<div className="mt-auto pt-6">
							<h3 className="text-xl font-bold tracking-tight">
								英作文トレーニング
							</h3>
							<p className="mt-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
								日本語を英文に変換して練習する
							</p>
						</div>
					</a>
				</div>
			</section>

			<section className="flex flex-col gap-3">
				<div>
					<h2 className="text-sm font-bold tracking-wider text-neutral-950 dark:text-white">
						英単語学習
					</h2>
					<p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
						範囲を選んで、単語の意味やスペルを練習
					</p>
				</div>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{studySections.map((section) => (
						<SectionCard
							key={section.id}
							section={section}
							answerStats={answerStats}
						/>
					))}
				</div>
			</section>

			<footer className="mt-auto flex flex-col gap-2 border-t border-neutral-950 pt-4 text-sm text-neutral-600 sm:flex-row sm:items-center sm:justify-between dark:border-white dark:text-neutral-400">
				<p className="font-bold text-neutral-950 dark:text-white">ゴーくん</p>
				<p>© 2026 Ayane. All rights reserved.</p>
				<div className="flex gap-4">
					<a href="/stats" className="underline underline-offset-4">
						Summary
					</a>
					<a href="/settings" className="underline underline-offset-4">
						Settings
					</a>
					<a
						href="mailto:info@ayane0857.net"
						className="w-fit underline underline-offset-4"
					>
						Contact
					</a>
				</div>
			</footer>
		</div>
	);
}
