"use server";

import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { z } from "zod";

const createPaymentSchema = z.object({
  slug: z.string().min(1, "Slug do creator é obrigatória"),
  name: z.string().min(1, "O nome precisa ter pelo menos 1 letra"),
  message: z.string().min(5, "A mensagem precisa ter pelo menos 5 letras"),
  price: z.number().min(1000, "Selecione um valor maior que R$10"), // 1000 centavos = R$10
  creatorId: z.string().min(1, "Creator ID é obrigatório"),
});

type CreatePaymentSchema = z.infer<typeof createPaymentSchema>;

export async function createPayment(data: CreatePaymentSchema) {
  try {
    console.log("---- createPayment START ----");
    console.log("Input data:", data);

    const schema = createPaymentSchema.safeParse(data);

    if (!schema.success) {
      console.error("Validation error:", schema.error.issues);
      return {
        error: schema.error.issues[0].message,
      };
    }

    console.log("Validation passed, searching for creator...");

    const creator = await prisma.user.findFirst({
      where: {
        connectedStripeAccountId: data.creatorId,
      },
    });

    console.log("Creator encontrado:", !!creator);
    console.log("Creator data:", creator);

    if (!creator) {
      console.error(
        "Creator not found with connectedStripeAccountId:",
        data.creatorId
      );
      return {
        data: null,
        error: "Creator não encontrado",
      };
    }

    // CALCULAR A TAXA QUE O APOIA DEV FICA PRA ELA
    const applicationFeeAmount = Math.floor(data.price * 0.1);
    console.log("Application fee:", applicationFeeAmount);

    console.log("Creating donation in database...");
    const donation = await prisma.donation.create({
      data: {
        donorName: data.name,
        donorMessage: data.message,
        userId: creator.id,
        status: "PENDING",
        amount: data.price - applicationFeeAmount,
      },
    });

    console.log("Donation criada:", donation.id);

    console.log("Creating Stripe session...");
    console.log("Stripe instance:", !!stripe);
    console.log(
      "Creator connectedStripeAccountId:",
      creator.connectedStripeAccountId
    );

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_HOST_URL}/creator/${data.slug}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_HOST_URL}/creator/${data.slug}?canceled=true`,
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: `Apoiar ${creator.name}`,
              description: `Doação de R$${(data.price / 100).toFixed(2)} para ${
                creator.name
              }`,
            },
            unit_amount: data.price,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: applicationFeeAmount,
        transfer_data: {
          destination: creator.connectedStripeAccountId as string,
        },
        metadata: {
          donorName: data.name,
          donorMessage: data.message,
          donationId: donation.id,
          userId: creator.id,
        },
      },
    });

    console.log("Stripe session criada:", session.id);
    console.log("---- createPayment END ----");

    return {
      sessionId: session.id,
      url: session.url, // Adicionar a URL também como fallback
    };
  } catch (error) {
    console.error("Erro detalhado no createPayment:", error);
    console.error(
      "Stack trace:",
      error instanceof Error ? error.stack : "No stack trace"
    );
    console.error(
      "Error message:",
      error instanceof Error ? error.message : String(error)
    );

    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "Erro interno do servidor. Tente novamente mais tarde.",
    };
  }
}
