import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
	advanceRepetition,
	REPETITION_TARGET,
	startRepetition,
} from "../lib/repetition";
import {
	loadQuestions,
	loadSettings,
	normalizeEnglish,
	type PhraseQuestion,
	type PhraseSettings,
	sanitizeQuestions,
	saveQuestions,
	saveSettings,
	shuffle,
} from "../lib/phraseflow";

export const Route = createFileRoute("/phraseflow")({
	head: () => ({
		meta: [{ title: "英作文トレーニング｜ゴーくん" }],
	}),
	component: PhraseFlow,
});

type SessionPhase =
	| "answering"
	| "evaluated"
	| "practice"
	| "completed"
	| "empty_all"
	| "empty_wrong";

function PhraseFlow() {
	const [questions, setQuestions] = useState<PhraseQuestion[]>([]);
	const [settings, setSettings] = useState<PhraseSettings>(loadSettings);
	const [mode, setMode] = useState<"all" | "wrong">("all");
	const [rangeStart, setRangeStart] = useState("1");
	const [rangeEnd, setRangeEnd] = useState("");
	const [queue, setQueue] = useState<string[]>([]);
	const [queueIndex, setQueueIndex] = useState(0);
	const [phase, setPhase] = useState<SessionPhase>("empty_all");
	const [sessionStarted, setSessionStarted] = useState(false);
	const [answer, setAnswer] = useState("");
	const [practiceAnswer, setPracticeAnswer] = useState("");
	const [practiceCount, setPracticeCount] = useState(0);
	const [resultCorrect, setResultCorrect] = useState<boolean | null>(null);
	const [mismatches, setMismatches] = useState<string[]>([]);
	const [correctCount, setCorrectCount] = useState(0);
	const [incorrectCount, setIncorrectCount] = useState(0);
	const [managementOpen, setManagementOpen] = useState(false);
	const [jsonText, setJsonText] = useState("");
	const [managementError, setManagementError] = useState("");
	const [newJa, setNewJa] = useState("");
	const [newEn, setNewEn] = useState("");
	const [newCategory, setNewCategory] = useState("");
	const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
	const [clearConfirm, setClearConfirm] = useState(false);

	const answerRef = useRef<HTMLInputElement>(null);
	const practiceRef = useRef<HTMLInputElement>(null);
	const nextRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		setQuestions(loadQuestions());
		setSettings(loadSettings());
	}, []);

	useEffect(() => {
		setJsonText(JSON.stringify(questions, null, 2));
	}, [questions]);

	useEffect(() => {
		if (phase === "answering") {
			setTimeout(() => answerRef.current?.focus(), 0);
		} else if (phase === "practice") {
			setTimeout(() => practiceRef.current?.focus(), 0);
		} else if (phase === "evaluated" && resultCorrect) {
			setTimeout(() => nextRef.current?.focus(), 0);
		} else if (phase === "evaluated" && practiceCount >= REPETITION_TARGET) {
			setTimeout(() => nextRef.current?.focus(), 0);
		}
	}, [phase, resultCorrect, practiceCount]);

	const current = queue[queueIndex]
		? questions.find((question) => question.id === queue[queueIndex])
		: undefined;

	function persist(next: PhraseQuestion[]) {
		setQuestions(next);
		saveQuestions(next);
	}

	function updateWrong(id: string, wrong: boolean) {
		persist(
			questions.map((question) =>
				question.id === id ? { ...question, wrong } : question,
			),
		);
	}

	function startSession() {
		if (questions.length === 0) {
			setSessionStarted(true);
			setPhase("empty_all");
			return;
		}
		const total = questions.length;
		let start = rangeStart.trim() ? Number.parseInt(rangeStart, 10) : 1;
		let end = rangeEnd.trim() ? Number.parseInt(rangeEnd, 10) : total;
		if (!Number.isFinite(start)) start = 1;
		if (!Number.isFinite(end)) end = total;
		start = Math.max(1, Math.min(total, start));
		end = Math.max(1, Math.min(total, end));
		if (start > end) [start, end] = [end, start];
		let selected = questions.slice(start - 1, end);
		if (mode === "wrong")
			selected = selected.filter((question) => question.wrong);
		if (selected.length === 0) {
			setSessionStarted(true);
			setQueue([]);
			setPhase(mode === "wrong" ? "empty_wrong" : "empty_all");
			return;
		}
		setQueue(shuffle(selected.map((question) => question.id)));
		setQueueIndex(0);
		setCorrectCount(0);
		setIncorrectCount(0);
		setAnswer("");
		setPracticeAnswer("");
		setPracticeCount(startRepetition());
		setResultCorrect(null);
		setMismatches([]);
		setSessionStarted(true);
		setPhase("answering");
	}

	function submitAnswer(input = answer) {
		if (!current || !input.trim()) return;
		const correct =
			normalizeEnglish(input, settings) ===
			normalizeEnglish(current.en, settings);
		setResultCorrect(correct);
		if (correct) {
			setCorrectCount((count) => count + 1);
			updateWrong(current.id, false);
			setPhase("evaluated");
			return;
		}
		const answerTokens = normalizeEnglish(input, settings)
			.split(" ")
			.map((word) => word.trim())
			.filter(Boolean);
		const modelTokens = new Set(
			normalizeEnglish(current.en, settings)
				.split(" ")
				.map((word) => word.trim())
				.filter(Boolean),
		);
		setMismatches(answerTokens.filter((word) => !modelTokens.has(word)));
		setIncorrectCount((count) => count + 1);
		updateWrong(current.id, true);
		setPracticeCount(startRepetition());
		setPracticeAnswer("");
		setPhase("practice");
	}

	function skipAnswer() {
		if (!current) return;
		setResultCorrect(false);
		setMismatches([]);
		setIncorrectCount((count) => count + 1);
		updateWrong(current.id, true);
		setPracticeCount(startRepetition());
		setPracticeAnswer("");
		setPhase("practice");
	}

	function submitPractice(input = practiceAnswer) {
		if (!current) return;
		if (
			normalizeEnglish(input, settings) ===
			normalizeEnglish(current.en, settings)
		) {
			const repetition = advanceRepetition(practiceCount);
			setPracticeCount(repetition.count);
			setPracticeAnswer("");
			if (repetition.complete) setPhase("evaluated");
		} else {
			setPracticeAnswer("");
		}
	}

	function nextQuestion() {
		if (queueIndex >= queue.length - 1) {
			setPhase("completed");
			return;
		}
		setQueueIndex((index) => index + 1);
		setAnswer("");
		setPracticeAnswer("");
		setPracticeCount(startRepetition());
		setResultCorrect(null);
		setMismatches([]);
		setPhase("answering");
	}

	function toggleCurrentWrong() {
		if (current) updateWrong(current.id, !current.wrong);
	}

	function changeSetting(key: keyof PhraseSettings) {
		const next = { ...settings, [key]: !settings[key] };
		setSettings(next);
		saveSettings(next);
	}

	function addQuestion() {
		setManagementError("");
		if (!newJa.trim() || !newEn.trim()) {
			setManagementError("日本語文と英文は必須です。");
			return;
		}
		const question: PhraseQuestion = {
			id: `q${Date.now()}`,
			ja: newJa.trim(),
			en: newEn.trim(),
			category: newCategory.trim() || "カスタム",
			wrong: false,
		};
		persist([...questions, question]);
		setNewJa("");
		setNewEn("");
		setNewCategory("");
	}

	function saveQuestion(id: string, ja: string, en: string, category: string) {
		if (!ja.trim() || !en.trim()) {
			setManagementError("日本語文と英文は必須です。");
			return;
		}
		persist(
			questions.map((question) =>
				question.id === id
					? {
							...question,
							ja: ja.trim(),
							en: en.trim(),
							category: category.trim() || "一般",
						}
					: question,
			),
		);
		setManagementError("");
	}

	function deleteQuestion(id: string) {
		persist(questions.filter((question) => question.id !== id));
		setPendingDeleteId(null);
	}

	function clearAll() {
		persist([]);
		setClearConfirm(false);
		setRangeStart("1");
		setRangeEnd("");
		setSessionStarted(false);
		setPhase("empty_all");
	}

	function saveJson() {
		try {
			const next = sanitizeQuestions(JSON.parse(jsonText));
			persist(next);
			setManagementError("");
		} catch (error) {
			setManagementError(
				error instanceof Error ? error.message : "JSONが不正です。",
			);
		}
	}

	function exportJson() {
		const blob = new Blob([JSON.stringify(questions, null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement("a");
		anchor.href = url;
		anchor.download = "phraseflow_questions_v1.json";
		anchor.click();
		URL.revokeObjectURL(url);
	}

	async function importJson(file: File) {
		try {
			const next = sanitizeQuestions(JSON.parse(await file.text()));
			persist(next);
			setSessionStarted(false);
			setQueue([]);
			setPhase(next.length === 0 ? "empty_all" : "answering");
			setManagementError("");
		} catch (error) {
			setManagementError(
				error instanceof Error ? error.message : "インポートに失敗しました。",
			);
		}
	}

	if (!sessionStarted) {
		return (
			<main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 p-4 sm:p-6">
				<header className="flex items-center justify-between border-b border-neutral-950 pb-4 dark:border-white">
					<div>
						<p className="text-sm text-neutral-600 dark:text-neutral-400">
							ゴーくん
						</p>
						<h1 className="text-2xl font-bold">英作文トレーニング</h1>
					</div>
					<Link to="/" className="text-sm underline underline-offset-4">
						戻る
					</Link>
				</header>
				<section className="flex flex-col gap-4 border border-neutral-950 p-5 dark:border-white">
					<h2 className="font-bold">出題設定</h2>
					<div className="grid grid-cols-2 gap-3">
						<label className="flex flex-col gap-1 text-sm">
							開始番号
							<input
								value={rangeStart}
								onChange={(e) => setRangeStart(e.target.value)}
								inputMode="numeric"
								className="border border-neutral-950 p-3 dark:border-white"
							/>
						</label>
						<label className="flex flex-col gap-1 text-sm">
							終了番号
							<input
								value={rangeEnd}
								onChange={(e) => setRangeEnd(e.target.value)}
								placeholder={`全${questions.length}問`}
								inputMode="numeric"
								className="border border-neutral-950 p-3 dark:border-white"
							/>
						</label>
					</div>
					<div className="grid grid-cols-2 gap-2">
						<button
							type="button"
							onClick={() => setMode("all")}
							className={`border p-3 ${mode === "all" ? "border-neutral-950 bg-neutral-950 text-white dark:border-white dark:bg-white dark:text-neutral-950" : "border-neutral-500"}`}
						>
							全問
						</button>
						<button
							type="button"
							onClick={() => setMode("wrong")}
							className={`border p-3 ${mode === "wrong" ? "border-neutral-950 bg-neutral-950 text-white dark:border-white dark:bg-white dark:text-neutral-950" : "border-neutral-500"}`}
						>
							間違えた問題
						</button>
					</div>
					<button
						type="button"
						onClick={startSession}
						className="border border-neutral-950 bg-neutral-950 p-4 font-bold text-white dark:border-white dark:bg-white dark:text-neutral-950"
					>
						学習を開始
					</button>
				</section>
				<SettingsPanel settings={settings} changeSetting={changeSetting} />
				<button
					type="button"
					onClick={() => setManagementOpen((open) => !open)}
					className="border border-neutral-950 p-4 font-bold dark:border-white"
				>
					{managementOpen ? "問題管理を閉じる" : "問題データを管理"}
				</button>
				{managementOpen && (
					<Management
						questions={questions}
						jsonText={jsonText}
						setJsonText={setJsonText}
						error={managementError}
						newJa={newJa}
						setNewJa={setNewJa}
						newEn={newEn}
						setNewEn={setNewEn}
						newCategory={newCategory}
						setNewCategory={setNewCategory}
						addQuestion={addQuestion}
						saveQuestion={saveQuestion}
						pendingDeleteId={pendingDeleteId}
						setPendingDeleteId={setPendingDeleteId}
						deleteQuestion={deleteQuestion}
						clearConfirm={clearConfirm}
						setClearConfirm={setClearConfirm}
						clearAll={clearAll}
						saveJson={saveJson}
						exportJson={exportJson}
						importJson={importJson}
					/>
				)}
			</main>
		);
	}

	if (
		phase === "empty_all" ||
		phase === "empty_wrong" ||
		phase === "completed"
	) {
		return (
			<main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 p-6">
				<header className="border-b border-neutral-950 pb-4 dark:border-white">
					<h1 className="text-2xl font-bold">
						{phase === "completed"
							? "学習結果"
							: phase === "empty_wrong"
								? "復習問題がありません"
								: "問題がありません"}
					</h1>
				</header>
				{phase === "completed" && (
					<div className="grid grid-cols-2 border border-neutral-950 text-center dark:border-white">
						<div className="border-r border-neutral-950 p-5 dark:border-white">
							<p className="text-sm">正解</p>
							<p className="text-3xl font-bold">{correctCount}</p>
						</div>
						<div className="p-5">
							<p className="text-sm">不正解</p>
							<p className="text-3xl font-bold">{incorrectCount}</p>
						</div>
					</div>
				)}
				<button
					type="button"
					onClick={() => setSessionStarted(false)}
					className="border border-neutral-950 p-4 font-bold dark:border-white"
				>
					設定に戻る
				</button>
				<Link
					to="/"
					className="text-center text-sm underline underline-offset-4"
				>
					ホームへ
				</Link>
			</main>
		);
	}

	return (
		<main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 p-4 sm:p-6">
			<header className="flex items-center justify-between border-b border-neutral-950 pb-4 dark:border-white">
				<div>
					<p className="text-sm text-neutral-600 dark:text-neutral-400">
						{queueIndex + 1} / {queue.length}
					</p>
					<h1 className="text-2xl font-bold">英作文トレーニング</h1>
				</div>
				<button
					type="button"
					onClick={() => setSessionStarted(false)}
					className="text-sm underline underline-offset-4"
				>
					終了
				</button>
			</header>

			{current && (
				<>
					<section className="flex flex-col gap-2">
						<p className="text-sm text-neutral-600 dark:text-neutral-400">
							{current.category}
						</p>
						<p className="text-3xl font-bold">{current.ja}</p>
					</section>

					{phase === "answering" && (
						<form
							className="flex flex-col gap-3"
							onSubmit={(event) => {
								event.preventDefault();
								submitAnswer(answer);
							}}
						>
							<input
								ref={answerRef}
								value={answer}
								onChange={(event) => setAnswer(event.target.value)}
								autoComplete="off"
								autoCapitalize="off"
								spellCheck={false}
								className="border border-neutral-950 p-4 outline-none focus:ring-2 focus:ring-neutral-950 dark:border-white"
								placeholder="英語を入力"
							/>
							<button
								type="submit"
								disabled={!answer.trim()}
								className="border border-neutral-950 p-4 font-bold disabled:opacity-40 dark:border-white"
							>
								回答する
							</button>
						</form>
					)}

					{phase === "practice" && (
						<section className="flex flex-col gap-4 border-t border-neutral-950 pt-5 dark:border-white">
							<p className="font-bold">模範解答</p>
							<p className="border border-green-700 bg-green-100 p-4 dark:bg-green-950">
								{current.en}
							</p>
							<p className="text-sm">
								正しく{REPETITION_TARGET}回入力：{practiceCount} /{" "}
								{REPETITION_TARGET}
							</p>
							<form
								className="flex flex-col gap-3"
								onSubmit={(event) => {
									event.preventDefault();
									submitPractice(practiceAnswer);
								}}
							>
								<input
									ref={practiceRef}
									value={practiceAnswer}
									onChange={(event) => setPracticeAnswer(event.target.value)}
									autoComplete="off"
									autoCapitalize="off"
									spellCheck={false}
									className="border border-neutral-950 p-4 dark:border-white"
									placeholder="模範解答を入力"
								/>
								<button
									type="submit"
									disabled={!practiceAnswer.trim()}
									className="border border-neutral-950 p-3 font-bold disabled:opacity-40 dark:border-white"
								>
									練習する
								</button>
							</form>
						</section>
					)}

					{phase === "evaluated" && (
						<section className="flex flex-col gap-4 border-t border-neutral-950 pt-5 dark:border-white">
							{practiceCount >= REPETITION_TARGET ? (
								<>
									<p className="font-bold text-green-700 dark:text-green-400">
										{REPETITION_TARGET}回練習できました！
									</p>
									<button
										ref={nextRef}
										type="button"
										onClick={nextQuestion}
										className="border border-neutral-950 p-4 font-bold dark:border-white"
									>
										{queueIndex === queue.length - 1
											? "結果を見る"
											: "次の問題"}
									</button>
								</>
							) : (
								<>
									<p
										className={`font-bold ${resultCorrect ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-300"}`}
									>
										{resultCorrect ? "正解！" : "不正解"}
									</p>
									{!resultCorrect && mismatches.length > 0 && (
										<p className="text-sm text-red-700 dark:text-red-300">
											一致していない単語：{mismatches.join("、")}
										</p>
									)}
									<div className="border border-neutral-950 p-4 dark:border-white">
										<p className="mb-1 text-sm text-neutral-600 dark:text-neutral-400">
											模範解答
										</p>
										<p>{current.en}</p>
									</div>
									<button
										ref={nextRef}
										type="button"
										onClick={nextQuestion}
										className="border border-neutral-950 p-4 font-bold dark:border-white"
									>
										{queueIndex === queue.length - 1
											? "結果を見る"
											: "次の問題"}
									</button>
								</>
							)}
							<button
								type="button"
								onClick={toggleCurrentWrong}
								className="border border-neutral-500 p-3 text-sm"
							>
								要復習：{current.wrong ? "オン" : "オフ"}（切り替える）
							</button>
						</section>
					)}

					{phase === "answering" && (
						<button
							type="button"
							onClick={skipAnswer}
							className="border border-neutral-500 p-3 text-sm"
						>
							わからない（スキップ）
						</button>
					)}
				</>
			)}
		</main>
	);
}

function SettingsPanel({
	settings,
	changeSetting,
}: {
	settings: PhraseSettings;
	changeSetting: (key: keyof PhraseSettings) => void;
}) {
	const options: { key: keyof PhraseSettings; label: string }[] = [
		{ key: "ignoreCase", label: "大文字・小文字を無視" },
		{ key: "ignorePunctuation", label: "句読点を無視" },
		{ key: "allowContractions", label: "短縮形を展開" },
	];
	return (
		<section className="flex flex-col gap-2 border border-neutral-950 p-5 dark:border-white">
			<h2 className="font-bold">判定設定</h2>
			{options.map((option) => (
				<label key={option.key} className="flex items-center gap-3 p-2">
					<input
						type="checkbox"
						checked={settings[option.key]}
						onChange={() => changeSetting(option.key)}
					/>
					<span>{option.label}</span>
				</label>
			))}
		</section>
	);
}

type ManagementProps = {
	questions: PhraseQuestion[];
	jsonText: string;
	setJsonText: (value: string) => void;
	error: string;
	newJa: string;
	setNewJa: (value: string) => void;
	newEn: string;
	setNewEn: (value: string) => void;
	newCategory: string;
	setNewCategory: (value: string) => void;
	addQuestion: () => void;
	saveQuestion: (id: string, ja: string, en: string, category: string) => void;
	pendingDeleteId: string | null;
	setPendingDeleteId: (id: string | null) => void;
	deleteQuestion: (id: string) => void;
	clearConfirm: boolean;
	setClearConfirm: (value: boolean) => void;
	clearAll: () => void;
	saveJson: () => void;
	exportJson: () => void;
	importJson: (file: File) => void;
};

function Management(props: ManagementProps) {
	return (
		<section className="flex flex-col gap-5 border border-neutral-950 p-5 dark:border-white">
			<h2 className="text-xl font-bold">問題管理</h2>
			{props.error && (
				<p className="border border-red-700 p-3 text-sm text-red-700">
					{props.error}
				</p>
			)}
			<div className="flex flex-col gap-2">
				<h3 className="font-bold">新規追加</h3>
				<input
					value={props.newJa}
					onChange={(e) => props.setNewJa(e.target.value)}
					className="border p-3"
					placeholder="日本語文"
				/>
				<input
					value={props.newEn}
					onChange={(e) => props.setNewEn(e.target.value)}
					className="border p-3"
					placeholder="英文"
				/>
				<input
					value={props.newCategory}
					onChange={(e) => props.setNewCategory(e.target.value)}
					className="border p-3"
					placeholder="カテゴリ（任意）"
				/>
				<button
					type="button"
					onClick={props.addQuestion}
					className="border p-3 font-bold"
				>
					追加
				</button>
			</div>
			<div className="flex flex-col gap-3">
				<h3 className="font-bold">登録済み（{props.questions.length}問）</h3>
				{props.questions.map((question) => (
					<EditableQuestion
						key={question.id}
						question={question}
						pending={props.pendingDeleteId === question.id}
						setPendingDeleteId={props.setPendingDeleteId}
						saveQuestion={props.saveQuestion}
						deleteQuestion={props.deleteQuestion}
					/>
				))}
			</div>
			<div className="flex flex-col gap-2">
				<h3 className="font-bold">JSON直接編集</h3>
				<textarea
					value={props.jsonText}
					onChange={(e) => props.setJsonText(e.target.value)}
					rows={12}
					className="border p-3 font-mono text-xs"
				/>
				<button
					type="button"
					onClick={props.saveJson}
					className="border p-3 font-bold"
				>
					JSONを保存
				</button>
			</div>
			<div className="grid grid-cols-2 gap-2">
				<button type="button" onClick={props.exportJson} className="border p-3">
					エクスポート
				</button>
				<label className="border p-3 text-center">
					インポート
					<input
						type="file"
						accept=".json,application/json"
						className="hidden"
						onChange={(e) => {
							const file = e.target.files?.[0];
							if (file) void props.importJson(file);
						}}
					/>
				</label>
			</div>
			{props.clearConfirm ? (
				<div className="flex gap-2">
					<button
						type="button"
						onClick={props.clearAll}
						className="flex-1 border border-red-700 p-3 font-bold text-red-700"
					>
						本当に全件削除
					</button>
					<button
						type="button"
						onClick={() => props.setClearConfirm(false)}
						className="border p-3"
					>
						キャンセル
					</button>
				</div>
			) : (
				<button
					type="button"
					onClick={() => props.setClearConfirm(true)}
					className="border border-red-700 p-3 text-red-700"
				>
					全問題を削除
				</button>
			)}
		</section>
	);
}

function EditableQuestion({
	question,
	pending,
	setPendingDeleteId,
	saveQuestion,
	deleteQuestion,
}: {
	question: PhraseQuestion;
	pending: boolean;
	setPendingDeleteId: (id: string | null) => void;
	saveQuestion: (id: string, ja: string, en: string, category: string) => void;
	deleteQuestion: (id: string) => void;
}) {
	const [ja, setJa] = useState(question.ja);
	const [en, setEn] = useState(question.en);
	const [category, setCategory] = useState(question.category);
	return (
		<div className="flex flex-col gap-2 border p-3">
			<div className="flex justify-between text-xs">
				<span>{question.id}</span>
				<span>{question.wrong ? "要復習" : ""}</span>
			</div>
			<input
				value={ja}
				onChange={(e) => setJa(e.target.value)}
				className="border p-2"
			/>
			<input
				value={en}
				onChange={(e) => setEn(e.target.value)}
				className="border p-2"
			/>
			<input
				value={category}
				onChange={(e) => setCategory(e.target.value)}
				className="border p-2"
			/>
			<div className="grid grid-cols-2 gap-2">
				<button
					type="button"
					onClick={() => saveQuestion(question.id, ja, en, category)}
					className="border p-2"
				>
					保存
				</button>
				{pending ? (
					<button
						type="button"
						onClick={() => deleteQuestion(question.id)}
						className="border border-red-700 p-2 text-red-700"
					>
						削除を確定
					</button>
				) : (
					<button
						type="button"
						onClick={() => setPendingDeleteId(question.id)}
						className="border p-2"
					>
						削除
					</button>
				)}
			</div>
		</div>
	);
}
