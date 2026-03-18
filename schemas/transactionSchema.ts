import * as z from "zod";

export const transactionSchema = z.object({
  description: z
    .string()
    .min(3, "A descrição deve ter pelo menos 3 caracteres")
    .max(50, "Descrição muito longa"),

  amount: z
    .string()
    .refine((val) => !isNaN(Number(val)), "Informe um valor numérico válido")
    .transform((val) => Number(val))
    .refine((val) => val > 0, "O valor deve ser maior que zero"),

  category: z
    .string({ required_error: "Selecione uma categoria" })
    .min(1, "A categoria é obrigatória"),

  type: z.enum(["income", "expense"], {
    required_error: "Selecione se é Entrada ou Saída",
  }),

  date: z.date({
    required_error: "A data é obrigatória",
    invalid_type_error: "Formato de data inválido",
  }),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;
