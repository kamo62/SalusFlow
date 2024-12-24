import { AppointmentSync } from "../sync";
import { prisma } from "@/lib/db/prisma";
import { Appointment } from "../types";

jest.mock("@/lib/db/prisma", () => ({
  prisma: {
    appointment: {
      findMany: jest.fn()
    }
  }
}));

describe("AppointmentSync", () => {
  let appointmentSync: AppointmentSync;
  const mockPracticeId = "practice-123";

  beforeEach(() => {
    appointmentSync = new AppointmentSync();
    jest.clearAllMocks();
  });

  describe("syncAppointments", () => {
    it("should sync appointments successfully", async () => {
      const mockAppointments: Partial<Appointment>[] = [
        {
          id: "apt-1",
          practiceId: mockPracticeId,
          practitionerId: "doc-1",
          patientId: "pat-1",
          statusId: "SCHEDULED",
          typeId: "type-1",
          startTime: "2024-03-20T09:00:00Z",
          endTime: "2024-03-20T10:00:00Z",
          createdAt: "2024-03-19T00:00:00Z",
          updatedAt: "2024-03-19T00:00:00Z",
          createdBy: "user-1",
          lastModifiedBy: "user-1"
        }
      ];

      (prisma.appointment.findMany as jest.Mock).mockResolvedValue(mockAppointments);

      await expect(appointmentSync.syncAppointments(mockPracticeId))
        .resolves.not.toThrow();

      expect(prisma.appointment.findMany).toHaveBeenCalledWith({
        where: { practiceId: mockPracticeId },
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
    });

    it("should handle sync errors", async () => {
      const mockError = new Error("Sync failed");
      (prisma.appointment.findMany as jest.Mock).mockRejectedValue(mockError);

      await expect(appointmentSync.syncAppointments(mockPracticeId))
        .rejects.toThrow("Sync failed");
    });
  });
}); 