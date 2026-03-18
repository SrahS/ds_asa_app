// app/forgot-password.tsx
import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useRouter } from "expo-router";
import theme from "@/utils/theme";
import { Mail, ArrowLeft } from "lucide-react-native";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";

export default function ForgotPasswordScreen() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const router = useRouter();

  const handleSend = async () => {
    try {
      setLoading(true);
      // await sendPasswordReset(email);
      setSent(true);
    } catch (error) {
      // tratado no contexto
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
            paddingTop: 64,
            paddingBottom: 48,
            maxWidth: 480,
            width: "100%",
            alignSelf: "center",
          }}
        >
          {/* Voltar */}
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            style={{ marginBottom: 40 }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <ArrowLeft size={18} color={theme.colors.primaryText} />
              <Text size="sm" bold style={{ color: theme.colors.primaryText }}>
                Voltar
              </Text>
            </View>
          </Pressable>

          {sent ? (
            /* ── Estado: e-mail enviado ── */
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 16 }}>
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  backgroundColor: `${theme.colors.primary}15`,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Mail size={32} color={theme.colors.primary} />
              </View>
              <Text
                bold
                style={{
                  fontSize: 24,
                  color: theme.colors.primaryText,
                  letterSpacing: -0.5,
                  textAlign: "center",
                }}
              >
                Verifique seu e-mail
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  color: theme.colors.secondaryText,
                  lineHeight: 23,
                  textAlign: "center",
                  maxWidth: 300,
                }}
              >
                Enviamos as instruções de recuperação para{" "}
                <Text bold style={{ color: theme.colors.primaryText }}>
                  {email}
                </Text>
              </Text>
              <Button
                onPress={() => router.replace("/login")}
                style={{
                  backgroundColor: theme.colors.primary,
                  borderRadius: 14,
                  height: 56,
                  marginTop: 16,
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <ButtonText
                  bold
                  style={{ color: "#FFFFFF", fontSize: 16, textAlign: "center" }}
                >
                  Voltar ao login
                </ButtonText>
              </Button>
            </View>
          ) : (
            /* ── Estado: formulário ── */
            <>
              <VStack space="sm" style={{ marginBottom: 40 }}>
                <Text
                  bold
                  style={{
                    fontSize: 30,
                    color: theme.colors.primaryText,
                    letterSpacing: -0.5,
                  }}
                >
                  Esqueceu a senha?
                </Text>
                <Text
                  style={{
                    fontSize: 15,
                    color: theme.colors.secondaryText,
                    lineHeight: 23,
                  }}
                >
                  Informe seu e-mail e enviaremos as instruções de recuperação.
                </Text>
              </VStack>

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

              <Button
                onPress={handleSend}
                disabled={loading || !email}
                style={{
                  backgroundColor: theme.colors.primary,
                  borderRadius: 14,
                  height: 56,
                  marginTop: 32,
                  justifyContent: "center",
                  alignItems: "center",
                  opacity: loading || !email ? 0.6 : 1,
                }}
              >
                {loading ? (
                  <ButtonSpinner color="white" />
                ) : (
                  <ButtonText
                    bold
                    style={{ color: "#FFFFFF", fontSize: 16, textAlign: "center" }}
                  >
                    Enviar instruções
                  </ButtonText>
                )}
              </Button>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}