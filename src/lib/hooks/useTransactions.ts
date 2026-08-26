import { z } from 'zod';

export const transactionSchema = z.object({
    amount: z.number().min(0.01, "O valor deve ser maior que zero"),
    description: z.string().min(3, "Descrição muito curta"),
    type: z.enum(['INCOME', 'EXPENSE']),
    categoryId: z.string().min(1, "Selecione uma categoria"),
    cardId: z.string().optional(),
    installments: z.number().min(1).max(24).optional(),
    date: z.string()
});

export type TransactionFormData = z.infer<typeof transactionSchema>;

export function useTransactions() {
    const submitTransaction = async (data: TransactionFormData) => {
        const response = await fetch("/api/transactions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error("Failed to save transaction");
        }

        return await response.json();
    };

    const deleteTransaction = async (id: string) => {
        const response = await fetch(`/api/transactions/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Failed to delete transaction');
        }
        return await response.json();
    };

    return {
        submitTransaction,
        deleteTransaction
    };
}
