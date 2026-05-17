import { Service } from "@/lib/types";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ServiceLineProps {
  service: Service;
  onChange: (id: string, field: keyof Service, value: string | number) => void;
  onDelete: (id: string) => void;
}

const ServiceLine = ({ service, onChange, onDelete }: ServiceLineProps) => {
  return (
    <div className="grid grid-cols-5 gap-2 items-center mb-2">
      <Input
        type="date"
        value={service.date}
        onChange={(e) => onChange(service.id, "date", e.target.value)}
        className="col-span-1"
      />
      <Input
        type="text"
        value={service.description}
        onChange={(e) => onChange(service.id, "description", e.target.value)}
        placeholder="Description"
        className="col-span-2"
      />
      <Input
        type="number"
        value={service.numberOfLessons}
        onChange={(e) =>
          onChange(service.id, "numberOfLessons", parseInt(e.target.value) || 0)
        }
        placeholder="Nombre de cours"
        className="col-span-1"
      />
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={service.rate}
          onChange={(e) =>
            onChange(service.id, "rate", parseFloat(e.target.value) || 0)
          }
          placeholder="Tarif (€/cours)"
          className="flex-1"
        />
        <button
          onClick={() => onDelete(service.id)}
          className="p-2 text-red-500 hover:text-red-700 transition-colors"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
};

export default ServiceLine;
