import { useCallback, useEffect, useRef, useState } from "react";
import { DocumentSnapshot } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchTransactionsPaginated,
  TransactionFilters,
} from "@/services/transactionService";
import { Transaction } from "@/types/transaction";
import theme from "@/utils/theme";
export function useTransactions(initialFilters: TransactionFilters = {}) {
  const { user } = useAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filters, setFilters] = useState<TransactionFilters>(initialFilters);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastDocRef = useRef<DocumentSnapshot | null>(null);
  const activeFiltersRef = useRef<TransactionFilters>(initialFilters);

  const [dashboardData, setDashboardData] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    monthlySummary: [],
    categoryExpenses: []
  });

  const fetchFirst = useCallback(
    async (newFilters: TransactionFilters = activeFiltersRef.current) => {
      if (!user?.uid) return;
      try {
        setLoading(true);
        setError(null);
        lastDocRef.current = null;

        const result = await fetchTransactionsPaginated(user.uid, newFilters, null);

        const data = result.data;

        let income = 0;
        let expense = 0;
        const categories: Record<string, number> = {};
        const monthly: Record<string, { income: number; expense: number }> = {};

        data.forEach((t) => {
          const amt = Number(t.amount);
          const date = new Date(t.date);
          const monthKey = date.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
          if (!monthly[monthKey]) monthly[monthKey] = { income: 0, expense: 0 };

          if (t.type === "income") {
            income += amt;
            monthly[monthKey].income += amt;
          } else {
            expense += amt;
            monthly[monthKey].expense += amt;
            categories[t.category] = (categories[t.category] || 0) + amt;
          }
        });

        setDashboardData({
          totalIncome: income,
          totalExpense: expense,
          balance: income - expense,
          monthlySummary: Object.entries(monthly).map(([month, vals]) => ({
            month,
            income: vals.income,
            expense: vals.expense,
            balance: vals.income - vals.expense
          })).reverse(),
          categoryExpenses: Object.entries(categories).map(([category, amount]) => ({
            category,
            amount,
            percentage: (amount / expense) * 100,
            color: theme.colors.primary
          }))
        });

        setTransactions(data);
        lastDocRef.current = result.lastDoc;
        setHasMore(result.hasMore);
        activeFiltersRef.current = newFilters;
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar dados.");
      } finally {
        setLoading(false);
      }
    },
    [user?.uid]
  );

  const fetchMore = useCallback(async () => {
    if (!user?.uid || loadingMore || !hasMore || !lastDocRef.current) return;
    try {
      setLoadingMore(true);
      const result = await fetchTransactionsPaginated(
        user.uid,
        activeFiltersRef.current,
        lastDocRef.current
      );

      setTransactions((prev) => [...prev, ...result.data]);
      lastDocRef.current = result.lastDoc;
      setHasMore(result.hasMore);
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar mais transações.");
    } finally {
      setLoadingMore(false);
    }
  }, [user?.uid, loadingMore, hasMore]);

  const applyFilters = useCallback(
    (newFilters: TransactionFilters) => {
      setFilters(newFilters);
      fetchFirst(newFilters);
    },
    [fetchFirst]
  );

  const clearFilters = useCallback(() => {
    applyFilters({});
  }, [applyFilters]);

  const refetch = useCallback(() => fetchFirst(), [fetchFirst]);

  useEffect(() => {
    fetchFirst(initialFilters);
  }, [fetchFirst]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return {
    transactions,
    dashboardData,
    filters,
    loading,
    loadingMore,
    hasMore,
    error,
    activeFilterCount,
    applyFilters,
    clearFilters,
    fetchMore,
    refetch,
  };
}