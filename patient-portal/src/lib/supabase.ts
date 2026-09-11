import { createClient } from '@supabase/supabase-js';

// Arpan's Supabase — Patient Portal (primary)
export const supabaseArpan = createClient(
  'https://zcbjyqgangdsmvftqtnz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjYmp5cWdhbmdkc212ZnRxdG56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3ODQ2MDIsImV4cCI6MjEwNDM2MDYwMn0.VZLWVl0DO_QWCdsn_bnLe5KzoJm3KaGXWnDfiIv8rdU'
);

// Rishikesh's Supabase — Patient Portal (secondary / backup)
export const supabaseRishikesh = createClient(
  'https://xfxbljtxgsbsoazfeeaf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmeGJsanR4Z3Nic29hemZlZWFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3ODQ1MTIsImV4cCI6MjEwNDM2MDUxMn0._lcDDxYL4qMz9we8arnNuz0tJ2SFifhdDTRoUqJA5wA'
);

/**
 * Write patient portal data to both Arpan and Rishikesh's Supabase in parallel.
 * Silently logs on failure — does not break the app if Supabase is unreachable.
 */
export async function upsertPatientToken(tokenData: Record<string, any>) {
  const row = {
    token_id: tokenData.token_id || tokenData.tokenId,
    token_number: tokenData.token_number || tokenData.tokenNumber,
    patient_id: tokenData.patient_id || tokenData.patientId,
    patient_name: tokenData.patientName || tokenData.patient_name,
    department: tokenData.department,
    department_id: tokenData.department_id || tokenData.deptId,
    hospital: tokenData.hospital,
    hospital_id: tokenData.hospitalId || tokenData.hospital_id,
    doctor: tokenData.doctor,
    date: tokenData.date,
    slot_time: tokenData.slotTime || tokenData.time,
    queue_position: tokenData.queuePosition,
    estimated_wait_mins: tokenData.estimatedWaitMins,
    priority_tag: tokenData.priorityTag,
    fee_status: tokenData.feeStatus,
    payment_method: tokenData.paymentMethod,
    status: tokenData.status || 'waiting',
    qr_hash: tokenData.qr_hash || tokenData.hash,
    created_at: tokenData.created_at || new Date().toISOString(),
  };

  await Promise.allSettled([
    supabaseArpan.from('patient_tokens').upsert(row, { onConflict: 'token_id' }),
    supabaseRishikesh.from('patient_tokens').upsert(row, { onConflict: 'token_id' }),
  ]).then(results => {
    results.forEach((r, i) => {
      if (r.status === 'rejected') console.warn(`[Supabase Patient ${i === 0 ? 'Arpan' : 'Rishikesh'}] upsert failed:`, r.reason);
    });
  });
}

export async function upsertPatientProfile(userData: Record<string, any>) {
  const row = {
    patient_id: userData.id || userData.phone,
    full_name: userData.full_name,
    phone: userData.phone,
    age: userData.age,
    gender: userData.gender,
    abha_id: userData.abha_id,
    is_senior: userData.is_senior,
    is_pregnant: userData.is_pregnant,
    is_pwd: userData.is_pwd,
    created_at: userData.created_at || new Date().toISOString(),
  };

  await Promise.allSettled([
    supabaseArpan.from('patient_profiles').upsert(row, { onConflict: 'patient_id' }),
    supabaseRishikesh.from('patient_profiles').upsert(row, { onConflict: 'patient_id' }),
  ]).then(results => {
    results.forEach((r, i) => {
      if (r.status === 'rejected') console.warn(`[Supabase Patient ${i === 0 ? 'Arpan' : 'Rishikesh'}] profile upsert failed:`, r.reason);
    });
  });
}
