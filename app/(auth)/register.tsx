import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { useRouter } from "expo-router";
import theme from "@/utils/theme";
import { Eye, EyeOff, Lock, Mail, User, ArrowLeft } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useAuth } from "@/contexts/AuthContext";
export default function RegisterScreen() {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();
  const { signUp } = useAuth();
  const passwordMatch = confirmPassword === "" || password === confirmPassword;
  const isValid = name && email && password && confirmPassword && passwordMatch;
  const handleRegister = async () => {
    try {
      setLoading(true);
      await signUp(email, password, name);
    } catch (error: any) {
      Alert.alert("Erro", error.message);
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
  const inputErrorStyle = {
    ...inputContainerStyle,
    borderColor: theme.colors.error,
    backgroundColor: `${theme.colors.error}08`,
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
          { }
          <VStack space="sm" style={{ marginBottom: 40 }}>
            <Text
              bold
              style={{
                fontSize: 30,
                color: theme.colors.primaryText,
                letterSpacing: -0.5,
              }}
            >
              Criar conta
            </Text>
            <Text
              style={{
                fontSize: 15,
                color: theme.colors.secondaryText,
                lineHeight: 23,
              }}
            >
              Preencha os campos abaixo para se cadastrar.
            </Text>
          </VStack>
          { }
          <VStack style={{ gap: 20 }}>
            { }
            <VStack style={{ gap: 8 }}>
              <Text size="sm" bold style={{ color: theme.colors.primaryText }}>
                Nome completo
              </Text>
              <Input variant="outline" size="lg" style={inputContainerStyle}>
                <InputSlot style={{ paddingLeft: 16, height: "100%", justifyContent: "center" }}>
                  <InputIcon
                    as={User}
                    style={{ color: theme.colors.secondaryText }}
                    size={18}
                  />
                </InputSlot>
                <InputField
                  placeholder="Seu nome"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
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
            { }
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
            { }
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
                  placeholder="Mínimo 8 caracteres"
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
            { }
            <VStack style={{ gap: 8 }}>
              <Text size="sm" bold style={{ color: theme.colors.primaryText }}>
                Confirmar senha
              </Text>
              <Input
                variant="outline"
                size="lg"
                style={!passwordMatch ? inputErrorStyle : inputContainerStyle}
              >
                <InputSlot style={{ paddingLeft: 16, height: "100%", justifyContent: "center" }}>
                  <InputIcon
                    as={Lock}
                    style={{
                      color: !passwordMatch
                        ? theme.colors.error
                        : theme.colors.secondaryText,
                    }}
                    size={18}
                  />
                </InputSlot>
                <InputField
                  placeholder="Repita sua senha"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirm}
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
                  onPress={() => setShowConfirm(!showConfirm)}
                >
                  <InputIcon
                    as={showConfirm ? EyeOff : Eye}
                    style={{
                      color: !passwordMatch
                        ? theme.colors.error
                        : theme.colors.secondaryText,
                    }}
                    size={18}
                  />
                </InputSlot>
              </Input>
              {!passwordMatch && (
                <Text
                  size="xs"
                  style={{ color: theme.colors.error, marginTop: 2 }}
                >
                  As senhas não coincidem
                </Text>
              )}
            </VStack>
          </VStack>
          { }
          <Button
            onPress={handleRegister}
            disabled={loading || !isValid}
            style={{
              backgroundColor: theme.colors.primary,
              borderRadius: 14,
              height: 56,
              marginTop: 36,
              justifyContent: "center",
              alignItems: "center",
              opacity: loading || !isValid ? 0.6 : 1,
            }}
          >
            {loading ? (
              <ButtonSpinner color="white" />
            ) : (
              <ButtonText
                bold
                style={{ color: "#FFFFFF", fontSize: 16, textAlign: "center" }}
              >
                Criar conta
              </ButtonText>
            )}
          </Button>
          { }
          <View style={{ flex: 1, justifyContent: "flex-end", alignItems: "center", marginTop: 32 }}>
            <HStack style={{ alignItems: "center", gap: 4 }}>
              <Text size="sm" style={{ color: theme.colors.secondaryText }}>
                Já possui uma conta?
              </Text>
              <Pressable hitSlop={8} onPress={() => router.replace("/login")}>
                <Text size="sm" bold style={{ color: theme.colors.primary }}>
                  Entrar
                </Text>
              </Pressable>
            </HStack>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}