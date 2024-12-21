-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types for better data integrity
CREATE TYPE user_role AS ENUM ('admin', 'doctor', 'reception', 'billing');
CREATE TYPE record_status AS ENUM ('active', 'inactive');
CREATE TYPE doctor_status AS ENUM ('available', 'unavailable');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no-show');
CREATE TYPE condition_type AS ENUM ('condition', 'allergy', 'note');
CREATE TYPE sync_operation AS ENUM ('insert', 'update', 'delete');
CREATE TYPE sync_resolution AS ENUM ('local', 'remote', 'manual');
CREATE TYPE sync_status AS ENUM ('pending', 'resolved', 'conflict');

-- Create base tables
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL,
    contact_number TEXT,
    status record_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    registration_number TEXT NOT NULL,
    specialization TEXT,
    status doctor_status DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id),
    UNIQUE(registration_number)
);

CREATE TABLE consultation_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    default_fee DECIMAL(10,2),
    duration_minutes INTEGER DEFAULT 30,
    status record_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE doctor_consultation_fees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES doctors(id),
    consultation_type_id UUID NOT NULL REFERENCES consultation_types(id),
    fee DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(doctor_id, consultation_type_id)
);

CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_number TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    contact_number TEXT,
    email TEXT,
    address TEXT,
    primary_doctor_id UUID REFERENCES doctors(id),
    emergency_contact_name TEXT,
    emergency_contact_number TEXT,
    status record_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id),
    doctor_id UUID NOT NULL REFERENCES doctors(id),
    consultation_type_id UUID NOT NULL REFERENCES consultation_types(id),
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status appointment_status DEFAULT 'scheduled',
    notes TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID NOT NULL REFERENCES appointments(id),
    patient_id UUID NOT NULL REFERENCES patients(id),
    doctor_id UUID NOT NULL REFERENCES doctors(id),
    consultation_type_id UUID NOT NULL REFERENCES consultation_types(id),
    clinical_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(appointment_id)
);

CREATE TABLE medical_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id),
    condition_type condition_type NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sync tables
CREATE TABLE sync_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    operation sync_operation NOT NULL,
    local_checksum TEXT NOT NULL,
    remote_checksum TEXT,
    conflict_status sync_status DEFAULT 'pending',
    resolution_type sync_resolution,
    resolved_by UUID REFERENCES users(id),
    synced BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE sync_conflicts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sync_log_id UUID NOT NULL REFERENCES sync_log(id),
    local_data JSONB NOT NULL,
    remote_data JSONB NOT NULL,
    resolution_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_doctors_user_id ON doctors(user_id);
CREATE INDEX idx_doctors_registration ON doctors(registration_number);
CREATE INDEX idx_consultation_types_status ON consultation_types(status);
CREATE INDEX idx_doctor_fees ON doctor_consultation_fees(doctor_id, consultation_type_id);
CREATE INDEX idx_patients_id_number ON patients(id_number);
CREATE INDEX idx_patients_primary_doctor ON patients(primary_doctor_id);
CREATE INDEX idx_patients_name ON patients(full_name);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_schedule ON appointments(scheduled_time);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_consultations_appointment ON consultations(appointment_id);
CREATE INDEX idx_consultations_patient ON consultations(patient_id);
CREATE INDEX idx_consultations_doctor ON consultations(doctor_id);
CREATE INDEX idx_medical_history_patient ON medical_history(patient_id);
CREATE INDEX idx_sync_log_unsynced ON sync_log(synced) WHERE NOT synced;
CREATE INDEX idx_sync_log_conflicts ON sync_log(conflict_status) WHERE conflict_status = 'conflict';
CREATE INDEX idx_sync_conflicts_log ON sync_conflicts(sync_log_id);

-- Create change tracking trigger function
CREATE OR REPLACE FUNCTION track_changes()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO sync_log (
        table_name, 
        record_id, 
        operation, 
        local_checksum
    ) VALUES (
        TG_TABLE_NAME,
        NEW.id,
        TG_OP::sync_operation,
        md5(row_to_json(NEW)::text)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all relevant tables
CREATE TRIGGER track_patient_changes
    AFTER INSERT OR UPDATE OR DELETE ON patients
    FOR EACH ROW EXECUTE FUNCTION track_changes();

CREATE TRIGGER track_appointment_changes
    AFTER INSERT OR UPDATE OR DELETE ON appointments
    FOR EACH ROW EXECUTE FUNCTION track_changes();

CREATE TRIGGER track_consultation_changes
    AFTER INSERT OR UPDATE OR DELETE ON consultations
    FOR EACH ROW EXECUTE FUNCTION track_changes();

CREATE TRIGGER track_medical_history_changes
    AFTER INSERT OR UPDATE OR DELETE ON medical_history
    FOR EACH ROW EXECUTE FUNCTION track_changes();

-- Seed initial data
INSERT INTO consultation_types (name, description, duration_minutes, status) VALUES
    ('Initial Consultation', 'First visit with the doctor', 30, 'active'),
    ('Follow-up', 'Follow-up consultation', 30, 'active'),
    ('Procedure', 'Medical procedure', 30, 'active');

-- Create admin user (password to be set via application)
INSERT INTO users (email, full_name, role, status) VALUES
    ('admin@practice.local', 'System Administrator', 'admin', 'active'); 