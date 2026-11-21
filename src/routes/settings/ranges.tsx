import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
	DEFAULT_SECTIONS,
	loadStudySections,
	type StudySection,
	sanitizeStudySections,
	saveStudySections,
} from "../../lib/settings";

export const Route = createFileRoute("/settings/ranges")({
	component: RangeSettings,
});

function RangeSettings() {
	const [json, setJson] = useState("");
	const [error, setError] = useState("");

	useEffect(() => {
		const loaded = loadStudySections();
		setJson(JSON.stringify(loaded, null, 2));
	}, []);

	function persist(next: StudySection[]) {
		setJson(JSON.stringify(next, null, 2));
		saveStudySections(next);
		setError("");
	}

	function saveJson() {
		try {
			persist(sanitizeStudySections(JSON.parse(json)));
		} catch (caught) {
			setError(caught instanceof Error ? caught.message : "JSONが不正です。");
		}
	}

	return (
		<main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 p-4 sm:p-6">
			<header className="flex items-center justify-between border-b border-neutral-950 pb-4 dark:border-white">
				<h1 className="text-2xl font-bold">学習範囲</h1>
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
				rows={16}
				className="border border-neutral-950 p-3 font-mono text-xs dark:border-white"
			/>
			<div className="grid grid-cols-2 gap-2">
				<button
					type="button"
					onClick={saveJson}
					className="border border-neutral-950 p-3 font-bold dark:border-white"
				>
					保存
				</button>
				<button
					type="button"
					onClick={() => persist(DEFAULT_SECTIONS)}
					className="border border-neutral-500 p-3"
				>
					初期値に戻す
				</button>
			</div>
		</main>
	);
}
