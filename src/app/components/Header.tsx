import { Input } from "@/components/ui/input";
import { MessageCircle } from "lucide-react";

interface HeaderProps {
  title: string;
  bgcolor: string;
  setValue: (value: string) => void;
  value: string;
}

export default function Header(props: HeaderProps) {
  return (
    <div
      className={`flex flex-col gap-4 md:flex-row p-4 items-center justify-between ${props.bgcolor}`}
    >
      <div className="flex items-center justify-center gap-2">
        <MessageCircle size={40} color="white" />
        <h2 className="text-2xl font-bold text-white">{props.title}</h2>
      </div>
      <div className="flex gap-2 items-center">
        <p className="font-semibold text-white">Pesquise:</p>
        <Input
          placeholder="Tipo..."
          value={props.value}
          onChange={(e) => props.setValue(e.target.value)}
        />
      </div>
    </div>
  );
}
