/**
 * Example integration for the Register screen.
 * Copy the relevant bits into your real src/screens/Register.jsx.
 */
import React, { useState } from 'react';
import OfflineBanner from '../OfflineBanner';
import { useOfflineSync } from '../useOfflineSync';

export default function RegisterScreen() {
  const { submit } = useOfflineSync('register');
  const [form, setForm] = useState({ name: '', phone: '', reason: '' });
  const [status, setStatus] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const result = await submit({
      url: '/api/register',
      method: 'POST',
      body: form,
    });

    setStatus(
      result.status === 'sent'
        ? 'Registered! Your token will be issued shortly.'
        : "Saved. We'll register you automatically as soon as you're back online."
    );
  }

  return (
    <div>
      <OfflineBanner screen="register" />
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="Phone number"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <input
          placeholder="Reason for visit"
          value={form.reason}
          onChange={(e) => setForm({ ...form, reason: e.target.value })}
        />
        <button type="submit">Register</button>
      </form>
      {status && <p>{status}</p>}
    </div>
  );
}
