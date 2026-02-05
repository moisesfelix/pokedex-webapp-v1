# 📱 Pokédex IA Pro (UI de Game Boy)

Este é o cliente web da **Pokédex IA Pro**, construído com **React** e **TypeScript**. A interface simula a experiência de uso de um **Game Boy Color**, completa com controles virtuais, navegação por teclado e uma tela "LCD" responsiva.

🔗 **Demo Online:** [https://pokedex-gameboy-color.web.app/](https://pokedex-gameboy-color.web.app/)

## ✨ Funcionalidades

*   **🎨 UI/UX Retrô:** Design inspirado no Game Boy Color usando **Tailwind CSS**.
*   **🎹 Navegação Híbrida:** Suporte completo para Mouse (cliques na tela/botões) e Teclado (Setas, Enter, Esc).
*   **🗣️ Text-to-Speech Nativo:** Utiliza a Web Speech API (`window.speechSynthesis`) para narrar as descrições dos Pokémon.
*   **🧠 Integração com IA:** Consome descrições estratégicas ("Notas do Professor") geradas pelo Google Gemini.
*   **⚡ Gestão de Estado Centralizada:** Utiliza **Redux Toolkit** para um gerenciamento de estado global eficiente e previsível.
*   **🧪 Testes:** Configurado com **Vitest** e **React Testing Library** para testes unitários e de componentes.

## 🛠️ Tecnologias

*   **React 19**
*   **TypeScript**
*   **Redux Toolkit** e **React-Redux**
*   **Tailwind CSS**
*   **Vite** como ferramenta de build
*   **Vitest** & **React Testing Library** para testes
*   **Marked** para renderização de Markdown

## 📂 Estrutura do Projeto

O código-fonte está organizado dentro do diretório `src` com uma arquitetura baseada em features:

```
src/
├── components/      # Componentes reutilizáveis (ex: PokemonCard)
├── features/        # Funcionalidades principais da aplicação (ex: Pokedex)
│   └── Pokedex/
│       ├── components/  # Componentes específicos da feature
│       ├── hooks/       # Hooks específicos da feature
│       └── Pokedex.tsx  # Componente principal da feature
├── services/        # Módulos para interagir com o API Gateway do projeto
├── state/           # Configuração do Redux (store, slices)
└── types.ts         # Tipos e interfaces globais
```

## 🚀 Como Rodar Localmente

### 1. Pré-requisitos

*   **Node.js** (versão 18 ou superior)

### 2. Instalação

Na raiz do projeto, instale as dependências:

```bash
npm install
```

### 3. Executando o Projeto

Execute o seguinte comando para iniciar o servidor de desenvolvimento:

```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:5173` (ou a próxima porta disponível).

## 🧪 Testes

Para rodar os testes unitários e de componentes, execute:

```bash
npm test
```

## 🕹️ Mapeamento de Controles

A interface responde tanto aos cliques nos botões virtuais quanto às teclas físicas:

| Ação                | Tecla (PC)     | Botão (Game Boy)  |
| ------------------- | -------------- | ----------------- |
| **Navegar Cima**    | `Seta Cima`    | D-Pad Up          |
| **Navegar Baixo**   | `Seta Baixo`   | D-Pad Down        |
| **Navegar Esq/Dir** | `Seta Esq/Dir` | D-Pad Left/Right  |
| **Confirmar / Ação**| `Enter` ou `Z` | Botão A           |
| **Voltar / Cancelar**| `Esc` ou `X`   | Botão B           |
| **Buscar**          | `S`            | Start             |
| **Filtros**         | `F`            | Select            |

## 📦 Deploy (Firebase Hosting)

O projeto está configurado para deploy no Firebase.

1.  Instale a CLI do Firebase: `npm install -g firebase-tools`
2.  Faça login: `firebase login`
3.  Build e Deploy:

```bash
npm run build
firebase deploy
```

---

**Desenvolvido com 💙 e nostalgia.**