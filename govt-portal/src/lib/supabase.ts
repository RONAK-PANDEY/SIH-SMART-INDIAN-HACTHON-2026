import { createClient } from '@supabase/supabase-js';

// Ajay Kumar's Supabase — Govt Observer Pool & Vigilance
export const supabaseAjay = createClient(
  'https://hkwhfxthehiuhgecflau.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhrd2hmeHRoZWhpdWhnZWNmbGF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3ODMwMDksImV4cCI6MjEwNDM1OTAwOX0.kztYRmcVEBmjt4xYlIa2m18SJvTg-ggq_If_JUGbCwY'
);

/**
 * Log vigilance actions, flash inspections, audits to Ajay's Supabase
 */
export async function logVigilanceInspection(data: Record<string, any>) {
  try {
    const { error } = await supabaseAjay.from('vigilance_inspections').upsert({
      inspection_id: data.id || `insp_${Date.now()}`,
      hospital_id: data.hospitalId || 'AIIMS-ND-001',
      department: data.department,
      type: data.type || 'FLASH_INSPECTION',
      observer_notes: data.notes || '',
      triggered_by: 'MoHFW Central Vigilance Command',
      status: 'DISPATCHED',
      dispatched_at: new Date().toISOString()
    });
    if (error) console.warn('[Supabase Govt] Log inspection failed:', error.message);
  } catch (err) {
    console.warn('[Supabase Govt] network error:', err);
  }
}

export async function logAuditRecord(data: Record<string, any>) {
  try {
    const { error } = await supabaseAjay.from('audit_records').upsert({
      audit_id: data.id || `audit_${Date.now()}`,
      hospital_id: data.hospitalId || 'AIIMS-ND-001',
      department: data.department || 'ALL',
      audit_score: data.auditScore,
      action_taken: data.actionTaken,
      created_at: new Date().toISOString()
    });
    if (error) console.warn('[Supabase Govt] Log audit failed:', error.message);
  } catch (err) {
    console.warn('[Supabase Govt] network error:', err);
  }
}
