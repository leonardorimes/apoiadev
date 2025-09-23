"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

export default function CreateAccountButton() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleCreateStripeAccount() {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_HOST_URL}/api/stripe/create-account`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();
      if (!res.ok) {
        toast.error("Falha ao criar conta de pagamento!");
        setIsLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  }
  return (
    <div className="mb-5 ">
      <Button
        className="cursor-pointer"
        onClick={handleCreateStripeAccount}
        disabled={isLoading}
      >
        {isLoading ? "Carregando..." : "Ativar conta de pagamentos"}
      </Button>
    </div>
  );
}
