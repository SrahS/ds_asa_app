# Para começar:

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

# Arquitetura do Projeto

# src/

# ├── app/ # Expo Router (Navegação baseada em arquivos)

# ├── components/ # UI Kit (Botões, Inputs seguindo o estilo shadcn)

# ├── contexts/ # AuthContext e TransactionContext

# ├── hooks/ # Custom hooks para Firebase/Firestore

# ├── services/ # Configuração do Firebase

# ├── utils/ # Formatadores de moeda e data

# └── types/ # Interfaces TypeScript

# 🏦 DS_ASA_APP - Gerenciador Financeiro Pessoal

Projeto desenvolvido como desafio prático para o curso de Pós-Graduação, focado em **Mobile Development** com **React Native** e **Cloud Integration**. A aplicação permite o controle total de transações financeiras com autenticação segura e armazenamento em nuvem.

## 🚀 Tecnologias Utilizadas

- **Framework:** [Expo](https://expo.dev/) (React Native)
- **Linguagem:** TypeScript
- **UI System:** Shadcn/ui (via Gluestack UI v2 + NativeWind)
- **Estilização:** Tailwind CSS (NativeWind v4)
- **Banco de Dados & Auth:** Firebase (Firestore & Auth)
- **Storage:** Firebase Storage (para recibos)
- **Validação:** Zod + React Hook Form
- **Navegação:** Expo Router (File-based routing)

## ✨ Funcionalidades

- [x] **Autenticação:** Login e Cadastro via Firebase Auth.
- [x] **Dashboard:** Visão geral com gráficos financeiros e análise de saldo.
- [x] **Transações:** Listagem com **Scroll Infinito** e paginação via Firestore.
- [x] **Gestão de Dados:** Adição, edição e exclusão de transações.
- [x] **Anexos:** Upload de fotos de recibos diretamente da câmera ou galeria.
- [x] **Filtros Avançados:** Busca por categoria, data e tipo (Entrada/Saída).

## 📂 Estrutura de Pastas

```text
src/
├── app/             # Rotas e Navegação (Expo Router)
├── components/      # UI Kit (Botões, Cards, Inputs estilo Shadcn)
├── contexts/        # Gerenciamento de Estado Global (Auth/Transactions)
├── hooks/           # Lógica de negócio e chamadas ao Firebase
├── schemas/         # Validações de formulários com Zod
├── services/        # Configurações do Firebase e APIs
├── types/           # Definições de interfaces TypeScript
└── utils/           # Formatadores de moeda e data
```
