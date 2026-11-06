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

	return {
		words,
		meanings: [...new Set(meanings.flatMap((word) => word.meanings))],
	};
}
