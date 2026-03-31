import React from "react";
import { View, Pressable, ScrollView } from "react-native";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import theme from "@/utils/theme";
import {
  LogOut,
  UserCircle,
  Mail,
  Calendar,
} from "lucide-react-native";

function InfoRow({ icon: Icon, label, value, isLast = false }: any) {
  return (
    <VStack style={{ gap: 12 }}>
      <HStack style={{ justifyContent: "space-between", alignItems: "center", paddingVertical: 4 }}>
        <HStack style={{ alignItems: "center", gap: 12 }}>
          <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: `${theme.colors.primary}10`, justifyContent: 'center', alignItems: 'center' }}>
            <Icon size={16} color={theme.colors.primary} />
          </View>
          <VStack>
            <Text size="xs" style={{ color: theme.colors.secondaryText }}>{label}</Text>
            <Text bold size="sm" style={{ color: theme.colors.primaryText }}>{value}</Text>
          </VStack>
        </HStack>
      </HStack>
      {!isLast && <View style={{ height: 1, backgroundColor: theme.colors.border, marginLeft: 44 }} />}
    </VStack>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  const creationDate = user?.metadata.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString('pt-BR')
    : '--/--/----';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 64, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Text bold style={{ fontSize: 28, color: theme.colors.primaryText, marginBottom: 32, letterSpacing: -1 }}>
        Perfil
      </Text>

      <View style={{
        backgroundColor: theme.colors.foreground,
        borderRadius: 28, padding: 24, alignItems: "center", gap: 16, marginBottom: 32,
        borderWidth: 1, borderColor: theme.colors.border,
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 10, elevation: 2
      }}>
        <View style={{
          width: 90, height: 90, borderRadius: 45,
          backgroundColor: `${theme.colors.primary}10`,
          justifyContent: "center", alignItems: "center",
          borderWidth: 2, borderColor: `${theme.colors.primary}20`
        }}>
          <UserCircle size={56} color={theme.colors.primary} strokeWidth={1.5} />
        </View>
        <VStack style={{ alignItems: "center", gap: 4 }}>
          <Text bold style={{ fontSize: 22, color: theme.colors.primaryText, letterSpacing: -0.5 }}>
            {user?.displayName}
          </Text>
          <View style={{ backgroundColor: `${theme.colors.primary}10`, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 99 }}>
            <Text size="xs" bold style={{ color: theme.colors.primary }}>Usuário PRO</Text>
          </View>
        </VStack>
      </View>

      <Text bold size="xs" style={{ color: theme.colors.secondaryText, marginBottom: 12, marginLeft: 4, letterSpacing: 1 }}>
        CONTA
      </Text>
      <View style={{ backgroundColor: theme.colors.foreground, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: theme.colors.border, marginBottom: 32 }}>
        <InfoRow icon={Mail} label="E-mail" value={user?.email} />
        <InfoRow icon={Calendar} label="Membro desde" value={creationDate} isLast />
      </View>

      <Pressable
        onPress={handleLogout}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          padding: 18,
          borderRadius: 20,
          backgroundColor: pressed ? `${theme.colors.error}15` : `${theme.colors.error}05`,
          borderWidth: 1,
          borderColor: `${theme.colors.error}20`,
          marginTop: 8
        })}
      >
        <LogOut size={18} color={theme.colors.error} />
        <Text bold style={{ color: theme.colors.error, fontSize: 15 }}>Sair da conta</Text>
      </Pressable>

      <Text size="xs" style={{ textAlign: 'center', color: theme.colors.secondaryText, marginTop: 40, opacity: 0.5 }}>
        v1.0.4 • DSA Finanças
      </Text>
    </ScrollView>
  );
}