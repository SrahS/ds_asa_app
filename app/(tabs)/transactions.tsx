import React, { useCallback, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  TextInput,
  View,
  ActivityIndicator,
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
  Info,
  Plus,
} from "lucide-react-native";
import { useRouter } from "expo-router";

// ── Helpers ────────────────────────────────────────────────────────────────

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDateTime(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const day = String(d).padStart(2, "0");
  const monthNames = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  return `${day} ${monthNames[m - 1]} de ${y}`;
}

function getInitials(text: string): string {
  return text
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

// ── Chip de filtro ─────────────────────────────────────────────────────────

function FilterChip({
  label,
  active,
  onPress,
  onClear,
  icon,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  onClear?: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: active ? theme.colors.primary : theme.colors.border,
        backgroundColor: active
          ? theme.colors.primary
          : theme.colors.background,
      }}
    >
      {icon}
      <Text
        size="sm"
        bold={active}
        style={{
          color: active ? "#FFFFFF" : theme.colors.primaryText,
        }}
      >
        {label}
      </Text>
      {active && onClear ? (
        <Pressable onPress={onClear} hitSlop={8}>
          <X size={12} color="#FFFFFF" />
        </Pressable>
      ) : !active ? (
        <ChevronDown size={12} color={theme.colors.secondaryText} />
      ) : null}
    </Pressable>
  );
}

// ── Dropdown ───────────────────────────────────────────────────────────────

function Dropdown<T extends string>({
  visible,
  options,
  labels,
  colors,
  selected,
  onSelect,
  onClose,
}: {
  visible: boolean;
  options: T[];
  labels: Record<T, string>;
  colors?: Record<T, string>;
  selected?: T;
  onSelect: (v: T) => void;
  onClose: () => void;
}) {
  if (!visible) return null;
  return (
    <View style={{
      position: "absolute",
      top: 46,
      left: 0,
      minWidth: 190,
      zIndex: 999,
      backgroundColor: theme.colors.background,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 10,
      overflow: "hidden",
    }}>
      {options.map((opt, i) => (
        <Pressable
          key={opt}
          onPress={() => { onSelect(opt); onClose(); }}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            paddingHorizontal: 16,
            paddingVertical: 13,
            backgroundColor: pressed
              ? theme.colors.formsBackground
              : selected === opt
                ? `${theme.colors.primary}08`
                : "transparent",
            borderBottomWidth: i < options.length - 1 ? 1 : 0,
            borderBottomColor: theme.colors.border,
          })}
        >
          {colors && (
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors[opt] }} />
          )}
          <Text
            size="sm"
            bold={selected === opt}
            style={{ color: selected === opt ? theme.colors.primary : theme.colors.primaryText }}
          >
            {labels[opt]}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

// ── Item de transação ──────────────────────────────────────────────────────

