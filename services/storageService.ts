import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

export async function uploadReceipt(
  userId: string,
  transactionId: string,
  localUri: string
): Promise<string> {
  try {
    const storage = getStorage();
    const ext = localUri.split(".").pop() ?? "jpg";
    const storagePath = `receipts/${userId}/${transactionId}.${ext}`;
    const storageRef = ref(storage, storagePath);

    const response = await fetch(localUri);
    const blob = await response.blob();

    await uploadBytes(storageRef, blob);

    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error("Erro no upload do recibo:", error);
    throw error;
  }
}

export async function deleteReceipt(downloadUrl: string): Promise<void> {
  try {
    const storage = getStorage();
    const storageRef = ref(storage, downloadUrl);
    await deleteObject(storageRef);
  } catch (error) {
    console.warn("Erro ao deletar recibo (ou ele não existia):", error);
  }
}