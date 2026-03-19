import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getTransactions } from "@/services/transactionService";
import { Transaction, TransactionCategory, CATEGORY_COLORS } from "@/types/transaction";

export interface MonthlySummary {
  month: string;   // "Jan", "Fev", ...
  income: number;
  expense: number;
  balance: number;
}

export interface CategorySummary {
  category: TransactionCategory;
  label: string;
  amount: number;
  color: string;
  percentage: number;
}

export interface DashboardData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  monthlySummary: MonthlySummary[];
  categoryExpenses: CategorySummary[];
  recentTransactions: Transaction[];
}

const MONTH_LABELS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export function useTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!user?.uid) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getTransactions(user.uid);
      setTransactions(data);
    } catch (e) {
      setError("Erro ao carregar transações");
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const dashboardData: DashboardData = (() => {
    const now = new Date();
    const currentYear = now.getFullYear();

    // Totais gerais
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    // Resumo mensal (últimos 6 meses)
    const monthlySummary: MonthlySummary[] = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const month = d.getMonth();
      const year = d.getFullYear();

      const monthTx = transactions.filter((t) => {
        const td = new Date(t.date);
        return td.getMonth() === month && td.getFullYear() === year;
      });

      const income = monthTx
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + t.amount, 0);

      const expense = monthTx
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + t.amount, 0);

      return {
        month: MONTH_LABELS[month],
        income,
        expense,
        balance: income - expense,
      };
    });

    // Gastos por categoria
    const expenseMap: Partial<Record<TransactionCategory, number>> = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        expenseMap[t.category] = (expenseMap[t.category] ?? 0) + t.amount;
      });

    const categoryExpenses: CategorySummary[] = Object.entries(expenseMap)
      .map(([cat, amount]) => ({
        category: cat as TransactionCategory,
        label: cat,
        amount: amount ?? 0,
        color: CATEGORY_COLORS[cat as TransactionCategory],
        percentage: totalExpense > 0 ? ((amount ?? 0) / totalExpense) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      monthlySummary,
      categoryExpenses,
      recentTransactions: transactions.slice(0, 5),
    };
  })();

  return { transactions, dashboardData, loading, error, refetch: fetchTransactions };
}