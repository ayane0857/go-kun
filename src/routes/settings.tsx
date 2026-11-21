import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { TbHome, TbSettings } from "react-icons/tb";

export const Route = createFileRoute("/settings")({
	head: () => ({
		meta: [{ title: "設定｜ゴーくん" }],
	}),
	component: SettingsLayout,
});

function SettingsLayout() {
	return (
		<div className="min-h-screen">
			<nav className="mx-auto flex w-full max-w-4xl items-center gap-4 px-4 pt-4 sm:px-6">
				<Link
					to="/settings"
					className="flex items-center gap-2 text-sm font-bold underline-offset-4 hover:underline"
				>
					<TbSettings aria-hidden="true" />
					設定
				</Link>
				<Link
					to="/"
					className="flex items-center gap-2 text-sm text-neutral-600 underline-offset-4 hover:underline dark:text-neutral-400"
				>
					<TbHome aria-hidden="true" />
					ホーム
				</Link>
			</nav>
			<Outlet />
		</div>
	);
}
