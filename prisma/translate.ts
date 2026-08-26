import { PrismaClient } from "@prisma/client";
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

const translations: Record<string, string> = {
    "Food": "Alimentação",
    "Transport": "Transporte",
    "Entertainment": "Lazer",
    "Bills": "Contas",
    "Shopping": "Compras",
    "Health": "Saúde",
    "Salary": "Salário",
    "Freelance": "Freelance",
    "Investment": "Investimentos",
    "Other": "Outros"
};

async function main() {
    console.log("Translating categories...");

    const categories = await prisma.category.findMany();

    for (const cat of categories) {
        if (translations[cat.name]) {
            const newName = translations[cat.name];
            await prisma.category.update({
                where: { id: cat.id },
                data: { name: newName }
            });
            console.log(`Translated category ${cat.name} to ${newName}`);
        }
    }

    console.log("Translating common transaction descriptions...");
    const transactions = await prisma.transaction.findMany();

    for (const t of transactions) {
        let updated = false;
        let newDesc = t.description;

        for (const [eng, pt] of Object.entries(translations)) {
            if (newDesc.toLowerCase() === eng.toLowerCase()) {
                newDesc = pt;
                updated = true;
                break;
            }
        }

        if (updated) {
            await prisma.transaction.update({
                where: { id: t.id },
                data: { description: newDesc }
            });
            console.log(`Translated transaction description ${t.description} to ${newDesc}`);
        }
    }

    console.log("Done!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
