import { db } from "./firebaseConfig";
import {
  collection,
  doc,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  limit,
  serverTimestamp
} from "firebase/firestore";
import { Transaction } from "@/types/transaction";

const getColRef = (userId: string) =>
  collection(db, "users", userId, "transactions");

export async function addTransaction(
  userId: string,
  data: Omit<Transaction, "id" | "userId" | "createdAt">
): Promise<void> {
  await addDoc(getColRef(userId), {
    ...data,
    userId,
    createdAt: serverTimestamp(),
  });
}

export async function getTransactions(
  userId: string,
  limitCount = 100
): Promise<Transaction[]> {
  const q = query(
    getColRef(userId),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );


  const snap = await getDocs(q);

  return snap.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<Transaction, "id">),
  })) as Transaction[];
}

export async function deleteTransaction(
  userId: string,
  transactionId: string
): Promise<void> {
  const docRef = doc(db, "users", userId, "transactions", transactionId);
  await deleteDoc(docRef);
}