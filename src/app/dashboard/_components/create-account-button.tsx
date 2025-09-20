import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function CreateAccountButton() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleCreateStripeAccount() {
    setIsLoading(true);

    // ir lá na api do stripe criar a conta
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
