"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createPayment } from "../_actions/create-payment";
import { toast } from "sonner";
import { getStripeJs } from "@/lib/stripe-js";
import {
  Card,
  CardTitle,
  CardHeader,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

const formSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  message: z.string().min(1, "Mensagem obrigatória"),
  price: z.enum(["15", "25", "35"], {
    required_error: "O valor é obrigatório",
    invalid_type_error: "O valor é obrigatório",
  }),
});

type FormData = z.infer<typeof formSchema>;

interface FormDonateProps {
  creatorId: string;
  slug: string;
}

export function FormDonate({ slug, creatorId }: FormDonateProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      message: "",
      price: "15",
    },
  });

  async function onSubmit(data: FormData) {
    try {
      const priceInCents = Number(data.price) * 100;

      console.log("Dados sendo enviados:", {
        name: data.name,
        message: data.message,
        creatorId: creatorId,
        slug: slug,
        price: priceInCents,
      });

      const checkout = await createPayment({
        name: data.name,
        message: data.message,
        creatorId: creatorId,
        slug: slug,
        price: priceInCents,
      });

      await handlePaymentResponse(checkout);

      console.log("Resposta do createPayment:", checkout);
    } catch (error) {
      console.error("Erro geral no onSubmit:", error);
      toast.error("Erro inesperado ao processar pagamento");
    }
  }

  async function handlePaymentResponse(checkout: {
    sessionId?: string;
    error?: string;
  }) {
    if (checkout.error) {
      console.error("Erro no checkout:", checkout.error);
      toast.error(
        typeof checkout.error === "string"
          ? checkout.error
          : "Erro ao processar pagamento"
      );
      return;
    }

    if (!checkout.sessionId) {
      toast.error("Falha ao criar pagamento, tente mais tarde.");
      return;
    }

    const stripe = await getStripeJs();

    if (!stripe) {
      toast.error("Falha ao criar pagamento, tente mais tarde.");
      return;
    }
    await stripe?.redirectToCheckout({
      sessionId: checkout.sessionId,
    });
  }
  return (
    <Card className="shadow-xl border-0 bg-white/95 backdrop-blur h-fit ">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">
          Apoiar Fulano
        </CardTitle>

        <CardDescription>
          Sua contribuição ajuda a manter o conteúdo
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form
            className="space-y-8 mt-5"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            {/* Nome */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite seu nome"
                      {...field}
                      className="bg-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Mensagem */}
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mensagem</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Digite sua mensagem"
                      {...field}
                      className="bg-white h-32 resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preço */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor da doação</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex items-center gap-3"
                    >
                      {["15", "25", "35"].map((value) => (
                        <div key={value} className="flex items-center gap-1">
                          <RadioGroupItem value={value} id={value} />
                          <label className="text-lg " htmlFor={value}>
                            R$ {value}
                          </label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Carregando..." : "Fazer doação"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
