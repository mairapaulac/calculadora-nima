# Calculadora NIMA — Sistema de Orçamento de Manufatura Aditiva

Aplicação web full stack (TypeScript no frontend e no backend) para o operador de um
laboratório de manufatura aditiva calcular o custo de uma demanda de impressão 3D,
visualizar o orçamento em tempo real e gerar um documento (PDF e/ou DOCX) formatado
para envio ao solicitante.

Um orçamento pode reunir **múltiplos itens** de dois tipos — Impressão 3D e
Escaneamento 3D — cada um com seus próprios campos de controle interno (código,
status, custo de insumo, lucro do laboratório etc.), somados num valor total.
O documento entregue ao solicitante (PDF/DOCX) segue o template visual do NIMA:
lista de itens + valor + total.

Os orçamentos são persistidos em um banco **Postgres** externo (ex: [Neon](https://neon.tech))
— veja a seção [Persistência](#6-persistência-postgres) — justamente para sobreviver
a deploys/reinícios em hospedagens com disco efêmero (ex: Render free).

---

## 1. Estrutura de Pastas

```
calculadoraNima/
├── backend/                        # API em Node.js + TypeScript
│   ├── src/
│   │   ├── config/                 # Arquivos de configuração editáveis
│   │   │   ├── materials.config.ts   # Materiais/filamentos e preços
│   │   │   ├── pricing.config.ts     # Custo de máquina/hora, taxas, dados do lab
│   │   │   ├── options.config.ts     # Status, complexidade, pós-processamento
│   │   │   ├── labMembers.config.ts  # Integrantes do laboratório
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   └── budget.types.ts     # Tipagens de domínio
│   │   ├── validators/
│   │   │   └── budget.validator.ts # Validação (Zod) dos dados recebidos
│   │   ├── utils/
│   │   │   ├── time.utils.ts       # Conversão horas/minutos -> decimal
│   │   │   ├── currency.utils.ts   # Formatação BRL / arredondamento
│   │   │   ├── id.utils.ts         # Geração de número/códigos sequenciais (contador no Postgres)
│   │   │   └── asyncHandler.ts
│   │   ├── services/               # Regras de negócio centralizadas
│   │   │   ├── calculation.service.ts  # Fórmulas de custo (fonte da verdade)
│   │   │   ├── budget.service.ts       # Orquestra cálculo + persistência
│   │   │   ├── pdf.service.ts          # Geração do PDF (pdfkit)
│   │   │   └── docx.service.ts         # Geração do DOCX (docx)
│   │   ├── database/
│   │   │   └── db.ts               # Conexão Postgres (pg)
│   │   ├── repositories/
│   │   │   └── budget.repository.ts # Armazenamento em Postgres
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
2. O operador adiciona quantos **itens de impressão** e/ou **itens de escaneamento**
   quiser dentro do mesmo orçamento (ex: mesma peça em tamanho original + miniatura).
3. Ao clicar em **"Gerar Orçamento"**, os dados são validados e enviados para o
   backend (`POST /api/budgets`), que recalcula oficialmente com o
   `calculation.service.ts` do backend (fonte da verdade), gera o número do
   orçamento e o código de cada item (`ORC-001`, `ESC-001`, ...) e persiste no
   Postgres.
4. O operador pode então baixar o orçamento em **PDF** ou **DOCX**
   (`GET /api/budgets/:id/pdf` e `/docx`) — documento com a marca do NIMA, um item
   por linha e o total — prontos para envio ao solicitante.
5. A aba **Dashboard** lista os orçamentos gerados; cada linha expande para mostrar
   os campos internos de cada item (status, subtotal NIMA, taxa EJ, custo de
   insumo, lucro do laboratório).

### Fórmulas de cálculo (`backend/src/services/calculation.service.ts`)

**Item de Impressão 3D:**

| Custo             | Fórmula                                                          |
|-------------------|-------------------------------------------------------------------|
| Material          | `peso (g) × valor por grama do filamento`                         |
| Custo de Máquina  | `tempo de impressão (h) × custo de máquina por hora` (energia + desgaste combinados) |
| Taxa de Fatiamento | `R$ 5,00` fixo, se o item tiver fatiamento habilitado             |
| Subtotal NIMA     | soma dos três custos acima                                        |
| Taxa EJ (20%)     | `Subtotal NIMA × 20%`                                             |
| **Valor Final Cobrado** | `Subtotal NIMA + Taxa EJ`                                    |
| Lucro Lab         | `Subtotal NIMA − Custo de Insumo` (custo de insumo é informado manualmente) |

**Item de Escaneamento 3D:** `horas de escaneamento × valor por hora` = Valor Final Cobrado.

**Modelagem 3D** (serviço único, opcional, no nível do orçamento): `horas × valor por hora`.

**Total do orçamento** = soma do Valor Final Cobrado de todos os itens + Modelagem 3D.

### Configuração (edite sem tocar em código de negócio)

- `backend/src/config/materials.config.ts` — nome, preço por kg de cada filamento
  (PLA, PETG, ABS, TPU, Nylon, Resina, Outros). O preço por grama é derivado
  automaticamente.
- `backend/src/config/pricing.config.ts` — custo de máquina por hora, taxa fixa de
  fatiamento, percentual da taxa EJ, valor-hora padrão de escaneamento e dados do
  laboratório (nome, e-mail, WhatsApp) exibidos no orçamento gerado.
- `backend/src/config/options.config.ts` — opções de status (impressão/escaneamento),
  complexidade e pós-processamento/malha usadas nos formulários.
- `backend/src/config/labMembers.config.ts` — integrantes do laboratório que podem
  ser selecionados como responsáveis pela elaboração de um orçamento.

O frontend busca esses valores em `GET /api/config` na inicialização, então uma
alteração no backend já reflete na simulação instantânea sem duplicar configuração.

---

## 3. Instruções de Instalação

Pré-requisitos: **Node.js 22.5+**, **npm** e um banco **Postgres** gratuito (ex:
crie um projeto em [neon.tech](https://neon.tech) e copie a connection string).

```powershell
# Backend
cd backend
npm install
copy .env.example .env
# edite o .env e preencha DATABASE_URL com a connection string do Postgres

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

## 6. Persistência (Postgres)

Os orçamentos são armazenados em um banco **Postgres** externo (ex: **Neon**, plano
gratuito), configurado via `DATABASE_URL` (`backend/.env`). Isso substitui o SQLite
local usado na primeira versão: em hospedagens com disco efêmero (ex: Render free),
o arquivo local era apagado a cada novo deploy ou reinício do container — com o
banco fora do processo da API, os dados sobrevivem a qualquer deploy/restart.

O orçamento inteiro continua salvo como JSON (`JSONB`) na coluna `payload` da
tabela `budgets` — suficiente para o volume e as consultas deste sistema. Uma
segunda tabela, `counters`, guarda contadores incrementados atomicamente
(`INSERT ... ON CONFLICT DO UPDATE ... RETURNING`) usados para gerar o número do
orçamento (`NIMA-2026-000001`) e os códigos de cada item (`ORC-001`, `ESC-001`).
Ao evoluir para tabelas normalizadas, a única camada que muda é
`backend/src/repositories/budget.repository.ts` e `backend/src/utils/id.utils.ts`,
mantendo a mesma interface pública (`save`, `findById`, `list`).

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
3. Na tela de revisão, defina os valores de `CORS_ORIGIN` e `DATABASE_URL` (ambas
   marcadas como `sync: false`, então o Render pede para preenchê-las) —
   `DATABASE_URL` é a connection string do seu projeto Neon/Postgres; `CORS_ORIGIN`
   pode ficar em branco por enquanto e ser preenchida depois de implantar o frontend.
4. Clique em **Apply**. Ao final, você terá uma URL como
   `https://nima-backend.onrender.com`.

> Se a criação via Blueprint falhar ou você preferir configurar manualmente, crie um
> **New + → Web Service** apontando para o repositório e preencha os mesmos campos
> que estão no `render.yaml` (Root Directory `backend`, Build/Start Command acima,
> Instance Type Free, mais as env vars `CORS_ORIGIN` e `DATABASE_URL`) — o resultado
> é idêntico.

Como os dados agora ficam no Postgres externo (não no disco do container), o
comportamento efêmero do Render Free — disco resetado a cada novo deploy ou ao
"acordar" de um período de inatividade — deixa de ser um problema.

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
- Normalizar `budgets`/itens em tabelas próprias (em vez do payload JSON) e/ou
  trocar as queries manuais por um ORM (ex: **Prisma**), reaproveitando a mesma
  connection Postgres já configurada.
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
