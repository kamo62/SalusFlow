import { z } from "zod";

// Enums
export const PatientStatusEnum = z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]);
export type PatientStatusType = z.infer<typeof PatientStatusEnum>;

export const AllergySeverityEnum = z.enum(["MILD", "MODERATE", "SEVERE"]);
export type AllergySeverityType = z.infer<typeof AllergySeverityEnum>;

export const ConditionStatusEnum = z.enum(["ACTIVE", "MANAGED", "RESOLVED"]);
export type ConditionStatusType = z.infer<typeof ConditionStatusEnum>;

// Base Schemas
export const patientSchema = z.object({
  id: z.string(),
  practiceId: z.string(),
  title: z.string().nullable(),
  firstName: z.string(),
  lastName: z.string(),
  idNumber: z.string(),
  dateOfBirth: z.date(),
  gender: z.string(),
  
  // Contact Information
  email: z.string().email().nullable(),
  mobileNumber: z.string(),
  altNumber: z.string().nullable(),
  
  // Address
  addressLine1: z.string().nullable(),
  addressLine2: z.string().nullable(),
  suburb: z.string().nullable(),
  city: z.string().nullable(),
  postalCode: z.string().nullable(),
  province: z.string().nullable(),
  
  // Medical Aid
  hasMedicalAid: z.boolean(),
  medicalAidScheme: z.string().nullable(),
  medicalAidNumber: z.string().nullable(),
  medicalAidPlan: z.string().nullable(),
  
  // Main Member
  mainMemberFirstName: z.string().nullable(),
  mainMemberLastName: z.string().nullable(),
  mainMemberIdNumber: z.string().nullable(),
  mainMemberRelation: z.string().nullable(),
  
  // Emergency Contact
  emergencyName: z.string(),
  emergencyRelation: z.string(),
  emergencyContact: z.string(),
  emergencyAltContact: z.string().nullable(),
  
  // Administrative
  registrationDate: z.date(),
  lastVisit: z.date().nullable(),
  status: PatientStatusEnum,
  notes: z.string().nullable(),
  
  // Audit
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string(),
  lastModifiedBy: z.string(),
});

export const patientDocumentSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  name: z.string(),
  type: z.string(),
  fileUrl: z.string(),
  uploadedAt: z.date(),
  uploadedBy: z.string(),
  notes: z.string().nullable(),
});

export const patientAllergySchema = z.object({
  id: z.string(),
  patientId: z.string(),
  name: z.string(),
  severity: AllergySeverityEnum,
  notes: z.string().nullable(),
});

export const patientConditionSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  name: z.string(),
  diagnosedDate: z.date().nullable(),
  status: ConditionStatusEnum,
  notes: z.string().nullable(),
});

// Input Schemas
export const createPatientSchema = patientSchema.omit({
  id: true,
  registrationDate: true,
  lastVisit: true,
  createdAt: true,
  updatedAt: true,
});

export const updatePatientSchema = patientSchema.partial().omit({
  id: true,
  registrationDate: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
});

// Types
export type Patient = z.infer<typeof patientSchema>;
export type PatientDocument = z.infer<typeof patientDocumentSchema>;
export type PatientAllergy = z.infer<typeof patientAllergySchema>;
export type PatientCondition = z.infer<typeof patientConditionSchema>;
export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;

// Utility Types
export interface PatientWithRelations extends Patient {
  practice: {
    id: string;
    name: string;
  };
  documents: PatientDocument[];
  allergies: PatientAllergy[];
  conditions: PatientCondition[];
  appointments: {
    id: string;
    startTime: Date;
    endTime: Date;
    status: string;
  }[];
}

// Error Types
export class PatientError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "PatientError";
  }
}

export class PatientValidationError extends PatientError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "PATIENT_VALIDATION", details);
    this.name = "PatientValidationError";
  }
}

export class PatientNotFoundError extends PatientError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "PATIENT_NOT_FOUND", details);
    this.name = "PatientNotFoundError";
  }
} 