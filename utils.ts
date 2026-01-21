export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (dateString: string) => {
  // Ajuste de fuso horário para exibir a data corretamente independente do local do usuário
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat('pt-BR').format(date);
};

// Gera string YYYY-MM a partir de um objeto Date
export const getMonthKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

// Retorna a data correspondente ao dia 1 de um mês específico (YYYY-MM)
export const getDateFromMonthKey = (monthKey: string): string => {
  const [year, month] = monthKey.split('-');
  // Retorna YYYY-MM-01
  return `${year}-${month}-01`;
};

// Retorna data do mês anterior ou seguinte
export const addMonths = (date: Date, months: number): Date => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

// Retorna nome do mês legível (ex: "Janeiro 2024")
export const formatMonthYear = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date);
};

export const generateId = () => Math.random().toString(36).substr(2, 9);
