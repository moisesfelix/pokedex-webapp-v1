Aqui está o `README.md` específico para a pasta **frontend** do projeto. Ele foca na instalação, configuração e detalhes da interface do cliente.

---

# 📱 Pokédex IA Pro - Frontend (Game Boy UI)

Este é o cliente web da **Pokédex IA Pro**, construído com **React** e **TypeScript**. A interface simula fielmente a experiência de uso de um **Game Boy Color**, completa com controles virtuais, navegação por teclado e uma tela "LCD" responsiva.

🔗 **Demo Online:** [https://pokedex-gameboy-color.web.app/](https://pokedex-gameboy-color.web.app/)

## ✨ Funcionalidades do Frontend

* **🎨 UI/UX Retrô:** Design pixel-perfect inspirado no Game Boy Color usando **Tailwind CSS**.
* **🎹 Navegação Híbrida:** Suporte completo para Mouse (cliques na tela/botões) e Teclado (Setas, Enter, Esc).
* **🗣️ Text-to-Speech Nativo:** Utiliza a Web Speech API (`window.speechSynthesis`) para narrar as descrições dos Pokémon sem custos de API e com latência zero.
* **🧠 Integração com IA:** Consome descrições estratégicas ("Notas do Professor") geradas pelo Google Gemini via Backend.
* **⚡ Performance:** Otimizado para carregar sprites e dados rapidamente, com estados de carregamento animados.

## 🛠️ Tecnologias

* **React 18** (Hooks: `useState`, `useEffect`, `useMemo`, `useRef`)
* **TypeScript** (Tipagem estrita para dados da PokeAPI e componentes)
* **Tailwind CSS** (Estilização avançada para a carcaça do Game Boy e layout)
* **Marked** (Renderização de Markdown para os textos da IA)
* **Fetch API** (Comunicação leve com o Gateway/Backend)

## 🚀 Como Rodar Localmente

### 1. Pré-requisitos

Certifique-se de ter o **Node.js** instalado e que o **Backend** do projeto esteja rodando (padrão: porta 3000) para fornecer os dados da IA.

### 2. Instalação

Navegue até a pasta do frontend e instale as dependências:

```bash
cd frontend
npm install

```

### 3. Configuração de Ambiente (.env)

Crie um arquivo `.env` na raiz da pasta `frontend` para configurar a conexão com o backend:

```env
# URL do seu Backend/Gateway local ou de produção
REACT_APP_GATEWAY_URL=http://localhost:3000
# OU, se estiver usando Next.js/Vite:
# NEXT_PUBLIC_GATEWAY_URL=http://localhost:3000

```

### 4. Executando o Projeto

```bash
npm start

```

O aplicativo estará disponível em [http://localhost:4000](https://www.google.com/search?q=http://localhost:4000) (ou a porta que seu script definir).

## 🕹️ Mapeamento de Controles

A interface responde tanto aos cliques nos botões virtuais quanto às teclas físicas:

| Ação | Tecla (PC) | Botão (Game Boy) |
| --- | --- | --- |
| **Navegar Cima** | `Seta Cima` | D-Pad Up |
| **Navegar Baixo** | `Seta Baixo` | D-Pad Down |
| **Navegar Esq/Dir** | `Seta Esq/Dir` | D-Pad Left/Right |
| **Confirmar / Ouvir** | `Enter` ou `Z` | Botão A |
| **Voltar / Cancelar** | `Esc` ou `X` | Botão B |
| **Buscar** | `S` | Start |
| **Filtros** | `F` | Select |

## 📦 Deploy (Firebase Hosting)

O projeto está configurado para deploy no Firebase.

1. Instale a CLI do Firebase: `npm install -g firebase-tools`
2. Faça login: `firebase login`
3. Inicialize (se ainda não fez): `firebase init`
4. Build e Deploy:

```bash
npm run build
firebase deploy

```

---

**Desenvolvido com 💙 e nostalgia.**