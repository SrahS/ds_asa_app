import React, { useRef, useState, useCallback } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { BarChart, LineChart, PieChart } from "react-native-gifted-charts";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { useTransactions } from "@/hooks/useTransactions";
import { CATEGORY_LABELS } from "@/types/transaction";
import { useAuth } from "@/contexts/AuthContext";
import theme from "@/utils/theme";
import { TrendingUp, TrendingDown, Wallet, ChevronRight } from "lucide-react-native";
import { seedUserData } from "@/services/transactionService";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CHART_WIDTH = SCREEN_WIDTH - 56;

const SECTIONS = ["Resumo", "Mensal", "Categorias"] as const;
type Section = typeof SECTIONS[number];

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ── Componente de card de métrica ──────────────────────────────────────────
function MetricCard({
  label,
  value,
  type,
  delay,
}: {
  label: string;
  value: number;
  type: "income" | "expense" | "balance";
  delay: number;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const colors = {
    income: { bg: `${theme.colors.success}12`, text: theme.colors.success, icon: TrendingUp },
    expense: { bg: `${theme.colors.error}12`, text: theme.colors.error, icon: TrendingDown },
    balance: { bg: `${theme.colors.primary}12`, text: theme.colors.primary, icon: Wallet },
  };

  const config = colors[type];
  const Icon = config.icon;

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        flex: 1,
      }}
    >
      <View
        style={{
          backgroundColor: config.bg,
          borderRadius: 16,
          padding: 16,
          gap: 10,
        }}
      >
        <Icon size={18} color={config.text} />
        <Text
          style={{ fontSize: 11, color: theme.colors.secondaryText, letterSpacing: 0.3 }}
        >
          {label.toUpperCase()}
        </Text>
        <Text bold style={{ fontSize: 16, color: theme.colors.primaryText, letterSpacing: -0.3 }}>
          {formatCurrency(value)}
        </Text>
      </View>
    </Animated.View>
  );
}