function TransactionItem({
  item,
  index,
}: {
  item: Transaction;
  index: number;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(10)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 260,
        delay: Math.min(index * 40, 200),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 260,
        delay: Math.min(index * 40, 200),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const isIncome = item.type === "income";
  const categoryColor = CATEGORY_COLORS[item.category];
  const initials = getInitials(item.description);

  return (
    <Animated.View
      style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
    >
      {/* Data e hora acima do item */}
      <Text
        size="xs"
        style={{
          color: theme.colors.secondaryText,
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 8,
          textAlign: "right",
        }}
      >
        {formatDateTime(item.date)}
      </Text>

      <Pressable
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
          paddingVertical: 12,
          paddingHorizontal: 20,
          backgroundColor: pressed
            ? theme.colors.formsBackground
            : theme.colors.background,
        })}
      >
        {/* Avatar com iniciais */}
        <View
          style={{
            width: 46,
            height: 46,
            borderRadius: 23,
            backgroundColor: `${categoryColor}20`,
            justifyContent: "center",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <Text
            bold
            style={{
              fontSize: 13,
              color: categoryColor,
              letterSpacing: 0.5,
            }}
          >
            {initials}
          </Text>
        </View>

        {/* Descrição + subcategoria */}
        <VStack style={{ flex: 1, gap: 3 }}>
          <Text
            bold
            style={{
              fontSize: 15,
              color: theme.colors.primaryText,
              lineHeight: 20,
            }}
            numberOfLines={1}
          >
            {item.description}
          </Text>
          <Text size="sm" style={{ color: theme.colors.secondaryText }}>
            {CATEGORY_LABELS[item.category]}
          </Text>
        </VStack>

        {/* Valor */}
        <Text
          bold
          style={{
            fontSize: 15,
            color: isIncome ? theme.colors.success : theme.colors.error,
            letterSpacing: -0.3,
            flexShrink: 0,
          }}
        >
          R$ {item.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </Text>
      </Pressable>

      {/* Divisor */}
      <View style={{ height: 1, backgroundColor: theme.colors.border, marginHorizontal: 20 }} />
    </Animated.View>
  );
}

// ── Tela principal ─────────────────────────────────────────────────────────

const TYPE_LABELS: Record<TransactionType, string> = {
  income: "Receita",
  expense: "Despesa",
};

const CATEGORY_OPTIONS = Object.keys(CATEGORY_LABELS) as TransactionCategory[];
const TYPE_OPTIONS: TransactionType[] = ["income", "expense"];

export default function TransactionsScreen() {
  const {
    transactions,
    filters,
    loading,
    loadingMore,
    hasMore,
    error,
    activeFilterCount,
    applyFilters,
    clearFilters,
    fetchMore,
    refetch,
  } = useTransactions();

  const [search, setSearch] = useState("");
  const [openDropdown, setOpenDropdown] = useState<"type" | "category" | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();
  const router = useRouter();


  const handleSearch = useCallback(
    (text: string) => {
      setSearch(text);
      clearTimeout(searchTimeout.current);
      searchTimeout.current = setTimeout(() => {
        applyFilters({ ...filters, search: text || undefined });
      }, 400);
    },
    [filters, applyFilters]
  );

  const handleTypeSelect = (type: TransactionType) => {
    applyFilters({ ...filters, type: filters.type === type ? undefined : type });
  };

  const handleCategorySelect = (category: TransactionCategory) => {
    applyFilters({ ...filters, category: filters.category === category ? undefined : category });
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const onEndReached = useCallback(() => {
    if (hasMore && !loadingMore) fetchMore();
  }, [hasMore, loadingMore, fetchMore]);

  // Intervalo de datas ativo
  const dateRangeLabel = filters.dateFrom && filters.dateTo
    ? `${filters.dateFrom.split("-").reverse().join("/")} até ${filters.dateTo.split("-").reverse().join("/")}`
    : "Selecione o período";

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={{ paddingVertical: 24, alignItems: "center" }}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={{ alignItems: "center", paddingVertical: 72, gap: 10 }}>
        <View style={{
          width: 56, height: 56, borderRadius: 28,
          backgroundColor: theme.colors.formsBackground,
          justifyContent: "center", alignItems: "center", marginBottom: 4,
        }}>
          <SlidersHorizontal size={22} color={theme.colors.secondaryText} />
        </View>
        <Text bold style={{ fontSize: 16, color: theme.colors.primaryText }}>
          Nenhuma transação
        </Text>
        <Text size="sm" style={{ color: theme.colors.secondaryText, textAlign: "center", maxWidth: 240 }}>
          {activeFilterCount > 0
            ? "Nenhum resultado para os filtros selecionados"
            : "Suas transações aparecerão aqui"}
        </Text>
        {activeFilterCount > 0 && (
          <Pressable
            onPress={clearFilters}
            style={{
              marginTop: 8, paddingHorizontal: 20, paddingVertical: 10,
              borderRadius: 10, borderWidth: 1,
              borderColor: theme.colors.primary,
              backgroundColor: `${theme.colors.primary}08`,
            }}
          >
            <Text size="sm" bold style={{ color: theme.colors.primary }}>
              Limpar filtros
            </Text>
          </Pressable>
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>

      {/* Header */}
      <View style={{
        paddingHorizontal: 20,
        paddingTop: 56,
        paddingBottom: 14,
        backgroundColor: theme.colors.background,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        gap: 14,
      }}>

        {/* Título + info */}
        <HStack style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
          <VStack style={{ gap: 2 }}>
            <Text bold style={{ fontSize: 22, color: theme.colors.primaryText, letterSpacing: -0.5 }}>
              Transações
            </Text>
            <Text size="sm" style={{ color: theme.colors.secondaryText }}>
              {dateRangeLabel}
            </Text>
          </VStack>
          <Pressable hitSlop={8} style={{ marginTop: 4 }}>
            <Info size={20} color={theme.colors.secondaryText} />
          </Pressable>
        </HStack>

        {/* Seletor de período */}
        <Pressable
          onPress={() => {
            const now = new Date();
            const from = `${now.getFullYear()}-01-01`;
            const to = now.toISOString().split("T")[0];
            if (filters.dateFrom) {
              applyFilters({ ...filters, dateFrom: undefined, dateTo: undefined });
            } else {
              applyFilters({ ...filters, dateFrom: from, dateTo: to });
            }
          }}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 14,
            paddingVertical: 12,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.formsBackground,
          }}
        >
          <Text size="sm" style={{ color: theme.colors.primaryText }}>
            {filters.dateFrom && filters.dateTo
              ? `${filters.dateFrom.split("-").reverse().join("/")} até ${filters.dateTo.split("-").reverse().join("/")}`
              : "01/01/2025 até hoje"}
          </Text>
          <Calendar size={16} color={theme.colors.secondaryText} />
        </Pressable>

        {/* Busca */}
        <View style={{
          flexDirection: "row", alignItems: "center", gap: 10,
          backgroundColor: theme.colors.formsBackground,
          borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border,
          paddingHorizontal: 14, height: 44,
        }}>
          <Search size={15} color={theme.colors.secondaryText} />
          <TextInput
            placeholder="Buscar transação..."
            value={search}
            onChangeText={handleSearch}
            style={{ flex: 1, fontSize: 15, color: theme.colors.primaryText }}
            placeholderTextColor={theme.colors.secondaryText}
            returnKeyType="search"
          />
          {search !== "" && (
            <Pressable hitSlop={8} onPress={() => handleSearch("")}>
              <X size={14} color={theme.colors.secondaryText} />
            </Pressable>
          )}
        </View>

        {/* Chips de filtro */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingRight: 4 }}
        >
          <View style={{ position: "relative" }}>
            <FilterChip
              label={filters.type ? TYPE_LABELS[filters.type] : "Tipo"}
              active={!!filters.type}
              onPress={() => setOpenDropdown(openDropdown === "type" ? null : "type")}
              onClear={() => applyFilters({ ...filters, type: undefined })}
            />
            <Dropdown
              visible={openDropdown === "type"}
              options={TYPE_OPTIONS}
              labels={TYPE_LABELS}
              selected={filters.type}
              onSelect={handleTypeSelect}
              onClose={() => setOpenDropdown(null)}
            />
          </View>

          <View style={{ position: "relative" }}>
            <FilterChip
              label={filters.category ? CATEGORY_LABELS[filters.category] : "Categoria"}
              active={!!filters.category}
              onPress={() => setOpenDropdown(openDropdown === "category" ? null : "category")}
              onClear={() => applyFilters({ ...filters, category: undefined })}
            />
            <Dropdown
              visible={openDropdown === "category"}
              options={CATEGORY_OPTIONS}
              labels={CATEGORY_LABELS}
              colors={CATEGORY_COLORS}
              selected={filters.category}
              onSelect={handleCategorySelect}
              onClose={() => setOpenDropdown(null)}
            />
          </View>

          {activeFilterCount > 0 && (
            <FilterChip
              label="Limpar tudo"
              active={false}
              onPress={clearFilters}
            />
          )}
        </ScrollView>
      </View>

      {/* Lista */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : error ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 12 }}>
          <Text style={{ color: theme.colors.error }}>{error}</Text>
          <Pressable onPress={refetch}>
            <Text bold style={{ color: theme.colors.primary }}>Tentar novamente</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <TransactionItem item={item} index={index} />
          )}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
          contentContainerStyle={
            transactions.length === 0 ? { flex: 1 } : { paddingBottom: 32 }
          }
          showsVerticalScrollIndicator={false}
        />
      )}


      <Pressable
        onPress={() => router.push("/(tabs)/new")}
        style={({ pressed }) => ({
          position: "absolute",
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: 16,
          backgroundColor: theme.colors.primary,
          justifyContent: "center",
          alignItems: "center",
          opacity: pressed ? 0.85 : 1,
          shadowColor: theme.colors.primary,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.4,
          shadowRadius: 12,
          elevation: 8,
        })}
      >
        <Plus size={24} color="#FFFFFF" strokeWidth={2.5} />
      </Pressable>

    </View>
  );
}