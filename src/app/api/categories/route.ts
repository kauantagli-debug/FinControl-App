import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
    const count = await prisma.category.count();

    if (count === 0) {
        const defaultCategories = [
            // Income
            { name: "Salário", type: true, color: "bg-green-500", icon: "Wallet" },
            { name: "Freelance", type: true, color: "bg-emerald-500", icon: "Laptop" },
            { name: "Investimentos", type: true, color: "bg-lime-500", icon: "TrendingUp" },
            // Expense
            { name: "Alimentação", type: false, color: "bg-orange-500", icon: "Utensils" },
            { name: "Moradia", type: false, color: "bg-blue-500", icon: "Home" },
            { name: "Transporte", type: false, color: "bg-yellow-500", icon: "Car" },
            { name: "Lazer", type: false, color: "bg-purple-500", icon: "Gamepad2" },
            { name: "Saúde", type: false, color: "bg-red-500", icon: "HeartPulse" },
            { name: "Educação", type: false, color: "bg-indigo-500", icon: "GraduationCap" },
            { name: "Compras", type: false, color: "bg-pink-500", icon: "ShoppingBag" },
        ];

        await prisma.category.createMany({
            data: defaultCategories.map(c => ({
                name: c.name,
                isIncome: c.type, // True = Income, False = Expense
                color: c.color,
                icon: c.icon
            }))
        });
    }

    const categories = await prisma.category.findMany({
        orderBy: { name: "asc" }
    });

    return NextResponse.json(categories);
}
