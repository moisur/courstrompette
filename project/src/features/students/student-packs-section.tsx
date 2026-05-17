import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CoursePack } from "@/lib/types";
import { Trash2 } from "lucide-react";

interface StudentPacksSectionProps {
  packs: CoursePack[];
  onDeletePack: (packId: string) => void;
}

export function StudentPacksSection({ packs, onDeletePack }: StudentPacksSectionProps) {
  if (packs.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-4">Packs de cours</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date d&apos;achat</TableHead>
              <TableHead>Total cours</TableHead>
              <TableHead>Cours restants</TableHead>
              <TableHead>Date d&apos;expiration</TableHead>
              <TableHead className="text-right">Prix</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packs.map((pack) => (
              <TableRow key={pack._id}>
                <TableCell>{new Date(pack.purchaseDate).toLocaleDateString()}</TableCell>
                <TableCell>{pack.totalLessons}</TableCell>
                <TableCell>
                  <span className="font-semibold">{pack.remainingLessons}</span>
                </TableCell>
                <TableCell>{pack.expiryDate ? new Date(pack.expiryDate).toLocaleDateString() : "-"}</TableCell>
                <TableCell className="text-right">{pack.price}€</TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <Button variant="ghost" size="icon" onClick={() => onDeletePack(pack._id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
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
