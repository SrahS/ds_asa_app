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
  DocumentSnapshot
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

// Referência para a subcoleção de transações do usuário
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

  // Buscamos 1 a mais para saber se tem próxima página
  q = query(q, limit(PAGE_SIZE + 1));

  const snap = await getDocs(q);
  const hasMore = snap.docs.length > PAGE_SIZE;
  const docs = hasMore ? snap.docs.slice(0, PAGE_SIZE) : snap.docs;

  const data: Transaction[] = docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Transaction, "id">),
  }));

  // Filtro de busca simples no cliente
  const filtered = filters.search
    ? data.filter((t) => t.description.toLowerCase().includes(filters.search!.toLowerCase()))
    : data;

  return {
    data: filtered,
    lastDoc: docs[docs.length - 1] ?? null,
    hasMore,
  };
}

export async function addTransaction(
  userId: string,
  data: Omit<Transaction, "id" | "userId" | "createdAt">
): Promise<string> {
  const docRef = await addDoc(getColRef(userId), {
    ...data,
    userId,
    createdAt: Date.now(),
  });
  return docRef.id;
}

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

// LÓGICA DE STORAGE (RECIBOS)
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
    // --- MARÇO (Mês Atual) ---
    { description: "Salário Mensal", amount: 5500.00, type: "income", category: "salary", date: "2026-03-01" },
    { description: "Aluguel Apartamento", amount: 1400.00, type: "expense", category: "housing", date: "2026-03-02" },
    { description: "Supermercado Semanal", amount: 450.30, type: "expense", category: "food", date: "2026-03-03" },
    { description: "Venda de Teclado Usado", amount: 250.00, type: "income", category: "others", date: "2026-03-05" },
    { description: "Conta de Luz", amount: 185.20, type: "expense", category: "utilities", date: "2026-03-07" },
    { description: "Restaurante Japonês", amount: 120.00, type: "expense", category: "leisure", date: "2026-03-08" },
    { description: "Gasolina", amount: 200.00, type: "expense", category: "transport", date: "2026-03-10" },
    { description: "Freelance Landing Page", amount: 1200.00, type: "income", category: "freelance", date: "2026-03-12" },
    { description: "Farmácia", amount: 85.90, type: "expense", category: "health", date: "2026-03-14" },
    { description: "Assinatura Netflix/Spotify", amount: 75.00, type: "expense", category: "services", date: "2026-03-15" },
    { description: "Dividendos FIIs", amount: 112.45, type: "income", category: "investments", date: "2026-03-18" },

    // --- FEVEREIRO (Para o gráfico de evolução) ---
    { description: "Salário Fevereiro", amount: 5500.00, type: "income", category: "salary", date: "2026-02-01" },
    { description: "Aluguel Fevereiro", amount: 1400.00, type: "expense", category: "housing", date: "2026-02-02" },
    { description: "Carnaval Viagem", amount: 800.00, type: "expense", category: "leisure", date: "2026-02-15" },
    { description: "Bônus Performance", amount: 1000.00, type: "income", category: "others", date: "2026-02-20" },
    { description: "Manutenção Carro", amount: 600.00, type: "expense", category: "transport", date: "2026-02-25" },

    // --- JANEIRO ---
    { description: "Salário Janeiro", amount: 5500.00, type: "income", category: "salary", date: "2026-01-01" },
    { description: "Presentes Reais", amount: 300.00, type: "expense", category: "others", date: "2026-01-05" },
    { description: "Jantar Celebração", amount: 250.00, type: "expense", category: "food", date: "2026-01-10" },
    { description: "Reembolso Despesas", amount: 450.00, type: "income", category: "others", date: "2026-01-20" },
  ];

  console.log(`A injetar ${dummyTransactions.length} transações para o utilizador: ${userId}`);

  try {
    await Promise.all(
      dummyTransactions.map(transaction =>
        addTransaction(userId, transaction as any)
      )
    );
    console.log("Sucesso! Banco de dados populado em Reais.");
  } catch (error) {
    console.error("Erro ao popular dados:", error);
  }
}