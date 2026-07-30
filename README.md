# Calculadora NIMA — Sistema de Orçamento de Manufatura Aditiva

Aplicação web full stack (TypeScript no frontend e no backend) para o operador de um
laboratório de manufatura aditiva calcular o custo de uma demanda de impressão 3D,
visualizar o orçamento em tempo real e gerar um documento (PDF e/ou DOCX) formatado
para envio ao solicitante.

Esta primeira versão **não usa banco de dados** — os orçamentos gerados ficam em
memória no processo do backend — mas toda a arquitetura já está preparada para a
troca por um banco real sem impacto nas camadas de cálculo, controllers ou frontend
(veja [Evoluções Futuras](#evoluções-futuras)).

---

## 1. Estrutura de Pastas

```
calculadoraNima/
├── backend/                        # API em Node.js + TypeScript
│   ├── src/
│   │   ├── config/                 # Arquivos de configuração editáveis
│   │   │   ├── materials.config.ts   # Materiais/filamentos e preços
│   │   │   ├── pricing.config.ts     # Potência, kWh, desgaste, dados do lab
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   └── budget.types.ts     # Tipagens de domínio
│   │   ├── validators/
│   │   │   └── budget.validator.ts # Validação (Zod) dos dados recebidos
│   │   ├── utils/
│   │   │   ├── time.utils.ts       # Conversão horas/minutos -> decimal
│   │   │   ├── currency.utils.ts   # Formatação BRL / arredondamento
│   │   │   ├── id.utils.ts         # Geração do número do orçamento
│   │   │   └── asyncHandler.ts
│   │   ├── services/               # Regras de negócio centralizadas
│   │   │   ├── calculation.service.ts  # Fórmulas de custo (fonte da verdade)
│   │   │   ├── budget.service.ts       # Orquestra cálculo + persistência
│   │   │   ├── pdf.service.ts          # Geração do PDF (pdfkit)
│   │   │   └── docx.service.ts         # Geração do DOCX (docx)
│   │   ├── repositories/
│   │   │   └── budget.repository.ts # Armazenamento em memória (troque por DB aqui)
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
   orçamento e persiste em memória.
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

O frontend busca esses valores em `GET /api/config` na inicialização, então uma
alteração no backend já reflete na simulação instantânea sem duplicar configuração.

---

## 3. Instruções de Instalação

Pré-requisitos: **Node.js 18+** e **npm**.

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

## 6. Evoluções Futuras

### Persistência em banco de dados
- A única camada que precisa mudar é `backend/src/repositories/budget.repository.ts`:
  troque o `Map` em memória por um cliente de banco (ex: **Prisma** + PostgreSQL,
  ou MongoDB) mantendo a mesma interface (`save`, `findById`, `list`).
- Adicionar tabelas/coleções para `budgets`, `materials` (tornando a configuração de
  materiais editável via painel administrativo em vez de arquivo estático) e
  `users` (para autenticação, abaixo).
- Persistir o contador de numeração de orçamento (`id.utils.ts`) no banco em vez de
  em memória, evitando reinício zerar a sequência.

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
