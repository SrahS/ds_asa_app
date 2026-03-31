import React, { useState } from "react";
import {
  View,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Button, ButtonText, ButtonSpinner } from "@/components/ui/button";
import { CATEGORY_LABELS, CATEGORY_COLORS, TransactionCategory } from "@/types/transaction";
import { addTransaction } from "@/services/transactionService";
import { useAuth } from "@/contexts/AuthContext";
import theme from "@/utils/theme";
import { useRouter } from "expo-router";
import { X, Calendar as CalendarIcon, Check } from "lucide-react-native";

export default function NewTransactionScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Estados do Formulário
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TransactionCategory>("food");
  const [date] = useState(new Date().toISOString().split("T")[0]);

  const handleSave = async () => {
    if (!amount || !description || !user?.uid) return;

    try {
      setLoading(true);
      await addTransaction(user.uid, {
        description,
        amount: parseFloat(amount.replace(",", ".")),
        type,
        category,
        date,
      });
      router.back(); // Volta para a tela anterior após salvar
    } catch (error) {
      console.error("Erro ao salvar transação:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Header com botão fechar */}
        <HStack style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={20}>
            <X size={24} color={theme.colors.primaryText} />
          </Pressable>
          <Text bold style={{ fontSize: 18 }}>Nova Transação</Text>
          <View style={{ width: 24 }} />
        </HStack>

        <View style={{ paddingHorizontal: 24, paddingTop: 20 }}>

          {/* Seletor de Tipo (Receita/Despesa) */}
          <HStack style={styles.typeSelector}>
            <Pressable
              onPress={() => setType("expense")}
              style={[styles.typeBtn, type === "expense" && { backgroundColor: theme.colors.error }]}
            >
              <Text bold style={{ color: type === "expense" ? "#FFF" : theme.colors.secondaryText }}>Despesa</Text>
            </Pressable>
            <Pressable
              onPress={() => setType("income")}
              style={[styles.typeBtn, type === "income" && { backgroundColor: theme.colors.success }]}
            >
              <Text bold style={{ color: type === "income" ? "#FFF" : theme.colors.secondaryText }}>Receita</Text>
            </Pressable>
          </HStack>

          {/* Valor Principal */}
          <VStack style={{ alignItems: 'center', marginVertical: 40 }}>
            <Text size="sm" bold style={{ color: theme.colors.secondaryText, marginBottom: 8 }}>VALOR EM REAIS</Text>
            <HStack style={{ alignItems: 'center' }}>
              <Text bold style={{ fontSize: 32, color: theme.colors.primaryText, marginRight: 8 }}>R$</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0,00"
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
                autoFocus
                placeholderTextColor={theme.colors.border}
              />
            </HStack>
          </VStack>

          {/* Descrição */}
          <VStack style={{ gap: 8, marginBottom: 32 }}>
            <Text size="xs" bold style={{ color: theme.colors.secondaryText }}>DESCRIÇÃO</Text>
            <TextInput
              style={styles.descriptionInput}
              placeholder="Ex: Aluguel, Uber, Salário..."
              value={description}
              onChangeText={setDescription}
              placeholderTextColor={theme.colors.secondaryText}
            />
          </VStack>

          {/* Categorias (Chips) */}
          <Text size="xs" bold style={{ color: theme.colors.secondaryText, marginBottom: 16 }}>CATEGORIA</Text>
          <View style={styles.categoryContainer}>
            {Object.keys(CATEGORY_LABELS).map((cat) => {
              const isSelected = category === cat;
              const color = CATEGORY_COLORS[cat as TransactionCategory];
              return (
                <Pressable
                  key={cat}
                  onPress={() => setCategory(cat as TransactionCategory)}
                  style={[
                    styles.catChip,
                    isSelected ? { backgroundColor: color, borderColor: color } : { borderColor: theme.colors.border }
                  ]}
                >
                  {isSelected && <Check size={14} color="#FFF" style={{ marginRight: 4 }} />}
                  <Text
                    size="xs"
                    bold={isSelected}
                    style={{ color: isSelected ? "#FFF" : theme.colors.secondaryText }}
                  >
                    {CATEGORY_LABELS[cat as TransactionCategory]}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Data Fixa (Simulada) */}
          <HStack style={styles.dateInfo}>
            <CalendarIcon size={18} color={theme.colors.secondaryText} />
            <Text size="sm" style={{ color: theme.colors.secondaryText }}>Hoje, {new Date().toLocaleDateString('pt-BR')}</Text>
          </HStack>

          {/* Botão Salvar */}
          <Button
            onPress={handleSave}
            disabled={loading || !amount || !description}
            style={[styles.saveButton, { backgroundColor: type === "expense" ? theme.colors.error : theme.colors.success }]}
          >
            {loading ? <ButtonSpinner color="#FFF" /> : <ButtonText bold style={{ color: "#FFF" }}>Salvar Transação</ButtonText>}
          </Button>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  typeSelector: { backgroundColor: theme.colors.formsBackground, borderRadius: 16, padding: 6, gap: 4 },
  typeBtn: { flex: 1, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  amountInput: { fontSize: 48, fontWeight: '900', color: theme.colors.primaryText, minWidth: 100 },
  descriptionInput: {
    fontSize: 16, borderBottomWidth: 1.5, borderBottomColor: theme.colors.border,
    paddingVertical: 12, color: theme.colors.primaryText
  },
  categoryContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 32 },
  catChip: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 20, borderWidth: 1.5
  },
  dateInfo: { alignItems: 'center', gap: 8, marginBottom: 40, alignSelf: 'center' },
  saveButton: { height: 58, borderRadius: 18, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowOpacity: 0.2, shadowRadius: 10 }
});