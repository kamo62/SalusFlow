import { NextRequest, NextResponse } from "next/server";
import { PatientService } from "@/lib/patient/service";
import { updatePatientSchema } from "@/lib/patient/types";
import { getServerUser } from "@/lib/auth/config";

const patientService = new PatientService();

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getServerUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const patient = await patientService.getPatientById(params.id);
    if (!patient) {
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(patient);
  } catch (error: any) {
    console.error("Failed to fetch patient:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch patient" },
      { status: 400 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getServerUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await req.json();
    const validated = updatePatientSchema.parse({
      ...data,
      lastModifiedBy: user.id,
    });

    const patient = await patientService.updatePatient(params.id, validated);
    return NextResponse.json(patient);
  } catch (error: any) {
    console.error("Failed to update patient:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update patient" },
      { status: error.code === "PATIENT_VALIDATION" ? 409 : 400 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getServerUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await req.json();
    const { action } = data;

    switch (action) {
      case "archive":
        await patientService.archivePatient(params.id);
        return new NextResponse(null, { status: 204 });

      case "addAllergy":
        await patientService.addAllergy(params.id, data.allergy);
        return new NextResponse(null, { status: 204 });

      case "addCondition":
        await patientService.addCondition(params.id, data.condition);
        return new NextResponse(null, { status: 204 });

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error("Failed to process patient action:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process patient action" },
      { status: 400 }
    );
  }
} 