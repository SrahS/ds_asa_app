DS ASA APP — Gestão Financeira Inteligente
Projeto desenvolvido como desafio prático para a Pós-Graduação em Front-end Engineering Mobile Development com React Native e Cloud Integration. A aplicação oferece um controle de gastos refinado, utilizando o que há de mais moderno no ecossistema Expo e Firebase.

# Funcionalidades Principais
- Autenticação Segura: Fluxo completo de Login e Cadastro via Firebase Auth, com persistência de estado e proteção de rotas.

- Dashboard Estratégico: Visão geral de saldo, receitas e despesas com análise de dados em tempo real.

- Gestão de Transações: CRUD completo (Criar, Ler, Atualizar e Excluir) com tipagem forte para categorias e tipos.

- Extrato Organizado: Listagem de atividades agrupada por data, com Scroll Infinito e paginação otimizada via Firestore.

- Comprovantes na Nuvem: Sistema de anexos para fotos de recibos (Câmera/Galeria) utilizando Firebase Storage.

- Filtros Dinâmicos: Busca textual e filtros rápidos por Categoria, Tipo e Período.

# Tecnologias e Stack Técnica

- Framework: Expo (SDK 50+) com Expo Router (File-based routing).

- Linguagem: TypeScript (Tipagem estrita para segurança de dados).

- UI & Design: Baseado no estilo Shadcn/ui, utilizando Gluestack UI v2 + NativeWind v4.

- Estilização: Tailwind CSS para um layout responsivo e moderno.

- Backend as a Service: Firebase (Firestore Database & Auth).

- Cloud Storage: Google Cloud Storage (com configuração de CORS para uploads mobile).

- Formulários: React Hook Form + Zod para validações robustas.

# Arquitetura

src/
├── app/             # Rotas e Navegação (Tab Bar, Auth, Modais)
├── components/      # UI Kit (Botões, Cards, Inputs, Listas estilo Shadcn)
├── contexts/        # Gerenciamento de Estado (AuthContext e UI State)
├── hooks/           # Lógica de negócio (useTransactions, useUploadReceipt)
├── schemas/         # Esquemas de validação (Zod)
├── services/        # Configuração do Firebase e chamadas de API
├── types/           # Interfaces e Enums (Transaction, User)
└── utils/           # Formatadores (BRL, Datas) e Helpers de tema


# Como Iniciar o Projeto
1. Pré-requisitos
  Certifique-se de ter o Node.js e o Expo Go instalados.

2. Instalação
  Clone o repositório e instale as dependências
  npm install

3. Configuração do Firebase
  Em src/services/firebaseConfig.ts - adicione suas credenciais:

TypeScript
const firebaseConfig = {
  apiKey: "",
  projectId: "dsa-app-21d17",
  storageBucket: "", 
};

4. Execução
  Inicie o servidor do Expo
  npx expo start
  Dica: Pressione s para abrir no simulador ou escaneie o QR Code com o app Expo Go.

# Configuração de Segurança (CORS)
  Para que o upload de recibos funcione corretamente no ambiente mobile, o bucket do Google Cloud deve estar configurado:

 ex: gsutil cors set cors.json gs://dsa-app-receipts-sarah
  
<p align="center">
Desenvolvido por <strong>Sarah Silva</strong> 🚀
</p>
