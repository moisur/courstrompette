import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { InscriptionParticulierSchema } from "@/lib/urssaf/schema";
import { UrssafService } from "@/lib/services/urssaf-service";
import { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. Extract and validate data
    const { studentData, urssafData } = body;
    
    // Validate URSSAF data with existing schema
    const validatedUrssaf = InscriptionParticulierSchema.parse(urssafData);
    
    // 2. Create student in DB (Internal)
    // We use prenoms + nomNaissance for the display name
    const fullName = `${validatedUrssaf.prenoms} ${validatedUrssaf.nomNaissance}`.trim();
    
    const student = await prisma.student.create({
      data: {
        name: fullName,
        legacyEmail: validatedUrssaf.adresseMail,
        phone: validatedUrssaf.numeroTelephonePortable || null,
        address: studentData.address || null,
        rate: new Prisma.Decimal(studentData.rate || 40),
        courseDay: studentData.courseDay || null,
        courseHour: studentData.courseHour || null,
        notes: studentData.notes || null,
        declared: true,
      },
    });

    // 3. Prepare URSSAF Payload (ISO Dates etc)
    const payload = {
      ...validatedUrssaf,
      dateNaissance: new Date(validatedUrssaf.dateNaissance).toISOString(),
      nomUsage: validatedUrssaf.nomUsage || undefined,
      lieuNaissance: {
        ...validatedUrssaf.lieuNaissance,
        communeNaissance: validatedUrssaf.lieuNaissance.codePaysNaissance === '99100' 
          ? validatedUrssaf.lieuNaissance.communeNaissance 
          : undefined,
        departementNaissance: validatedUrssaf.lieuNaissance.codePaysNaissance === '99100'
          ? validatedUrssaf.lieuNaissance.departementNaissance
          : undefined
      },
      adressePostale: {
        ...validatedUrssaf.adressePostale,
        numeroVoie: validatedUrssaf.adressePostale.numeroVoie || undefined,
        lettreVoie: validatedUrssaf.adressePostale.lettreVoie || undefined,
        codeTypeVoie: validatedUrssaf.adressePostale.codeTypeVoie || undefined,
        libelleVoie: validatedUrssaf.adressePostale.libelleVoie || undefined,
        complement: validatedUrssaf.adressePostale.complement || undefined,
        lieuDit: validatedUrssaf.adressePostale.lieuDit || undefined,
      }
    };

    // 4. Call URSSAF API
    try {
      const result = await UrssafService.registerClient(payload);
      
      // Update student with URSSAF client ID
      await prisma.urssafClient.create({
        data: {
          id: result.idClient,
          studentId: student.id,
          nomNaissance: validatedUrssaf.nomNaissance,
          prenoms: validatedUrssaf.prenoms,
          email: validatedUrssaf.adresseMail,
          dateNaissance: payload.dateNaissance,
        }
      });

      return NextResponse.json({ 
        success: true, 
        studentId: student.id, 
        urssafClientId: result.idClient 
      });
      
    } catch (urssafError: any) {
      // If URSSAF fails, we still keep the student but return the error
      // Note: We might want to revert the student creation if we wanted strict atomicity,
      // but keeping it allows the user to retry enrollment from the student's file.
      return NextResponse.json({ 
        success: false, 
        studentId: student.id, 
        error: urssafError.data || urssafError.message || "Erreur lors de l'inscription URSSAF"
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error("Full URSSAF Onboarding failed:", error);
    return NextResponse.json({ 
      error: error.message || "Erreur serveur" 
    }, { status: 500 });
  }
}
