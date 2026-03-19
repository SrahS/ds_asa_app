import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { addTransaction } from "@/services/transactionService";
import { uploadReceipt } from "@/services/storageService";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  TransactionCategory,
  TransactionType,
} from "@/types/transaction";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import theme from "@/utils/theme";
import {
  DollarSign,
  FileText,
  Calendar,
  Camera,
  X,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  ChevronDown,
} from "lucide-react-native";

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function parseDateToISO(display: string): string {
  const [d, m, y] = display.split("/");
  return `${y}-${m}-${d}`;
}

function formatAmountInput(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  const number = parseInt(digits, 10) / 100;
  return number.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parseAmount(formatted: string): number {
  return parseFloat(formatted.replace(/\./g, "").replace(",", ".")) || 0;
}

// ── Validação ──────────────────────────────────────────────────────────────

interface FormErrors {
  amount?: string;
  description?: string;
  category?: string;
  date?: string;
}

function validate(fields: {
  amount: string;
  description: string;
  category: TransactionCategory | null;
  date: string;
}): FormErrors {
  const errors: FormErrors = {};

  if (!fields.amount || parseAmount(fields.amount) <= 0)
    errors.amount = "Informe um valor válido.";

  if (!fields.description.trim())
    errors.description = "Descrição é obrigatória.";
  else if (fields.description.trim().length < 3)
    errors.description = "Mínimo de 3 caracteres.";

  if (!fields.category)
    errors.category = "Selecione uma categoria.";

  const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!dateRegex.test(fields.date)) {
    errors.date = "Formato inválido. Use DD/MM/AAAA.";
  } else {
    const [d, m, y] = fields.date.split("/").map(Number);
    const dt = new Date(y, m - 1, d);
    if (dt > new Date()) errors.date = "Data não pode ser futura.";
    if (y < 2000) errors.date = "Ano inválido.";
  }

  return errors;
}

// ── Componente de campo de erro ────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <Text size="xs" style={{ color: theme.colors.error, marginTop: 4 }}>
      {message}
    </Text>
  );
}

// ── Tela principal ─────────────────────────────────────────────────────────

const CATEGORY_OPTIONS = Object.keys(CATEGORY_LABELS) as TransactionCategory[];

