import { prisma } from "@/lib/db/prisma";
import { 
  AppointmentConflict,
  CreateAppointmentInput,
  ValidationResult
} from "./types";
import { logger as log } from "@/lib/logger";

/**
 * Validate appointment time
 */
export async function validateAppointmentTime(
  input: CreateAppointmentInput
): Promise<ValidationResult> {
  const errors: string[] = [];
  const startTime = new Date(input.startTime);
  const endTime = new Date(input.endTime);

  // Check if practitioner exists and is active
  const practitioner = await prisma.doctor.findUnique({
    where: { id: input.practitionerId }
  });

  if (!practitioner) {
    errors.push("Practitioner not found");
  }

  // Check if patient exists and is active
  const patient = await prisma.patient.findUnique({
    where: { id: input.patientId }
  });

  if (!patient) {
    errors.push("Patient not found");
  }

  // Check if appointment type exists
  const appointmentType = await prisma.appointmentType.findUnique({
    where: { id: input.typeId }
  });

  if (!appointmentType) {
    errors.push("Appointment type not found");
  }

  // Validate time slot
  if (startTime >= endTime) {
    errors.push("End time must be after start time");
  }

  if (startTime < new Date()) {
    errors.push("Cannot schedule appointments in the past");
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}

/**
 * Check for appointment conflicts
 */
export async function getAppointmentConflicts(
  input: CreateAppointmentInput
): Promise<AppointmentConflict[]> {
  const startTime = new Date(input.startTime);
  const endTime = new Date(input.endTime);

  const existingAppointments = await prisma.appointment.findMany({
    where: {
      practitionerId: input.practitionerId,
      AND: [
        { startTime: { lte: endTime } },
        { endTime: { gte: startTime } },
        {
          statusId: {
            in: ["SCHEDULED", "CONFIRMED", "IN_PROGRESS"]
          }
        }
      ]
    },
    include: {
      type: true,
      patient: {
        select: {
          firstName: true,
          lastName: true
        }
      }
    }
  });

  return existingAppointments.map((apt: {
    id: string;
    startTime: Date;
    endTime: Date;
    patient: { firstName: string; lastName: string };
    type: { name: string };
  }) => ({
    appointmentId: apt.id,
    startTime: apt.startTime.toISOString(),
    endTime: apt.endTime.toISOString(),
    patientName: `${apt.patient.firstName} ${apt.patient.lastName}`,
    type: apt.type.name
  }));
} 