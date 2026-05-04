# 🏢 Plataforma Imobiliária - Grupo São Paulo Participações

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Finalizado-blue?style=flat-square)](STATUS.md)

> Plataforma moderna de imóveis comerciais com busca inteligente por IA, desenvolvida como projeto acadêmico no 1º ciclo da faculdade. Construída com React, TypeScript e Tailwind CSS v4.

---

## 📌 Sobre Este Projeto

Este é um **projeto finalizado** desenvolvido durante o **1º ciclo acadêmico** como um trabalho em grupo. O projeto apresenta as melhores práticas de desenvolvimento web moderno, arquitetura de componentes e integração com IA local.

> 💡 **Nota:** Este projeto não está em desenvolvimento ativo. Veja [STATUS.md](STATUS.md) para mais detalhes.

---

- 🤖 **Busca Inteligente com IA** - Interpretação semântica usando Ollama local
- 💬 **Chatbot Assistente** - Suporte em tempo real para navegação e agendamento
- 🔍 **Filtros Avançados** - 8 categorias de filtros inteligentes
- 📊 **Dashboard Admin** - Gestão completa de imóveis
- 📱 **Design Responsivo** - Mobile-first com animações fluidas
- ⚡ **Performance** - Otimizado com Vite e lazy-loading

---

---

## 🚀 Quick Start

### Pré-requisitos
- **Node.js** 18+ e npm/yarn
- **Git**
- *(Opcional)* **Ollama** para IA local

### Instalação Rápida

```bash
# 1. Clone o repositório
git clone https://github.com/silasdurans/PlataformadeImoveis.git
cd PlataformadeImoveis

# 2. Instale dependências
npm install

# 3. Configure o ambiente (opcional)
cp backend/.env.example backend/.env

# 4. Inicie o projeto
npm run dev        # Frontend apenas
npm run dev:full   # Frontend + Backend (requer Node)
```

### Acessar a Aplicação

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3001
- **Admin:** http://localhost:5173/admin/login

---

## 📖 Documentação Completa

### 🛠️ Tecnologias

| Tecnologia | Versão | Propósito |
|------------|--------|----------|
| **React** | 19 | Framework UI |
| **TypeScript** | 5 | Tipagem estática |
| **Tailwind CSS** | 4 | Estilização utilitária |
| **Vite** | 5 | Build tool |
| **React Router** | 6 | Roteamento SPA |
| **Framer Motion** | 11 | Animações |
| **Lucide React** | - | Ícones modernos |

---

## 📁 Estrutura do Projeto

```
PlataformadeImoveis/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── layout/          → Header, Footer
│   │   │   ├── common/          → PropertyCard, InstitutionalBanner
│   │   │   ├── ui/              → Componentes base (Button, Input, etc)
│   │   │   └── figma/           → Componentes do Figma
│   │   ├── pages/               → Home, Results, PropertyDetail, AdminDashboard
│   │   ├── data/                → Mock de propriedades
│   │   ├── lib/                 → Utilitários (aiSearch, clientSession, etc)
│   │   └── routes.tsx           → Configuração de rotas
│   ├── styles/                  → CSS global e tema
│   ├── assets/                  → Imagens e recursos
│   └── main.tsx                 → Entrada da aplicação
├── backend/
│   ├── server.js                → API Express
│   ├── properties.db            → Banco SQLite (local)
│   └── .env.example             → Variáveis de ambiente
├── index.html                   → HTML base
├── vite.config.ts               → Configuração Vite
├── tsconfig.json                → Configuração TypeScript
├── tailwind.config.js           → Configuração Tailwind
└── package.json                 → Dependências
```

---

## 🤖 Busca com IA (Ollama)

### Setup Completo da IA

```bash
# 1. Instale o Ollama
curl -fsSL https://ollama.com/install.sh | sh

# 2. Baixe um modelo leve
ollama pull qwen2.5:3b

# 3. Configure o backend
cp backend/.env.example backend/.env

# 4. Inicie tudo
npm run dev:full
```

### Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Frontend + Vite (sem backend) |
| `npm run dev:full` | Frontend + Backend com IA automática |
| `npm run dev:ai` | Apenas Backend com IA |
| `npm run dev:ai:strict` | Backend IA obrigatória (falha sem Ollama) |
| `npm run build` | Build otimizado para produção |
| `npm run preview` | Preview do build |

### Configuração de Ambiente

```env
# backend/.env
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen2.5:3b
ADMIN_EMAIL=admin@saopauloparticipacoes.com.br
ADMIN_PASSWORD=sua_senha_segura_aqui
PORT=3001
HOST=0.0.0.0
```

> **Nota:** Se o Ollama não estiver disponível, a busca usa fallback local automático.

---

## 🔐 Painel Administrativo

**URL:** http://localhost:5173/admin/login

**Credenciais de Demonstração:**
```
Email: admin@saopauloparticipacoes.com.br
Senha: (configure em backend/.env)
```

