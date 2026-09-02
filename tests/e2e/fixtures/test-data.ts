export function uniquePatient() {
  const suffix = Date.now();
  return {
    fullName: `Test Patient ${suffix}`,
    phone: `9${String(suffix).slice(-9)}`,
    email: `patient${suffix}@example.test`,
    password: 'TestPass123!',
    dob: '1990-05-15',
  };
}

export const hospital = { name: 'City General Hospital' };
export const department = { name: 'General Medicine' };

export const triageAnswers = {
  symptom: 'Fever and headache for 2 days',
  severity: 'moderate' as const,
};
