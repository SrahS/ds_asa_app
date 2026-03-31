import { db } from "./firebaseConfig";
import {
  collection,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  DocumentSnapshot,
  serverTimestamp
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { Transaction, TransactionCategory, TransactionType } from "@/types/transaction";
export interface TransactionFilters {
  type?: TransactionType;
  category?: TransactionCategory;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}
export interface PaginatedResult {
  data: Transaction[];
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
}
const PAGE_SIZE = 10;
const getColRef = (userId: string) => collection(db, "users", userId, "transactions");
export async function fetchTransactionsPaginated(
  userId: string,
  filters: TransactionFilters = {},
  lastDoc: DocumentSnapshot | null = null
): Promise<PaginatedResult> {
  let q = query(getColRef(userId), orderBy("date", "desc"), orderBy("createdAt", "desc"));
  if (filters.type) q = query(q, where("type", "==", filters.type));
  if (filters.category) q = query(q, where("category", "==", filters.category));
  if (filters.dateFrom) q = query(q, where("date", ">=", filters.dateFrom));
  if (filters.dateTo) q = query(q, where("date", "<=", filters.dateTo));
  if (lastDoc) q = query(q, startAfter(lastDoc));
  q = query(q, limit(PAGE_SIZE + 1));
  const snap = await getDocs(q);
  const hasMore = snap.docs.length > PAGE_SIZE;
  const docs = hasMore ? snap.docs.slice(0, PAGE_SIZE) : snap.docs;
  const data: Transaction[] = docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Transaction, "id">),
  }));
  const filtered = filters.search
    ? data.filter((t) => t.description.toLowerCase().includes(filters.search!.toLowerCase()))
    : data;
  return {
    data: filtered,
    lastDoc: docs[docs.length - 1] ?? null,
    hasMore,
  };
}
export const addTransaction = async (userId: string, data: any) => {
  try {
    const colRef = collection(db, "users", userId, "transactions");
    await addDoc(colRef, {
      ...data,
      amount: Number(data.amount),
      userId: userId,
      createdAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Erro real no Firebase:", error);
    throw error;
  }
};
export async function deleteTransaction(userId: string, transactionId: string): Promise<void> {
  await deleteDoc(doc(db, "users", userId, "transactions", transactionId));
}
export async function updateTransaction(
  userId: string,
  transactionId: string,
  data: Partial<Omit<Transaction, "id" | "userId" | "createdAt">>
): Promise<void> {
  const docRef = doc(db, "users", userId, "transactions", transactionId);
  await updateDoc(docRef, data);
}
export async function uploadReceipt(userId: string, transactionId: string, localUri: string): Promise<string> {
  const storage = getStorage();
  const ext = localUri.split(".").pop() ?? "jpg";
  const storageRef = ref(storage, `receipts/${userId}/${transactionId}.${ext}`);
  const response = await fetch(localUri);
  const blob = await response.blob();
  await uploadBytes(storageRef, blob);
  return await getDownloadURL(storageRef);
}
export async function deleteReceipt(downloadUrl: string): Promise<void> {
  const storage = getStorage();
  const storageRef = ref(storage, downloadUrl);
  await deleteObject(storageRef).catch(() => { });
}
export async function seedUserData(userId: string) {
  const dummyTransactions = [
    { description: "Salário Março", amount: 6200.00, type: "income", category: "salary", date: "2026-03-01" },
    { description: "Aluguel", amount: 1500.00, type: "expense", category: "housing", date: "2026-03-02" },
    { description: "Supermercado", amount: 800.00, type: "expense", category: "food", date: "2026-03-10" },
    { description: "Freelance", amount: 1500.00, type: "income", category: "others", date: "2026-03-15" },
    { description: "Academia", amount: 150.00, type: "expense", category: "health", date: "2026-03-18" },
    { description: "Salário Fev", amount: 6200.00, type: "income", category: "salary", date: "2026-02-01" },
    { description: "Aluguel", amount: 1500.00, type: "expense", category: "housing", date: "2026-02-02" },
    { description: "Viagem Carnaval", amount: 2200.00, type: "expense", category: "leisure", date: "2026-02-15" },
    { description: "Jantar", amount: 200.00, type: "expense", category: "food", date: "2026-02-20" },
    { description: "Salário Jan", amount: 6200.00, type: "income", category: "salary", date: "2026-01-01" },
    { description: "IPVA Carro", amount: 1800.00, type: "expense", category: "transport", date: "2026-01-05" },
    { description: "Aluguel", amount: 1500.00, type: "expense", category: "housing", date: "2026-01-02" },
    { description: "Venda Celular", amount: 1200.00, type: "income", category: "others", date: "2026-01-20" },
    { description: "Salário Dez", amount: 6200.00, type: "income", category: "salary", date: "2025-12-01" },
    { description: "Décimo Terceiro", amount: 6200.00, type: "income", category: "salary", date: "2025-12-15" },
    { description: "Presentes Natal", amount: 2500.00, type: "expense", category: "others", date: "2025-12-20" },
    { description: "Aluguel", amount: 1500.00, type: "expense", category: "housing", date: "2025-12-02" },
    { description: "Salário Nov", amount: 6200.00, type: "income", category: "salary", date: "2025-11-01" },
    { description: "Aluguel", amount: 1500.00, type: "expense", category: "housing", date: "2025-11-02" },
    { description: "Black Friday", amount: 3000.00, type: "expense", category: "others", date: "2025-11-25" },
    { description: "Salário Out", amount: 6200.00, type: "income", category: "salary", date: "2025-10-01" },
    { description: "Aluguel", amount: 1500.00, type: "expense", category: "housing", date: "2025-10-02" },
    { description: "Conserto Carro", amount: 1200.00, type: "expense", category: "transport", date: "2025-10-15" },
  ];
  console.log("Injetando histórico de 6 meses...");
  try {
    for (const transaction of dummyTransactions) {
      await addTransaction(userId, transaction as any);
    }
    console.log("Histórico populado com sucesso!");
  } catch (error) {
    console.error("Erro ao popular:", error);
  }
}