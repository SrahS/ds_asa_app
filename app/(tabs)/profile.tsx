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
  Fingerprint,
  ShieldCheck,
  HelpCircle,
  ChevronRight
} from "lucide-react-native";

// Componente para as linhas de informação
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

// Componente para botões de menu
function MenuButton({ icon: Icon, label, color = theme.colors.primaryText, onPress }: any) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 14,
        opacity: pressed ? 0.6 : 1
      })}
    >
      <HStack style={{ alignItems: "center", gap: 12 }}>
        <Icon size={20} color={color} />
        <Text bold size="sm" style={{ color }}>{label}</Text>
      </HStack>
      <ChevronRight size={18} color={theme.colors.border} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  // Formata a data de criação do Firebase
  const creationDate = user?.metadata.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString('pt-BR')
    : '--/--/----';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 64, paddingBottom: 40 }}
    >
      <Text bold style={{ fontSize: 24, color: theme.colors.primaryText, marginBottom: 32 }}>
        Perfil
      </Text>

      {/* Card de Identificação */}
      <View style={{
        backgroundColor: theme.colors.foreground,
        borderRadius: 24, padding: 24, alignItems: "center", gap: 16, marginBottom: 32,
        borderWidth: 1, borderColor: theme.colors.border
      }}>
        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: `${theme.colors.primary}15`, justifyContent: "center", alignItems: "center" }}>
          <UserCircle size={48} color={theme.colors.primary} />
        </View>
        <VStack style={{ alignItems: "center" }}>
          <Text bold style={{ fontSize: 20, color: theme.colors.primaryText }}>
            {user?.displayName ?? "Sarah Silva"}
          </Text>
          <Text size="sm" style={{ color: theme.colors.secondaryText }}>{user?.email}</Text>
        </VStack>
      </View>

      {/* Seção: Informações da Conta */}
      <Text bold size="sm" style={{ color: theme.colors.secondaryText, marginBottom: 16, marginLeft: 4 }}>
        INFORMAÇÕES DA CONTA
      </Text>
      <View style={{ backgroundColor: theme.colors.foreground, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: theme.colors.border, marginBottom: 32 }}>
        <InfoRow icon={Mail} label="E-mail principal" value={user?.email} />
        <InfoRow icon={Calendar} label="Membro desde" value={creationDate} />
      </View>

      {/* Seção: Segurança e Suporte */}
      <Text bold size="sm" style={{ color: theme.colors.secondaryText, marginBottom: 8, marginLeft: 4 }}>
        AJUSTES
      </Text>
      <View style={{ marginBottom: 32 }}>
        <MenuButton icon={ShieldCheck} label="Privacidade e Segurança" />
        <MenuButton icon={HelpCircle} label="Central de Ajuda" />
      </View>

      {/* Botão Sair - Destacado */}
      <Pressable
        onPress={handleLogout}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          padding: 16,
          borderRadius: 16,
          backgroundColor: pressed ? `${theme.colors.error}15` : `${theme.colors.error}10`,
          borderWidth: 1,
          borderColor: `${theme.colors.error}20`,
          marginTop: 8
        })}
      >
        <LogOut size={18} color={theme.colors.error} />
        <Text bold style={{ color: theme.colors.error }}>Sair da conta</Text>
      </Pressable>

      <Text size="xs" style={{ textAlign: 'center', color: theme.colors.border, marginTop: 32 }}>
        Versão 1.0.4 DSA App
      </Text>
    </ScrollView>
  );
}