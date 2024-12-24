import { z } from "zod";

// Enums
export const AppointmentStatusEnum = z.enum([
  "SCHEDULED",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW"
]);

export const BillingStatusEnum = z.enum([
  "PENDING",
  "BILLED",
  "SUBMITTED",
  "PAID",
  "PARTIAL",
  "REJECTED",
  "CANCELLED"
]);

export type AppointmentStatusType = 
  | "SCHEDULED"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export type BillingStatusType =
  | "PENDING"
  | "BILLED"
  | "PAID"
  | "CANCELLED";

// Base Schemas
export const appointmentTypeSchema = z.object({
  id: z.string().uuid(),
  practiceId: z.string().uuid(),
  name: z.string().min(1),
  duration: z.number().min(1),  // in minutes
  color: z.string(),
  isDefault: z.boolean(),
  isActive: z.boolean(),
  price: z.number().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const consultationSchema = z.object({
  id: z.string().uuid(),
  appointmentId: z.string().uuid(),
  notes: z.string().nullable(),
  prescription: z.string().nullable(),
  billingStatus: BillingStatusEnum,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const appointmentSchema = z.object({
  id: z.string().uuid(),
  practiceId: z.string().uuid(),
  practitionerId: z.string().uuid(),
  patientId: z.string().uuid(),
  patientName: z.string(),
  statusId: AppointmentStatusEnum,
  typeId: z.string().uuid(),
  type: appointmentTypeSchema,
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  notes: z.string().nullable(),
  consultation: consultationSchema.nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
  lastModifiedBy: z.string().uuid()
});

export type AppointmentType = z.infer<typeof appointmentTypeSchema>;
export type Consultation = z.infer<typeof consultationSchema>;
export type Appointment = z.infer<typeof appointmentSchema>;

// Input Schemas
export const createAppointmentSchema = z.object({
  practiceId: z.string().uuid(),
  practitionerId: z.string().uuid(),
  patientId: z.string().uuid(),
  statusId: AppointmentStatusEnum,
  typeId: z.string().uuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  notes: z.string().nullable(),
  userId: z.string().uuid()
}).refine(
  (data) => new Date(data.startTime) < new Date(data.endTime),
  {
    message: "End time must be after start time",
    path: ["endTime"]
  }
);

export const updateAppointmentSchema = z.object({
  id: z.string().uuid(),
  statusId: AppointmentStatusEnum.optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  notes: z.string().nullable().optional(),
  userId: z.string().uuid()
}).refine(
  (data) => {
    if (data.startTime && data.endTime) {
      return new Date(data.startTime) < new Date(data.endTime);
    }
    return true;
  },
  {
    message: "End time must be after start time",
    path: ["endTime"]
  }
);

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;

// Error Types
export class AppointmentError extends Error {
  code: string = "APPOINTMENT_ERROR";
  details?: any;

  constructor(message: string) {
    super(message);
    this.name = "AppointmentError";
  }
}

export class AppointmentConflictError extends AppointmentError {
  constructor(message: string, details?: any) {
    super(message);
    this.code = "APPOINTMENT_CONFLICT";
    this.details = details;
    this.name = "AppointmentConflictError";
  }
}

export class AppointmentValidationError extends AppointmentError {
  constructor(message: string, details?: any) {
    super(message);
    this.code = "VALIDATION_ERROR";
    this.details = details;
    this.name = "AppointmentValidationError";
  }
}

// Utility Types
export interface AppointmentConflict {
  appointmentId: string;
  startTime: string;
  endTime: string;
  patientName: string;
  type: string;
}

export interface AppointmentTimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  conflicts?: AppointmentConflict[];
}

export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
} 