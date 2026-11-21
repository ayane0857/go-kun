import { createFileRoute, Link, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/settings/$section")({
	component: SettingsSection,
});

const ROUTES: Record<
	string,
	| "/settings/words"
	| "/settings/ranges"
	| "/settings/memorize"
	| "/settings/phraseflow"
	| "/settings/stats"
> = {
	words: "/settings/words",
	word: "/settings/words",
	ranges: "/settings/ranges",
	range: "/settings/ranges",
	sections: "/settings/ranges",
	memorize: "/settings/memorize",
	card: "/settings/memorize",
	cards: "/settings/memorize",
	phraseflow: "/settings/phraseflow",
	english: "/settings/phraseflow",
	stats: "/settings/stats",
};

function SettingsSection() {
	const { section } = Route.useParams();
	const target = ROUTES[section.toLowerCase()];
	if (target) return <Navigate to={target} replace />;

	return (
		<main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4 sm:p-6">
			<h1 className="text-2xl font-bold">設定項目が見つかりません</h1>
			<p className="text-neutral-600 dark:text-neutral-400">
				「{section}」に対応する管理ページはありません。
			</p>
			<Link
				to="/settings"
				className="w-fit border border-neutral-950 p-3 font-bold dark:border-white"
			>
				設定トップへ戻る
			</Link>
		</main>
	);
}
