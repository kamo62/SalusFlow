# Practice Management System Documentation

## System Overview
A practice management system designed for medical practices in South Africa, with support for both online (SaaS) and offline (self-hosted) operations.

## Architecture

### Database Design
The system uses a hybrid database approach:
- **Primary Database (Supabase/PostgreSQL)**: Cloud database for SaaS version
- **Local Database (SQLite)**: Local-first storage for offline capability
- **Sync System**: Weekly synchronization between local and cloud databases

#### Key Design Decisions

1. **UUID Usage**
   - All primary keys use UUIDs
   - Ensures unique IDs across distributed systems
   - Allows offline record creation without conflicts
   - PostgreSQL: Uses uuid-ossp extension
   - SQLite: Stores as TEXT

2. **Timestamp Handling**
   - PostgreSQL: TIMESTAMP WITH TIME ZONE
   - SQLite: TEXT in ISO8601 format
   - Ensures timezone consistency across systems

3. **Enum Types**
   - PostgreSQL: Native ENUM types
   - SQLite: CHECK constraints
   - Ensures data integrity across systems

### Core Tables

1. **Users**
   - Stores all system users
   - Role-based access control
   - Supports multiple user types (admin, doctor, reception, billing)
   ```sql
   Key fields:
   - id: UUID (primary key)
   - email: Unique identifier
   - role: User type
   - status: Account status
   ```

2. **Doctors**
   - Extends user information for doctors
   - Links to consultation fees
   - Tracks availability
   ```sql
   Key fields:
   - user_id: Links to users table
   - registration_number: Professional registration
   - status: Availability status
   ```

3. **Patients**
   - Core patient information
   - SA ID number validation
   - Primary doctor assignment
   ```sql
   Key fields:
   - id_number: SA ID number
   - primary_doctor_id: Default doctor
   - status: Patient status
   ```

4. **Appointments**
   - Scheduling system
   - Links patients, doctors, and consultation types
   - Tracks appointment status
   ```sql
   Key fields:
   - scheduled_time: Appointment time
   - status: Appointment status
   - created_by: User who created appointment
   ```

5. **Consultations**
   - Clinical records
   - Links to appointments
   - Stores consultation notes
   ```sql
   Key fields:
   - appointment_id: Related appointment
   - clinical_notes: Consultation details
   ```

### Sync System

1. **Sync Log**
   - Tracks all data changes
   - Manages conflict detection
   - Handles resolution status
   ```sql
   Key fields:
   - operation: Type of change
   - local_checksum: Local data hash
   - conflict_status: Sync status
   ```

2. **Sync Conflicts**
   - Stores conflicting versions
   - Maintains resolution history
   - Supports manual resolution
   ```sql
   Key fields:
   - local_data: Local version
   - remote_data: Server version
   - resolution_data: Final resolved data
   ```

### Indexes
1. **Performance Indexes**
   - Email lookups: idx_users_email
   - ID number searches: idx_patients_id_number
   - Appointment scheduling: idx_appointments_schedule

2. **Relationship Indexes**
   - Doctor relationships: idx_doctors_user_id
   - Patient relationships: idx_patients_primary_doctor
   - Appointment relationships: Multiple indexes for quick lookups

3. **Status Indexes**
   - Active records: idx_consultation_types_status
   - Appointment status: idx_appointments_status
   - Sync status: idx_sync_log_unsynced

### Security Considerations
1. **Data Protection**
   - POPIA compliance built into schema
   - Role-based access control
   - Audit logging through sync system

2. **Offline Security**
   - Local data encryption
   - Secure sync protocol
   - Token-based authentication cache

## Development Guidelines

### Database Migrations
1. **PostgreSQL Migrations**
   - Located in: `migrations/postgresql/`
   - Includes both up and down migrations
   - Handles ENUM types and triggers

2. **SQLite Migrations**
   - Located in: `migrations/sqlite/`
   - Compatible type mappings
   - Simplified constraints

### Prisma Schema
- Located in: `prisma/schema.prisma`
- Defines type-safe models
- Manages relationships
- Handles both PostgreSQL and SQLite

### Testing Data
- Seed data in migrations
- Test data scripts (to be removed in production)
- Data generation utilities

## Deployment

### Production Setup
1. **Database Initialization**
   - Run PostgreSQL migrations
   - Set up initial admin user
   - Configure backup system

2. **Local Installation**
   - Initialize SQLite database
   - Set up sync configuration
   - Configure offline mode

### Maintenance
1. **Backup Procedures**
   - Weekly full backups
   - Daily incremental backups
   - Local backup management

2. **Sync Management**
   - Monitor sync conflicts
   - Handle resolution queues
   - Maintain sync logs

## Future Considerations
1. **Scalability**
   - Sharding strategy
   - Read replicas
   - Caching implementation

2. **Extensions**
   - Medical aid integration
   - Document management
   - Advanced reporting

3. **Mobile Support**
   - Offline-first mobile app
   - Sync optimization
   - Mobile-specific security 

## Test Users

The following test users are available for development and testing:

| Role       | Email                        | Password               | Purpose                                    |
|------------|-----------------------------|-----------------------|--------------------------------------------|
| SuperAdmin | superadmin@salusflow.co.za  | SuperAdmin123!@#     | Full system access, manage practices       |
| Admin      | admin@salusflow.co.za       | Admin123!@#          | Practice management, user administration   |
| Doctor     | doctor@salusflow.co.za      | Doctor123!@#         | Medical staff access, patient management   |
| User       | user@salusflow.co.za        | User123!@#           | Basic user access, view appointments       |

> ⚠️ Note: These credentials should only be used in development/testing environments. Production environments should use secure, unique passwords.

## Creating Additional Test Users

To create more test users, you can:

1. Run the test user creation script:
   ```bash
   pnpm test:create-users
   ```

2. Test the authentication:
   ```bash
   pnpm test:auth
   ```