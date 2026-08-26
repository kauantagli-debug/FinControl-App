import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
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

        const categories = await prisma.category.findMany();
        const logs: string[] = [];

        for (const cat of categories) {
            if (translations[cat.name]) {
                const newName = translations[cat.name];
                await prisma.category.update({
                    where: { id: cat.id },
                    data: { name: newName }
                });
                logs.push(`Translated category ${cat.name} to ${newName}`);
            }
        }

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
                logs.push(`Translated transaction description ${t.description} to ${newDesc}`);
            }
        }

        return NextResponse.json({ success: true, logs });
    } catch (error) {
        console.error("Migration Error:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
