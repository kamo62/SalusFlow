-- Sync schema changes from Prisma to Supabase

-- Patient table changes
ALTER TABLE patients
ADD COLUMN IF NOT EXISTS blood_type text,
ADD COLUMN IF NOT EXISTS allergies text[],
ADD COLUMN IF NOT EXISTS chronic_conditions text[],
ADD COLUMN IF NOT EXISTS disabilities text[],
ADD COLUMN IF NOT EXISTS preferred_language text,
ADD COLUMN IF NOT EXISTS occupation text,
ADD COLUMN IF NOT EXISTS marital_status text,
ADD COLUMN IF NOT EXISTS nationality text,
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS family_doctor text,
ADD COLUMN IF NOT EXISTS referred_by text,
ADD COLUMN IF NOT EXISTS referred_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS last_visit timestamp with time zone,
ADD COLUMN IF NOT EXISTS next_visit timestamp with time zone;

-- Create enum types if they don't exist
DO $$ BEGIN
    CREATE TYPE blood_type AS ENUM ('A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE');
    CREATE TYPE marital_status AS ENUM ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'SEPARATED', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create junction tables for many-to-many relationships
CREATE TABLE IF NOT EXISTS communication_preferences (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
    type text NOT NULL,
    value text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS risk_factors (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
    factor text NOT NULL,
    details text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS family_history (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
    condition text NOT NULL,
    relationship text NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Practice table changes
ALTER TABLE practices
ADD COLUMN IF NOT EXISTS settings jsonb,
ADD COLUMN IF NOT EXISTS bank_details jsonb,
ADD COLUMN IF NOT EXISTS billing_settings jsonb;

-- Doctor table changes
ALTER TABLE doctors
ALTER COLUMN qualifications TYPE text[] USING qualifications::text[];

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_doctors_speciality ON doctors(speciality);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date_range ON appointments(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_patients_search ON patients(first_name, last_name);

-- Add RLS policies
ALTER TABLE practices ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

-- Practice access policy
CREATE POLICY practice_access_policy ON practices
    FOR ALL
    USING (id IN (
        SELECT practice_id 
        FROM practice_users 
        WHERE user_id = auth.uid()
    ));

-- Patient access policy
CREATE POLICY patient_access_policy ON patients
    FOR ALL
    USING (practice_id IN (
        SELECT practice_id 
        FROM practice_users 
        WHERE user_id = auth.uid()
    ));

-- Appointment access policy
CREATE POLICY appointment_access_policy ON appointments
    FOR ALL
    USING (practice_id IN (
        SELECT practice_id 
        FROM practice_users 
        WHERE user_id = auth.uid()
    ));

-- Doctor access policy
CREATE POLICY doctor_access_policy ON doctors
    FOR ALL
    USING (practice_id IN (
        SELECT practice_id 
        FROM practice_users 
        WHERE user_id = auth.uid()
    ));

-- Update triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to new tables
CREATE TRIGGER update_communication_preferences_updated_at
    BEFORE UPDATE ON communication_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_risk_factors_updated_at
    BEFORE UPDATE ON risk_factors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_history_updated_at
    BEFORE UPDATE ON family_history
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Alter the UserRole enum type
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
CREATE TYPE "UserRole" AS ENUM ('PATIENT', 'PRACTITIONER', 'PRACTICE_ADMIN', 'SYSTEM_ADMIN');

-- Convert existing roles to new values
ALTER TABLE "users" ALTER COLUMN role TYPE "UserRole" USING
  CASE role::text
    WHEN 'USER' THEN 'PATIENT'::text
    WHEN 'DOCTOR' THEN 'PRACTITIONER'::text
    WHEN 'ADMIN' THEN 'PRACTICE_ADMIN'::text
    WHEN 'SUPERADMIN' THEN 'SYSTEM_ADMIN'::text
  END::"UserRole";

-- Drop old enum type
DROP TYPE "UserRole_old"; 