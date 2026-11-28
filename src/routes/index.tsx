import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TbArrowRight, TbPencil, TbRepeat } from "react-icons/tb";
import { SectionCard } from "../components/SectionCard";
import { readAnswerStats } from "../lib/answer-stats";
import { loadStudySections, type StudySection } from "../lib/settings";
import {
	completeWordMigration,
	loadMigrationStatus,
	loadWordsJson,
	sanitizeWords,
	saveWordsJson,
	startWordMigration,
	type WordMigrationStatus,
} from "../lib/word-json";
import { getQuizWords } from "../server/quiz";

export const Route = createFileRoute("/")({
	loader: () => getQuizWords({ data: { from: 1, to: 100000 } }),
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
	const { words } = Route.useLoaderData();
	const [studySections, setStudySections] = useState<StudySection[]>([]);
	const [answerStats, setAnswerStats] = useState<
		Record<number, { correct: number; total: number }>
	>({});
	const [migrationStatus, setMigrationStatus] =
		useState<WordMigrationStatus | null>(null);
	const [migrationError, setMigrationError] = useState("");
	const [jsonText, setJsonText] = useState("");
	const [showJsonManager, setShowJsonManager] = useState(false);
	useEffect(() => {
		setAnswerStats(readAnswerStats());
	}, []);
	useEffect(() => setStudySections(loadStudySections()), []);
	useEffect(() => {
		startWordMigration(words);
		setMigrationStatus(loadMigrationStatus());
		setJsonText(JSON.stringify(loadWordsJson() ?? words, null, 2));
	}, [words]);

	function saveJson() {
		try {
			const next = sanitizeWords(JSON.parse(jsonText));
			saveWordsJson(next);
			completeWordMigration();
			setMigrationStatus(loadMigrationStatus());
			setMigrationError("");
		} catch (error) {
			setMigrationError(
				error instanceof Error ? error.message : "JSONが不正です。",
			);
		}
	}

	function exportJson() {
		const blob = new Blob([JSON.stringify(loadWordsJson() ?? words, null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement("a");
		anchor.href = url;
		anchor.download = "go-kun_words_v1.json";
		anchor.click();
		URL.revokeObjectURL(url);
	}

	async function importJson(file: File) {
		try {
			const next = sanitizeWords(JSON.parse(await file.text()));
			saveWordsJson(next);
			completeWordMigration();
			setJsonText(JSON.stringify(next, null, 2));
			setMigrationStatus(loadMigrationStatus());
			setMigrationError("");
		} catch (error) {
			setMigrationError(
				error instanceof Error ? error.message : "インポートに失敗しました。",
			);
		}
	}

	return (
		<div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 p-4 sm:p-6">
			<header className="flex flex-col gap-3 border-b border-neutral-950 pb-4 text-neutral-950 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4 dark:border-white dark:text-white">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">ゴーくん</h1>
					<p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
						範囲を選んで、学習を始めよう
					</p>
				</div>
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
				<div className="border border-neutral-950 p-4 text-sm dark:border-white">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<p className="font-bold">
								{migrationStatus?.source === "json"
									? "JSON保存へ移行済み"
									: "DB → JSON 移行期間中"}
							</p>
							<p className="mt-1 text-neutral-600 dark:text-neutral-400">
								{migrationStatus
									? `DBフォールバック期限：${new Date(migrationStatus.dbFallbackUntil).toLocaleDateString("ja-JP")}`
									: "初回起動時に単語データをJSONへ移行します"}
							</p>
						</div>
						<button
							type="button"
							onClick={() => setShowJsonManager((open) => !open)}
							className="border border-neutral-950 px-4 py-2 font-bold dark:border-white"
						>
							{showJsonManager ? "閉じる" : "JSONを管理"}
						</button>
					</div>
					{showJsonManager && (
						<div className="mt-4 flex flex-col gap-3">
							{migrationError && (
								<p className="border border-red-700 p-3 text-red-700">
									{migrationError}
								</p>
							)}
							<textarea
								value={jsonText}
								onChange={(event) => setJsonText(event.target.value)}
								rows={12}
								className="border border-neutral-950 p-3 font-mono text-xs dark:border-white"
							/>
							<div className="grid grid-cols-3 gap-2">
								<button
									type="button"
									onClick={saveJson}
									className="border border-neutral-950 p-3 font-bold dark:border-white"
								>
									保存
								</button>
								<button
									type="button"
									onClick={exportJson}
									className="border border-neutral-950 p-3 dark:border-white"
								>
									エクスポート
								</button>
								<label className="border border-neutral-950 p-3 text-center dark:border-white">
									インポート
									<input
										type="file"
										accept=".json,application/json"
										className="hidden"
										onChange={(event) => {
											const file = event.target.files?.[0];
											if (file) void importJson(file);
										}}
									/>
								</label>
							</div>
						</div>
					)}
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
						学習サマリー
					</a>
					<a href="/settings" className="underline underline-offset-4">
						Setting
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
