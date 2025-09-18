"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createUsernameSchema = z.object({
  slug: z.string().min(1, "Slug do creator é obrigatória"),
  name: z.string().min(1, "O nome precisa ter pelo menos 1 letra"),
  message: z.string().min(5, "A mensagem precisa ter pelo menos 5 letras"),
  price: z.number().min(10, "Selecione um valor maior que R$10"),
  creatorId: z.string(),
});

type CreatePaymentSchema = z.infer<typeof createUsernameSchema>;

export async function createPayment(data: CreatePaymentSchema) {
  const schema = createUsernameSchema.safeParse(data);

  if (!schema.success) {
    return {
      data: null,
      error: schema.error.issues[0].message,
    };
  }

  try {
    const creator = await prisma.user.findUnique({});
  } catch (error) {
    return {
      data: null,
      error: "falha ao criar o pagamento, tente mais tarde",
    };
  }
}
