import { PrismaPg } from "@prisma/adapter-pg";
import { getDatabaseUrl } from "../database-url";
import { PrismaClient } from "../generated/prisma/client";
import type { QuizData } from "./quiz";

const globalForPrisma = globalThis as unknown as {
	prisma?: PrismaClient;
};

const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		adapter: new PrismaPg({ connectionString: getDatabaseUrl() }),
	});

if (import.meta.env?.DEV) {
	globalForPrisma.prisma = prisma;
}

export async function getQuizWordsFromDatabase(data: {
	from: number;
	to: number;
}): Promise<QuizData> {
	const words = await prisma.word.findMany({
		where: {
			id: {
				gte: data.from,
				lte: data.to,
			},
		},
		orderBy: { id: "asc" },
		select: { id: true, word: true, meanings: true },
	});

	const meanings = await prisma.word.findMany({
		select: { meanings: true },
	});
	// サーバー側で一度だけ並べ替え、初期表示時のSSRとブラウザー表示を一致させます。
	for (let index = words.length - 1; index > 0; index -= 1) {
		const randomIndex = Math.floor(Math.random() * (index + 1));
		[words[index], words[randomIndex]] = [words[randomIndex], words[index]];
	}

	return {
		words,
		meanings: [...new Set(meanings.flatMap((word) => word.meanings))],
	};
}
