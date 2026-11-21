import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
	clearAnswerStats,
	readAnswerStats,
	saveAnswerStats,
} from "../../lib/answer-stats";

export const Route = createFileRoute("/settings/stats")({
	component: StatsSettings,
});

function StatsSettings() {
	const [json, setJson] = useState("{}");
	const [error, setError] = useState("");
	useEffect(() => setJson(JSON.stringify(readAnswerStats(), null, 2)), []);
	function save() {
		try {
			const value = JSON.parse(json) as Record<string, unknown>;
			for (const [id, stat] of Object.entries(value)) {
				if (!/^\d+$/.test(id) || !stat || typeof stat !== "object") {
					throw new Error("学習統計の形式が不正です。");
				}
				const item = stat as Record<string, unknown>;
				if (
					typeof item.correct !== "number" ||
					typeof item.total !== "number"
				) {
					throw new Error("correctとtotalには数値を指定してください。");
				}
			}
			saveAnswerStats(value as Parameters<typeof saveAnswerStats>[0]);
			setError("");
		} catch (caught) {
			setError(
				caught instanceof Error ? caught.message : "保存に失敗しました。",
			);
		}
	}
	return (
		<main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 p-4 sm:p-6">
			<header className="flex items-center justify-between border-b border-neutral-950 pb-4 dark:border-white">
				<h1 className="text-2xl font-bold">学習統計</h1>
				<Link to="/settings" className="text-sm underline underline-offset-4">
					設定へ
				</Link>
			</header>
			{error && (
				<p className="border border-red-700 p-3 text-red-700">{error}</p>
			)}
			<textarea
				value={json}
				onChange={(event) => setJson(event.target.value)}
				rows={18}
				className="border border-neutral-950 p-3 font-mono text-xs dark:border-white"
			/>
			<div className="grid grid-cols-2 gap-2">
				<button
					type="button"
					onClick={save}
					className="border border-neutral-950 p-3 font-bold dark:border-white"
				>
					JSONを保存
				</button>
				<button
					type="button"
					onClick={() => {
						clearAnswerStats();
						setJson("{}");
					}}
					className="border border-red-700 p-3 text-red-700"
				>
					統計をリセット
				</button>
			</div>
		</main>
	);
}
