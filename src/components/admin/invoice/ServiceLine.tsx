import { Service } from "@/lib/types/invoice";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ServiceLineProps {
  service: Service;
  onChange: (id: string, field: keyof Service, value: string | number) => void;
  onDelete: (id: string) => void;
}

const ServiceLine = ({ service, onChange, onDelete }: ServiceLineProps) => {
  return (
    <div className="grid grid-cols-12 gap-3 items-center mb-3">
      <div className="col-span-2">
        <Input
          type="date"
          value={service.date}
          onChange={(e) => onChange(service.id, "date", e.target.value)}
          className="bg-white border-stone-200"
        />
      </div>
      <div className="col-span-5">
        <Input
          type="text"
          value={service.description}
          onChange={(e) => onChange(service.id, "description", e.target.value)}
          placeholder="Description"
          className="bg-white border-stone-200"
        />
      </div>
      <div className="col-span-1">
        <Input
          type="number"
          value={service.numberOfLessons}
          onChange={(e) =>
            onChange(service.id, "numberOfLessons", parseInt(e.target.value) || 0)
          }
          placeholder="Nombre"
          className="bg-white border-stone-200 text-center"
        />
      </div>
      <div className="col-span-2">
        <Input
          type="number"
          value={service.rate}
          onChange={(e) =>
            onChange(service.id, "rate", parseFloat(e.target.value) || 0)
          }
          placeholder="Tarif (€)"
          className="bg-white border-stone-200 text-right"
        />
      </div>
      <div className="col-span-2 flex items-center justify-between pl-2">
        <span className="font-semibold text-stone-600 text-sm">
          {(service.numberOfLessons * service.rate).toFixed(2)} €
        </span>
        <button
          onClick={() => onDelete(service.id)}
          className="p-2 text-red-400 hover:text-red-600 transition-colors"
          title="Supprimer cette ligne"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default ServiceLine;
