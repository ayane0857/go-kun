import { Button } from "@base-ui/react/button";
import { Progress } from "@base-ui/react/progress";
import { createFileRoute } from "@tanstack/react-router";
import { TbDotsVertical } from "react-icons/tb";

export const Route = createFileRoute("/")({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "ページのタイトル",
			},
		],
	}),
	component: Home,
});

type Section = {
	id: string;
	from: number;
	to: number;
	accuracy: number; // 0-1.0
};

const SECTIONS: Section[] = [
	{ id: "column-1", from: 240, to: 340, accuracy: 0.3 },
	{ id: "column-2", from: 341, to: 440, accuracy: 0.55 },
	{ id: "column-3", from: 441, to: 540, accuracy: 0.8 },
];

function Home() {
	return (
		<div className="flex flex-col h-full w-full gap-4 p-4">
			<header className="flex flex-col gap-1 border-b border-neutral-950 pb-4 text-neutral-950 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4 dark:border-white dark:text-white">
				<h1 className="text-3xl font-bold tracking-tight">ゴーくん</h1>
				<p className="text-sm text-neutral-600 dark:text-neutral-400">
					範囲を選んで、学習を始めよう
				</p>
			</header>

			<div className="flex flex-row gap-4">
				{SECTIONS.map((section) => (
					<SectionCard key={section.id} section={section} />
				))}
			</div>

			<footer className="mt-auto flex flex-col gap-2 border-t border-neutral-950 pt-4 text-sm text-neutral-600 sm:flex-row sm:items-center sm:justify-between dark:border-white dark:text-neutral-400">
				<p className="font-bold text-neutral-950 dark:text-white">ゴーくん</p>
				<p>© 2026 Ayane. All rights reserved.</p>
				<a
					href="#contact"
					className="w-fit underline underline-offset-4 hover:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:hover:text-white dark:focus-visible:outline-white"
				>
					Contact
				</a>
			</footer>
		</div>
	);
}

function SectionCard({ section }: { section: Section }) {
	return (
		<div className="flex min-w-0 flex-1 flex-col gap-4 border border-neutral-950 p-6 dark:border-white">
			<div className="flex items-center justify-between gap-4">
				<p className="text-lg">
					#{section.from} - #{section.to}
				</p>
				<Button
					className="flex size-8 items-center justify-center rounded-none text-neutral-950 hover:bg-neutral-100 active:bg-neutral-200 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:text-white dark:hover:bg-neutral-800 dark:active:bg-neutral-700 dark:focus-visible:outline-white"
					aria-label="メニューを開く"
				>
					<TbDotsVertical className="text-lg" aria-hidden="true" />
				</Button>
			</div>

			<Progress.Root
				className="grid w-full grid-cols-2 gap-y-2"
				value={section.accuracy}
				max={1}
				format={{ style: "percent" }}
			>
				<Progress.Label className="text-sm font-normal text-neutral-950 dark:text-white">
					正答率
				</Progress.Label>
				<Progress.Value className="text-right text-sm text-neutral-950 tabular-nums dark:text-white" />
				<Progress.Track className="col-span-2 h-1 overflow-hidden bg-neutral-200 dark:bg-neutral-800">
					<Progress.Indicator className="bg-neutral-950 transition-[width] duration-500 dark:bg-white" />
				</Progress.Track>
			</Progress.Root>

			<Button className="flex h-8 items-center justify-center gap-2 rounded-none border border-neutral-950 bg-white px-3 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 select-none hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400">
				学習を開始する
			</Button>
		</div>
	);
}
