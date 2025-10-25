import { Badge } from "@/components/ui/badge";
import { DollarSign, ArrowLeftRight, Banknote } from "lucide-react";

interface ModoPagamentoBadgeProps {
  modo: 'dinheiro' | 'permuta' | 'dinheiro_permuta';
  descricaoPermuta?: string;
}

export const ModoPagamentoBadge = ({ modo, descricaoPermuta }: ModoPagamentoBadgeProps) => {
  const configs = {
    dinheiro: {
      variant: "default" as const,
      icon: <DollarSign className="h-3 w-3" />,
      label: "Dinheiro",
      className: "bg-green-100 text-green-700 hover:bg-green-200"
    },
    permuta: {
      variant: "secondary" as const,
      icon: <ArrowLeftRight className="h-3 w-3" />,
      label: "Permuta",
      className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
    },
    dinheiro_permuta: {
      variant: "outline" as const,
      icon: <Banknote className="h-3 w-3" />,
      label: "Misto",
      className: "bg-blue-100 text-blue-700 hover:bg-blue-200"
    }
  };

  const config = configs[modo];

  return (
    <Badge 
      variant={config.variant}
      className={`flex items-center gap-1 ${config.className}`}
      title={descricaoPermuta || config.label}
    >
      {config.icon}
      {config.label}
    </Badge>
  );
};
