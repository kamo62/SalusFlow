# Database Design Documentation

## Overview
The database is designed to support a multi-practice medical practice management system with offline-first capabilities. It uses PostgreSQL for the main database (via Supabase) and SQLite for local storage.

## Key Features
- Multi-practice support with practice-specific settings
- Role-based access control at both system and practice levels
- Patient data sharing between practices (with consent)
- Comprehensive medical records management
- Integrated billing and invoicing
- Document management
- Audit logging
- Offline-first synchronization

## Core Models

### Users and Authentication
- `User`: System-level user accounts
- `Practice`: Medical practices
- `PracticeUser`: Practice-specific user roles and permissions

### Medical Staff
- `Doctor`: Medical practitioners
- `ConsultationType`: Types of consultations offered
- `DoctorConsultationType`: Doctor-specific consultation settings

### Patient Management
- `Patient`: Patient records
- `EmergencyContact`: Patient emergency contacts
- `MedicalAid`: Medical aid/insurance details
- `MedicalHistory`: Patient medical history
- `FamilyHistory`: Family medical history

### Appointments and Consultations
- `Appointment`: Scheduled appointments
- `Consultation`: Consultation records
- `ConsultationDiagnosis`: ICD-10 diagnoses
- `ConsultationProcedure`: Procedures performed

### Billing and Payments
- `Invoice`: Patient invoices
- `InvoiceItem`: Individual invoice items
- `Payment`: Payment records
- `FeeSchedule`: Practice fee schedules
- `ProcedureBundle`: Bundled procedures

### Document Management
- `Document`: File attachments and documents
- Categories: Medical, Administrative, Financial, etc.

### Data Sharing and Consent
- `PatientConsent`: Patient consent records
- `SharedPatientAccess`: Inter-practice data sharing

### Synchronization
- `SyncLog`: Sync status tracking
- Conflict resolution handling

## Security Features
1. Role-based access control
2. Practice-level data isolation
3. Audit logging
4. Patient data sharing controls
5. Document access tracking

## Indexes and Performance
Key indexes are maintained for:
- Patient search (name, ID)
- Appointment scheduling
- Medical aid claims
- Document retrieval
- Audit trail queries

## Offline-First Strategy
1. Local SQLite database for offline operation
2. Sync log tracking for changes
3. Conflict resolution mechanisms
4. Prioritized sync for critical data

## Medical Coding Support
1. ICD-10 diagnosis codes
2. CPT/NAPPI procedure codes
3. Custom procedure support
4. Bundled procedures

## Billing Features
1. Multiple fee schedules
2. Medical aid integration
3. Payment tracking
4. Invoice generation
5. Tax handling

## Compliance
1. Patient consent tracking
2. Audit logging
3. Document versioning
4. Access control
5. Data sharing controls

## Best Practices
1. Always use transactions for related operations
2. Implement proper error handling
3. Use appropriate indexes for performance
4. Regular backup procedures
5. Monitor sync conflicts

## Future Considerations
1. Integration with external systems
2. Enhanced reporting capabilities
3. Advanced analytics
4. Machine learning integration
5. Telemedicine support