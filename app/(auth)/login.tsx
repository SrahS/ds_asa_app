import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
  StyleSheet
} from "react-native";
import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { useAuth } from "@/contexts/AuthContext";
import theme from "@/utils/theme";
import { Eye, EyeOff, Lock, Mail } from "lucide-react-native";
import { router } from "expo-router";
import Svg, { Path, Circle } from 'react-native-svg';

const LogoIcon = () => (
  <Svg width={40} height={40} viewBox="0 0 46 46" fill="none">
    <Path d="M8 35L17 21L24 29L32 16L39 24" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx={17} cy={21} r={2.5} fill="white" />
    <Circle cx={24} cy={29} r={2.5} fill={theme.colors.secondary} />
    <Circle cx={32} cy={16} r={2.5} fill="white" />
  </Svg>
);

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

      router.replace("/(tabs)");

    } catch (e: any) {
      setError("E-mail ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>

          <View style={styles.logoWrapper}>
            <View style={styles.logoBox}>
              <LogoIcon />
            </View>
          </View>

          <VStack style={styles.header}>
            <Text bold style={styles.title}>
              DS<Text style={{ color: theme.colors.primary }}> ASA</Text>
            </Text>
            <Text style={styles.subtitle}>Gerencie suas finanças.</Text>
          </VStack>

          <HStack style={{ gap: 10, marginBottom: 8, width: '100%' }}>

            <VStack style={{ flex: 1, gap: 8 }}>
              <Text size="xs" bold style={styles.label}>E-MAIL</Text>
              <Input variant="outline" size="lg" style={styles.inputContainer}>
                <InputSlot style={{ paddingLeft: 12, justifyContent: 'center', alignItems: 'center' }}>
                  <InputIcon as={Mail} color={theme.colors.secondaryText} size="sm" />
                </InputSlot>
                <InputField
                  placeholder="E-mail"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  style={[styles.field, { paddingLeft: 4 }]}
                  placeholderTextColor={theme.colors.secondaryText}
                />
              </Input>
            </VStack>

            <VStack style={{ flex: 1, gap: 8 }}>
              <Text size="xs" bold style={styles.label}>SENHA</Text>
              <Input variant="outline" size="lg" style={styles.inputContainer}>
                <InputSlot style={{ paddingLeft: 12, justifyContent: 'center', alignItems: 'center' }}>
                  <InputIcon as={Lock} color={theme.colors.secondaryText} size="sm" />
                </InputSlot>
                <InputField
                  placeholder="Senha"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  style={[styles.field, { paddingLeft: 4 }]}
                  placeholderTextColor={theme.colors.secondaryText}
                />
                <InputSlot style={{ paddingRight: 12 }} onPress={() => setShowPassword(!showPassword)}>
                  <InputIcon as={showPassword ? EyeOff : Eye} color={theme.colors.secondaryText} size="sm" />
                </InputSlot>
              </Input>
            </VStack>

          </HStack>

          <Button onPress={handleLogin} disabled={loading} style={styles.loginButton}>
            {loading ? (
              <ButtonSpinner color="white" />
            ) : (
              <ButtonText bold style={styles.buttonText}>Entrar</ButtonText>
            )}
          </Button>

          {error !== "" && <Text size="sm" style={styles.errorText}>{error}</Text>}

          <Pressable style={styles.forgotPass} onPress={() => router.push("/(auth)/forgot-password")}>
            <Text size="sm" bold style={{ color: theme.colors.primary }}>Esqueceu sua senha?</Text>
          </Pressable>

          <View style={styles.footer}>
            <HStack style={{ gap: 4 }}>
              <Text size="sm" style={{ color: theme.colors.secondaryText }}>Novo por aqui?</Text>
              <Pressable onPress={() => router.push("/(auth)/register")}>
                <Text size="sm" bold style={{ color: theme.colors.primary }}>Crie uma conta</Text>
              </Pressable>
            </HStack>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40 },
  logoWrapper: { alignItems: "center", marginBottom: 32 },
  logoBox: {
    width: 64, height: 64, borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: 'center', justifyContent: 'center',
    elevation: 8, shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 10
  },
  header: { marginBottom: 36, alignItems: 'center' },
  title: { fontSize: 32, color: theme.colors.primaryText, fontWeight: '900', letterSpacing: -1 },
  subtitle: { fontSize: 14, color: theme.colors.secondaryText, marginTop: 4, textAlign: 'center' },
  label: { color: theme.colors.secondaryText, marginLeft: 4, letterSpacing: 1 },
  inputContainer: {
    borderRadius: 16, borderColor: theme.colors.border,
    backgroundColor: theme.colors.formsBackground, height: 58,
    flexDirection: 'row', alignItems: 'center',
  },
  field: {
    flex: 1,
    color: theme.colors.primaryText,
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: theme.colors.primary, borderRadius: 16,
    height: 58, marginTop: 32, justifyContent: 'center', alignItems: 'center',
  },
  buttonText: { color: "#FFFFFF", fontSize: 16, textAlign: 'center' },
  errorText: { color: theme.colors.error, textAlign: "center", marginTop: 16, fontWeight: '600' },
  forgotPass: { marginTop: 24, alignItems: 'center' },
  footer: { flex: 1, justifyContent: 'flex-end', marginTop: 40, alignItems: 'center' }
});