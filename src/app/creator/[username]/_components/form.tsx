"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const formSchema = z.object({
  name: z.string().min(1, { message: "Nome obrigatório" }),
  message: z.string().min(1, { message: "Mensagem obrigatória" }),
  price,
});

export function FormDonate() {
  return <div>form</div>;
}
