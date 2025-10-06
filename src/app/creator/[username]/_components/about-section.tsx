import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface aboutSectionProps {
  name: string;
  description: string;
}

export function AboutSection({ name, description }: aboutSectionProps) {
  return (
    <Card className="shadow-xl border-0 bg-white/95">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 mb-2">
          <div className="h-6 w-1 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
          Sobre {name}
        </CardTitle>
      </CardHeader>
      <CardContent>{description}</CardContent>
    </Card>
  );
}
