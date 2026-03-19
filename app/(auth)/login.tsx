import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { useAuth } from "@/contexts/AuthContext";
import theme from "@/utils/theme";
import { Eye, EyeOff, Lock, Mail } from "lucide-react-native";
import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { router } from "expo-router";

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useAuth();
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Preencha todos os campos.");
      return;
    }
    try {
      setError("");
      setLoading(true);
      await signIn(email, password);
      // Não precisa de router.replace aqui —
      // o onAuthStateChanged dispara → _layout.tsx detecta user → redireciona
    } catch (e: any) {
      const messages: Record<string, string> = {
        "auth/invalid-credential": "E-mail ou senha incorretos.",
        "auth/user-not-found": "Usuário não encontrado.",
        "auth/wrong-password": "Senha incorreta.",
        "auth/too-many-requests": "Muitas tentativas. Tente mais tarde.",
        "auth/network-request-failed": "Sem conexão com a internet.",
      };
      setError(messages[e.code] ?? "Erro ao entrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const inputContainerStyle = {
    borderRadius: 12,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.formsBackground,
    height: 54,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    overflow: "hidden" as const,
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        style={{ backgroundColor: theme.colors.background }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            flex: 1,
            paddingHorizontal: 28,
            paddingTop: 96,
            paddingBottom: 48,
            maxWidth: 480,
            width: "100%",
            alignSelf: "center",
          }}
        >
          {/* Logo */}
          <View style={{ alignItems: "center", marginBottom: 56 }}>
            <Image
              source={require("@/assets/images/logo.png")}
              style={{ width: 160, height: 56 }}
              resizeMode="contain"
            />
          </View>

          {/* Título */}
          <VStack space="sm" style={{ marginBottom: 40 }}>
            <Text
              bold
              style={{
                fontSize: 30,
                color: theme.colors.primaryText,
                letterSpacing: -0.5,
              }}
            >
              Bem vindo de volta
            </Text>
            <Text
              style={{
                fontSize: 15,
                color: theme.colors.secondaryText,
                lineHeight: 23,
              }}
            >
              Entre com sua conta para continuar
            </Text>
          </VStack>

          {/* Campos */}
          <VStack style={{ gap: 20, marginBottom: 8 }}>

            {/* E-mail */}
            <VStack style={{ gap: 8 }}>
              <Text size="sm" bold style={{ color: theme.colors.primaryText }}>
                E-mail
              </Text>
              <Input variant="outline" size="lg" style={inputContainerStyle}>
                <InputSlot style={{ paddingLeft: 16, height: "100%", justifyContent: "center" }}>
                  <InputIcon
                    as={Mail}
                    style={{ color: theme.colors.secondaryText }}
                    size={18}
                  />
                </InputSlot>
                <InputField
                  placeholder="seu@email.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={{
                    flex: 1,
                    height: "100%",
                    fontSize: 15,
                    color: theme.colors.primaryText,
                    paddingHorizontal: 8,
                  }}
                  placeholderTextColor={theme.colors.secondaryText}
                />
              </Input>
            </VStack>

            {/* Senha */}
            <VStack style={{ gap: 8 }}>
              <Text size="sm" bold style={{ color: theme.colors.primaryText }}>
                Senha
              </Text>
              <Input variant="outline" size="lg" style={inputContainerStyle}>
                <InputSlot style={{ paddingLeft: 16, height: "100%", justifyContent: "center" }}>
                  <InputIcon
                    as={Lock}
                    style={{ color: theme.colors.secondaryText }}
                    size={18}
                  />
                </InputSlot>
                <InputField
                  placeholder="Sua senha"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  style={{
                    flex: 1,
                    height: "100%",
                    fontSize: 15,
                    color: theme.colors.primaryText,
                    paddingHorizontal: 8,
                  }}
                  placeholderTextColor={theme.colors.secondaryText}
                />
                <InputSlot
                  style={{ paddingRight: 16, height: "100%", justifyContent: "center" }}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <InputIcon
                    as={showPassword ? EyeOff : Eye}
                    style={{ color: theme.colors.secondaryText }}
                    size={18}
                  />
                </InputSlot>
              </Input>
            </VStack>
          </VStack>

          {/* Botão principal */}
          <Button
            onPress={handleLogin}
            disabled={loading}
            style={{
              backgroundColor: theme.colors.primary,
              borderRadius: 14,
              height: 56,
              marginTop: 32,
              justifyContent: "center",
              alignItems: "center",
              opacity: loading ? 0.8 : 1,
            }}
          >
            {loading ? (
              <ButtonSpinner color="white" />
            ) : (
              <ButtonText
                bold
                style={{ color: "#FFFFFF", fontSize: 16, letterSpacing: 0.4, textAlign: "center" }}
              >
                Entrar
              </ButtonText>
            )}
          </Button>

          {error !== "" && (
            <View
              style={{
                marginTop: 12,
                backgroundColor: `${theme.colors.error}12`,
                borderRadius: 10,
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderWidth: 1,
                borderColor: `${theme.colors.error}30`,
              }}
            >
              <Text size="sm" style={{ color: theme.colors.error, textAlign: "center" }}>
                {error}
              </Text>
            </View>
          )}

          {/* Esqueceu a senha */}
          <View style={{ alignItems: "center", marginTop: 20 }}>
            <Pressable hitSlop={8}>
              <Text
                size="sm"
                style={{ color: theme.colors.primary }}
                onPress={() => router.push("/(auth)/forgot-password")}
              >
                Esqueceu a senha?
              </Text>
            </Pressable>
          </View>

          {/* Divisor */}
          <HStack
            style={{
              alignItems: "center",
              marginTop: 32,
              marginBottom: 32,
              gap: 12,
            }}
          >
            <View style={{ flex: 1, height: 1, backgroundColor: theme.colors.border }} />
            <Text size="sm" style={{ color: theme.colors.secondaryText }}>
              ou
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: theme.colors.border }} />
          </HStack>

          {/* Rodapé */}
          <View style={{ flex: 1, justifyContent: "flex-end", alignItems: "center" }}>
            <HStack style={{ alignItems: "center", gap: 4 }}>
              <Text size="sm" style={{ color: theme.colors.secondaryText }}>
                Não possui uma conta?
              </Text>
              <Pressable hitSlop={8}>
                <Text
                  size="sm"
                  bold
                  style={{ color: theme.colors.primary }}
                  onPress={() => router.push("/(auth)/register")}>
                  Cadastre-se
                </Text>
              </Pressable>
            </HStack>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}