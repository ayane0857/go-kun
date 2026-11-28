import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TbArrowRight, TbPencil, TbRepeat } from "react-icons/tb";
import { SectionCard } from "../components/SectionCard";
import { readAnswerStats } from "../lib/answer-stats";
import { readStudyHistory, summarizeStudy } from "../lib/study-summary";
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
	const [studyHistory, setStudyHistory] = useState<
		Record<string, { words: number; memorize: number; phraseflow: number }>
	>({});
	const [migrationStatus, setMigrationStatus] =
		useState<WordMigrationStatus | null>(null);
	const [migrationError, setMigrationError] = useState("");
	const [jsonText, setJsonText] = useState("");
	const [showJsonManager, setShowJsonManager] = useState(false);
	const [showStudyDetails, setShowStudyDetails] = useState(false);
	useEffect(() => {
		setAnswerStats(readAnswerStats());
		setStudyHistory(readStudyHistory());
	}, []);
	useEffect(() => setStudySections(loadStudySections()), []);
	useEffect(() => {
		startWordMigration(words);
		setMigrationStatus(loadMigrationStatus());
		setJsonText(JSON.stringify(loadWordsJson() ?? words, null, 2));
	}, [words]);

	const studySummary = summarizeStudy(studyHistory);
	const chartDays = Array.from({ length: 7 }, (_, index) => {
		const date = new Date();
		date.setDate(date.getDate() - (6 - index));
		const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
		return {
			label: date.toLocaleDateString("ja-JP", {
				month: "numeric",
				day: "numeric",
			}),
			...studyHistory[key],
		};
	});
	const maxStudyCount = Math.max(
		0,
		...chartDays.flatMap((day) => [
			day.words ?? 0,
			day.memorize ?? 0,
			day.phraseflow ?? 0,
		]),
	);
	const chartMax = Math.max(4, Math.ceil(maxStudyCount / 4) * 4);
	const chartSeries = [
		{ key: "words", label: "英単語", color: "#2563eb" },
		{ key: "memorize", label: "英語暗記", color: "#16a34a" },
		{ key: "phraseflow", label: "英作文", color: "#9333ea" },
	] as const;
	const chartPoint = (value: number, index: number) =>
		`${50 + index * 83},${205 - (value / chartMax) * 180}`;

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

			<section
				className="border border-neutral-950 p-5 dark:border-white"
				aria-labelledby="study-summary-title"
			>
				<div className="flex flex-wrap items-baseline justify-between gap-2">
					<div>
						<h2 id="study-summary-title" className="text-lg font-bold">
							学習サマリー
						</h2>
						<p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
							今日と直近7日間の取り組み
						</p>
					</div>
					<p className="text-sm text-neutral-600 dark:text-neutral-400">
						今日{" "}
						<strong className="text-2xl text-neutral-950 dark:text-white">
							{studySummary.todayTotal}
						</strong>{" "}
						問・枚
					</p>
				</div>
				<div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
					<div className="border border-neutral-300 p-3 dark:border-neutral-700">
						<p className="text-xs text-neutral-600 dark:text-neutral-400">
							直近7日
						</p>
						<p className="mt-1 text-2xl font-bold tabular-nums">
							{studySummary.weekTotal}
							<span className="ml-1 text-xs font-normal">問・枚</span>
						</p>
					</div>
					<div className="border border-neutral-300 p-3 dark:border-neutral-700">
						<p className="text-xs text-neutral-600 dark:text-neutral-400">
							英単語
						</p>
						<p className="mt-1 text-2xl font-bold tabular-nums">
							{studySummary.week.words}
							<span className="ml-1 text-xs font-normal">回</span>
						</p>
					</div>
					<div className="border border-neutral-300 p-3 dark:border-neutral-700">
						<p className="text-xs text-neutral-600 dark:text-neutral-400">
							英語暗記
						</p>
						<p className="mt-1 text-2xl font-bold tabular-nums">
							{studySummary.week.memorize}
							<span className="ml-1 text-xs font-normal">枚</span>
						</p>
					</div>
					<div className="border border-neutral-300 p-3 dark:border-neutral-700">
						<p className="text-xs text-neutral-600 dark:text-neutral-400">
							英作文
						</p>
						<p className="mt-1 text-2xl font-bold tabular-nums">
							{studySummary.week.phraseflow}
							<span className="ml-1 text-xs font-normal">問</span>
						</p>
					</div>
				</div>
				<p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
					学習量の記録はこの端末で、追加後の分から集計されます。
				</p>
				<button
					type="button"
					onClick={() => setShowStudyDetails((visible) => !visible)}
					aria-expanded={showStudyDetails}
					className="mt-4 border border-neutral-950 px-4 py-2 text-sm font-bold underline-offset-4 hover:underline dark:border-white"
				>
					{showStudyDetails ? "閉じる" : "詳しく見る"}
				</button>
				{showStudyDetails && (
					<div className="mt-5 border-t border-neutral-300 pt-5 dark:border-neutral-700">
						<h3 className="font-bold">日ごとの学習量</h3>
						<div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
							{chartSeries.map((series) => (
								<div key={series.key} className="flex items-center gap-2">
									<span
										className="size-3 rounded-full"
										style={{ backgroundColor: series.color }}
										aria-hidden="true"
									/>
									{series.label}
								</div>
							))}
						</div>
						<div className="mt-3 overflow-x-auto">
							<svg
								viewBox="0 0 600 250"
								role="img"
								aria-label="直近7日間の日ごとの学習量を示す折れ線グラフ"
								className="h-64 min-w-[560px] w-full"
							>
								{[0, 1, 2, 3, 4].map((tick) => {
									const y = 205 - tick * 45;
									return (
										<g key={tick}>
											<line
												x1="42"
												x2="548"
												y1={y}
												y2={y}
												stroke="currentColor"
												opacity="0.15"
											/>
											<text
												x="34"
												y={y + 4}
												textAnchor="end"
												fontSize="11"
												fill="currentColor"
											>
												{Math.round((chartMax * tick) / 4)}
											</text>
										</g>
									);
								})}
								{chartDays.map((day, index) => (
									<text
										key={day.label}
										x={50 + index * 83}
										y="232"
										textAnchor="middle"
										fontSize="11"
										fill="currentColor"
									>
										{day.label}
									</text>
								))}
								{chartSeries.map((series) => {
									const points = chartDays
										.map((day, index) =>
											chartPoint(day[series.key] ?? 0, index),
										)
										.join(" ");
									return (
										<g key={series.key}>
											<polyline
												points={points}
												fill="none"
												stroke={series.color}
												strokeWidth="3"
												strokeLinejoin="round"
												strokeLinecap="round"
											/>
											{chartDays.map((day, index) => (
												<circle
													key={`${series.key}-${index}`}
													cx={50 + index * 83}
													cy={205 - ((day[series.key] ?? 0) / chartMax) * 180}
													r="4"
													fill={series.color}
												>
													<title>{`${day.label} ${series.label}: ${day[series.key] ?? 0}`}</title>
												</circle>
											))}
										</g>
									);
								})}
							</svg>
						</div>
					</div>
				)}
			</section>

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
