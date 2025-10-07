import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export const POST = auth(async function Post(request) {
  if (!request.auth) {
    return NextResponse.json(
      { message: "User is authenticated" },
      { status: 401 }
    );
  }

  try {
    const account = await stripe.accounts.create({
      capabilities: {
        transfers: { requested: true }, // IMPORTANTE!
        card_payments: { requested: true },
      },
      controller: {
        losses: { payments: "application" },
        fees: { payer: "application" },
        stripe_dashboard: { type: "express" },
      },
    });

    if (!account.id) {
      return NextResponse.json(
        { message: "falha ao criar conta de pagamento" },
        { status: 400 }
      );
    }

    // atualiza no banco com a conta criada no Stripe
    await prisma.user.update({
      where: { id: request.auth.user.id! },
      data: { connectedStripeAccountId: account.id },
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      type: "account_onboarding",
      capabilities: {
        transfers: { requested: true }, // IMPORTANTE!
        card_payments: { requested: true },
      },
    });

    return NextResponse.json({ url: accountLink?.url }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "falha ao criar link de configuração" },
      { status: 400 }
    );
  }
});
