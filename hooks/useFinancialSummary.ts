import { useMemo } from "react";
import { useTransactionList } from "./useTransactions";

export function useFinancialSummary() {
  const { transactions } = useTransactionList();

  const summary = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + t.amount, 0);

    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0);

    return {
      totalBalance: income - expense,
      income,
      expense,
      chartData: [
        { value: income, color: "#22c55e", text: "Entradas" },
        { value: expense, color: "#ef4444", text: "Saídas" },
      ],
    };
  }, [transactions]);

  return summary;
}
