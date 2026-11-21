import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
	loadSentences,
	sanitizeSentences,
	saveSentences,
} from "../../lib/memorize";

export const Route = createFileRoute("/settings/memorize")({
	component: MemorizeSettings,
});

function MemorizeSettings() {
	const [json, setJson] = useState("[]");
	const [error, setError] = useState("");
	useEffect(() => setJson(JSON.stringify(loadSentences(), null, 2)), []);
	function save() {
		try {
			const sentences = sanitizeSentences(JSON.parse(json));
			saveSentences(sentences);
			setJson(JSON.stringify(sentences, null, 2));
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
				<h1 className="text-2xl font-bold">暗記カード</h1>
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
			<button
				type="button"
				onClick={save}
				className="border border-neutral-950 bg-neutral-950 p-3 font-bold text-white dark:border-white dark:bg-white dark:text-neutral-950"
			>
				JSONを保存
			</button>
		</main>
	);
}
