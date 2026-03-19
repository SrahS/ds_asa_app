import React, { useEffect, useRef } from "react";
import { Animated, Pressable, View } from "react-native";
import { Tabs } from "expo-router";
import {
  LayoutDashboard,
  ArrowLeftRight,
  UserCircle,
} from "lucide-react-native";
import theme from "@/utils/theme";

const TABS = [
  { name: "index", icon: LayoutDashboard, label: "Dashboard" },
  { name: "transactions", icon: ArrowLeftRight, label: "Transações" },
  { name: "profile", icon: UserCircle, label: "Perfil" },
] as const;

function TabIcon({ Icon, focused }: { Icon: React.ElementType; focused: boolean }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(focused ? 1 : 0.45)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: focused ? 1.15 : 1,
        useNativeDriver: true,
        tension: 200,
        friction: 10,
      }),
      Animated.timing(opacityAnim, {
        toValue: focused ? 1 : 0.45,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused]);

  return (
    <Animated.View
      style={{
        alignItems: "center",
        justifyContent: "center",
        transform: [{ scale: scaleAnim }],
        opacity: opacityAnim,
      }}
    >
      {focused && (
        <View style={{
          position: "absolute",
          top: -10,
          width: 4,
          height: 4,
          borderRadius: 2,
          backgroundColor: theme.colors.primary,
        }} />
      )}
      <Icon
        size={22}
        color={focused ? theme.colors.primary : theme.colors.secondaryText}
        strokeWidth={focused ? 2.2 : 1.8}
      />
    </Animated.View>
  );
}

function CustomTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={{
      flexDirection: "row",
      backgroundColor: theme.colors.background,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingHorizontal: 16,
      paddingBottom: 28,
      paddingTop: 12,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.04,
      shadowRadius: 12,
      elevation: 8,
    }}>
      {state.routes.map((route: any, index: number) => {
        const focused = state.index === index;

        // --- PROTEÇÃO AQUI: Busca o ícone pelo nome da rota ---
        const tab = TABS.find(t => t.name === route.name);

        // Se a rota não estiver no nosso array TABS (ex: uma tela de 'detalhes'), não renderiza no menu
        if (!tab) return null;

        return (
          <Pressable
            key={route.key}
            onPress={() => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }}
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
            accessibilityRole="button"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: focused }}
          >
            <TabIcon Icon={tab.icon} focused={focused} />
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="transactions" options={{ title: "Transações" }} />
      <Tabs.Screen name="profile" options={{ title: "Perfil" }} />
    </Tabs>
  );
}