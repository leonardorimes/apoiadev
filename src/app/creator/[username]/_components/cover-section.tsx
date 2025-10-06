import { Avatar } from "@/components/ui/avatar";
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import Image from "next/image";

interface CoverSectionProps {
  coverImage?: string;
  profileImage?: string;
  name?: string;
}

export default function CoverSection({
  coverImage,
  name,
  profileImage,
}: CoverSectionProps) {
  return (
    <div className="relative h-48 w-full sm:h-64 md:h-80">
      <Image
        src={coverImage}
        alt="Capa do Usuário"
        fill
        className="object-cover"
        priority
        quality={100}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

      <div className="absolute  bottom-2 md:bottom-6 left-0 right-0 p-4 md:p-8">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col items-center sm:items-end sm:flex-row sm:gap-6">
            <div className="relative flex-shrink-0 mb-2 sm:mb-0">
              <Avatar className="h-20 w-20 border-2 md:border-4 border-white sm:h-24 sm:w-24 md:h-32 md:w-32 shadow-2xl group">
                <AvatarImage
                  src={profileImage}
                  alt={name}
                  className="group-hover:scale-105 transition-transform duration-200 ease-in-out  group-hover:-rotate-6"
                />
                <AvatarFallback className="text-xl sm:text-2xl md:text-4xl font-bold bg-gray-200 text-gray-600">
                  {name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join(")")}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="pb-0 sm:pb-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-white text-center sm:text-left drop-shadow-lg">
                {name}
              </h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
