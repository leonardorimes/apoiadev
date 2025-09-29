import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import next from "next";

export async function POST(req: NextRequest) {
  console.log("👉 Webhook recebido!");
  console.log("Headers:", Object.fromEntries(req.headers));
  const sig = req.headers.get("stripe-signature")!;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
  let event: Stripe.Event;

  try {
    const payload = await req.text();
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err) {
    console.error("Error verifying Stripe webhook signature:", err);
    return NextResponse.json(`Webhook Error: ${err}`, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session;
      const paymentIntentId = session.payment_intent as string;

      // PEGAR as informações do pagamento
      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId
      );

      console.log("PaymentIntent:", paymentIntent);

      const donorName = session.metadata?.donorName || "Anonymous";
      const donorMessage = paymentIntent.metadata?.donorMessage || "";
      const donateId = paymentIntent.metadata.donationId || "";

      if (!donateId) {
        console.error("Nenhum donationId encontrado nos metadados!");
        break;
      }
      try {
        const updateDonation = await prisma.donation.update({
          where: { id: donateId },
          data: {
            status: "PAID",
            donorName: donorName ?? "Anônimo",
            donorMessage: donorMessage ?? "sem mensagem",
          },
        });
        console.log("Donation updated:", updateDonation);
      } catch (error) {
        console.error("Error processing donation:", error);
      }
      break;

    default:
      console.warn(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true }); // Respond with a 200 status to acknowledge receipt of the event
}
