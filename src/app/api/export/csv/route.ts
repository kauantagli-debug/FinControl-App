import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const transactions = await prisma.transaction.findMany({
            where: { userId: session.user.id },
            orderBy: { date: "desc" },
            include: { category: true }
        });

        // Generate CSV content
        let csvContent = "Data;Descrição;Categoria;Tipo;Valor\n";

        transactions.forEach(t => {
            const date = new Date(t.date).toLocaleDateString('pt-BR');
            const desc = `"${t.description.replace(/"/g, '""')}"`;
            const cat = `"${t.category?.name?.replace(/"/g, '""') || 'Sem Categoria'}"`;
            const type = t.type === 'INCOME' ? 'Receita' : 'Despesa';
            const val = parseFloat(t.amount.toString()).toFixed(2).replace('.', ',');
            
            csvContent += `${date};${desc};${cat};${type};${val}\n`;
        });

        // Ensure proper encoding (BOM for Excel)
        const bom = "\uFEFF";
        
        return new NextResponse(bom + csvContent, {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="extrato-fincontrol-${new Date().toISOString().split('T')[0]}.csv"`
            }
        });

    } catch (error) {
        console.error("CSV Export Error:", error);
        return NextResponse.json({ error: "Failed to export CSV" }, { status: 500 });
    }
}
