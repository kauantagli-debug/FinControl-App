import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Filter, Calendar, Download, AlertCircle, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Transaction, TransactionType } from '../types';
import { formatCurrency, formatDate } from '../utils';

interface ExpenseReportProps {
  transactions: Transaction[];
}

const COLORS = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export const ExpenseReport: React.FC<ExpenseReportProps> = ({ transactions }) => {
  // Estado dos Filtros
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1); // Primeiro dia do mês atual
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const date = new Date(); // Hoje
    return date.toISOString().split('T')[0];
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [transactionType, setTransactionType] = useState<'all' | 'expense' | 'income'>('expense');

  // 1. Filtragem de Dados
  const filteredData = useMemo(() => {
    return transactions.filter(t => {
      const tDate = t.date;
      const matchesDate = tDate >= startDate && tDate <= endDate;
      const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
      
      let matchesType = true;
      if (transactionType === 'expense') matchesType = t.type === 'expense' || t.type === 'credit';
      if (transactionType === 'income') matchesType = t.type === 'income';

      return matchesDate && matchesCategory && matchesType;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [transactions, startDate, endDate, selectedCategory, transactionType]);

  // 2. Dados para KPIs
  const kpis = useMemo(() => {
    const total = filteredData.reduce((acc, curr) => acc + curr.amount, 0);
    const count = filteredData.length;
    
    // Cálculo de dias no intervalo
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    const avgDaily = total / (diffDays || 1);
    const maxTransaction = filteredData.reduce((max, curr) => curr.amount > max.amount ? curr : max, { amount: 0, description: '-' });

    return { total, count, avgDaily, maxTransaction };
  }, [filteredData, startDate, endDate]);

  // 3. Dados para Gráfico de Barras (Linha do Tempo)
  const timelineData = useMemo(() => {
    const map = new Map<string, number>();
    
    // Inicializa datas zeradas se quiser mostrar dias sem gastos (opcional, aqui foca nos dias com gastos)
    filteredData.forEach(t => {
      const dateStr = formatDate(t.date).substring(0, 5); // DD/MM
      const current = map.get(dateStr) || 0;
      map.set(dateStr, current + t.amount);
    });

    return Array.from(map.entries()).map(([date, amount]) => ({
      date,
      amount
    }));
  }, [filteredData]);

  // 4. Dados para Gráfico de Pizza (Por Categoria)
  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    filteredData.forEach(t => {
      const current = map.get(t.category) || 0;
      map.set(t.category, current + t.amount);
    });

    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredData]);

  // Lista única de categorias para o filtro
  const availableCategories = useMemo(() => {
    const cats = new Set(transactions.map(t => t.category));
    return Array.from(cats).sort();
  }, [transactions]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Barra de Filtros */}
      <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-6 justify-between items-end lg:items-center mb-2">
          <div className="flex items-center gap-2 text-brand-600">
            <Filter size={20} />
            <h2 className="font-bold text-lg">Filtros de Análise</h2>
          </div>
          <button className="text-sm text-gray-500 hover:text-brand-600 flex items-center gap-1 transition-colors" title="Exportar (Demo)">
            <Download size={16} /> Exportar CSV
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Início</label>
            <div className="relative">
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm font-medium text-gray-700"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Fim</label>
            <div className="relative">
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm font-medium text-gray-700"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoria</label>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm font-medium text-gray-700"
            >
              <option value="all">Todas as Categorias</option>
              {availableCategories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</label>
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button 
                onClick={() => setTransactionType('expense')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${transactionType === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Saídas
              </button>
              <button 
                onClick={() => setTransactionType('income')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${transactionType === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Entradas
              </button>
               <button 
                onClick={() => setTransactionType('all')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${transactionType === 'all' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Tudo
              </button>
            </div>
          </div>
        </div>
      </div>

      {filteredData.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-100 shadow-soft text-center flex flex-col items-center">
          <div className="bg-gray-50 p-4 rounded-full mb-4">
            <AlertCircle size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Nenhum dado encontrado</h3>
          <p className="text-gray-500 mt-1">Tente ajustar os filtros de data ou categoria.</p>
        </div>
      ) : (
        <>
          {/* KPIs Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-2xl shadow-soft border border-gray-100 flex items-center gap-4">
              <div className="p-3 bg-brand-50 text-brand-600 rounded-xl">
                <DollarSign size={24} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Total no Período</p>
                <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(kpis.total)}</h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-soft border border-gray-100 flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Calendar size={24} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Média Diária</p>
                <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(kpis.avgDaily)}</h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-soft border border-gray-100 flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                {transactionType === 'income' ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-500 uppercase">Maior Lançamento</p>
                <h3 className="text-xl font-bold text-gray-900 truncate" title={kpis.maxTransaction.description}>
                  {formatCurrency(kpis.maxTransaction.amount)}
                </h3>
                <p className="text-xs text-gray-400 truncate">{kpis.maxTransaction.description}</p>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Timeline Bar Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-soft border border-gray-100 h-[400px] flex flex-col">
              <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                Evolução Temporal
                <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">Dia a Dia</span>
              </h3>
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timelineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }} 
                      tickFormatter={(value) => `R$${value}`}
                    />
                    <RechartsTooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                      formatter={(value: number) => [formatCurrency(value), 'Valor']}
                    />
                    <Bar 
                      dataKey="amount" 
                      fill="#6366f1" 
                      radius={[6, 6, 0, 0]} 
                      barSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Pie Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 h-[400px] flex flex-col">
              <h3 className="font-bold text-gray-900 mb-2">Distribuição</h3>
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={100} 
                      layout="vertical"
                      iconType="circle"
                      content={(props) => {
                        const { payload } = props;
                        return (
                          <ul className="flex flex-col gap-1 mt-4 overflow-y-auto max-h-[100px] pr-2 custom-scrollbar">
                            {payload?.map((entry, index) => (
                              <li key={`item-${index}`} className="flex items-center justify-between text-xs text-gray-600">
                                <span className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                                  {entry.value}
                                </span>
                                <span className="font-medium text-gray-900">
                                  {/* @ts-ignore */}
                                  {formatCurrency(entry.payload.value)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Detailed Table Preview */}
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
             <div className="p-6 border-b border-gray-50">
               <h3 className="font-bold text-gray-900">Detalhamento ({filteredData.length})</h3>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left text-sm text-gray-600">
                 <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
                   <tr>
                     <th className="px-6 py-4">Data</th>
                     <th className="px-6 py-4">Descrição</th>
                     <th className="px-6 py-4">Categoria</th>
                     <th className="px-6 py-4 text-right">Valor</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                   {filteredData.map(t => (
                     <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                       <td className="px-6 py-4 font-medium">{formatDate(t.date)}</td>
                       <td className="px-6 py-4 text-gray-900 font-medium">{t.description}</td>
                       <td className="px-6 py-4">
                         <span className="bg-gray-100 px-2 py-1 rounded text-xs font-semibold">
                           {t.category}
                         </span>
                       </td>
                       <td className={`px-6 py-4 text-right font-bold ${
                         t.type === 'income' ? 'text-emerald-600' : 'text-gray-900'
                       }`}>
                         {formatCurrency(t.amount)}
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        </>
      )}
    </div>
  );
};