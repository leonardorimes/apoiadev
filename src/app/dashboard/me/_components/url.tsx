"use client";

import { Button } from "@/components/ui/button";
import { createUserName } from "../_actions/create-user-name";
import { useState } from "react";
import { Link2 } from "lucide-react";
import Link from "next/link";

interface urlPreviewProps {
  username: string | null;
}

export function UrlPreview({ username: slug }: urlPreviewProps) {
  const [error, setError] = useState<null | string>(null);
  const [userName, setUserName] = useState<null | string>(slug);

  async function submitAction(formData: FormData) {
    const username = formData.get("username") as string;

    if (username === "") {
      return "";
    }

    const response = await createUserName({ username: username });

    if (response.error) {
      setError(response.error);
      return;
    }

    if (response.data) {
      setUserName(response.data);
    }
  }

  if (!!userName) {
    return (
      <div className="flex items-center flex-1 p-2 text-gray-100">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-center w-full gap-2">
          <h3 className="font-bold text-lg">SUA URL: </h3>
          <Link
            href={`${process.env.NEXT_PUBLIC_HOST_URL}/creator/${userName}`}
            target="_blank"
          >
            {process.env.NEXT_PUBLIC_HOST_URL}/creator/{userName}
          </Link>
        </div>
        <Link
          href={`${process.env.NEXT_PUBLIC_HOST_URL}/creator/${userName}`}
          target="_blank"
          className="bg-blue-500 px-4 py-1 rounded-md hidden md:block"
        >
          <Link2 className="w-5 h-5 text-white" />
        </Link>
      </div>
    );
  }
  return (
    <div className="w-full ">
      <div className="flex items-center flex-1 p-2 text-gray-100">
        <form
          className="flex flex-1 flex-col md:flex-row gap-4 items-start md-items-center"
          action={submitAction}
        >
          <div className="flex items-center justify-center w-full">
            <p>{process.env.NEXT_PUBLIC_HOST_URL}/creator/</p>
            <input
              type="text"
              className="flex-1 outline-none border h-9 border-gray-300 bg-gray-50 text-black rounded-md px-1"
              placeholder="Digite o seu username...."
              name="username"
            />
          </div>
          <Button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 h-9 w-full md:w-fit text-white px-4 rounded-md cursor-pointer"
          >
            Salvar
          </Button>
        </form>
      </div>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
