-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own data" ON "users";
DROP POLICY IF EXISTS "Admins can view all users" ON "users";
DROP POLICY IF EXISTS "Doctors can view their patients" ON "users";

-- Create new policies
CREATE POLICY "Users can view their own data"
ON "users"
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Practice admins can view practice users"
ON "users"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM practices p
    WHERE p.id IN (
      SELECT practice_id FROM practice_users
      WHERE user_id = auth.uid()
    )
    AND auth.uid() IN (
      SELECT user_id FROM practice_users pu
      WHERE pu.practice_id = p.id
      AND pu.role IN ('PRACTICE_ADMIN', 'SYSTEM_ADMIN')
    )
  )
);

CREATE POLICY "System admins can view all users"
ON "users"
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'SYSTEM_ADMIN'
  )
);

CREATE POLICY "Practitioners can view their patients"
ON "users"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM appointments a
    WHERE a.patient_id = users.id
    AND a.practitioner_id = auth.uid()
  )
); 