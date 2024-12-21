-- Drop triggers
DROP TRIGGER IF EXISTS track_medical_history_changes ON medical_history;
DROP TRIGGER IF EXISTS track_consultation_changes ON consultations;
DROP TRIGGER IF EXISTS track_appointment_changes ON appointments;
DROP TRIGGER IF EXISTS track_patient_changes ON patients;

-- Drop trigger function
DROP FUNCTION IF EXISTS track_changes();

-- Drop tables in reverse order
DROP TABLE IF EXISTS sync_conflicts;
DROP TABLE IF EXISTS sync_log;
DROP TABLE IF EXISTS medical_history;
DROP TABLE IF EXISTS consultations;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS doctor_consultation_fees;
DROP TABLE IF EXISTS patients;
DROP TABLE IF EXISTS consultation_types;
DROP TABLE IF EXISTS doctors;
DROP TABLE IF EXISTS users;

-- Drop ENUMs
DROP TYPE IF EXISTS sync_status;
DROP TYPE IF EXISTS sync_resolution;
DROP TYPE IF EXISTS sync_operation;
DROP TYPE IF EXISTS condition_type;
DROP TYPE IF EXISTS appointment_status;
DROP TYPE IF EXISTS doctor_status;
DROP TYPE IF EXISTS record_status;
DROP TYPE IF EXISTS user_role; 