
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { parseOFX, ImportedTransaction } from "@/lib/importers/ofx";
import { parseCSV } from "@/lib/importers/csv";
import { suggestCategory } from "@/lib/importers/categorizer";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const text = await file.text();
        const filename = file.name.toLowerCase();
        let transactions: ImportedTransaction[] = [];

        if (filename.endsWith(".ofx")) {
            transactions = parseOFX(text);
        } else if (filename.endsWith(".csv")) {
            transactions = parseCSV(text);
        } else {
            return NextResponse.json({ error: "Unsupported file format" }, { status: 400 });
        }

        // Auto-categorize and Match Existing Categories
        const categories = await (prisma as any).category.findMany();

        const enrichedTransactions = transactions.map(t => {
            const suggestedName = suggestCategory(t.description);
            let categoryId = null;

            if (suggestedName) {
                const match = categories.find((c: any) => c.name.toLowerCase() === suggestedName.toLowerCase());
                if (match) categoryId = match.id;
            }

            return {
                ...t,
                categoryId,
                suggestedCategory: suggestedName || "Outros"
            };
        });

        return NextResponse.json({ transactions: enrichedTransactions });

    } catch (error) {
        console.error("Import Error:", error);
        return NextResponse.json({ error: "Failed to process file" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { transactions } = body;

        if (!transactions || !Array.isArray(transactions)) {
            return NextResponse.json({ error: "Invalid data" }, { status: 400 });
        }

        const created = await (prisma as any).transaction.createMany({
            data: transactions.map((t: any) => ({
                amount: t.type === 'EXPENSE' ? parseFloat(t.amount) : parseFloat(t.amount), // Amount is usually absolute in import, but Type handles sign logic? 
                // Wait, our DB stores positive amounts usually, and Type field handles sign logic in UI?
                // Let's check `Transaction` model. `type` String @default("EXPENSE"). `amount` Decimal.
                // Usually we store positive amount and use Type to differentiate.
                // So:
                description: t.description,
                date: new Date(t.date),
                type: t.type,
                categoryId: t.categoryId,
                userId: session.user.id,
                source: "IMPORT"
            }))
        });

        return NextResponse.json({ count: created.count });

    } catch (error) {
        console.error("Bulk Import Error:", error);
        return NextResponse.json({ error: "Failed to save transactions" }, { status: 500 });
    }
}
