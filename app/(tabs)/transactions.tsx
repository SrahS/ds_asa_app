import React, { useCallback, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Pressable,
  RefreshControl,
  TextInput,
  View,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  Transaction,
  TransactionCategory,
  TransactionType,
} from "@/types/transaction";
import { useTransactions } from "@/hooks/useTransactions";
import theme from "@/utils/theme";
import {
  Search,
  X,
  SlidersHorizontal,
  Calendar,
  ChevronDown,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react-native";
import { useRouter } from "expo-router";

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Hoje";
  if (date.toDateString() === yesterday.toDateString()) return "Ontem";

  return date.toLocaleDateString("pt-BR", { day: '2-digit', month: 'long' });
}

function TransactionItem({ item, isLast }: { item: Transaction; isLast: boolean }) {
  const isIncome = item.type === "income";
  const categoryColor = CATEGORY_COLORS[item.category] || theme.colors.primary;

  const initials = item.description.substring(0, 2).toUpperCase();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.transactionRow,
        pressed && { backgroundColor: theme.colors.formsBackground }
      ]}
    >
      <HStack style={{ alignItems: "center", flexDirection: 'row', gap: 16, padding: 20 }}>
        <View style={[styles.avatarCircle, { backgroundColor: `${categoryColor}10` }]}>
          <Text bold style={{ color: categoryColor, fontSize: 12 }}>
            {initials}
          </Text>
        </View>

        <VStack style={{ flex: 1 }}>
          <Text bold style={styles.descriptionText}>
            {item.description}
          </Text>
          <Text style={styles.timeText}>
            00:00
          </Text>
        </VStack>

        <Text bold style={[styles.amountText, { color: isIncome ? theme.colors.success : theme.colors.error }]}>
          {isIncome ? "+ " : "-"} {formatCurrency(item.amount)}
        </Text>
      </HStack>

      {!isLast && <View style={styles.divider} />}
    </Pressable>
  );
}


function FilterChip({ label, active, onPress, onClear }: any) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        active ? { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary } : { borderColor: theme.colors.border }
      ]}
    >
      <Text size="xs" bold={active} style={{ color: active ? "#FFF" : theme.colors.secondaryText }}>
        {label}
      </Text>
      {active && <X size={12} color="#FFF" onPress={onClear} />}
    </Pressable>
  );
}

type ListItem =
  | { kind: "header"; date: string; key: string }
  | { kind: "transaction"; data: Transaction; index: number; isLast: boolean; key: string };

function groupTransactions(transactions: Transaction[]): ListItem[] {
  const items: ListItem[] = [];
  let globalIndex = 0;

  const groups = new Map<string, Transaction[]>();

  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));

  for (const t of sorted) {
    const existing = groups.get(t.date) ?? [];
    existing.push(t);
    groups.set(t.date, existing);
  }

  groups.forEach((txs, date) => {
    items.push({ kind: "header", date, key: `header-${date}` });

    txs.forEach((tx, i) => {
      items.push({
        kind: "transaction",
        data: tx,
        index: globalIndex++,
        isLast: i === txs.length - 1,
        key: tx.id || `tx-${globalIndex}`,
      });
    });
  });

  return items;
}

function DateSectionHeader({ date }: { date: string }) {
  return (
    <View style={styles.dateHeaderContainer}>
      <Text style={styles.dateHeaderText}>
        {formatDateLabel(date)}
      </Text>
    </View>
  );
}

export default function TransactionsScreen() {
  const { transactions, filters, loading, applyFilters, refetch, fetchMore, hasMore, loadingMore } = useTransactions();
  const [search, setSearch] = useState("");
  const router = useRouter();

  const listData = groupTransactions(transactions);

  return (
    <View style={styles.mainContainer}>
      <View style={styles.headerContainer}>
        <Text bold style={styles.headerTitle}>Transações</Text>

        <View style={styles.searchBar}>
          <Search size={18} color={theme.colors.secondaryText} />
          <TextInput
            placeholder="Buscar nas suas transações"
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholderTextColor={theme.colors.secondaryText}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          <FilterChip
            label={filters.type ? (filters.type === 'income' ? 'Receitas' : 'Despesas') : "Todos os tipos"}
            active={!!filters.type}
            onPress={() => {
              let nextType: "income" | "expense" | undefined;
              if (!filters.type) nextType = "income";
              else if (filters.type === "income") nextType = "expense";
              else nextType = undefined;

              applyFilters({ ...filters, type: nextType });
            }}
          />
        </ScrollView>
      </View>

      <FlatList
        data={listData}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => {
          if (item.kind === "header") return <DateSectionHeader date={item.date} />;
          return <TransactionItem item={item.data} index={item.index} isLast={item.isLast} />;
        }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} tintColor={theme.colors.primary} />}
      />

      <Pressable style={styles.fab} onPress={() => router.push("/(tabs)/new")}>
        <Plus size={28} color="#FFF" strokeWidth={2.5} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: theme.colors.background },
  headerContainer: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: theme.colors.background,
    gap: 16,
  },
  headerTitle: { fontSize: 28, color: theme.colors.primaryText, fontWeight: '900' },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.formsBackground,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 48,
    gap: 12,
  },
  searchInput: { flex: 1, fontSize: 15, color: theme.colors.primaryText },

  dateHeaderContainer: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 16,
    backgroundColor: theme.colors.background,
  },
  dateHeaderText: {
    fontSize: 22,
    color: '#999',
    fontWeight: '500',
  },
  transactionRow: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: theme.colors.background,
  },
  avatarCircle: {
    width: 50,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  descriptionText: {
    fontSize: 16,
    color: theme.colors.primaryText,
  },
  timeText: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  amountText: {
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#F2F2F2',
    position: 'absolute',
    bottom: 0,
    left: 86,
    right: 0,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  }
});