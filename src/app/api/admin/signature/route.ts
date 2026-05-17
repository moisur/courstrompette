import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import fs from "fs/promises";
import path from "path";

// Location on disk for the persistent signature
const SIGNATURE_FILENAME = "signature-sap.png";
const PUBLIC_DIR = path.join(process.cwd(), "public");
const SIGNATURE_PATH = path.join(PUBLIC_DIR, SIGNATURE_FILENAME);

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    // Check if signature file exists
    await fs.access(SIGNATURE_PATH);
    return NextResponse.json({
      exists: true,
      url: `/${SIGNATURE_FILENAME}?t=${Date.now()}`,
    });
  } catch {
    return NextResponse.json({ exists: false });
  }
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let body: { image: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Format invalide" }, { status: 400 });
  }

  if (!body.image || !body.image.startsWith("data:image/png;base64,")) {
    return NextResponse.json({ error: "Image base64 PNG valide requise" }, { status: 400 });
  }

  try {
    // Ensure public folder exists
    await fs.mkdir(PUBLIC_DIR, { recursive: true });

    // Remove the data URI prefix
    const base64Data = body.image.replace(/^data:image\/png;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Write file to public/signature-sap.png
    await fs.writeFile(SIGNATURE_PATH, new Uint8Array(buffer));

    return NextResponse.json({
      success: true,
      url: `/${SIGNATURE_FILENAME}?t=${Date.now()}`,
      message: "Signature enregistrée avec succès !",
    });
  } catch (error) {
    console.error("Error saving signature:", error);
    return NextResponse.json({ error: "Échec de l'enregistrement sur le serveur" }, { status: 500 });
  }
}
