import { LucideIcon } from "lucide-react";

interface SectionDividerProps {
  title: string;
  icon: LucideIcon;
  color?: 'green' | 'red' | 'primary';
}

export const SectionDivider = ({ 
  title, 
  icon: Icon, 
  color = 'primary' 
}: SectionDividerProps) => {
  const colorClasses = {
    green: 'text-green-600 border-green-600',
    red: 'text-red-600 border-red-600',
    primary: 'text-primary border-primary',
  };

  return (
    <div className="flex items-center gap-3 my-8">
      <div className={`flex items-center gap-2 ${colorClasses[color]}`}>
        <Icon className="h-6 w-6" />
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      <div className={`flex-1 h-px border-t-2 ${colorClasses[color]} opacity-20`} />
    </div>
  );
};
