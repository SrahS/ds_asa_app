export type TransactionType = "income" | "expense";

export type TransactionCategory =
  | "salary"
  | "investment"
  | "freelance"
  | "food"
  | "transport"
  | "health"
  | "education"
  | "entertainment"
  | "housing"
  | "other";

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description: string;
  date: string;
  createdAt: number;
}

export const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  salary: "Salário",
  investment: "Investimentos",
  freelance: "Freelance",
  food: "Alimentação",
  transport: "Transporte",
  health: "Saúde",
  education: "Educação",
  entertainment: "Lazer",
  housing: "Moradia",
  other: "Outros",
};

export const CATEGORY_COLORS: Record<TransactionCategory, string> = {
  salary: "#0061FF",
  investment: "#22C55E",
  freelance: "#FF9318",
  food: "#EF4444",
  transport: "#8B5CF6",
  health: "#EC4899",
  education: "#14B8A6",
  entertainment: "#F59E0B",
  housing: "#6366F1",
  other: "#737373",
};