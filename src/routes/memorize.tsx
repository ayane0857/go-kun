import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
	loadSentences,
	type MemorizeSentence,
	sanitizeSentences,
	saveSentences,
} from "../lib/memorize";

export const Route = createFileRoute("/memorize")({
	head: () => ({
		meta: [{ title: "段落暗記｜ゴーくん" }],
	}),
	component: Memorize,
});

function shuffle<T>(items: T[]): T[] {
	const result = [...items];
	for (let i = result.length - 1; i > 0; i -= 1) {
		const j = Math.floor(Math.random() * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}
	return result;
}

function Memorize() {
	const [sentences, setSentences] = useState<MemorizeSentence[]>([]);
	const [queue, setQueue] = useState<MemorizeSentence[]>([]);
	const [index, setIndex] = useState(0);
	const [revealed, setRevealed] = useState(false);
	const [started, setStarted] = useState(false);
	const [learnedCount, setLearnedCount] = useState(0);
	const [managementOpen, setManagementOpen] = useState(false);
	const [jsonText, setJsonText] = useState("");
	const [error, setError] = useState("");
	const [ja, setJa] = useState("");
	const [en, setEn] = useState("");
	const revealRef = useRef<HTMLButtonElement>(null);
	const learnedRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		const loaded = loadSentences();
		setSentences(loaded);
		saveSentences(loaded);
	}, []);

	useEffect(() => {
		setJsonText(JSON.stringify(sentences, null, 2));
	}, [sentences]);

	// index と started の遷移でも自動フォーカスを更新する
	// biome-ignore lint/correctness/useExhaustiveDependencies: 暗記画面の遷移をまとめて検知する
	useEffect(() => {
		const timer = setTimeout(() => {
			if (revealed) learnedRef.current?.focus();
			else revealRef.current?.focus();
		}, 0);
		return () => clearTimeout(timer);
	}, [revealed, index, started]);

	function persist(next: MemorizeSentence[]) {
		setSentences(next);
		saveSentences(next);
	}

	function start() {
		if (sentences.length === 0) return;
		setQueue(shuffle(sentences));
		setIndex(0);
		setRevealed(false);
		setLearnedCount(0);
		setStarted(true);
	}

	function next(learned: boolean) {
		if (learned) setLearnedCount((count) => count + 1);
		if (index >= queue.length - 1) {
			setStarted(false);
			setQueue([]);
			setIndex(0);
			setRevealed(false);
			return;
		}
		setIndex((value) => value + 1);
		setRevealed(false);
	}

	function again() {
		if (current) setQueue((items) => [...items, current]);
		setIndex((value) => value);
		setRevealed(false);
	}

	function addSentence() {
		setError("");
		if (!en.trim()) {
			setError("英文は必須です。");
			return;
		}
		persist([
			...sentences,
			{
				id: `m${Date.now()}`,
				ja: ja.trim(),
				en: en.trim(),
			},
		]);
		setJa("");
		setEn("");
	}

	function updateSentence(id: string, nextJa: string, nextEn: string) {
		if (!nextEn.trim()) {
			setError("英文は必須です。");
			return;
		}
		persist(
			sentences.map((sentence) =>
				sentence.id === id
					? { ...sentence, ja: nextJa.trim(), en: nextEn.trim() }
					: sentence,
			),
		);
		setError("");
	}

	function deleteSentence(id: string) {
		persist(sentences.filter((sentence) => sentence.id !== id));
	}

	function saveJson() {
		try {
			persist(sanitizeSentences(JSON.parse(jsonText)));
			setError("");
		} catch (caught) {
			setError(caught instanceof Error ? caught.message : "JSONが不正です。");
		}
	}

	function exportJson() {
		const blob = new Blob([JSON.stringify(sentences, null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement("a");
		anchor.href = url;
		anchor.download = "go-kun-memorize.json";
		anchor.click();
		URL.revokeObjectURL(url);
	}

	async function importJson(file: File) {
		try {
			persist(sanitizeSentences(JSON.parse(await file.text())));
			setError("");
		} catch (caught) {
			setError(
				caught instanceof Error ? caught.message : "インポートに失敗しました。",
			);
		}
	}

	const current = queue[index];

	if (started && current) {
		return (
			<main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 p-4 sm:p-6">
				<header className="flex items-center justify-between border-b border-neutral-950 pb-4 dark:border-white">
					<div>
						<p className="text-sm text-neutral-600 tabular-nums dark:text-neutral-400">
							{index + 1} / {queue.length}
						</p>
						<h1 className="text-2xl font-bold">段落暗記</h1>
					</div>
					<button
						type="button"
						onClick={() => setStarted(false)}
						className="text-sm underline underline-offset-4"
					>
						終了
					</button>
				</header>

				<section className="flex min-h-64 flex-col justify-center gap-5 border border-neutral-950 p-6 text-center dark:border-white">
					{current.ja && (
						<p className="text-sm text-neutral-600 dark:text-neutral-400">
							日本語
						</p>
					)}
					<p className="text-2xl font-bold leading-relaxed whitespace-pre-wrap">
						{current.ja || "英文を確認しましょう"}
					</p>
					{revealed && (
						<div className="border-t border-neutral-950 pt-5 dark:border-white">
							<p className="mb-2 text-sm text-neutral-600 dark:text-neutral-400">
								English
							</p>
							<p className="text-2xl font-bold leading-relaxed whitespace-pre-wrap">
								{current.en}
							</p>
						</div>
					)}
				</section>

				{!revealed ? (
					<button
						ref={revealRef}
						type="button"
						onClick={() => setRevealed(true)}
						className="border border-neutral-950 bg-neutral-950 p-4 font-bold text-white dark:border-white dark:bg-white dark:text-neutral-950"
					>
						英文を見る
					</button>
				) : (
					<div className="grid gap-3 sm:grid-cols-2">
						<button
							type="button"
							onClick={again}
							className="border border-neutral-950 p-4 font-bold dark:border-white"
						>
							もう一度
						</button>
						<button
							ref={learnedRef}
							type="button"
							onClick={() => next(true)}
							className="border border-neutral-950 bg-neutral-950 p-4 font-bold text-white dark:border-white dark:bg-white dark:text-neutral-950"
						>
							覚えた
						</button>
					</div>
				)}

				<p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
					覚えた：{learnedCount}段落
				</p>
			</main>
		);
	}

	return (
		<main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 p-4 sm:p-6">
			<header className="flex items-center justify-between border-b border-neutral-950 pb-4 dark:border-white">
				<div>
					<p className="text-sm text-neutral-600 dark:text-neutral-400">
						ゴーくん
					</p>
					<h1 className="text-3xl font-bold">段落暗記</h1>
				</div>
				<Link to="/" className="text-sm underline underline-offset-4">
					戻る
				</Link>
			</header>

			<section className="flex flex-col gap-4 border border-neutral-950 p-5 dark:border-white">
				<p className="text-neutral-600 dark:text-neutral-400">
					登録段落：
					<strong className="text-neutral-950 dark:text-white">
						{sentences.length}
					</strong>{" "}
					段落
				</p>
				<button
					type="button"
					onClick={start}
					disabled={sentences.length === 0}
					className="border border-neutral-950 bg-neutral-950 p-4 font-bold text-white disabled:opacity-40 dark:border-white dark:bg-white dark:text-neutral-950"
				>
					暗記を開始
				</button>
				{learnedCount > 0 && (
					<p className="text-center text-sm">
						前回覚えた段落：{learnedCount}段落
					</p>
				)}
			</section>

			<button
				type="button"
				onClick={() => setManagementOpen((open) => !open)}
				className="border border-neutral-950 p-4 font-bold dark:border-white"
			>
				{managementOpen ? "段落管理を閉じる" : "段落・JSONを管理"}
			</button>

			{managementOpen && (
				<section className="flex flex-col gap-5 border border-neutral-950 p-5 dark:border-white">
					<h2 className="text-xl font-bold">段落管理</h2>
					{error && (
						<p className="border border-red-700 p-3 text-sm text-red-700">
							{error}
						</p>
					)}

					<div className="flex flex-col gap-2">
						<h3 className="font-bold">新規追加</h3>
						<textarea
							value={ja}
							onChange={(event) => setJa(event.target.value)}
							rows={4}
							className="border p-3"
							placeholder="日本語の段落（任意）"
						/>
						<textarea
							value={en}
							onChange={(event) => setEn(event.target.value)}
							rows={5}
							className="border p-3"
							placeholder="英文の段落（必須）"
						/>
						<button
							type="button"
							onClick={addSentence}
							className="border p-3 font-bold"
						>
							追加
						</button>
					</div>

					<div className="flex flex-col gap-3">
						<h3 className="font-bold">登録済み（{sentences.length}段落）</h3>
						{sentences.map((sentence) => (
							<EditableSentence
								key={sentence.id}
								sentence={sentence}
								updateSentence={updateSentence}
								deleteSentence={deleteSentence}
							/>
						))}
					</div>

					<div className="flex flex-col gap-2">
						<h3 className="font-bold">JSON編集・保存</h3>
						<textarea
							value={jsonText}
							onChange={(event) => setJsonText(event.target.value)}
							rows={12}
							className="border p-3 font-mono text-xs"
						/>
						<button
							type="button"
							onClick={saveJson}
							className="border p-3 font-bold"
						>
							JSONを保存
						</button>
					</div>

					<div className="grid grid-cols-2 gap-2">
						<button type="button" onClick={exportJson} className="border p-3">
							エクスポート
						</button>
						<label className="border p-3 text-center">
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
				</section>
			)}
		</main>
	);
}

function EditableSentence({
	sentence,
	updateSentence,
	deleteSentence,
}: {
	sentence: MemorizeSentence;
	updateSentence: (id: string, ja: string, en: string) => void;
	deleteSentence: (id: string) => void;
}) {
	const [ja, setJa] = useState(sentence.ja);
	const [en, setEn] = useState(sentence.en);
	const [confirm, setConfirm] = useState(false);

	return (
		<div className="flex flex-col gap-2 border p-3">
			<textarea
				value={ja}
				onChange={(event) => setJa(event.target.value)}
				rows={3}
				className="border p-2"
				placeholder="日本語の段落"
			/>
			<textarea
				value={en}
				onChange={(event) => setEn(event.target.value)}
				rows={4}
				className="border p-2"
				placeholder="英文の段落"
			/>
			<div className="grid grid-cols-2 gap-2">
				<button
					type="button"
					onClick={() => updateSentence(sentence.id, ja, en)}
					className="border p-2"
				>
					保存
				</button>
				{confirm ? (
					<button
						type="button"
						onClick={() => deleteSentence(sentence.id)}
						className="border border-red-700 p-2 text-red-700"
					>
						削除を確定
					</button>
				) : (
					<button
						type="button"
						onClick={() => setConfirm(true)}
						className="border p-2"
					>
						削除
					</button>
				)}
			</div>
		</div>
	);
}
