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

  // 1. Função para selecionar a imagem (Galeria ou Câmera)
  async function pickImage(useCamera = false) {
    if (!user) return;

    // Pedir permissão
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

    // Abrir o seletor/câmera
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

  // 2. Função interna para fazer o upload para o Firebase Storage
  async function uploadImage(uri: string) {
    if (!user) return;

    setUploading(true);
    try {
      // Criar um nome único para o arquivo (ex: userId/timestamp.jpg)
      const filename = `${user.uid}/receipts/${Date.now()}.jpg`;
      const storageRef = ref(storage, filename);

      // Converter URI nativa para Blob (necessário para o Firebase v10+)
      const response = await fetch(uri);
      const blob = await response.blob();

      // Fazer o upload
      const snapshot = await uploadBytes(storageRef, blob);

      // Pegar a URL pública do arquivo
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
