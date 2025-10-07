// app/api/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// IMPORTANTE: Next.js 14+ App Router precisa do body raw para verificar a assinatura
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  if (!sig) {
    console.error("❌ Stripe signature não encontrada");
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const body = await req.text(); // corpo RAW do Stripe

    console.log(
      "📝 Body recebido (primeiros 100 chars):",
      body.substring(0, 100)
    );
    console.log("🔑 Signature:", sig.substring(0, 50) + "...");

    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    console.log("✅ Webhook verificado:", event.type);
  } catch (err: any) {
    console.error("❌ Falha ao verificar webhook:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const paymentIntentId = session.payment_intent as string;

        console.log("💰 Checkout concluído! Session:", session.id);

        const paymentIntent = await stripe.paymentIntents.retrieve(
          paymentIntentId
        );

        const donorName = paymentIntent.metadata.donorName || "Anônimo";
        const donorMessage = paymentIntent.metadata?.donorMessage || "";
        const donationId = paymentIntent.metadata.donationId;

        if (!donationId) {
          console.error("❌ Nenhum donationId encontrado nos metadados!");
          break;
        }

        console.log("🔄 Atualizando doação:", donationId);

        const updatedDonation = await prisma.donation.update({
          where: { id: donationId },
          data: {
            status: "PAID",
            donorName: donorName,
            donorMessage: donorMessage,
          },
        });

        console.log(
          "✅ Doação atualizada:",
          updatedDonation.id,
          "- Status:",
          updatedDonation.status
        );
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("💳 Payment Intent succeeded:", paymentIntent.id);
        break;
      }

      case "charge.succeeded": {
        const charge = event.data.object as Stripe.Charge;
        console.log(
          "✅ Charge succeeded:",
          charge.id,
          "- Amount:",
          charge.amount / 100
        );
        break;
      }

      default:
        console.log(`ℹ️ Evento não tratado: ${event.type}`);
    }
  } catch (err: any) {
    console.error("❌ Erro ao processar evento:", err);
    return NextResponse.json({ error: "Processing error" }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