export default function NewTransactionScreen() {
  const { user } = useAuth();
  const router = useRouter();

  // Form state
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TransactionCategory | null>(null);
  const [date, setDate] = useState(() => {
    const now = new Date();
    return `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
  });
  const [receiptUri, setReceiptUri] = useState<string | null>(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ── Upload de recibo ─────────────────────────────────────────────────────
  const handlePickReceipt = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão negada", "Precisamos de acesso à galeria para anexar recibos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setReceiptUri(result.assets[0].uri);
    }
  };

  const handleCameraReceipt = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão negada", "Precisamos de acesso à câmera para tirar foto do recibo.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setReceiptUri(result.assets[0].uri);
    }
  };

  const handleReceiptOptions = () => {
    Alert.alert("Anexar recibo", "Escolha uma opção", [
      { text: "Câmera", onPress: handleCameraReceipt },
      { text: "Galeria", onPress: handlePickReceipt },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const errs = validate({ amount, description, category, date });
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    if (!user?.uid) return;

    try {
      setLoading(true);

      const transactionId = await addTransaction(user.uid, {
        type,
        amount: parseAmount(amount),
        description: description.trim(),
        category: category!,
        date: parseDateToISO(date),
        receiptUrl: undefined,
      });

      // Upload do recibo se existir
      if (receiptUri) {
        const url = await uploadReceipt(user.uid, transactionId, receiptUri);
        const { updateTransaction } = await import("@/services/transactionService");
        await updateTransaction(user.uid, transactionId, { receiptUrl: url });
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        router.replace("/(tabs)/transactions");
      }, 1500);
    } catch (e) {
      Alert.alert("Erro", "Não foi possível salvar a transação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // ── Input style helper ───────────────────────────────────────────────────
  const inputStyle = (hasError: boolean) => ({
    borderRadius: 12,
    borderColor: hasError ? theme.colors.error : theme.colors.border,
    backgroundColor: hasError ? `${theme.colors.error}06` : theme.colors.formsBackground,
    height: 54,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    overflow: "hidden" as const,
  });

  // ── Tela de sucesso ──────────────────────────────────────────────────────
  if (success) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.background, gap: 12 }}>
        <View style={{
          width: 72, height: 72, borderRadius: 36,
          backgroundColor: `${theme.colors.success}15`,
          justifyContent: "center", alignItems: "center",
        }}>
          <CheckCircle size={36} color={theme.colors.success} />
        </View>
        <Text bold style={{ fontSize: 18, color: theme.colors.primaryText }}>
          Transação salva!
        </Text>
        <Text size="sm" style={{ color: theme.colors.secondaryText }}>
          Redirecionando...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 24, paddingTop: 56 }}>

          {/* Header */}
          <Text bold style={{ fontSize: 22, color: theme.colors.primaryText, letterSpacing: -0.5, marginBottom: 28 }}>
            Nova transação
          </Text>

          {/* Tipo: Receita / Despesa */}
          <VStack style={{ gap: 8, marginBottom: 20 }}>
            <Text size="sm" bold style={{ color: theme.colors.primaryText }}>
              Tipo
            </Text>
            <HStack style={{ gap: 10 }}>
              {(["income", "expense"] as TransactionType[]).map((t) => {
                const isActive = type === t;
                const color = t === "income" ? theme.colors.success : theme.colors.error;
                const Icon = t === "income" ? TrendingUp : TrendingDown;
                return (
                  <Pressable
                    key={t}
                    onPress={() => setType(t)}
                    style={{
                      flex: 1, flexDirection: "row", alignItems: "center",
                      justifyContent: "center", gap: 8,
                      paddingVertical: 14, borderRadius: 12,
                      borderWidth: 1.5,
                      borderColor: isActive ? color : theme.colors.border,
                      backgroundColor: isActive ? `${color}12` : theme.colors.formsBackground,
                    }}
                  >
                    <Icon size={16} color={isActive ? color : theme.colors.secondaryText} />
                    <Text
                      size="sm"
                      bold={isActive}
                      style={{ color: isActive ? color : theme.colors.secondaryText }}
                    >
                      {t === "income" ? "Receita" : "Despesa"}
                    </Text>
                  </Pressable>
                );
              })}
            </HStack>
          </VStack>

          {/* Valor */}
          <VStack style={{ gap: 8, marginBottom: 20 }}>
            <Text size="sm" bold style={{ color: theme.colors.primaryText }}>Valor</Text>
            <Input variant="outline" size="lg" style={inputStyle(!!errors.amount)}>
              <InputSlot style={{ paddingLeft: 16, height: "100%", justifyContent: "center" }}>
                <InputIcon as={DollarSign} style={{ color: errors.amount ? theme.colors.error : theme.colors.secondaryText }} size={18} />
              </InputSlot>
              <InputField
                placeholder="0,00"
                value={amount}
                onChangeText={(t) => {
                  setAmount(formatAmountInput(t));
                  if (errors.amount) setErrors((e) => ({ ...e, amount: undefined }));
                }}
                keyboardType="numeric"
                style={{ flex: 1, height: "100%", fontSize: 15, color: theme.colors.primaryText, paddingHorizontal: 8 }}
                placeholderTextColor={theme.colors.secondaryText}
              />
            </Input>
            <FieldError message={errors.amount} />
          </VStack>

          {/* Descrição */}
          <VStack style={{ gap: 8, marginBottom: 20 }}>
            <Text size="sm" bold style={{ color: theme.colors.primaryText }}>Descrição</Text>
            <Input variant="outline" size="lg" style={inputStyle(!!errors.description)}>
              <InputSlot style={{ paddingLeft: 16, height: "100%", justifyContent: "center" }}>
                <InputIcon as={FileText} style={{ color: errors.description ? theme.colors.error : theme.colors.secondaryText }} size={18} />
              </InputSlot>
              <InputField
                placeholder="Ex: Almoço, Salário..."
                value={description}
                onChangeText={(t) => {
                  setDescription(t);
                  if (errors.description) setErrors((e) => ({ ...e, description: undefined }));
                }}
                style={{ flex: 1, height: "100%", fontSize: 15, color: theme.colors.primaryText, paddingHorizontal: 8 }}
                placeholderTextColor={theme.colors.secondaryText}
              />
            </Input>
            <FieldError message={errors.description} />
          </VStack>

          {/* Categoria */}
          <VStack style={{ gap: 8, marginBottom: 20 }}>
            <Text size="sm" bold style={{ color: theme.colors.primaryText }}>Categoria</Text>
            <Pressable
              onPress={() => setShowCategoryPicker(!showCategoryPicker)}
              style={{
                ...inputStyle(!!errors.category),
                paddingHorizontal: 16,
                justifyContent: "space-between",
              }}
            >
              <HStack style={{ alignItems: "center", gap: 10 }}>
                {category && (
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: CATEGORY_COLORS[category] }} />
                )}
                <Text
                  size="sm"
                  style={{ color: category ? theme.colors.primaryText : theme.colors.secondaryText }}
                >
                  {category ? CATEGORY_LABELS[category] : "Selecione uma categoria"}
                </Text>
              </HStack>
              <ChevronDown size={16} color={theme.colors.secondaryText} />
            </Pressable>
            <FieldError message={errors.category} />

            {/* Picker de categorias */}
            {showCategoryPicker && (
              <View style={{
                borderRadius: 12, borderWidth: 1,
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.background,
                overflow: "hidden",
              }}>
                {CATEGORY_OPTIONS.map((cat, i) => (
                  <Pressable
                    key={cat}
                    onPress={() => {
                      setCategory(cat);
                      setShowCategoryPicker(false);
                      if (errors.category) setErrors((e) => ({ ...e, category: undefined }));
                    }}
                    style={({ pressed }) => ({
                      flexDirection: "row", alignItems: "center", gap: 12,
                      paddingHorizontal: 16, paddingVertical: 13,
                      backgroundColor: pressed
                        ? theme.colors.formsBackground
                        : category === cat
                          ? `${CATEGORY_COLORS[cat]}10`
                          : "transparent",
                      borderBottomWidth: i < CATEGORY_OPTIONS.length - 1 ? 1 : 0,
                      borderBottomColor: theme.colors.border,
                    })}
                  >
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: CATEGORY_COLORS[cat] }} />
                    <Text
                      size="sm"
                      bold={category === cat}
                      style={{ color: category === cat ? theme.colors.primaryText : theme.colors.secondaryText }}
                    >
                      {CATEGORY_LABELS[cat]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </VStack>

          {/* Data */}
          <VStack style={{ gap: 8, marginBottom: 20 }}>
            <Text size="sm" bold style={{ color: theme.colors.primaryText }}>Data</Text>
            <Input variant="outline" size="lg" style={inputStyle(!!errors.date)}>
              <InputSlot style={{ paddingLeft: 16, height: "100%", justifyContent: "center" }}>
                <InputIcon as={Calendar} style={{ color: errors.date ? theme.colors.error : theme.colors.secondaryText }} size={18} />
              </InputSlot>
              <InputField
                placeholder="DD/MM/AAAA"
                value={date}
                onChangeText={(t) => {
                  setDate(formatDateInput(t));
                  if (errors.date) setErrors((e) => ({ ...e, date: undefined }));
                }}
                keyboardType="numeric"
                style={{ flex: 1, height: "100%", fontSize: 15, color: theme.colors.primaryText, paddingHorizontal: 8 }}
                placeholderTextColor={theme.colors.secondaryText}
              />
            </Input>
            <FieldError message={errors.date} />
          </VStack>

          {/* Recibo */}
          <VStack style={{ gap: 8, marginBottom: 32 }}>
            <Text size="sm" bold style={{ color: theme.colors.primaryText }}>
              Recibo <Text size="sm" style={{ color: theme.colors.secondaryText }}>(opcional)</Text>
            </Text>

            {receiptUri ? (
              <View style={{ borderRadius: 12, overflow: "hidden", position: "relative" }}>
                <Image
                  source={{ uri: receiptUri }}
                  style={{ width: "100%", height: 180, borderRadius: 12 }}
                  resizeMode="cover"
                />
                <Pressable
                  onPress={() => setReceiptUri(null)}
                  style={{
                    position: "absolute", top: 8, right: 8,
                    width: 28, height: 28, borderRadius: 14,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    justifyContent: "center", alignItems: "center",
                  }}
                >
                  <X size={14} color="#FFF" />
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={handleReceiptOptions}
                style={{
                  height: 100, borderRadius: 12,
                  borderWidth: 1.5, borderStyle: "dashed",
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.formsBackground,
                  justifyContent: "center", alignItems: "center", gap: 8,
                }}
              >
                <Camera size={22} color={theme.colors.secondaryText} />
                <Text size="sm" style={{ color: theme.colors.secondaryText }}>
                  Toque para anexar recibo
                </Text>
              </Pressable>
            )}
          </VStack>

          {/* Botão salvar */}
          <Pressable
            onPress={handleSubmit}
            disabled={loading}
            style={({ pressed }) => ({
              height: 56, borderRadius: 14,
              backgroundColor: theme.colors.primary,
              justifyContent: "center", alignItems: "center",
              opacity: pressed || loading ? 0.8 : 1,
            })}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text bold style={{ color: "#FFF", fontSize: 16, textAlign: "center" }}>
                Salvar transação
              </Text>
            )}
          </Pressable>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
