import React, { useState, useMemo } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend 
} from 'recharts';
import { 
  Plus, Wallet, TrendingUp, TrendingDown, CreditCard, Sparkles 
} from 'lucide-react';

import { MonthSummary } from './types';
import { getMonthKey, addMonths, formatCurrency, formatMonthYear } from './utils';
import { useTransactions } from './hooks/useTransactions';

// Componentes
import { SummaryCard } from './components/SummaryCard';
import { TransactionModal } from './components/TransactionModal';
import { MonthSelector } from './components/MonthSelector';
import { TransactionList } from './components/TransactionList';

// Updated palette to match the Indigo theme
const COLORS = ['#6366f1', '#f43f5e', '#a855f7', '#10b981', '#f59e0b', '#64748b', '#334155'];

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { transactions, addTransaction, deleteTransaction } = useTransactions();
  const currentMonthKey = useMemo(() => getMonthKey(currentDate), [currentDate]);

  const monthData = useMemo(() => {
    const filtered = transactions.filter(t => t.targetMonth === currentMonthKey);
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
    const sortedList = [...filtered].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return { summary, transactions: sortedList };
  }, [transactions, currentMonthKey]);

  const chartData = useMemo(() => {
    const data = [
      { name: 'Fixas', value: monthData.summary.fixedExpenses },
      { name: 'Variáveis', value: monthData.summary.variableExpenses },
      { name: 'Cartão', value: monthData.summary.creditCardBill },
    ].filter(i => i.value > 0);
    return data;
  }, [monthData]);

  const handlePrevMonth = () => setCurrentDate(addMonths(currentDate, -1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  return (
    <div className="min-h-screen pb-32 bg-gray-50/50 font-sans selection:bg-brand-500 selection:text-white">
      
      {/* Navbar with blur effect */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-brand-600 to-brand-400 text-white p-2.5 rounded-xl shadow-lg shadow-brand-500/30">
              <Wallet size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-none flex items-center gap-2">
                FinControl <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Pro</span>
              </h1>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* KPI Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
          <SummaryCard 
            title="Receitas Mensais" 
            amount={monthData.summary.income} 
            icon={TrendingUp} 
            variant="success" 
          />
          <SummaryCard 
            title="Despesas Totais" 
            amount={monthData.summary.totalExpenses} 
            icon={TrendingDown} 
            variant="danger" 
            subtitle={`Inclui cartão: ${formatCurrency(monthData.summary.creditCardBill)}`}
          />
          <SummaryCard 
            title="Saldo Disponível" 
            amount={monthData.summary.balance} 
            icon={Wallet} 
            variant={monthData.summary.balance >= 0 ? "info" : "warning"}
            subtitle={monthData.summary.balance < 0 ? "Saldo Negativo" : "Economia do mês"}
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main List */}
          <section className="lg:col-span-2 space-y-6 animate-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                Transações Recentes
              </h2>
              <span className="text-xs font-semibold text-gray-500 bg-white border border-gray-200 px-3 py-1 rounded-full shadow-sm">
                {monthData.transactions.length} items
              </span>
            </div>

            <TransactionList 
              transactions={monthData.transactions} 
              onDelete={deleteTransaction} 
            />
          </section>

          {/* Sidebar Widgets */}
          <aside className="space-y-8 animate-in slide-in-from-bottom-8 duration-1000">
            
            {/* Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 flex flex-col h-[350px]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-900">Análise de Gastos</h3>
                <Sparkles size={16} className="text-brand-400" />
              </div>
              
              {chartData.length > 0 ? (
                <div className="flex-1 w-full min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)} 
                        contentStyle={{ 
                          borderRadius: '12px', 
                          border: 'none', 
                          boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)',
                          fontFamily: 'Inter'
                        }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36} 
                        iconType="circle"
                        formatter={(value) => <span className="text-sm font-medium text-gray-600 ml-1">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
                  <p className="text-sm font-medium">Sem dados visuais</p>
                </div>
              )}
            </div>

            {/* Realistic Credit Card Widget */}
            <div className="relative h-56 w-full rounded-2xl bg-gradient-to-bl from-gray-900 via-gray-800 to-black text-white p-6 shadow-2xl shadow-gray-900/20 overflow-hidden group transform transition hover:scale-[1.02] duration-300">
               {/* Decorative Circles */}
               <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/5 blur-3xl"></div>
               <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-brand-500/20 blur-3xl"></div>
               
               {/* Card Content */}
               <div className="relative z-10 flex flex-col justify-between h-full">
                 <div className="flex justify-between items-start">
                   <div>
                     <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">Fatura Atual</p>
                     <h3 className="text-3xl font-bold tracking-tight text-white">{formatCurrency(monthData.summary.creditCardBill)}</h3>
                   </div>
                   <CreditCard size={32} className="text-brand-400/80" />
                 </div>
                 
                 <div>
                   <div className="flex gap-3 mb-6">
                     <div className="w-12 h-8 bg-amber-200/20 rounded-md border border-amber-200/30 backdrop-blur-sm flex items-center justify-center">
                       <div className="w-8 h-5 border border-amber-200/40 rounded-sm"></div>
                     </div>
                     <div className="w-8 h-8 flex -space-x-3">
                       <div className="w-8 h-8 rounded-full bg-red-500/80"></div>
                       <div className="w-8 h-8 rounded-full bg-orange-400/80"></div>
                     </div>
                   </div>
                   <div className="flex justify-between items-end">
                     <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Vencimento</p>
                        <p className="font-mono text-sm tracking-wider">{formatMonthYear(currentDate)}</p>
                     </div>
                     <p className="font-mono text-lg tracking-widest text-gray-400">•••• 8842</p>
                   </div>
                 </div>
               </div>
            </div>

          </aside>

        </div>
      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-brand-600 hover:bg-brand-500 text-white rounded-full shadow-lg shadow-brand-600/40 flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-40 group"
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