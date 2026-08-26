
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = "kauantagli@gmail.com";
    const password = "admin"; // senha que tentaremos validar, ou crie uma varivável se quiser testar outra

    console.log("🔍 Iniciando diagnóstico de autenticação...");
    console.log(`📧 Testando email: ${email}`);

    try {
        // 1. Testar Conexão
        console.log("📡 Tentando conectar ao banco de dados...");
        await prisma.$connect();
        console.log("✅ Conexão com banco de dados estabelecida com sucesso.");

        // 2. Buscar Usuário
        console.log("👤 Buscando usuário no banco...");
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (!user) {
            console.error("❌ Usuário NÃO encontrado.");
            console.log("💡 Sugestão: O usuário não foi criado corretamente. Tente registrar novamente ou verifique se o email está correto.");
        } else {
            console.log(`✅ Usuário encontrado: ID: ${user.id}, Email: ${user.email}`);
            console.log(`🔑 Hash da senha no banco: ${user.password}`);

            // 3. Testar Senha
            console.log(`🔐 Testando comparação de senha (tentativa: '${password}')...`);
            const isValid = await bcrypt.compare(password, user.password);

            if (isValid) {
                console.log("✅ Senha VÁLIDA. O login deveria funcionar.");
            } else {
                console.error("❌ Senha INVÁLIDA. Resetando para 'admin123'...");

                const newHash = await bcrypt.hash("admin123", 12);
                await prisma.user.update({
                    where: { email: email.toLowerCase() },
                    data: { password: newHash }
                });

                console.log("✅ Senha atualizada com sucesso para: admin123");
                console.log("👉 Tente logar agora com essa senha.");
            }
        }
    } catch (error) {
        console.error("🔥 Erro crítico durante diagnóstico:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
