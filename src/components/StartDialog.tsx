import { Dialog } from "@base-ui/react/dialog";
import { Link } from "@tanstack/react-router";
import { TbListCheck, TbPencil, TbX } from "react-icons/tb";
import { loadAppSettings } from "../lib/settings";

const QUIZ_MODES = [
	{
		id: "choice",
		label: "四択問題",
		description: "4つの選択肢から正解を選ぶ",
		to: "/words/choice",
		icon: TbListCheck,
	},
	{
		id: "input",
		label: "入力問題",
		description: "答えを自分で入力する",
		to: "/words/input",
		icon: TbPencil,
	},
] as const;

export function StartDialog({
	section,
}: {
	section: { from: number; to: number };
}) {
	const defaultQuestionCount = loadAppSettings().defaultQuestionCount;
	return (
		<Dialog.Root>
			<Dialog.Trigger className="mt-auto border border-neutral-950 p-3 text-center text-sm font-bold dark:border-white">
				学習を開始する
			</Dialog.Trigger>

			<Dialog.Portal>
				<Dialog.Backdrop className="fixed inset-0 bg-neutral-950/50 transition-opacity duration-150 data-starting-style:opacity-0 data-ending-style:opacity-0 motion-reduce:transition-none" />
				<Dialog.Popup className="fixed top-1/2 left-1/2 flex w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col gap-6 border border-neutral-950 bg-white p-6 text-neutral-950 transition-opacity duration-150 data-starting-style:opacity-0 data-ending-style:opacity-0 motion-reduce:transition-none dark:border-white dark:bg-neutral-950 dark:text-white">
					<div className="flex items-start justify-between gap-4">
						<div className="flex flex-col gap-1">
							<Dialog.Title className="text-xl font-bold">
								出題形式を選ぶ
							</Dialog.Title>
							<Dialog.Description className="text-sm text-neutral-600 tabular-nums dark:text-neutral-400">
								#{section.from} - #{section.to} の問題に挑戦します。
							</Dialog.Description>
						</div>
						<Dialog.Close
							className="-mt-1 -mr-2 flex size-8 shrink-0 items-center justify-center rounded-none text-neutral-950 hover:bg-neutral-100 active:bg-neutral-200 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:text-white dark:hover:bg-neutral-800 dark:active:bg-neutral-700 dark:focus-visible:outline-white"
							aria-label="閉じる"
						>
							<TbX className="text-lg" aria-hidden="true" />
						</Dialog.Close>
					</div>

					<div className="flex flex-col gap-3">
						{QUIZ_MODES.map((mode) => (
							<div key={mode.id} className="flex flex-col gap-2">
								<div className="flex items-center gap-4">
									<mode.icon className="shrink-0 text-2xl" aria-hidden="true" />
									<span className="flex flex-col gap-0.5">
										<span className="font-bold">{mode.label}</span>
										<span className="text-sm text-neutral-600 dark:text-neutral-400">
											{mode.description}
										</span>
									</span>
								</div>
								<div className="grid grid-cols-2 gap-2 pl-10">
									{[
										...(defaultQuestionCount === "all"
											? [
													{ label: "全問", count: undefined },
													{ label: "5問だけ", count: 5 },
												]
											: [
													{ label: "5問だけ", count: 5 },
													{ label: "全問", count: undefined },
												]),
									].map((option) => (
										<Link
											key={option.label}
											to={mode.to}
											search={{
												from: section.from,
												to: section.to,
												count: option.count,
											}}
											className="border border-neutral-950 p-3 text-center text-sm text-neutral-950 hover:bg-neutral-100 active:bg-neutral-200 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:border-white dark:text-white dark:hover:bg-neutral-800 dark:active:bg-neutral-700 dark:focus-visible:outline-white"
										>
											{option.label}
										</Link>
									))}
								</div>
							</div>
						))}
					</div>
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
