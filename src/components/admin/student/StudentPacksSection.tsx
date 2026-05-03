import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CoursePack } from "@/hooks/use-student-detail";
import { Trash2, Box } from "lucide-react";

interface StudentPacksSectionProps {
  packs: CoursePack[];
  onDeletePack: (packId: string) => void;
}

export function StudentPacksSection({ packs, onDeletePack }: StudentPacksSectionProps) {
  if (packs.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-stone-800">
        <Box size={20} className="text-blue-600" />
        <h2 className="text-xl font-bold">Packs de cours</h2>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-stone-50">
            <TableRow className="hover:bg-transparent border-stone-200">
              <TableHead className="text-stone-500 font-bold text-xs uppercase py-4">Achat</TableHead>
              <TableHead className="text-stone-500 font-bold text-xs uppercase py-4">Total</TableHead>
              <TableHead className="text-stone-500 font-bold text-xs uppercase py-4">Restants</TableHead>
              <TableHead className="text-stone-500 font-bold text-xs uppercase py-4">Expiration</TableHead>
              <TableHead className="text-right text-stone-500 font-bold text-xs uppercase py-4">Prix</TableHead>
              <TableHead className="w-[80px] text-right text-stone-500 font-bold text-xs uppercase py-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packs.map((pack) => (
              <TableRow key={pack.id} className="border-stone-100 hover:bg-stone-50/50 transition-colors">
                <TableCell className="font-medium text-stone-700">
                  {new Date(pack.purchaseDate).toLocaleDateString("fr-FR")}
                </TableCell>
                <TableCell className="text-stone-600">
                  {pack.totalLessons} cours
                </TableCell>
                <TableCell>
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-full text-xs font-bold border",
                    pack.remainingLessons > 0 
                      ? "bg-blue-50 text-blue-700 border-blue-100" 
                      : "bg-stone-100 text-stone-500 border-stone-200"
                  )}>
                    {pack.remainingLessons} restants
                  </span>
                </TableCell>
                <TableCell className="text-stone-500 text-xs">
                  {pack.expiryDate ? new Date(pack.expiryDate).toLocaleDateString("fr-FR") : "-"}
                </TableCell>
                <TableCell className="text-right font-black text-stone-800">
                  {Number(pack.price).toFixed(2)}€
                </TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-stone-300 hover:text-red-500 hover:bg-red-50" 
                      onClick={() => onDeletePack(pack.id)}
                      title="Supprimer ce pack"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
