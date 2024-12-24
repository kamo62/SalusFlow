import { SyncOrchestrator } from "@/lib/sync";
import { SyncChange, SyncResult, SyncedRecord } from "@/lib/sync/types";
import { prisma } from "@/lib/db/prisma";
import { Appointment } from "./types";
import { logger as log } from "@/lib/logger";

const BATCH_SIZE = 50;

interface AppointmentSyncData {
  id: string;
  practice_id: string;
  practitioner_id: string;
  patient_id: string;
  status_id: string;
  type_id: string;
  start_time: string;
  end_time: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  last_modified_by: string;
}

export class AppointmentSync {
  private syncOrchestrator: SyncOrchestrator;

  constructor() {
    this.syncOrchestrator = new SyncOrchestrator();
  }

  async syncAppointments(practiceId: string): Promise<void> {
    try {
      log.info("Starting appointment sync", { practiceId });

      const appointments = await prisma.appointment.findMany({
        where: { practiceId },
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

      // Process in batches
      for (let i = 0; i < appointments.length; i += BATCH_SIZE) {
        const batch = appointments.slice(i, i + BATCH_SIZE);
        await this.syncBatch(batch);
      }

      log.info("Completed appointment sync", { 
        practiceId,
        count: appointments.length 
      });
    } catch (error) {
      log.error("Failed to sync appointments", { error, practiceId });
      throw error;
    }
  }

  private async syncBatch(appointments: Appointment[]): Promise<void> {
    const changes: SyncChange<AppointmentSyncData>[] = appointments.map(appointment => ({
      table_name: "appointments",
      record_id: appointment.id,
      data: {
        id: appointment.id,
        practice_id: appointment.practiceId,
        practitioner_id: appointment.practitionerId,
        patient_id: appointment.patientId,
        status_id: appointment.statusId,
        type_id: appointment.typeId,
        start_time: appointment.startTime,
        end_time: appointment.endTime,
        notes: appointment.notes,
        created_at: appointment.createdAt,
        updated_at: appointment.updatedAt,
        created_by: appointment.createdBy,
        last_modified_by: appointment.lastModifiedBy
      }
    }));

    const results = await this.syncOrchestrator.sync({ changes });
    
    // Handle failed syncs
    if (!results.success) {
      log.error("Failed to sync appointments", { error: results.error });
      throw results.error;
    }
  }
} 