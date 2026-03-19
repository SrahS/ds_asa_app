import { useCallback, useEffect, useRef, useState } from "react";
// MUDANÇA: Importamos o tipo correto do Firebase Web
import { DocumentSnapshot } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchTransactionsPaginated,
  TransactionFilters,
} from "@/services/transactionService";
import { Transaction } from "@/types/transaction";


// MUDANÇA: Renomeei o argumento para 'initialFilters' para não dar conflito com o state
export function useTransactions(initialFilters: TransactionFilters = {}) {
  const { user } = useAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filters, setFilters] = useState<TransactionFilters>(initialFilters);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // MUDANÇA: Usando DocumentSnapshot do Firebase Web
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

        const result = await fetchTransactionsPaginated(
          user.uid,
          newFilters,
          null
        );

        setTransactions(result.data);
        lastDocRef.current = result.lastDoc;
        setHasMore(result.hasMore);
        activeFiltersRef.current = newFilters;
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar transações.");
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