import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { readStudyHistory, summarizeStudy } from "../lib/study-summary";

type StudyDay = { words: number; memorize: number; phraseflow: number };

export const Route = createFileRoute("/stats")({
	head: () => ({ meta: [{ title: "学習サマリー｜ゴーくん" }] }),
	component: StudyStats,
});

function StudyStats() {
	const [history, setHistory] = useState<Record<string, StudyDay>>({});
	useEffect(() => setHistory(readStudyHistory()), []);

	const summary = summarizeStudy(history);
	const days = Array.from({ length: 7 }, (_, index) => {
		const date = new Date();
		date.setDate(date.getDate() - (6 - index));
		const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
		return {
			label: date.toLocaleDateString("ja-JP", {
				month: "numeric",
				day: "numeric",
			}),
			...history[key],
		};
	});
	const maxCount = Math.max(
		0,
		...days.flatMap((day) => [
			day.words ?? 0,
			day.memorize ?? 0,
			day.phraseflow ?? 0,
		]),
	);
	const chartMax = Math.max(4, Math.ceil(maxCount / 4) * 4);
	const series = [
		{ key: "words", label: "英単語", color: "#2563eb", unit: "回" },
		{ key: "memorize", label: "英語暗記", color: "#16a34a", unit: "枚" },
		{ key: "phraseflow", label: "英作文", color: "#9333ea", unit: "問" },
	] as const;

	return (
		<main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 p-4 sm:p-6">
			<header className="flex items-center justify-between border-b border-neutral-950 pb-4 dark:border-white">
				<div>
					<p className="text-sm text-neutral-600 dark:text-neutral-400">
						ゴーくん
					</p>
					<h1 className="text-2xl font-bold">学習サマリー</h1>
				</div>
				<Link to="/" className="text-sm underline underline-offset-4">
					ホームへ戻る
				</Link>
			</header>

			<section
				className="grid grid-cols-2 gap-3 sm:grid-cols-3"
				aria-label="学習量"
			>
				<SummaryCard label="今日" value={summary.todayTotal} unit="問・枚" />
				<SummaryCard label="直近7日" value={summary.weekTotal} unit="問・枚" />
				<SummaryCard
					label="英単語（7日）"
					value={summary.week.words}
					unit="回"
				/>
				<SummaryCard
					label="英語暗記（7日）"
					value={summary.week.memorize}
					unit="枚"
				/>
				<SummaryCard
					label="英作文（7日）"
					value={summary.week.phraseflow}
					unit="問"
				/>
			</section>

			<section className="border border-neutral-950 p-5 dark:border-white">
				<h2 className="text-lg font-bold">日ごとの学習量</h2>
				<p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
					直近7日間の取り組みを種類ごとに表示しています。
				</p>
				<div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
					{series.map((item) => (
						<div key={item.key} className="flex items-center gap-2">
							<span
								className="size-3 rounded-full"
								style={{ backgroundColor: item.color }}
								aria-hidden="true"
							/>
							{item.label}
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
						{days.map((day, index) => (
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
						{series.map((item) => {
							const points = days
								.map(
									(day, index) =>
										`${50 + index * 83},${205 - ((day[item.key] ?? 0) / chartMax) * 180}`,
								)
								.join(" ");
							return (
								<g key={item.key}>
									<polyline
										points={points}
										fill="none"
										stroke={item.color}
										strokeWidth="3"
										strokeLinejoin="round"
										strokeLinecap="round"
									/>
									{days.map((day, index) => (
										<circle
											key={`${item.key}-${index}`}
											cx={50 + index * 83}
											cy={205 - ((day[item.key] ?? 0) / chartMax) * 180}
											r="4"
											fill={item.color}
										>
											<title>{`${day.label} ${item.label}: ${day[item.key] ?? 0} ${item.unit}`}</title>
										</circle>
									))}
								</g>
							);
						})}
					</svg>
				</div>
			</section>
			<p className="text-xs text-neutral-500 dark:text-neutral-400">
				学習量の記録はこの端末に保存され、追加後の分から集計されます。
			</p>
		</main>
	);
}

function SummaryCard({
	label,
	value,
	unit,
}: {
	label: string;
	value: number;
	unit: string;
}) {
	return (
		<div className="border border-neutral-300 p-3 dark:border-neutral-700">
			<p className="text-xs text-neutral-600 dark:text-neutral-400">{label}</p>
			<p className="mt-1 text-2xl font-bold tabular-nums">
				{value}
				<span className="ml-1 text-xs font-normal">{unit}</span>
			</p>
		</div>
	);
}
