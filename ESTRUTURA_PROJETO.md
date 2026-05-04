# 📁 Estrutura de Arquivos Organizada

## 🗂️ Visão Geral da Organização

```
/src/
├── 📄 styles/              → CSS (Estilos globais e tema)
│   ├── fonts.css
│   ├── index.css
│   ├── tailwind.css
│   └── theme.css
│
├── 📁 app/                 → TypeScript/React (Aplicação)
│   ├── 📄 App.tsx          → Componente principal
│   ├── 📄 routes.tsx       → Configuração de rotas
│   │
│   ├── 📁 components/      → Componentes React (.tsx)
│   │   ├── 📁 layout/      → Componentes de Layout
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   │
│   │   ├── 📁 common/      → Componentes Reutilizáveis
│   │   │   ├── PropertyCard.tsx
│   │   │   └── InstitutionalBanner.tsx
│   │   │
│   │   ├── 📁 features/    → Componentes de Funcionalidades
│   │   │   ├── AIAgent.tsx
│   │   │   └── Chatbot.tsx
│   │   │
│   │   ├── 📁 ui/          → Componentes UI Base
│   │   │   └── ...
│   │   │
│   │   └── 📁 figma/       → Componentes importados do Figma
│   │       └── ImageWithFallback.tsx
│   │
│   ├── 📁 pages/           → Páginas da aplicação (.tsx)
│   │   ├── 📁 home/
│   │   │   └── Home.tsx
│   │   │
│   │   ├── 📁 property/
│   │   │   ├── Results.tsx
│   │   │   └── PropertyDetail.tsx
│   │   │
│   │   └── 📁 admin/
│   │       ├── AdminLogin.tsx
│   │       └── AdminDashboard.tsx
│   │
│   └── 📁 data/            → Dados e mocks (.ts)
│       └── properties.ts
│
└── 📁 imports/             → Assets (Imagens, SVGs)
    ├── image.png
    ├── image-1.png
    └── ...
```

---

## 📂 Detalhamento por Categoria

### 🎨 **CSS** (`/src/styles/`)
Todos os arquivos de estilo globais:
- `fonts.css` - Importação de fontes customizadas
- `index.css` - Estilos base da aplicação
- `tailwind.css` - Configuração do Tailwind CSS v4
- `theme.css` - Tema customizado (cores, tokens CSS)

---

### ⚛️ **TypeScript/React** (`/src/app/`)

#### 🧩 **Componentes** (`/src/app/components/`)

**Layout** (`layout/`)
- Componentes de estrutura da página
- Header, Footer, Sidebar, etc.

**Comuns** (`common/`)
- Componentes reutilizáveis em várias páginas
- Cards, Banners, Modais, etc.

**Funcionalidades** (`features/`)
- Componentes de funcionalidades específicas
- AIAgent, Chatbot, Formulários avançados

**UI Base** (`ui/`)
- Componentes primitivos de interface
- Buttons, Inputs, Checkboxes, etc.

**Figma** (`figma/`)
- Componentes importados/gerados do Figma
- Componentes protegidos (não editar)

---

#### 📄 **Páginas** (`/src/app/pages/`)

Organizadas por módulo/funcionalidade:

**Home** (`home/`)
- `Home.tsx` - Página inicial

**Propriedades** (`property/`)
- `Results.tsx` - Listagem de imóveis
- `PropertyDetail.tsx` - Detalhes do imóvel

**Admin** (`admin/`)
- `AdminLogin.tsx` - Login administrativo
- `AdminDashboard.tsx` - Painel administrativo

---

#### 📊 **Dados** (`/src/app/data/`)
- `properties.ts` - Mock de dados de propriedades
- Outras fontes de dados mock

---

### 🖼️ **Assets** (`/src/imports/`)
Imagens, SVGs e outros assets estáticos

---

## 🔄 Como Importar Arquivos

### ✅ Imports Corretos (Após reorganização)

```typescript
// Layout Components
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";

// Common Components
import { PropertyCard } from "./components/common/PropertyCard";
import { InstitutionalBanner } from "./components/common/InstitutionalBanner";

// Feature Components
import { AIAgent } from "./components/features/AIAgent";
import { Chatbot } from "./components/features/Chatbot";

// Pages
import Home from "./pages/home/Home";
import Results from "./pages/property/Results";
import PropertyDetail from "./pages/property/PropertyDetail";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";

// Data
import { properties } from "./data/properties";
```

---

## 📋 Benefícios da Organização

### ✅ **Manutenibilidade**
- Fácil localização de arquivos por tipo
- Estrutura escalável e padronizada

### ✅ **Separação de Responsabilidades**
- CSS separado de lógica
- Componentes organizados por função
- Páginas agrupadas por módulo

### ✅ **Melhor DX (Developer Experience)**
- Navegação intuitiva entre arquivos
- Redução de confusão em projetos grandes
- Facilita trabalho em equipe

### ✅ **Performance**
- Tree-shaking otimizado
- Imports mais claros e diretos

---

## 🎯 Convenções de Nomenclatura

### Arquivos TypeScript/React (`.tsx`, `.ts`)
- **PascalCase** para componentes: `Header.tsx`, `PropertyCard.tsx`
- **camelCase** para utilities: `formatDate.ts`, `apiHelpers.ts`
- **kebab-case** para pastas: `admin-dashboard/`, `property-detail/`

### Arquivos CSS (`.css`)
- **kebab-case**: `fonts.css`, `theme.css`

### Pastas
- **kebab-case ou singular**: `layout/`, `common/`, `features/`

---

## 🚀 Próximos Passos (Opcional)

Para uma organização ainda mais avançada:

1. **Adicionar pasta `/types/`** - Para interfaces e tipos TypeScript
2. **Adicionar pasta `/hooks/`** - Para custom hooks React
3. **Adicionar pasta `/utils/`** - Para funções utilitárias
4. **Adicionar pasta `/services/`** - Para integração com APIs
5. **Adicionar pasta `/contexts/`** - Para React Context providers

---

**Criado em:** Abril 2026  
**Plataforma:** Grupo São Paulo Participações - Imóveis Comerciais
