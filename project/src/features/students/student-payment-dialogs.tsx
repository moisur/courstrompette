"use client";

import { useEffect, useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CoursePack, Lesson } from "@/lib/types";

interface SinglePackPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lessonId: string | null;
  lessons: Lesson[];
  activePacks: CoursePack[];
  onSubmit: (packId: string, lessonIds: string[]) => Promise<boolean>;
}

interface BulkPackPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unpaidLessons: Lesson[];
  activePacks: CoursePack[];
  onSubmit: (packId: string, lessonIds: string[]) => Promise<boolean>;
}

export function SinglePackPaymentDialog({
  open,
  onOpenChange,
  lessonId,
  lessons,
  activePacks,
  onSubmit,
}: SinglePackPaymentDialogProps) {
  const [selectedPackId, setSelectedPackId] = useState("");

  const lesson = useMemo(() => lessons.find((entry) => entry._id === lessonId) ?? null, [lessonId, lessons]);

  useEffect(() => {
    if (!open) {
      setSelectedPackId("");
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!lessonId || !selectedPackId) {
      return;
    }

    const success = await onSubmit(selectedPackId, [lessonId]);
    if (success) {
      setSelectedPackId("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Payer avec un pack</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Sélectionner un pack</Label>
            <Select value={selectedPackId} onValueChange={setSelectedPackId}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un pack" />
              </SelectTrigger>
              <SelectContent>
                {activePacks.map((pack) => (
                  <SelectItem key={pack._id} value={pack._id}>
                    Pack de {pack.totalLessons} cours - {pack.remainingLessons} restants
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {lesson ? (
            <div className="space-y-2">
              <Label>Cours à payer</Label>
              <div className="border rounded-md p-2">
                <div className="flex justify-between">
                  <span>{new Date(lesson.date).toLocaleDateString()}</span>
                  <span className="font-semibold">{lesson.amount}€</span>
                </div>
                {lesson.comment ? <span className="text-sm text-muted-foreground">{lesson.comment}</span> : null}
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmit} disabled={!selectedPackId || !lessonId}>
              Payer avec le pack
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function BulkPackPaymentDialog({
  open,
  onOpenChange,
  unpaidLessons,
  activePacks,
  onSubmit,
}: BulkPackPaymentDialogProps) {
  const [selectedPackId, setSelectedPackId] = useState("");
  const [selectedLessons, setSelectedLessons] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) {
      setSelectedPackId("");
      setSelectedLessons({});
    }
  }, [open]);

  const handleSubmit = async () => {
    const lessonIds = Object.entries(selectedLessons)
      .filter(([, isSelected]) => isSelected)
      .map(([id]) => id);

    if (!selectedPackId || lessonIds.length === 0) {
      return;
    }

    const success = await onSubmit(selectedPackId, lessonIds);
    if (success) {
      setSelectedPackId("");
      setSelectedLessons({});
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Payer avec un pack</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Sélectionner un pack</Label>
            <Select value={selectedPackId} onValueChange={setSelectedPackId}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un pack" />
              </SelectTrigger>
              <SelectContent>
                {activePacks.map((pack) => (
                  <SelectItem key={pack._id} value={pack._id}>
                    Pack de {pack.totalLessons} cours - {pack.remainingLessons} restants
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Sélectionner les cours à payer</Label>
            <div className="max-h-[300px] overflow-y-auto border rounded-md p-2">
              {unpaidLessons.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">Aucun cours non payé</p>
              ) : (
                unpaidLessons.map((lesson) => (
                  <div key={lesson._id} className="flex items-center space-x-2 py-2 border-b last:border-0">
                    <Checkbox
                      id={`lesson-${lesson._id}`}
                      checked={!!selectedLessons[lesson._id]}
                      onCheckedChange={(checked) => {
                        setSelectedLessons((current) => ({
                          ...current,
                          [lesson._id]: !!checked,
                        }));
                      }}
                    />
                    <Label htmlFor={`lesson-${lesson._id}`} className="flex-1">
                      <div className="flex justify-between">
                        <span>{new Date(lesson.date).toLocaleDateString()}</span>
                        <span className="font-semibold">{lesson.amount}€</span>
                      </div>
                      {lesson.comment ? <span className="text-sm text-muted-foreground">{lesson.comment}</span> : null}
                    </Label>
                  </div>
                ))
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmit}>Payer avec le pack</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
