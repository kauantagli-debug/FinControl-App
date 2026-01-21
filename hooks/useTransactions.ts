import { useState, useEffect, useCallback } from 'react';
import { Transaction } from '../types';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('fincontrol_transactions');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Erro ao carregar dados", e);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('fincontrol_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = useCallback((transaction: Transaction) => {
    setTransactions((prev) => [...prev, transaction]);
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return {
    transactions,
    addTransaction,
    deleteTransaction
  };
}
