"use server";

import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { error } from "console";

export async function getStats(userId: string, stripeAccountId: string) {
  if (!userId) {
    return {
      error: "usuário não autenticado",
    };
  }

  try {
    const totalDonations = await prisma.donation.count({
      where: {
        userId: userId,
        status: "PAID",
      },
    });

    const totalAmountResult = await prisma.donation.aggregate({
      where: {
        userId: userId,
        status: "PAID",
      },
      _sum: {
        amount: true,
      },
    });

    const balance = await stripe.balance.retrieve({
      stripeAccount: stripeAccountId,
    });

    return {
      totalQtdDonations: totalDonations,
      totalAmountResult: totalAmountResult._sum.amount ?? 0,
      balance: balance?.pending[0]?.amount ?? 0,
    };
  } catch (error) {
    return {
      error: "Falha ao buscar estatísticas",
    };
  }
}
