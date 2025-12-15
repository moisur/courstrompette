"use client";

import { useBooking } from "@/context/BookingContext";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import Formulaire from "./Formulaire";

export function BookingModal() {
    const { isOpen, closeModal } = useBooking();

    return (
        <Dialog open={isOpen} onOpenChange={closeModal}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center text-orange-600">
                        Réservez Votre Cours Gratuit
                    </DialogTitle>
                    <DialogDescription className="text-center text-gray-500 mb-4">
                        Remplissez ce formulaire pour planifier votre séance découverte.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Formulaire isModal />
                </div>
            </DialogContent>
        </Dialog>
    );
}
