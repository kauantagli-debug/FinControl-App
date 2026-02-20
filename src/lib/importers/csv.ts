
import { ImportedTransaction } from './ofx';

export function parseCSV(csvContent: string): ImportedTransaction[] {
    const lines = csvContent.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) return [];

    const transactions: ImportedTransaction[] = [];
    const header = lines[0].toLowerCase();

    // Basic Column Detection 
    // Expecting: "Date, Description, Amount" or "Data, Historico, Valor"
    const parts = header.split(/[;,]/); // Split by comma or semicolon

    let dateIndex = parts.findIndex(p => p.includes('date') || p.includes('data'));
    let descIndex = parts.findIndex(p => p.includes('desc') || p.includes('hist') || p.includes('memo'));
    let amountIndex = parts.findIndex(p => p.includes('amount') || p.includes('valor') || p.includes('saldo')); // Careful with Balance (Saldo)

    // Fallback defaults if not found (assume standar NuBank CSV: Date, Amount, Identifier, Description)
    // Actually NuBank CSV has specific format from app. 
    // Let's rely on standard fallback: [0]=Date, [1]=Category?, [2]=Title?, [3]=Amount
    if (dateIndex === -1) dateIndex = 0;
    if (amountIndex === -1) amountIndex = parts.length - 1; // Usually last
    if (descIndex === -1) descIndex = 1;

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        // Handle quoted values? Simple split for now.
        const cols = line.split(/[;,]/);

        if (cols.length < 3) continue;

        const dateStr = cols[dateIndex]?.trim();
        const amountStr = cols[amountIndex]?.trim();
        const descStr = cols[descIndex]?.trim();

        if (dateStr && amountStr) {
            // Parse Date (DD/MM/YYYY or YYYY-MM-DD or standard)
            let date = new Date(dateStr);
            if (isNaN(date.getTime())) {
                // Try DD/MM/YYYY
                const [d, m, y] = dateStr.split('/');
                if (d && m && y) date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
            }
            if (isNaN(date.getTime())) continue; // Skip invalid dates

            // Parse Amount (handle "R$ 1.000,00" or "-10.50")
            const cleanAmount = amountStr.replace(/[^\d,\.-]/g, '').replace(',', '.');
            const amount = parseFloat(cleanAmount);

            if (!isNaN(amount)) {
                transactions.push({
                    date,
                    amount: Math.abs(amount),
                    description: descStr || "Sem descrição",
                    fitId: `CSV-${i}-${Math.random().toString(36).substr(2, 9)}`,
                    type: amount < 0 ? "EXPENSE" : "INCOME"
                });
            }
        }
    }

    return transactions;
}
