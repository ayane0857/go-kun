import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
	loadQuestions,
	loadSettings,
	sanitizeQuestions,
	saveQuestions,
	saveSettings,
} from "../../lib/phraseflow";

export const Route = createFileRoute("/settings/phraseflow")({
	component: PhraseflowSettings,
});

function PhraseflowSettings() {
	const [questionsJson, setQuestionsJson] = useState("[]");
	const [judgeJson, setJudgeJson] = useState("{}");
	const [error, setError] = useState("");
	useEffect(() => {
		setQuestionsJson(JSON.stringify(loadQuestions(), null, 2));
		setJudgeJson(JSON.stringify(loadSettings(), null, 2));
	}, []);
	function save() {
		try {
			saveQuestions(sanitizeQuestions(JSON.parse(questionsJson)));
			saveSettings(JSON.parse(judgeJson));
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
				<h1 className="text-2xl font-bold">英作文問題</h1>
				<Link to="/settings" className="text-sm underline underline-offset-4">
					設定へ
				</Link>
			</header>
			{error && (
				<p className="border border-red-700 p-3 text-red-700">{error}</p>
			)}
			<section className="flex flex-col gap-3">
				<h2 className="font-bold">問題データ</h2>
				<textarea
					value={questionsJson}
					onChange={(event) => setQuestionsJson(event.target.value)}
					rows={14}
					className="border border-neutral-950 p-3 font-mono text-xs dark:border-white"
				/>
			</section>
			<section className="flex flex-col gap-3">
				<h2 className="font-bold">判定設定</h2>
				<textarea
					value={judgeJson}
					onChange={(event) => setJudgeJson(event.target.value)}
					rows={6}
					className="border border-neutral-950 p-3 font-mono text-xs dark:border-white"
				/>
			</section>
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
