import { Button } from "@base-ui/react/button";
import { Progress } from "@base-ui/react/progress";
import { TbDotsVertical } from "react-icons/tb";
import type { StudySection } from "../data/sections";
import { StartDialog } from "./StartDialog";

export function SectionCard({
	section,
	answerStats,
}: {
	section: StudySection;
	answerStats: Record<number, { correct: number; total: number }>;
}) {
	const sectionStats = Object.entries(answerStats).reduce(
		(stats, [id, stat]) => {
			if (Number(id) < section.from || Number(id) > section.to) {
				return stats;
			}
			return {
				correct: stats.correct + stat.correct,
				total: stats.total + stat.total,
			};
		},
		{ correct: 0, total: 0 },
	);
	const accuracy =
		sectionStats.total > 0 ? sectionStats.correct / sectionStats.total : 0;
	return (
		<div className="flex min-w-0 flex-1 flex-col gap-4 border border-neutral-950 p-6 dark:border-white">
			<div className="flex items-center justify-between gap-4">
				<div className="flex flex-col gap-1">
					<h3 className="text-xl font-bold tracking-tight">{section.title}</h3>
					<p className="text-sm text-neutral-600 tabular-nums dark:text-neutral-400">
						#{section.from} - #{section.to}
					</p>
				</div>
				<Button
					className="flex size-8 items-center justify-center rounded-none text-neutral-950 hover:bg-neutral-100 active:bg-neutral-200 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:text-white dark:hover:bg-neutral-800 dark:active:bg-neutral-700 dark:focus-visible:outline-white"
					aria-label="メニューを開く"
				>
					<TbDotsVertical className="text-lg" aria-hidden="true" />
				</Button>
			</div>
			<Progress.Root
				className="grid w-full grid-cols-2 gap-y-2"
				value={accuracy}
				max={1}
				format={{ style: "percent" }}
			>
				<Progress.Label className="text-sm font-normal text-neutral-950 dark:text-white">
					正答率
				</Progress.Label>
				<Progress.Value className="text-right text-sm text-neutral-950 tabular-nums dark:text-white">
					{Math.round(accuracy * 100)}%
				</Progress.Value>
				<Progress.Track className="col-span-2 h-1 overflow-hidden bg-neutral-200 dark:bg-neutral-800">
					<Progress.Indicator className="bg-neutral-950 transition-[width] duration-500 dark:bg-white" />
				</Progress.Track>
			</Progress.Root>
			<StartDialog section={section} />
		</div>
	);
}
