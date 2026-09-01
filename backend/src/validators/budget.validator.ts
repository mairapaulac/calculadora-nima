import { z } from "zod";
import { labMembers } from "../config/labMembers.config";
import { optionsConfig } from "../config/options.config";

const attendedBySchema = z.enum(labMembers, {
  errorMap: () => ({ message: "Selecione quem elaborou o orcamento." }),
});

const filamentKeySchema = z.enum([
  "PLA",
  "PETG",
  "ABS",
  "ASA",
  "TPU",
  "NYLON",
  "RESINA",
  "OUTROS",
]);

const printStatusValues = optionsConfig.printStatusOptions.map((o) => o.value) as [
  string,
  ...string[],
];
const scanStatusValues = optionsConfig.scanStatusOptions.map((o) => o.value) as [
  string,
  ...string[],
];
const complexityValues = optionsConfig.complexityOptions.map((o) => o.value) as [
  string,
  ...string[],
];

const printStatusSchema = z.enum(printStatusValues, {
  errorMap: () => ({ message: "Status de impressao invalido." }),
});
const scanStatusSchema = z.enum(scanStatusValues, {
  errorMap: () => ({ message: "Status de escaneamento invalido." }),
});
const complexitySchema = z.enum(complexityValues, {
  errorMap: () => ({ message: "Complexidade invalida." }),
});

const additionalServiceSchema = z
  .object({
    enabled: z.boolean(),
    hours: z.number().min(0).default(0),
    hourlyRate: z.number().min(0).default(0),
  })
  .refine((service) => !service.enabled || service.hours > 0, {
    message: "Informe as horas trabalhadas quando o servico estiver habilitado.",
    path: ["hours"],
  });

const printItemSchema = z
  .object({
    itemName: z.string().trim().min(1, "Nome da peca/demanda e obrigatorio."),
    materialKey: filamentKeySchema,
    weightInGrams: z.number().positive("Peso da peca deve ser maior que zero."),
    printTime: z.object({
      hours: z.number().int().min(0),
      minutes: z.number().int().min(0).max(59),
    }),
    quantity: z.number().int().positive("Quantidade deve ser maior que zero."),
    slicing: z.boolean(),
    status: printStatusSchema,
  })
  .refine((item) => item.printTime.hours > 0 || item.printTime.minutes > 0, {
    message: "Tempo de impressao deve ser maior que zero.",
    path: ["printTime"],
  });

const scanItemSchema = z.object({
  itemName: z.string().trim().min(1, "Nome da peca e obrigatorio."),
  scanTimeHours: z.number().positive("Tempo de escaneamento deve ser maior que zero."),
  hourlyRate: z.number().min(0),
  complexity: complexitySchema,
  postProcessing: z.string().trim().min(1, "Informe o pos-processamento/malha."),
  status: scanStatusSchema,
});

export const budgetInputSchema = z
  .object({
    attendedBy: attendedBySchema,
    requester: z.object({
      name: z.string().trim().min(1, "Nome do solicitante e obrigatorio."),
      email: z.string().trim().email("E-mail invalido."),
      department: z.string().trim().optional(),
      projectDescription: z.string().trim().min(1, "Descricao do projeto e obrigatoria."),
    }),
    printItems: z.array(printItemSchema),
    scanItems: z.array(scanItemSchema),
    services: z.object({
      modeling: additionalServiceSchema,
    }),
    notes: z.string().trim().optional(),
  })
  .refine((input) => input.printItems.length + input.scanItems.length > 0, {
    message: "Adicione ao menos um item de impressao ou escaneamento ao orcamento.",
    path: ["printItems"],
  });

export type BudgetInputSchema = z.infer<typeof budgetInputSchema>;
