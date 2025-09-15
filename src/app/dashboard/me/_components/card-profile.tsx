import { Session } from "inspector/promises";
import Image from "next/image";
import { Name } from "./name";

interface CardProfileProps {
  user: {
    id: string;
    name: string | null;
    username: string | null;
    bio: string | null;
    image: string | null;
  };
}

export function CardProfile({ user }: CardProfileProps) {
  return (
    <section className="w-full flex flex-col items-center mx-auto px-4">
      <div className="">
        <Image
          src={
            user.image ??
            "https://t4.ftcdn.net/jpg/15/56/08/35/360_F_1556083567_hkMXK7HBkBBVOnxPZZT4J2LXv3RsnJ5K.jpg"
          }
          alt="foto de perfil"
          width={104}
          height={104}
          className="rounded-xl bg-gray-50 object-cover border-4 border-white hover:shadow-xl duration-300"
          quality={100}
        />
      </div>

      <div>
        <Name initialName={user.name ?? "Digite o seu nome..."} />
      </div>
    </section>
  );
}