// ── Componente de item de categoria ───────────────────────────────────────
function CategoryItem({
  label,
  amount,
  percentage,
  color,
  index,
}: {
  label: string;
  amount: number;
  percentage: number;
  color: string;
  index: number;
}) {
  const widthAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: percentage,
      duration: 600,
      delay: index * 80,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  const barWidth = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={{ gap: 6 }}>
      <HStack style={{ justifyContent: "space-between", alignItems: "center" }}>
        <HStack style={{ alignItems: "center", gap: 8 }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
          <Text size="sm" style={{ color: theme.colors.primaryText }}>
            {CATEGORY_LABELS[label as keyof typeof CATEGORY_LABELS] ?? label}
          </Text>
        </HStack>
        <HStack style={{ alignItems: "center", gap: 8 }}>
          <Text size="sm" style={{ color: theme.colors.secondaryText }}>
            {percentage.toFixed(1)}%
          </Text>
          <Text size="sm" bold style={{ color: theme.colors.primaryText }}>
            {formatCurrency(amount)}
          </Text>
        </HStack>
      </HStack>
      <View
        style={{
          height: 4,
          backgroundColor: theme.colors.border,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <Animated.View
          style={{
            height: "100%",
            width: barWidth,
            backgroundColor: color,
            borderRadius: 2,
          }}
        />
      </View>
    </View>
  );
}

// ── Dashboard principal ────────────────────────────────────────────────────
export default function DashboardScreen() {
  const { user } = useAuth();
  const { dashboardData, loading, refetch } = useTransactions();
  const [activeSection, setActiveSection] = useState<Section>("Resumo");
  const [refreshing, setRefreshing] = useState(false);

  // Animação de transição entre seções
  const sectionAnim = useRef(new Animated.Value(0)).current;
  const prevSection = useRef<Section>("Resumo");

  const handleSeed = async () => {
    try {
      if (user?.uid) {
        console.log("Tentando enviar para o UID:", user.uid);
        await seedUserData(user.uid);
        alert("Injetado com sucesso!");
        refetch();
      } else {
        console.log("Usuário não identificado no clique");
      }
    } catch (e: any) {
      alert("ERRO NO FIREBASE: " + e.message);
      console.log(e);
    }
  };

  const switchSection = useCallback(
    (section: Section) => {
      if (section === activeSection) return;
      prevSection.current = activeSection;

      Animated.sequence([
        Animated.timing(sectionAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(sectionAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      setActiveSection(section);
    },
    [activeSection]
  );

  const sectionOpacity = sectionAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 1],
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const { totalIncome, totalExpense, balance, monthlySummary, categoryExpenses } =
    dashboardData;

  // Dados para o BarChart (receitas vs despesas)
  const barData = monthlySummary.flatMap((m) => [
    {
      value: m.income,
      label: m.month,
      frontColor: theme.colors.success,
      spacing: 4,
    },
    {
      value: m.expense,
      frontColor: theme.colors.error,
      spacing: 16,
    },
  ]);

  // Dados para o LineChart (saldo)
  const lineData = monthlySummary.map((m) => ({
    value: m.balance,
    label: m.month,
    dataPointColor: theme.colors.primary,
  }));

  // Dados para o PieChart (categorias)
  const pieData = categoryExpenses.map((c) => ({
    value: c.amount,
    color: c.color,
    label: CATEGORY_LABELS[c.category] ?? c.category,
  }));

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary}
        />
      }
    >
      <View style={{ paddingHorizontal: 24, paddingTop: 56 }}>

        {/* Header */}
        <HStack style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <VStack style={{ gap: 2 }}>
            <Text style={{ fontSize: 13, color: theme.colors.secondaryText }}>
              Olá,
            </Text>
            <Text bold style={{ fontSize: 22, color: theme.colors.primaryText, letterSpacing: -0.5 }}>
              {user?.displayName?.split(" ")[0]}
            </Text>
          </VStack>
          <View
            style={{
              backgroundColor: theme.colors.formsBackground,
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <Text size="xs" bold style={{ color: theme.colors.secondaryText }}>
              {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
            </Text>
          </View>
        </HStack>

        {/* Cards de métrica */}
        <HStack style={{ gap: 10, marginBottom: 32 }}>
          <MetricCard label="Receitas" value={totalIncome} type="income" delay={0} />
          <MetricCard label="Despesas" value={totalExpense} type="expense" delay={100} />
        </HStack>
        <View style={{ marginBottom: 32, marginTop: -16 }}>
          <MetricCard label="Saldo atual" value={balance} type="balance" delay={200} />
        </View>

        {/* Tabs de seção */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: theme.colors.formsBackground,
            borderRadius: 12,
            padding: 4,
            marginBottom: 28,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          {SECTIONS.map((section) => (
            <Pressable
              key={section}
              onPress={() => switchSection(section)}
              style={{
                flex: 1,
                paddingVertical: 8,
                alignItems: "center",
                borderRadius: 10,
                backgroundColor:
                  activeSection === section
                    ? theme.colors.background
                    : "transparent",
                shadowColor: activeSection === section ? "#000" : "transparent",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06,
                shadowRadius: 4,
                elevation: activeSection === section ? 2 : 0,
              }}
            >
              <Text
                size="sm"
                bold={activeSection === section}
                style={{
                  color:
                    activeSection === section
                      ? theme.colors.primary
                      : theme.colors.secondaryText,
                }}
              >
                {section}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Conteúdo animado das seções */}
        <Animated.View style={{ opacity: sectionOpacity }}>

          {/* ── SEÇÃO: Resumo ── */}
          {activeSection === "Resumo" && (
            <VStack style={{ gap: 24 }}>
              <View
                style={{
                  backgroundColor: theme.colors.foreground,
                  borderRadius: 16,
                  padding: 20,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
              >
                <Text bold style={{ color: theme.colors.primaryText, marginBottom: 16 }}>
                  Receitas vs Despesas
                </Text>
                <BarChart
                  data={barData}
                  width={CHART_WIDTH - 40}
                  height={180}
                  barWidth={14}
                  noOfSections={4}
                  barBorderRadius={4}
                  yAxisTextStyle={{ color: theme.colors.secondaryText, fontSize: 10 }}
                  xAxisLabelTextStyle={{ color: theme.colors.secondaryText, fontSize: 10 }}
                  rulesColor={theme.colors.border}
                  yAxisColor="transparent"
                  xAxisColor={theme.colors.border}
                  hideOrigin
                  isAnimated
                />
                <HStack style={{ gap: 16, marginTop: 12, justifyContent: "center" }}>
                  <HStack style={{ alignItems: "center", gap: 6 }}>
                    <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: theme.colors.success }} />
                    <Text size="xs" style={{ color: theme.colors.secondaryText }}>Receitas</Text>
                  </HStack>
                  <HStack style={{ alignItems: "center", gap: 6 }}>
                    <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: theme.colors.error }} />
                    <Text size="xs" style={{ color: theme.colors.secondaryText }}>Despesas</Text>
                  </HStack>
                </HStack>
              </View>
            </VStack>
          )}

          {/* ── SEÇÃO: Mensal ── */}
          {activeSection === "Mensal" && (
            <VStack style={{ gap: 24 }}>
              <View
                style={{
                  backgroundColor: theme.colors.foreground,
                  borderRadius: 16,
                  padding: 20,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
              >
                <Text bold style={{ color: theme.colors.primaryText, marginBottom: 4 }}>
                  Evolução do saldo
                </Text>
                <Text size="xs" style={{ color: theme.colors.secondaryText, marginBottom: 16 }}>
                  Últimos 6 meses
                </Text>
                <LineChart
                  data={lineData}
                  width={CHART_WIDTH - 40}
                  height={180}
                  color={theme.colors.primary}
                  thickness={2.5}
                  dataPointsColor={theme.colors.primary}
                  dataPointsRadius={5}
                  startFillColor={`${theme.colors.primary}30`}
                  endFillColor={`${theme.colors.primary}00`}
                  areaChart
                  curved
                  noOfSections={4}
                  yAxisTextStyle={{ color: theme.colors.secondaryText, fontSize: 10 }}
                  xAxisLabelTextStyle={{ color: theme.colors.secondaryText, fontSize: 10 }}
                  rulesColor={theme.colors.border}
                  yAxisColor="transparent"
                  xAxisColor={theme.colors.border}
                  hideOrigin
                  isAnimated
                />
              </View>

              {/* Tabela mensal */}
              <View
                style={{
                  backgroundColor: theme.colors.foreground,
                  borderRadius: 16,
                  padding: 20,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  gap: 12,
                }}
              >
                <Text bold style={{ color: theme.colors.primaryText, marginBottom: 4 }}>
                  Detalhes mensais
                </Text>
                {monthlySummary.map((m, i) => (
                  <View key={i}>
                    <HStack style={{ justifyContent: "space-between", alignItems: "center", paddingVertical: 8 }}>
                      <Text size="sm" bold style={{ color: theme.colors.primaryText, width: 32 }}>
                        {m.month}
                      </Text>
                      <Text size="sm" style={{ color: theme.colors.success, flex: 1, textAlign: "center" }}>
                        +{formatCurrency(m.income)}
                      </Text>
                      <Text size="sm" style={{ color: theme.colors.error, flex: 1, textAlign: "center" }}>
                        -{formatCurrency(m.expense)}
                      </Text>
                      <Text
                        size="sm"
                        bold
                        style={{
                          color: m.balance >= 0 ? theme.colors.success : theme.colors.error,
                          flex: 1,
                          textAlign: "right",
                        }}
                      >
                        {formatCurrency(m.balance)}
                      </Text>
                    </HStack>
                    {i < monthlySummary.length - 1 && (
                      <View style={{ height: 1, backgroundColor: theme.colors.border }} />
                    )}
                  </View>
                ))}
              </View>
            </VStack>
          )}

          {/* ── SEÇÃO: Categorias ── */}
          {activeSection === "Categorias" && (
            <VStack style={{ gap: 24 }}>
              {pieData.length > 0 && (
                <View
                  style={{
                    backgroundColor: theme.colors.foreground,
                    borderRadius: 16,
                    padding: 20,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    alignItems: "center",
                  }}
                >
                  <Text bold style={{ color: theme.colors.primaryText, marginBottom: 20, alignSelf: "flex-start" }}>
                    Distribuição de gastos
                  </Text>
                  <PieChart
                    data={pieData}
                    donut
                    radius={90}
                    innerRadius={58}
                    centerLabelComponent={() => (
                      <VStack style={{ alignItems: "center", gap: 2 }}>
                        <Text size="xs" style={{ color: theme.colors.secondaryText }}>Total</Text>
                        <Text bold style={{ fontSize: 13, color: theme.colors.primaryText }}>
                          {formatCurrency(totalExpense)}
                        </Text>
                      </VStack>
                    )}
                    isAnimated
                  />
                </View>
              )}

              <View
                style={{
                  backgroundColor: theme.colors.foreground,
                  borderRadius: 16,
                  padding: 20,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  gap: 16,
                }}
              >
                <Text bold style={{ color: theme.colors.primaryText }}>
                  Gastos por categoria
                </Text>
                {categoryExpenses.length === 0 ? (
                  <Text size="sm" style={{ color: theme.colors.secondaryText, textAlign: "center", paddingVertical: 16 }}>
                    Nenhum gasto registrado
                  </Text>
                ) : (
                  categoryExpenses.map((c, i) => (
                    <CategoryItem
                      key={c.category}
                      label={c.category}
                      amount={c.amount}
                      percentage={c.percentage}
                      color={c.color}
                      index={i}
                    />
                  ))
                )}
              </View>
            </VStack>
          )}

        </Animated.View>
      </View>
      <Pressable onPress={handleSeed} style={{ padding: 10, backgroundColor: 'blue' }}>
        <Text style={{ color: 'white' }}>GERAR DADOS DE TESTE</Text>
      </Pressable>
    </ScrollView>
  );
}
