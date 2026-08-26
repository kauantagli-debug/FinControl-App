
interface CategoryRule {
    keywords: string[];
    category: string;
}

const RULES: CategoryRule[] = [
    { keywords: ['uber', '99', 'taxi', 'posto', 'gasolina', 'combustivel', 'estacionamento'], category: 'Transporte' },
    { keywords: ['ifood', 'rappi', 'ubereats', 'restaurante', 'padaria', 'mercado', 'supermercado', 'atacadista'], category: 'Alimentação' },
    { keywords: ['netflix', 'spotify', 'amazon prime', 'disney', 'hbo', 'youtube', 'apple'], category: 'Assinaturas' },
    { keywords: ['farmacia', 'drogaria', 'medico', 'hospital', 'laboratorio', 'exam'], category: 'Saúde' },
    { keywords: ['cinema', 'show', 'ingresso', 'steam', 'playstation', 'xbox', 'nintendo'], category: 'Lazer' },
    { keywords: ['salario', 'pagamento', 'remuneracao', 'transferencia recebida', 'pix recebido'], category: 'Renda' },
    { keywords: ['aluguel', 'condominio', 'luz', 'agua', 'internet', 'claro', 'vivo', 'tim'], category: 'Casa' },
    { keywords: ['academia', 'smartfit', 'bluefit'], category: 'Saúde' },
];

export function suggestCategory(description: string): string | null {
    const desc = description.toLowerCase();

    for (const rule of RULES) {
        if (rule.keywords.some(k => desc.includes(k))) {
            return rule.category;
        }
    }

    return null;
}
