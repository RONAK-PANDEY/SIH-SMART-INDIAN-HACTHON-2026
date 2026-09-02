/**
 * Example integration for the Triage screen.
 * Copy the relevant bits into your real src/screens/Triage.jsx.
 */
import React, { useState } from 'react';
import OfflineBanner from '../OfflineBanner';
import { useOfflineSync } from '../useOfflineSync';

const SYMPTOMS = ['Fever', 'Cough', 'Chest pain', 'Shortness of breath', 'Other'];

export default function TriageScreen({ tokenId }) {
  const { submit, online } = useOfflineSync('triage');
  const [selected, setSelected] = useState([]);
  const [status, setStatus] = useState(null);

  function toggle(symptom) {
    setSelected((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  }

  async function handleSubmit() {
    const result = await submit({
      url: '/api/triage/submit',
      method: 'POST',
      body: { tokenId, symptoms: selected, submittedAt: Date.now() },
    });

    setStatus(
      result.status === 'sent'
        ? 'Triage info sent to the nurse station.'
        : 'Offline — your triage answers are saved and will be sent the moment connectivity returns.'
    );
  }

  return (
    <div>
      <OfflineBanner screen="triage" />
      <h2>Triage</h2>
      {!online && (
        <p style={{ color: '#7a5b00' }}>
          Answer as usual — nothing is lost if you lose signal mid-way.
        </p>
      )}
      <ul>
        {SYMPTOMS.map((s) => (
          <li key={s}>
            <label>
              <input
                type="checkbox"
                checked={selected.includes(s)}
                onChange={() => toggle(s)}
              />
              {s}
            </label>
          </li>
        ))}
      </ul>
      <button onClick={handleSubmit}>Submit triage</button>
      {status && <p>{status}</p>}
    </div>
  );
}
