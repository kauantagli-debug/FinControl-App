import React, { useState, useMemo } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend 
} from 'recharts';
import { 
  Plus, Wallet, TrendingUp, TrendingDown, CreditCard 
} from 'lucide-react';

import { MonthSummary } from './types';
import { getMonthKey, addMonths, formatCurrency, formatMonthYear } from './utils';
import { useTransactions } from './hooks/useTransactions';

// Componentes
import { SummaryCard } from './components/SummaryCard';
import { TransactionModal } from './components/TransactionModal';
import { MonthSelector } from './components/MonthSelector';
import { TransactionList } from './components/TransactionList';

const COLORS = ['#0ea5e9', '#f43f5e', '#a855f7', '#10b981', '#f59e0b', '#64748b', '#334155'];

function App() {
  // Estado Visual
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estado de Dados (Custom Hook)
  const { transactions, addTransaction, deleteTransaction } = useTransactions();

  // Valores Computados
  const currentMonthKey = useMemo(() => getMonthKey(currentDate), [currentDate]);

  const monthData = useMemo(() => {
    // Filtragem Crucial: 
    // Usamos o targetMonth para decidir o que aparece na tela.
    // Isso garante que compras de cartão apareçam na fatura certa, e não no dia da compra.
    const filtered = transactions.filter(t => t.targetMonth === currentMonthKey);

    // Cálculo de Totais
    const summary: MonthSummary = filtered.reduce((acc, t) => {
      if (t.type === 'income') {
        acc.income += t.amount;
      } else if (t.type === 'expense') {
        if (t.isFixed) acc.fixedExpenses += t.amount;
        else acc.variableExpenses += t.amount;
        acc.totalExpenses += t.amount;
      } else if (t.type === 'credit') {
        acc.creditCardBill += t.amount;
        acc.totalExpenses += t.amount;
      }
      return acc;
    }, {
      income: 0,
      fixedExpenses: 0,
      variableExpenses: 0,
      creditCardBill: 0,
      totalExpenses: 0,
      balance: 0
    });

    summary.balance = summary.income - summary.totalExpenses;
    
    // Ordenação: Mais recentes primeiro
    const sortedList = [...filtered].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return { summary, transactions: sortedList };
  }, [transactions, currentMonthKey]);

  // Dados para o Gráfico
  const chartData = useMemo(() => {
    const data = [
      { name: 'Gastos Fixos', value: monthData.summary.fixedExpenses },
      { name: 'Gastos Variáveis', value: monthData.summary.variableExpenses },
      { name: 'Fatura Cartão', value: monthData.summary.creditCardBill },
    ].filter(i => i.value > 0);
    return data;
  }, [monthData]);

  // Handlers de Navegação
  const handlePrevMonth = () => setCurrentDate(addMonths(currentDate, -1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  return (
    <div className="min-h-screen pb-24 md:pb-12 bg-gray-50 font-sans">
      
      {/* Header Sticky */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30 transition-all">
        <div className="max-w-6xl mx-auto px-4 py-3 md:py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-brand-600 text-white p-2.5 rounded-xl shadow-lg shadow-brand-500/20">
              <Wallet size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-none">FinControl</h1>
              <span className="text-xs text-brand-600 font-semibold uppercase tracking-wider">Professional</span>
            </div>
          </div>

          <div className="self-center w-full md:w-auto flex justify-center">
            <MonthSelector 
              currentDate={currentDate} 
              onPrevMonth={handlePrevMonth} 
              onNextMonth={handleNextMonth} 
            />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 md:py-8 space-y-6 md:space-y-8">
        
        {/* Resumo Financeiro (Cards) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 animate-fade-in-up">
          <SummaryCard 
            title="Receitas" 
            amount={monthData.summary.income} 
            icon={TrendingUp} 
            variant="success" 
          />
          <SummaryCard 
            title="Despesas Totais" 
            amount={monthData.summary.totalExpenses} 
            icon={TrendingDown} 
            variant="danger" 
            subtitle={`Cartão: ${formatCurrency(monthData.summary.creditCardBill)}`}
          />
          <SummaryCard 
            title="Saldo Previsto" 
            amount={monthData.summary.balance} 
            icon={Wallet} 
            variant={monthData.summary.balance >= 0 ? "info" : "warning"}
            subtitle={monthData.summary.balance < 0 ? "Atenção: Saldo Negativo" : "Saldo positivo"}
          />
        </section>

        {/* Área Principal: Lista e Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          
          {/* Coluna Esquerda: Lista de Transações */}
          <section className="lg:col-span-2 space-y-4 animate-fade-in-up delay-100">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xl font-bold text-gray-800">Lançamentos</h2>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {monthData.transactions.length} registros
              </span>
            </div>

            <TransactionList 
              transactions={monthData.transactions} 
              onDelete={deleteTransaction} 
            />
          </section>

          {/* Coluna Direita: Gráfico e Widget Cartão */}
          <aside className="space-y-6 animate-fade-in-up delay-200">
            
            {/* Gráfico */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[320px]">
              <h3 className="font-bold text-gray-800 mb-4">Composição de Gastos</h3>
              {chartData.length > 0 ? (
                <div className="flex-1 w-full min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)} 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                  <p className="text-sm">Sem gastos registrados</p>
                </div>
              )}
            </div>

            {/* Widget Cartão */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                 <CreditCard size={140} />
               </div>
               <div className="relative z-10">
                 <div className="flex items-center gap-2 mb-4 text-brand-200">
                   <CreditCard size={18} />
                   <span className="text-sm font-medium uppercase tracking-wider">Fatura do Cartão</span>
                 </div>
                 <h3 className="text-3xl font-bold tracking-tight mb-2">{formatCurrency(monthData.summary.creditCardBill)}</h3>
                 <p className="text-xs text-slate-400 max-w-[80%] leading-relaxed">
                   Este valor está impactando o saldo de <strong>{formatMonthYear(currentDate)}</strong>.
                 </p>
               </div>
            </div>

          </aside>

        </div>
      </main>

      {/* FAB (Floating Action Button) */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 w-14 h-14 md:w-16 md:h-16 bg-brand-600 hover:bg-brand-500 text-white rounded-full shadow-xl shadow-brand-600/40 flex items-center justify-center transition-all hover:scale-110 active:scale-90 z-40 group"
        aria-label="Adicionar Transação"
      >
        <Plus size={32} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Modal */}
      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={addTransaction}
        currentMonthKey={currentMonthKey}
      />

    </div>
  );
}

export default App;