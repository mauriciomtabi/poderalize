import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NegotiationTemperature } from "@/types/crm";
import { Thermometer } from "lucide-react";

interface TemperatureSelectorProps {
  value: NegotiationTemperature;
  onChange: (temperature: NegotiationTemperature) => void;
  disabled?: boolean;
}

const temperatureLabels: Record<NegotiationTemperature, string> = {
  'muito_fraca': 'Muito Fraca',
  'fraca': 'Fraca',
  'mediana': 'Mediana',
  'forte': 'Forte',
  'muito_forte': 'Muito Forte'
};

const temperatureColors: Record<NegotiationTemperature, string> = {
  'muito_fraca': 'text-blue-600',
  'fraca': 'text-cyan-600', 
  'mediana': 'text-yellow-600',
  'forte': 'text-orange-600',
  'muito_forte': 'text-red-600'
};

export const TemperatureSelector = ({ value, onChange, disabled }: TemperatureSelectorProps) => {
  return (
    <div>
      <Label className="text-sm font-medium flex items-center gap-2">
        <Thermometer className="h-4 w-4" />
        Temperatura da Negociação
      </Label>
      <Select
        value={value}
        onValueChange={(newValue) => onChange(newValue as NegotiationTemperature)}
        disabled={disabled}
      >
        <SelectTrigger className="mt-1">
          <SelectValue>
            <div className="flex items-center gap-2">
              <Thermometer className={`h-4 w-4 ${temperatureColors[value]}`} />
              <span>{temperatureLabels[value]}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(temperatureLabels).map(([temp, label]) => (
            <SelectItem key={temp} value={temp}>
              <div className="flex items-center gap-2">
                <Thermometer className={`h-4 w-4 ${temperatureColors[temp as NegotiationTemperature]}`} />
                <span>{label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};