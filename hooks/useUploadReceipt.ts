import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useState } from "react";
import { Alert } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { storage } from "../services/firebaseConfig";

export function useUploadReceipt() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  async function pickImage(useCamera = false) {
    if (!user) return;
    const permissionResult = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Permissão necessária",
        `Precisamos de acesso à ${useCamera ? "câmera" : "galeria"} para enviar o recibo.`,
      );
      return;
    }
    const result = await (useCamera
      ? ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.5 })
      : ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 0.5,
      }));

    if (!result.canceled && result.assets[0].uri) {
      await uploadImage(result.assets[0].uri);
    }
  }
  async function uploadImage(uri: string) {
    if (!user) return;

    setUploading(true);
    try {
      const filename = `${user.uid}/receipts/${Date.now()}.jpg`;
      const storageRef = ref(storage, filename);
      const response = await fetch(uri);
      const blob = await response.blob();
      const snapshot = await uploadBytes(storageRef, blob);
      const url = await getDownloadURL(snapshot.ref);

      setReceiptUrl(url);
      Alert.alert("Sucesso!", "Recibo enviado com sucesso.");
    } catch (error) {
      console.error("Erro no upload: ", error);
      Alert.alert("Erro", "Não foi possível enviar o recibo.");
    } finally {
      setUploading(false);
    }
  }

  return { pickImage, uploading, receiptUrl, setReceiptUrl };
}
