import { z } from "zod";
import { labMembers } from "../config/labMembers.config";

const attendedBySchema = z.enum(labMembers, {
  errorMap: () => ({ message: "Selecione quem elaborou o orcamento." }),
});

const filamentKeySchema = z.enum([
  "PLA",
  "PETG",
  "ABS",
  "TPU",
  "NYLON",
  "RESINA",
  "OUTROS",
]);

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

export const budgetInputSchema = z.object({
  attendedBy: attendedBySchema,
  requester: z.object({
    name: z.string().trim().min(1, "Nome do solicitante e obrigatorio."),
    email: z.string().trim().email("E-mail invalido."),
    department: z.string().trim().optional(),
    projectDescription: z.string().trim().min(1, "Descricao do projeto e obrigatoria."),
  }),
  print: z
    .object({
      materialKey: filamentKeySchema,
      weightInGrams: z.number().positive("Peso da peca deve ser maior que zero."),
      printTime: z.object({
        hours: z.number().int().min(0),
        minutes: z.number().int().min(0).max(59),
      }),
    })
    .refine((print) => print.printTime.hours > 0 || print.printTime.minutes > 0, {
      message: "Tempo de impressao deve ser maior que zero.",
      path: ["printTime"],
    }),
  services: z.object({
    modeling: additionalServiceSchema,
    scanning: additionalServiceSchema,
    slicing: additionalServiceSchema,
  }),
  notes: z.string().trim().optional(),
});

export type BudgetInputSchema = z.infer<typeof budgetInputSchema>;
