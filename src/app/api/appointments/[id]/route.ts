import { NextRequest, NextResponse } from "next/server";
import { AppointmentService } from "@/lib/appointment/service";
import { updateAppointmentSchema } from "@/lib/appointment/types";
import { getServerUser } from "@/lib/auth/config";

const appointmentService = new AppointmentService();

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

    const appointment = await appointmentService.getAppointmentById(params.id);
    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(appointment);
  } catch (error: any) {
    console.error("Failed to fetch appointment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch appointment" },
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
    const validated = updateAppointmentSchema.parse({
      ...data,
      lastModifiedBy: user.id,
    });

    const appointment = await appointmentService.updateAppointment(
      params.id,
      validated
    );
    return NextResponse.json(appointment);
  } catch (error: any) {
    console.error("Failed to update appointment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update appointment" },
      { status: error.code === "APPOINTMENT_CONFLICT" ? 409 : 400 }
    );
  }
}

export async function DELETE(
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

    await appointmentService.deleteAppointment(params.id);
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("Failed to delete appointment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete appointment" },
      { status: 400 }
    );
  }
} 