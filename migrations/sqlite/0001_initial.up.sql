-- Create tables with SQLite compatible types
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'doctor', 'reception', 'billing')),
    contact_number TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE doctors (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    registration_number TEXT NOT NULL,
    specialization TEXT,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'unavailable')),
    created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    UNIQUE(user_id),
    UNIQUE(registration_number)
);

CREATE TABLE consultation_types (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    default_fee REAL,
    duration_minutes INTEGER DEFAULT 30,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE doctor_consultation_fees (
    id TEXT PRIMARY KEY,
    doctor_id TEXT NOT NULL REFERENCES doctors(id),
    consultation_type_id TEXT NOT NULL REFERENCES consultation_types(id),
    fee REAL NOT NULL,
    created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    UNIQUE(doctor_id, consultation_type_id)
);

CREATE TABLE patients (
    id TEXT PRIMARY KEY,
    id_number TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    date_of_birth TEXT NOT NULL,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    contact_number TEXT,
    email TEXT,
    address TEXT,
    primary_doctor_id TEXT REFERENCES doctors(id),
    emergency_contact_name TEXT,
    emergency_contact_number TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE appointments (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL REFERENCES patients(id),
    doctor_id TEXT NOT NULL REFERENCES doctors(id),
    consultation_type_id TEXT NOT NULL REFERENCES consultation_types(id),
    scheduled_time TEXT NOT NULL,
    status TEXT DEFAULT 'scheduled' 
        CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no-show')),
    notes TEXT,
    created_by TEXT NOT NULL REFERENCES users(id),
    created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE consultations (
    id TEXT PRIMARY KEY,
    appointment_id TEXT NOT NULL REFERENCES appointments(id),
    patient_id TEXT NOT NULL REFERENCES patients(id),
    doctor_id TEXT NOT NULL REFERENCES doctors(id),
    consultation_type_id TEXT NOT NULL REFERENCES consultation_types(id),
    clinical_notes TEXT,
    created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    UNIQUE(appointment_id)
);

CREATE TABLE medical_history (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL REFERENCES patients(id),
    condition_type TEXT NOT NULL CHECK (condition_type IN ('condition', 'allergy', 'note')),
    description TEXT NOT NULL,
    created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE sync_log (
    id TEXT PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('insert', 'update', 'delete')),
    local_checksum TEXT NOT NULL,
    remote_checksum TEXT,
    conflict_status TEXT DEFAULT 'pending' 
        CHECK (conflict_status IN ('pending', 'resolved', 'conflict')),
    resolution_type TEXT 
        CHECK (resolution_type IN ('local', 'remote', 'manual', NULL)),
    resolved_by TEXT REFERENCES users(id),
    synced INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    resolved_at TEXT
);

CREATE TABLE sync_conflicts (
    id TEXT PRIMARY KEY,
    sync_log_id TEXT NOT NULL REFERENCES sync_log(id),
    local_data TEXT NOT NULL,
    remote_data TEXT NOT NULL,
    resolution_data TEXT,
    created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    resolved_at TEXT
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
CREATE INDEX idx_sync_log_unsynced ON sync_log(synced);
CREATE INDEX idx_sync_log_conflicts ON sync_log(conflict_status);
CREATE INDEX idx_sync_conflicts_log ON sync_conflicts(sync_log_id);

-- Seed initial data
INSERT INTO consultation_types (id, name, description, duration_minutes, status) VALUES
    ('00000000-0000-0000-0000-000000000001', 'Initial Consultation', 'First visit with the doctor', 30, 'active'),
    ('00000000-0000-0000-0000-000000000002', 'Follow-up', 'Follow-up consultation', 30, 'active'),
    ('00000000-0000-0000-0000-000000000003', 'Procedure', 'Medical procedure', 30, 'active');

-- Create admin user (password to be set via application)
INSERT INTO users (id, email, full_name, role, status) VALUES
    ('00000000-0000-0000-0000-000000000001', 'admin@practice.local', 'System Administrator', 'admin', 'active'); 