import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import fs from "fs/promises";
import path from "path";

// Location on disk for the persistent signature
const SIGNATURE_FILENAME = "signature-sap.png";
const PARAPHE_FILENAME = "paraphe-sap.png";
const PUBLIC_DIR = path.join(process.cwd(), "public");
const SIGNATURE_PATH = path.join(PUBLIC_DIR, SIGNATURE_FILENAME);
const PARAPHE_PATH = path.join(PUBLIC_DIR, PARAPHE_FILENAME);

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let sigExists = false;
  let parExists = false;

  try {
    await fs.access(SIGNATURE_PATH);
    sigExists = true;
  } catch {}

  try {
    await fs.access(PARAPHE_PATH);
    parExists = true;
  } catch {}

  const now = Date.now();
  return NextResponse.json({
    signature: {
      exists: sigExists,
      url: sigExists ? `/${SIGNATURE_FILENAME}?t=${now}` : null,
    },
    paraphe: {
      exists: parExists,
      url: parExists ? `/${PARAPHE_FILENAME}?t=${now}` : null,
    },
    // Backward compatibility
    exists: sigExists,
    url: sigExists ? `/${SIGNATURE_FILENAME}?t=${now}` : null,
  });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let body: { image: string; type?: "signature" | "paraphe" };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Format invalide" }, { status: 400 });
  }

  if (!body.image || !body.image.startsWith("data:image/png;base64,")) {
    return NextResponse.json({ error: "Image base64 PNG valide requise" }, { status: 400 });
  }

  const isParaphe = body.type === "paraphe";
  const targetFilename = isParaphe ? PARAPHE_FILENAME : SIGNATURE_FILENAME;
  const targetPath = isParaphe ? PARAPHE_PATH : SIGNATURE_PATH;

  try {
    // Ensure public folder exists
    await fs.mkdir(PUBLIC_DIR, { recursive: true });

    // Remove the data URI prefix
    const base64Data = body.image.replace(/^data:image\/png;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Write file to public target
    await fs.writeFile(targetPath, new Uint8Array(buffer));

    const now = Date.now();
    return NextResponse.json({
      success: true,
      url: `/${targetFilename}?t=${now}`,
      type: isParaphe ? "paraphe" : "signature",
      message: `${isParaphe ? "Paraphe" : "Signature"} enregistré(e) avec succès !`,
    });
  } catch (error) {
    console.error("Error saving signature/paraphe:", error);
    return NextResponse.json({ error: "Échec de l'enregistrement sur le serveur" }, { status: 500 });
  }
}
