-- Script to remove test data before production deployment

-- Function to remove test data while preserving system data
CREATE OR REPLACE FUNCTION remove_test_data()
RETURNS void AS $$
BEGIN
    -- Preserve the admin user and system settings
    CREATE TEMP TABLE preserved_users AS
    SELECT * FROM users WHERE email = 'admin@practice.local';

    -- Remove all data in reverse order of dependencies
    DELETE FROM sync_conflicts;
    DELETE FROM sync_log;
    DELETE FROM medical_history;
    DELETE FROM consultations;
    DELETE FROM appointments;
    DELETE FROM doctor_consultation_fees;
    DELETE FROM patients;
    DELETE FROM doctors;
    DELETE FROM users WHERE email != 'admin@practice.local';

    -- Restore preserved data if accidentally deleted
    INSERT INTO users 
    SELECT * FROM preserved_users 
    WHERE NOT EXISTS (
        SELECT 1 FROM users WHERE email = 'admin@practice.local'
    );

    -- Reset consultation types to defaults
    DELETE FROM consultation_types WHERE id NOT IN (
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000003'
    );

    -- Log the cleanup
    RAISE NOTICE 'Test data removed successfully';
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT remove_test_data();

-- Drop the function after use
DROP FUNCTION IF EXISTS remove_test_data();

-- Vacuum the database to reclaim space
VACUUM FULL; 