**Funcionalidades:**
- ✅ Gerenciar imóveis
- ✅ Visualizar agenda de visitas
- ✅ Ver histórico de consultas
- ✅ Gerenciar usuários

---

## 📁 Estrutura de Arquivos Organizada

### 🎨 **CSS** (`/src/styles/`)
```
/src/styles/
├── fonts.css       → Importação de fontes
├── index.css       → Estilos base
├── tailwind.css    → Configuração Tailwind v4
└── theme.css       → Tema customizado
```

### ⚛️ **TypeScript/React** (`/src/app/`)

#### 📦 **Componentes** (`/src/app/components/`)
```
/src/app/components/
├── layout/              → Layout principal
├── common/              → Componentes reutilizáveis
├── ui/                  → Componentes base UI
├── figma/               → Componentes do Figma
└── AIAgent.tsx          → Chatbot flutuante
```

#### 📄 **Páginas** (`/src/app/pages/`)
```
/src/app/pages/
├── Home.tsx             → Página inicial
├── Results.tsx          → Listagem de imóveis
├── PropertyDetail.tsx   → Detalhes do imóvel
├── AdminLogin.tsx       → Login administrativo
└── AdminDashboard.tsx   → Dashboard admin
```

---

## 🔄 Como Importar Arquivos

### ✅ Imports Recomendados

```typescript
// Layout Components
import { Header, Footer } from "@/app/components/layout";

// Common Components
import { PropertyCard, InstitutionalBanner } from "@/app/components/common";

// Pages
import Home from "@/app/pages/Home";

// Data
import { properties } from "@/app/data/properties";
```

---

## 📝 Convenções

### Nomenclatura de Arquivos
- **PascalCase** para componentes React: `Header.tsx`
- **camelCase** para utilidades: `formatDate.ts`
- **kebab-case** para CSS: `theme.css`

### Estrutura de Pastas
- Pastas em **singular**: `component/`, `page/`
- Pastas em **kebab-case**: `layout/`, `common/`

---

## 🎯 Funcionalidades Principais

### 🏠 Usuário Final
- ✅ Busca semântica com IA
- ✅ Filtros avançados
- ✅ Detalhes completos de imóveis
- ✅ Agendamento de visitas
- ✅ Chatbot de suporte

### 🔧 Administrador
- ✅ Dashboard completo
- ✅ Gerenciar propriedades
- ✅ Visualizar agendamentos
- ✅ Análise de consultas

---

## 🌐 Deployment

### Deploy no Render

O projeto já está configurado para deploy:

```bash
# Build automático
npm run build

# Arquivo: render.yaml
# (Já configurado no repositório)
```

**Variáveis de Ambiente (Production):**
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `OLLAMA_BASE_URL` (se usar IA externa)
- `OLLAMA_MODEL`

---

## 📊 Arquitetura da IA

```
┌─────────────────────────────────────┐
│       Frontend (React)              │
│  - Home: Busca com IA               │
│  - Results: Listagem filtrada       │
│  - ChatBot: Suporte local           │
└────────────┬────────────────────────┘
             │
             └──────────────────┐
                                │
                    ┌───────────▼──────────┐
                    │   Backend (Express)  │
                    │  - API REST          │
                    │  - SQLite DB         │
                    │  - Ollama Client     │
                    └───────────┬──────────┘
                                │
                    ┌───────────▼──────────┐
                    │  Ollama (IA Local)   │
                    │  - qwen2.5:3b        │
                    │  - Busca Semântica   │
                    └──────────────────────┘
```

---

## 🛡️ Segurança

- ✅ Credenciais em variáveis de ambiente
- ✅ `.env` não versionado
- ✅ Backend protegido com autenticação
- ✅ XSS protection ativado
- ✅ CORS configurado

---

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👥 Autores

**Desenvolvido por:** Grupo São Paulo Participações

**Colaboradores:**
- Leonardo Fernandes ([@lfernandozzz](https://github.com/lfernandozzz))
- Silas Durans ([@silasdurans](https://github.com/silasdurans))

---

## 📧 Contato

**Grupo São Paulo Participações**
- 📍 Av. São Luís, 100 - São Paulo, SP
- 📞 +55 (11) 3000-0000
- ✉️ contato@spparticipacoes.com.br
- 🌐 https://saopauloparticipacoes.com.br

---

## 📌 Links Rápidos

| Link | Descrição |
|------|-----------|
| [Home](http://localhost:5173) | Página inicial |
| [Resultados](http://localhost:5173/resultados) | Busca de imóveis |
| [Admin](http://localhost:5173/admin/login) | Painel administrativo |
| [Issues](https://github.com/silasdurans/PlataformadeImoveis/issues) | Reportar bugs |

---

**⭐ Se este projeto foi útil para você, considere deixar uma star no GitHub!**

---

**© 2026 São Paulo Participações. Todos os direitos reservados.**
