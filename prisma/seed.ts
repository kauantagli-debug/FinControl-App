import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding database...");

    // Create default categories
    const categories = [
        { name: "Alimentação", icon: "🍔", color: "bg-orange-500" },
        { name: "Transporte", icon: "🚗", color: "bg-blue-500" },
        { name: "Lazer", icon: "🎮", color: "bg-purple-500" },
        { name: "Contas", icon: "📄", color: "bg-red-500" },
        { name: "Compras", icon: "🛒", color: "bg-pink-500" },
        { name: "Saúde", icon: "💊", color: "bg-green-500" },
        { name: "Salário", icon: "💰", color: "bg-emerald-500", isIncome: true },
        { name: "Freelance", icon: "💻", color: "bg-cyan-500", isIncome: true },
        { name: "Investimentos", icon: "📈", color: "bg-yellow-500", isIncome: true },
        { name: "Outros", icon: "📂", color: "bg-gray-500" },
    ];

    for (const cat of categories) {
        await prisma.category.upsert({
            where: { id: cat.name.toLowerCase() },
            update: {},
            create: {
                id: cat.name.toLowerCase(),
                name: cat.name,
                icon: cat.icon,
                color: cat.color,
                isIncome: cat.isIncome || false,
            },
        });
    }

    console.log("✅ Seeding completed!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
