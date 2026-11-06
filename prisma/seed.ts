import { PrismaPg } from "@prisma/adapter-pg";
import { getDatabaseUrl } from "../src/database-url.js";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { words } from "./word_init.js";

const prisma = new PrismaClient({
	adapter: new PrismaPg({ connectionString: getDatabaseUrl() }),
});

async function main() {
	console.log("🌱 Seeding database...");

	await prisma.$executeRaw`TRUNCATE TABLE "Word" RESTART IDENTITY CASCADE`;

	for (const word of words) {
		await prisma.word.upsert({
			where: { word: word.word },
			update: { meanings: word.meanings },
			create: word,
		});
	}

	console.log(`✅ Seeded ${words.length} words`);
}

main()
	.catch((error) => {
		console.error("❌ Error seeding database:", error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
