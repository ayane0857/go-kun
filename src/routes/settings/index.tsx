import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
	TbArrowRight,
	TbBooks,
	TbChartBar,
	TbDatabase,
	TbRepeat,
	TbTextSize,
} from "react-icons/tb";
import {
	collectAllData,
	exportAllData,
	importAllData,
} from "../../lib/data-backup";
import {
	type AppSettings,
	DEFAULT_APP_SETTINGS,
	loadAppSettings,
	saveAppSettings,
} from "../../lib/settings";

export const Route = createFileRoute("/settings/")({
	component: SettingsIndex,
});

const ITEMS = [
	{
		to: "/settings/words",
		title: "英単語データ",
		description: "単語・意味・移行状態をJSONで管理",
		icon: TbBooks,
	},
	{
		to: "/settings/ranges",
		title: "学習範囲",
		description: "範囲カードと開始番号を管理",
		icon: TbTextSize,
	},
	{
		to: "/settings/memorize",
		title: "暗記カード",
		description: "問題と答えのカードを管理",
		icon: TbRepeat,
	},
	{
		to: "/settings/phraseflow",
		title: "英作文問題",
		description: "日本語・英文・復習フラグを管理",
		icon: TbDatabase,
	},
	{
		to: "/settings/stats",
		title: "学習統計",
		description: "正解数・回答数・学習履歴を管理",
		icon: TbChartBar,
	},
] as const;

function SettingsIndex() {
	const [appSettings, setAppSettings] =
		useState<AppSettings>(DEFAULT_APP_SETTINGS);
	const [backupJson, setBackupJson] = useState("");
	const [error, setError] = useState("");

	useEffect(() => {
		setAppSettings(loadAppSettings());
		setBackupJson(JSON.stringify(collectAllData(), null, 2));
	}, []);

	async function importBackup(file: File) {
		try {
			importAllData(JSON.parse(await file.text()));
			setBackupJson(JSON.stringify(collectAllData(), null, 2));
			setError("");
		} catch (caught) {
			setError(
				caught instanceof Error ? caught.message : "インポートに失敗しました。",
			);
		}
	}

	return (
		<main className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4 sm:p-6">
			<header className="border-b border-neutral-950 pb-4 dark:border-white">
				<p className="text-sm text-neutral-600 dark:text-neutral-400">
					ゴーくん
				</p>
				<h1 className="text-3xl font-bold">設定</h1>
			</header>
			{error && (
				<p className="border border-red-700 p-3 text-sm text-red-700">
					{error}
				</p>
			)}
			<section className="flex flex-col gap-3">
				<h2 className="text-xl font-bold">個別データ管理</h2>
				<div className="grid gap-3 sm:grid-cols-2">
					{ITEMS.map((item) => (
						<Link
							key={item.to}
							to={item.to}
							className="group flex min-h-32 flex-col border border-neutral-950 p-5 hover:bg-neutral-100 dark:border-white dark:hover:bg-neutral-900"
						>
							<div className="flex items-start justify-between">
								<item.icon className="text-2xl" aria-hidden="true" />
								<TbArrowRight
									className="text-xl transition-transform group-hover:translate-x-1"
									aria-hidden="true"
								/>
							</div>
							<div className="mt-auto pt-5">
								<h3 className="font-bold">{item.title}</h3>
								<p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
									{item.description}
								</p>
							</div>
						</Link>
					))}
				</div>
			</section>
			<section className="flex flex-col gap-4 border border-neutral-950 p-5 dark:border-white">
				<h2 className="text-xl font-bold">学習設定</h2>
				<label className="flex flex-col gap-2 text-sm">
					開始時の問題数
					<select
						value={appSettings.defaultQuestionCount}
						onChange={(event) => {
							const next: AppSettings = {
								defaultQuestionCount: event.target.value === "5" ? "5" : "all",
							};
							setAppSettings(next);
							saveAppSettings(next);
						}}
						className="border border-neutral-950 bg-transparent p-3 dark:border-white"
					>
						<option value="all">全問</option>
						<option value="5">5問だけ</option>
					</select>
				</label>
			</section>
			<section className="flex flex-col gap-4 border border-neutral-950 p-5 dark:border-white">
				<h2 className="text-xl font-bold">すべてのデータ</h2>
				<textarea
					value={backupJson}
					onChange={(event) => setBackupJson(event.target.value)}
					rows={14}
					className="border border-neutral-950 p-3 font-mono text-xs dark:border-white"
				/>
				<div className="grid gap-2 sm:grid-cols-3">
					<button
						type="button"
						onClick={() => {
							try {
								importAllData(JSON.parse(backupJson));
								setError("");
							} catch (caught) {
								setError(
									caught instanceof Error
										? caught.message
										: "保存に失敗しました。",
								);
							}
						}}
						className="border border-neutral-950 p-3 font-bold dark:border-white"
					>
						JSONを保存
					</button>
					<button
						type="button"
						onClick={exportAllData}
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
								if (file) void importBackup(file);
							}}
						/>
					</label>
				</div>
			</section>
		</main>
	);
}
