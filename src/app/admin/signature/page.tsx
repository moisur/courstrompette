import React from "react";
import { SignEaseTool } from "@/components/admin/signature/SignEaseLoader";

export const metadata = {
  title: "SignEase — Outil de signature PDF",
  description: "Signez vos factures et attestations de manière persistante sur votre serveur.",
};

export default function AdminSignaturePage() {
  return <SignEaseTool />;
}
