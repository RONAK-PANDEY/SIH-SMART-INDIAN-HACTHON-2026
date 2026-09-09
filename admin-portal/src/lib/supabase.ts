import { createClient } from '@supabase/supabase-js';

// Kartik's Supabase — Doctor Pool & Admin Data
export const supabaseKartik = createClient(
  'https://areqjlokmpqnoybaiflo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyZXFqbG9rbXBxbm95YmFpZmxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3ODQxMDEsImV4cCI6MjEwNDM2MDEwMX0.u5RJGESglmgKZKulZdfUwb3cEGb92qPsmETv4MWa24g'
);

/**
 * Record doctor status / consultation updates to Supabase
 */
export async function recordDoctorConsultation(data: Record<string, any>) {
  try {
    const { error } = await supabaseKartik.from('doctor_consultations').upsert({
      consultation_id: data.consultationId || data.id || `cons_${Date.now()}`,
      doctor_id: data.doctorId || data.doctor_id,
      doctor_name: data.doctorName || data.doctor_name,
      patient_token: data.tokenNumber || data.token_number,
      department: data.department,
      start_time: data.startTime,
      end_time: data.endTime,
      duration_mins: data.durationMins,
      diagnosis: data.diagnosis,
      dpi_score: data.dpiScore || data.recognitionScore,
      created_at: new Date().toISOString()
    });
    if (error) console.warn('[Supabase Doctor] Record consultation failed:', error.message);
  } catch (err) {
    console.warn('[Supabase Doctor] network error:', err);
  }
}

export async function updateDoctorStatus(doctorId: string, status: string, department?: string) {
  try {
    const { error } = await supabaseKartik.from('doctor_status').upsert({
      doctor_id: doctorId,
      status: status,
      department: department,
      updated_at: new Date().toISOString()
    });
    if (error) console.warn('[Supabase Doctor] Status update failed:', error.message);
  } catch (err) {
    console.warn('[Supabase Doctor] network error:', err);
  }
}
