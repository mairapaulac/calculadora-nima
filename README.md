# Calculadora NIMA — Sistema de Orçamento de Manufatura Aditiva

Aplicação web full stack (TypeScript no frontend e no backend) para o operador de um
laboratório de manufatura aditiva calcular o custo de uma demanda de impressão 3D,
visualizar o orçamento em tempo real e gerar um documento (PDF e/ou DOCX) formatado
para envio ao solicitante.

Esta primeira versão persiste os orçamentos em um arquivo **SQLite** local (sem
serviço de banco externo) — veja a seção [Persistência](#6-persistência-sqlite) — e
toda a arquitetura já está preparada para a troca por um banco gerenciado completo
sem impacto nas camadas de cálculo, controllers ou frontend (veja
[Evoluções Futuras](#8-evoluções-futuras)).

---

## 1. Estrutura de Pastas

```
calculadoraNima/
├── backend/                        # API em Node.js + TypeScript
│   ├── src/
│   │   ├── config/                 # Arquivos de configuração editáveis
│   │   │   ├── materials.config.ts   # Materiais/filamentos e preços
│   │   │   ├── pricing.config.ts     # Potência, kWh, desgaste, dados do lab
│   │   │   ├── labMembers.config.ts  # Integrantes do laboratório
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   └── budget.types.ts     # Tipagens de domínio
│   │   ├── validators/
│   │   │   └── budget.validator.ts # Validação (Zod) dos dados recebidos
│   │   ├── utils/
│   │   │   ├── time.utils.ts       # Conversão horas/minutos -> decimal
│   │   │   ├── currency.utils.ts   # Formatação BRL / arredondamento
│   │   │   ├── id.utils.ts         # Geração do número do orçamento (sequência via SQLite)
│   │   │   └── asyncHandler.ts
│   │   ├── services/               # Regras de negócio centralizadas
│   │   │   ├── calculation.service.ts  # Fórmulas de custo (fonte da verdade)
│   │   │   ├── budget.service.ts       # Orquestra cálculo + persistência
│   │   │   ├── pdf.service.ts          # Geração do PDF (pdfkit)
│   │   │   └── docx.service.ts         # Geração do DOCX (docx)
│   │   ├── database/
│   │   │   └── db.ts               # Conexão SQLite (node:sqlite)
│   │   ├── repositories/
│   │   │   └── budget.repository.ts # Armazenamento em SQLite (troque por outro DB aqui)
│   │   ├── controllers/
│   │   │   ├── budget.controller.ts
│   │   │   └── materials.controller.ts
│   │   ├── routes/
│   │   │   ├── budget.routes.ts
│   │   │   ├── materials.routes.ts
│   │   │   └── index.ts
│   │   ├── middlewares/
│   │   │   ├── validateBody.ts
│   │   │   └── errorHandler.ts
│   │   ├── app.ts                  # Configuração do Express
│   │   └── server.ts               # Ponto de entrada
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
└── frontend/                       # SPA em React + TypeScript + Tailwind
    ├── src/
    │   ├── types/
    │   │   └── budget.types.ts     # Espelho dos tipos do backend
    │   ├── config/
    │   │   └── defaultBudgetInput.ts
    │   ├── services/
    │   │   ├── api.service.ts        # Chamadas HTTP ao backend
    │   │   └── calculation.service.ts # Espelho do cálculo p/ simulação instantânea
    │   ├── utils/
    │   │   ├── currency.ts           # Máscara monetária BRL
    │   │   ├── time.ts
    │   │   └── validation.ts         # Validação de formulário
    │   ├── hooks/
    │   │   └── useBudgetForm.ts      # Estado central do formulário
    │   ├── components/
    │   │   ├── common/               # Inputs reutilizáveis (Text, Money, Select...)
    │   │   ├── form/                 # Seções do formulário de orçamento
    │   │   ├── dashboard/            # Dashboard simples
    │   │   └── layout/                # Header / Footer
    │   ├── App.tsx
    │   └── main.tsx
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── .env.example
```

---

## 2. Como Funciona

1. O operador preenche o formulário (`frontend`). A cada alteração, o
   `calculation.service.ts` do frontend recalcula os custos localmente
   (simulação instantânea, sem round-trip ao servidor).
2. Ao clicar em **"Gerar Orçamento"**, os dados são validados e enviados para o
   backend (`POST /api/budgets`), que recalcula oficialmente com o
   `calculation.service.ts` do backend (fonte da verdade), gera um número de
   orçamento e persiste no SQLite.
3. O operador pode então baixar o orçamento em **PDF** ou **DOCX**
   (`GET /api/budgets/:id/pdf` e `/docx`), prontos para envio ao solicitante.
4. A aba **Dashboard** lista os orçamentos gerados e totais agregados.

### Fórmulas de cálculo (`backend/src/services/calculation.service.ts`)

| Custo             | Fórmula                                                          |
|-------------------|-------------------------------------------------------------------|
| Material          | `peso (g) × valor por grama do filamento`                         |
| Energia           | `(potência da impressora (W) ÷ 1000) × tempo (h) × valor do kWh`  |
| Desgaste          | `tempo de impressão (h) × valor de desgaste por hora`             |
| Modelagem/Escaneamento/Fatiamento | `horas trabalhadas × valor por hora` (se habilitado) |
| **Total**         | soma de todos os itens acima                                       |

### Configuração (edite sem tocar em código de negócio)

- `backend/src/config/materials.config.ts` — nome, preço por kg de cada filamento
  (PLA, PETG, ABS, TPU, Nylon, Resina, Outros). O preço por grama é derivado
  automaticamente.
- `backend/src/config/pricing.config.ts` — potência média da impressora (W),
  valor do kWh, custo de desgaste por hora e dados do laboratório exibidos no
  cabeçalho do orçamento.
- `backend/src/config/labMembers.config.ts` — integrantes do laboratório que podem
  ser selecionados como responsáveis pela elaboração de um orçamento.

O frontend busca esses valores em `GET /api/config` na inicialização, então uma
alteração no backend já reflete na simulação instantânea sem duplicar configuração.

---

## 3. Instruções de Instalação

Pré-requisitos: **Node.js 22.5+** (o backend usa o módulo nativo `node:sqlite` para
persistência) e **npm**.

```powershell
# Backend
cd backend
npm install
copy .env.example .env

# Frontend (em outro terminal)
cd frontend
npm install
copy .env.example .env
```

---

## 4. Instruções de Execução

### Modo desenvolvimento

```powershell
# Terminal 1 — API (http://localhost:3333)
cd backend
npm run dev

# Terminal 2 — Interface (http://localhost:5173)
cd frontend
npm run dev
```

Acesse **http://localhost:5173** no navegador. O Vite já está configurado com
proxy de `/api` para `http://localhost:3333`, e o frontend também lê a variável
`VITE_API_URL` (`.env`) caso o backend rode em outro host/porta.

### Build de produção

```powershell
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

### Outros comandos úteis

```powershell
npm run typecheck   # roda apenas a checagem de tipos (backend e frontend)
```

---

## 5. Endpoints da API

| Método | Rota                        | Descrição                                      |
|--------|-----------------------------|--------------------------------------------------|
| GET    | `/api/config`               | Materiais e parâmetros de cálculo configurados   |
| POST   | `/api/budgets/simulate`     | Calcula custos sem persistir (simulação)         |
| POST   | `/api/budgets`              | Cria e persiste um orçamento                     |
| GET    | `/api/budgets`               | Lista orçamentos (usado pelo dashboard)          |
| GET    | `/api/budgets/:id`           | Detalha um orçamento                             |
| GET    | `/api/budgets/:id/pdf`       | Baixa o orçamento em PDF                         |
| GET    | `/api/budgets/:id/docx`      | Baixa o orçamento em DOCX                        |

---

## 6. Persistência (SQLite)

Os orçamentos são armazenados em um arquivo **SQLite** local (`backend/data/budgets.db`
por padrão, configurável via `DATABASE_PATH`), usando o módulo nativo `node:sqlite`
do próprio Node.js — **sem dependências externas** e sem necessidade de compilação
nativa (por isso não usamos `better-sqlite3`: exige Visual Studio Build Tools/
node-gyp para compilar em máquinas sem binário pré-compilado para a versão do Node
em uso).

> Requer **Node.js 22.5+** (o `node:sqlite` é experimental — o Node imprime um aviso
> no console ao iniciar, mas funciona normalmente).

O orçamento inteiro é salvo como JSON na coluna `payload`; é suficiente para o
volume e as consultas deste sistema. Ao evoluir para um banco relacional completo
(Postgres, etc.), a única camada que muda é `backend/src/repositories/budget.repository.ts`
e `backend/src/utils/id.utils.ts` (numeração sequencial) — mantendo a mesma interface
pública (`save`, `findById`, `list`).

---

## 7. Deploy Gratuito (Render + Vercel)

Como o frontend e o backend já são dois projetos independentes, cada um é implantado
separadamente, sem custo.

### Pré-requisito: subir o código para o GitHub

O Render (e a Vercel) implantam a partir de um repositório Git. Se este projeto
ainda não é um repositório:

```powershell
git init
git add .
git commit -m "Versão inicial do sistema de orçamento NIMA"
```

Crie um repositório vazio no GitHub e depois:

```powershell
git remote add origin https://github.com/SEU_USUARIO/calculadora-nima.git
git branch -M main
git push -u origin main
```

### Backend no Render (Web Service)

O repositório já inclui um [`render.yaml`](render.yaml) na raiz (Render Blueprint),
configurando o serviço automaticamente: root directory `backend`, build
(`npm install && npm run build`), start (`npm start`) e plano free.

1. Crie uma conta em [render.com](https://render.com) (grátis, sem cartão).
2. **New +** → **Blueprint** → conecte o repositório do GitHub → o Render detecta
   o `render.yaml` e propõe criar o serviço `nima-backend` automaticamente.
3. Na tela de revisão, defina o valor da variável `CORS_ORIGIN` (marcada como
   `sync: false`, então o Render pede para preenchê-la) — pode deixar em branco
   por enquanto e voltar depois de implantar o frontend.
4. Clique em **Apply**. Ao final, você terá uma URL como
   `https://nima-backend.onrender.com`.

> Se a criação via Blueprint falhar ou você preferir configurar manualmente, crie um
> **New + → Web Service** apontando para o repositório e preencha os mesmos campos
> que estão no `render.yaml` (Root Directory `backend`, Build/Start Command acima,
> Instance Type Free) — o resultado é idêntico.

**Importante sobre persistência no plano gratuito**: o disco do Render Free é
**efêmero** — ele não some entre requisições, mas é **resetado a cada novo deploy**
(e possivelmente após longos períodos de inatividade, quando o serviço "dorme" e
sobe em uma nova instância). Ou seja, o SQLite evita perda de dados por *crash* do
processo, mas não substitui um disco persistente de verdade nesse plano. Para
persistência real e contínua em produção, os caminhos são:
- Adicionar um **Persistent Disk** do Render (pago, a partir de poucos dólares/mês); ou
- Migrar para um banco gerenciado com camada gratuita própria, ex: **Neon** ou
  **Supabase** (Postgres) — ver seção de evoluções futuras abaixo.

Para uma demonstração ao time ou uso leve, o comportamento atual já é suficiente.

### Frontend na Vercel

O `frontend/` já inclui um [`vercel.json`](frontend/vercel.json) com o build
configurado (`framework: vite`, `outputDirectory: dist`).

1. Crie uma conta em [vercel.com](https://vercel.com) (grátis) e clique em
   **Add New → Project**, conectando o mesmo repositório do GitHub.
2. Em **Root Directory**, selecione `frontend` (a Vercel detecta o framework Vite
   automaticamente a partir do `vercel.json`).
3. Em **Environment Variables**, adicione `VITE_API_URL` →
   `https://nima-backend.onrender.com/api` (use a URL real gerada pelo Render).
4. Clique em **Deploy**. Você terá uma URL como
   `https://calculadora-nima.vercel.app`.

Depois de implantar o frontend, volte ao serviço `nima-backend` no Render
(**Environment**) e defina `CORS_ORIGIN` com essa URL final da Vercel, para o
navegador não bloquear as requisições por CORS.

---

## 8. Evoluções Futuras

### Banco de dados relacional completo
- Trocar `backend/src/repositories/budget.repository.ts` por um ORM (ex: **Prisma**)
  apontando para Postgres gerenciado (Neon, Supabase, Render Postgres).
- Normalizar `materials` e `labMembers` em tabelas próprias, com painel
  administrativo para editá-los sem precisar de redeploy.
- Adicionar tabela `users` (para autenticação, abaixo).

### Autenticação e autorização
- Adicionar login (ex: JWT ou sessão) para diferenciar operadores do laboratório.
- Registrar qual operador criou cada orçamento (`createdBy`).
- Perfis de acesso: operador (cria orçamentos) vs. administrador (edita
  `materials.config` e `pricing.config` via painel, sem precisar redeploy).

### Outras melhorias sugeridas
- Envio automático do PDF/DOCX por e-mail ao solicitante (ex: Nodemailer).
- Histórico de status do orçamento (pendente, aprovado, em produção, entregue).
- Assinatura digital real (ex: integração com um provedor de assinatura eletrônica).
- Testes automatizados (Vitest/Jest) para `calculation.service.ts` — é a camada mais
  crítica e mais fácil de cobrir com testes unitários.
- Extrair `types/budget.types.ts` para um pacote compartilhado (npm workspace) entre
  frontend e backend, eliminando a duplicação manual atual.
