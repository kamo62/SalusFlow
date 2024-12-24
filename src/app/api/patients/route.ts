import { NextRequest, NextResponse } from "next/server";
import { PatientService } from "@/lib/patient/service";
import { createPatientSchema } from "@/lib/patient/types";
import { getServerUser } from "@/lib/auth/config";

const patientService = new PatientService();

export async function POST(req: NextRequest) {
  try {
    const user = await getServerUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await req.json();
    const validated = createPatientSchema.parse({
      ...data,
      createdBy: user.id,
      lastModifiedBy: user.id,
    });

    const patient = await patientService.createPatient(validated);
    return NextResponse.json(patient);
  } catch (error: any) {
    console.error("Failed to create patient:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create patient" },
      { status: error.code === "PATIENT_VALIDATION" ? 409 : 400 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getServerUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const practiceId = searchParams.get("practiceId");
    const searchTerm = searchParams.get("search");
    const name = searchParams.get("name");
    const idNumber = searchParams.get("idNumber");
    const medicalAidNumber = searchParams.get("medicalAidNumber");
    const status = searchParams.get("status");

    if (!practiceId) {
      return NextResponse.json(
        { error: "Practice ID is required" },
        { status: 400 }
      );
    }

    let patients;
    if (name || idNumber || medicalAidNumber || status) {
      // Advanced search
      patients = await patientService.searchPatients(practiceId, {
        name: name || undefined,
        idNumber: idNumber || undefined,
        medicalAidNumber: medicalAidNumber || undefined,
        status: status || undefined,
      });
    } else {
      // Basic search
      patients = await patientService.getPracticePatients(
        practiceId,
        searchTerm || undefined
      );
    }

    return NextResponse.json(patients);
  } catch (error: any) {
    console.error("Failed to fetch patients:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch patients" },
      { status: 400 }
    );
  }
} 