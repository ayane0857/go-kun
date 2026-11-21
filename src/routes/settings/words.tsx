import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
	loadWordsJson,
	sanitizeWords,
	saveWordsJson,
} from "../../lib/word-json";

export const Route = createFileRoute("/settings/words")({
	component: WordSettings,
});

function WordSettings() {
	const [json, setJson] = useState("[]");
	const [error, setError] = useState("");

	useEffect(() => {
		setJson(JSON.stringify(loadWordsJson() ?? [], null, 2));
	}, []);

	function save() {
		try {
			const words = sanitizeWords(JSON.parse(json));
			saveWordsJson(words);
			setJson(JSON.stringify(words, null, 2));
			setError("");
		} catch (caught) {
			setError(
				caught instanceof Error ? caught.message : "保存に失敗しました。",
			);
		}
	}

	return (
		<JsonSettingsPage
			title="英単語データ"
			json={json}
			setJson={setJson}
			error={error}
			onSave={save}
		/>
	);
}

function JsonSettingsPage({
	title,
	json,
	setJson,
	error,
	onSave,
}: {
	title: string;
	json: string;
	setJson: (value: string) => void;
	error: string;
	onSave: () => void;
}) {
	return (
		<main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 p-4 sm:p-6">
			<header className="flex items-center justify-between border-b border-neutral-950 pb-4 dark:border-white">
				<h1 className="text-2xl font-bold">{title}</h1>
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
				onClick={onSave}
				className="border border-neutral-950 bg-neutral-950 p-3 font-bold text-white dark:border-white dark:bg-white dark:text-neutral-950"
			>
				JSONを保存
			</button>
		</main>
	);
}
