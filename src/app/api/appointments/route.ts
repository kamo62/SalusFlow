import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from '@supabase/ssr';
import { cookies } from "next/headers";
import { z } from "zod";
import { AppointmentService } from "@/lib/appointment/service";

const appointmentSchema = z.object({
  practitionerId: z.string(),
  patientId: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  notes: z.string().optional(),
  practiceId: z.string(),
  status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED"]),
});

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const practiceId = searchParams.get("practiceId");
    const practitionerId = searchParams.get("practitionerId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const service = new AppointmentService(supabase);

    // Filter appointments based on user role and parameters
    let appointments;
    switch (user.role) {
      case "SYSTEM_ADMIN":
      case "PRACTICE_ADMIN":
        appointments = await service.getAppointments({
          practiceId: practiceId || undefined,
          practitionerId: practitionerId || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        });
        break;
      case "PRACTITIONER":
        appointments = await service.getAppointments({
          practitionerId: user.id,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        });
        break;
      case "PATIENT":
        appointments = await service.getAppointments({
          patientId: user.id,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        });
        break;
      default:
        return NextResponse.json({ error: "Invalid role" }, { status: 403 });
    }

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Error in GET /api/appointments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const validatedData = appointmentSchema.parse(json);

    const service = new AppointmentService(supabase);

    // Check permissions based on role
    if (user.role === "PATIENT" && validatedData.patientId !== user.id) {
      return NextResponse.json(
        { error: "Cannot create appointments for other patients" },
        { status: 403 }
      );
    }

    if (
      user.role === "PRACTITIONER" &&
      validatedData.practitionerId !== user.id
    ) {
      return NextResponse.json(
        { error: "Cannot create appointments for other practitioners" },
        { status: 403 }
      );
    }

    const appointment = await service.createAppointment(validatedData);
    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Error in POST /api/appointments:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid appointment data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 