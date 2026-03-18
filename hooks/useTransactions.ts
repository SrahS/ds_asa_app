import {
    collection,
    getDocs,
    limit,
    orderBy,
    query,
    QueryDocumentSnapshot,
    startAfter,
    where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../services/firebaseConfig";

export function useTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot | null>(
    null,
  );
  const [refreshing, setRefreshing] = useState(false);

  const PAGE_SIZE = 10;

  async function fetchTransactions(isRefresh = false) {
    if (!user || loading) return;

    setLoading(true);
    try {
      // Se for refresh, recomeça do topo. Se não, começa após o último doc carregado.
      const firstQuery = query(
        collection(db, "transactions"),
        where("userId", "==", user.uid),
        orderBy("date", "desc"),
        limit(PAGE_SIZE),
      );

      const nextQuery = query(
        collection(db, "transactions"),
        where("userId", "==", user.uid),
        orderBy("date", "desc"),
        startAfter(isRefresh ? null : lastVisible),
        limit(PAGE_SIZE),
      );

      const querySnapshot = await getDocs(isRefresh ? firstQuery : nextQuery);

      const newTransactions = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setTransactions((prev) =>
        isRefresh ? newTransactions : [...prev, ...newTransactions],
      );
    } catch (error) {
      console.error("Erro ao buscar transações: ", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchTransactions(true);
  }, [user]);

  return {
    transactions,
    loading,
    refreshing,
    fetchMore: () => fetchTransactions(false),
    refresh: () => fetchTransactions(true),
  };
}
