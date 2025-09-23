"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createUserNameSchema = z.object({
  username: z.string({ message: "Nome de usuário obrigatório" }).min(1),
});

type createUserNameSchema = z.infer<typeof createUserNameSchema>;

export async function getInfoUser(data: createUserNameSchema) {
  const schema = createUserNameSchema.safeParse(data);

  if (!schema.success) {
    return {
      return: null,
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        username: data.username,
      },
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        image: true,
        connectedStripeAccountId: true,
      },
    });
    return user;
  } catch (error) {
    return null;
  }
}
