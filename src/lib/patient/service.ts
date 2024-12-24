import { prisma } from "@/lib/db/prisma";
import { supabase } from "@/lib/db/supabase";
import { 
  Patient,
  PatientWithRelations,
  CreatePatientInput,
  UpdatePatientInput,
  PatientError,
  PatientValidationError,
  PatientNotFoundError,
} from "./types";

export class PatientService {
  /**
   * Create a new patient
   */
  async createPatient(
    data: CreatePatientInput
  ): Promise<PatientWithRelations> {
    try {
      // Check for existing patient with same ID number
      const existing = await prisma.patient.findFirst({
        where: {
          practiceId: data.practiceId,
          idNumber: data.idNumber,
        },
      });

      if (existing) {
        throw new PatientValidationError(
          "Patient with this ID number already exists",
          { idNumber: data.idNumber }
        );
      }

      // Create patient in Prisma
      const patient = await prisma.patient.create({
        data,
        include: {
          practice: {
            select: {
              id: true,
              name: true,
            },
          },
          documents: true,
          allergies: true,
          conditions: true,
          appointments: {
            select: {
              id: true,
              startTime: true,
              endTime: true,
              status: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      // Sync to Supabase
      await this.syncToSupabase(patient);

      return patient;
    } catch (error) {
      if (error instanceof PatientError) {
        throw error;
      }
      throw new PatientError(
        "Failed to create patient",
        "CREATE_FAILED",
        { error }
      );
    }
  }

  /**
   * Update an existing patient
   */
  async updatePatient(
    id: string,
    data: UpdatePatientInput
  ): Promise<PatientWithRelations> {
    try {
      // Check if patient exists
      const existing = await prisma.patient.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new PatientNotFoundError("Patient not found");
      }

      // If updating ID number, check for duplicates
      if (data.idNumber && data.idNumber !== existing.idNumber) {
        const duplicate = await prisma.patient.findFirst({
          where: {
            practiceId: existing.practiceId,
            idNumber: data.idNumber,
            id: { not: id },
          },
        });

        if (duplicate) {
          throw new PatientValidationError(
            "Another patient with this ID number exists",
            { idNumber: data.idNumber }
          );
        }
      }

      // Update in Prisma
      const updated = await prisma.patient.update({
        where: { id },
        data,
        include: {
          practice: {
            select: {
              id: true,
              name: true,
            },
          },
          documents: true,
          allergies: true,
          conditions: true,
          appointments: {
            select: {
              id: true,
              startTime: true,
              endTime: true,
              status: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      // Sync to Supabase
      await this.syncToSupabase(updated);

      return updated;
    } catch (error) {
      if (error instanceof PatientError) {
        throw error;
      }
      throw new PatientError(
        "Failed to update patient",
        "UPDATE_FAILED",
        { error }
      );
    }
  }

  /**
   * Get a patient by ID
   */
  async getPatientById(id: string): Promise<PatientWithRelations | null> {
    try {
      return await prisma.patient.findUnique({
        where: { id },
        include: {
          practice: {
            select: {
              id: true,
              name: true,
            },
          },
          documents: true,
          allergies: true,
          conditions: true,
          appointments: {
            select: {
              id: true,
              startTime: true,
              endTime: true,
              status: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      throw new PatientError(
        "Failed to fetch patient",
        "FETCH_FAILED",
        { error }
      );
    }
  }

  /**
   * Get patients for a practice
   */
  async getPracticePatients(
    practiceId: string,
    searchTerm?: string
  ): Promise<PatientWithRelations[]> {
    try {
      const where: any = { practiceId };
      
      if (searchTerm) {
        where.OR = [
          { firstName: { contains: searchTerm, mode: "insensitive" } },
          { lastName: { contains: searchTerm, mode: "insensitive" } },
          { idNumber: { contains: searchTerm } },
          { medicalAidNumber: { contains: searchTerm } },
        ];
      }

      return await prisma.patient.findMany({
        where,
        include: {
          practice: {
            select: {
              id: true,
              name: true,
            },
          },
          documents: true,
          allergies: true,
          conditions: true,
          appointments: {
            select: {
              id: true,
              startTime: true,
              endTime: true,
              status: {
                select: {
                  name: true,
                },
              },
            },
            orderBy: {
              startTime: "desc",
            },
            take: 5, // Only get last 5 appointments
          },
        },
        orderBy: {
          lastName: "asc",
        },
      });
    } catch (error) {
      throw new PatientError(
        "Failed to fetch practice patients",
        "FETCH_FAILED",
        { error }
      );
    }
  }

  /**
   * Search patients by various criteria
   */
  async searchPatients(
    practiceId: string,
    criteria: {
      name?: string;
      idNumber?: string;
      medicalAidNumber?: string;
      status?: string;
    }
  ): Promise<PatientWithRelations[]> {
    try {
      const where: any = { practiceId };
      const OR: any[] = [];

      if (criteria.name) {
        const [firstName, lastName] = criteria.name.split(" ");
        if (lastName) {
          OR.push(
            {
              firstName: { contains: firstName, mode: "insensitive" },
              lastName: { contains: lastName, mode: "insensitive" },
            },
            {
              firstName: { contains: lastName, mode: "insensitive" },
              lastName: { contains: firstName, mode: "insensitive" },
            }
          );
        } else {
          OR.push(
            { firstName: { contains: firstName, mode: "insensitive" } },
            { lastName: { contains: firstName, mode: "insensitive" } }
          );
        }
      }

      if (criteria.idNumber) {
        OR.push({ idNumber: { contains: criteria.idNumber } });
      }

      if (criteria.medicalAidNumber) {
        OR.push({ medicalAidNumber: { contains: criteria.medicalAidNumber } });
      }

      if (criteria.status) {
        where.status = criteria.status;
      }

      if (OR.length > 0) {
        where.OR = OR;
      }

      return await prisma.patient.findMany({
        where,
        include: {
          practice: {
            select: {
              id: true,
              name: true,
            },
          },
          documents: true,
          allergies: true,
          conditions: true,
          appointments: {
            select: {
              id: true,
              startTime: true,
              endTime: true,
              status: {
                select: {
                  name: true,
                },
              },
            },
            orderBy: {
              startTime: "desc",
            },
            take: 5,
          },
        },
        orderBy: {
          lastName: "asc",
        },
      });
    } catch (error) {
      throw new PatientError(
        "Failed to search patients",
        "SEARCH_FAILED",
        { error }
      );
    }
  }

  /**
   * Archive a patient
   */
  async archivePatient(id: string): Promise<void> {
    try {
      await prisma.patient.update({
        where: { id },
        data: { status: "ARCHIVED" },
      });

      // Sync to Supabase
      await supabase
        .from("patients")
        .update({ status: "ARCHIVED" })
        .eq("id", id);
    } catch (error) {
      throw new PatientError(
        "Failed to archive patient",
        "ARCHIVE_FAILED",
        { error }
      );
    }
  }

  /**
   * Add allergy to patient
   */
  async addAllergy(
    patientId: string,
    data: { name: string; severity: string; notes?: string }
  ): Promise<void> {
    try {
      await prisma.patientAllergy.create({
        data: {
          ...data,
          patientId,
        },
      });
    } catch (error) {
      throw new PatientError(
        "Failed to add allergy",
        "ADD_ALLERGY_FAILED",
        { error }
      );
    }
  }

  /**
   * Add condition to patient
   */
  async addCondition(
    patientId: string,
    data: { name: string; diagnosedDate?: Date; notes?: string }
  ): Promise<void> {
    try {
      await prisma.patientCondition.create({
        data: {
          ...data,
          patientId,
        },
      });
    } catch (error) {
      throw new PatientError(
        "Failed to add condition",
        "ADD_CONDITION_FAILED",
        { error }
      );
    }
  }

  /**
   * Sync patient to Supabase
   */
  private async syncToSupabase(patient: Patient): Promise<void> {
    try {
      const { error } = await supabase
        .from("patients")
        .upsert({
          id: patient.id,
          practice_id: patient.practiceId,
          title: patient.title,
          first_name: patient.firstName,
          last_name: patient.lastName,
          id_number: patient.idNumber,
          date_of_birth: patient.dateOfBirth,
          gender: patient.gender,
          email: patient.email,
          mobile_number: patient.mobileNumber,
          alt_number: patient.altNumber,
          address_line1: patient.addressLine1,
          address_line2: patient.addressLine2,
          suburb: patient.suburb,
          city: patient.city,
          postal_code: patient.postalCode,
          province: patient.province,
          has_medical_aid: patient.hasMedicalAid,
          medical_aid_scheme: patient.medicalAidScheme,
          medical_aid_number: patient.medicalAidNumber,
          medical_aid_plan: patient.medicalAidPlan,
          main_member_first_name: patient.mainMemberFirstName,
          main_member_last_name: patient.mainMemberLastName,
          main_member_id_number: patient.mainMemberIdNumber,
          main_member_relation: patient.mainMemberRelation,
          emergency_name: patient.emergencyName,
          emergency_relation: patient.emergencyRelation,
          emergency_contact: patient.emergencyContact,
          emergency_alt_contact: patient.emergencyAltContact,
          registration_date: patient.registrationDate,
          last_visit: patient.lastVisit,
          status: patient.status,
          notes: patient.notes,
          created_at: patient.createdAt,
          updated_at: patient.updatedAt,
          created_by: patient.createdBy,
          last_modified_by: patient.lastModifiedBy,
        });

      if (error) throw error;
    } catch (error) {
      console.error("Failed to sync patient to Supabase:", error);
      // Don't throw - we don't want to fail the main operation
    }
  }
} 