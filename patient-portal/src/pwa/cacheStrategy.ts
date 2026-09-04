// Offline Local Storage & Sync Handler for Tokens & Triage Data
export const saveOfflineToken = (tokenData: any) => {
  try {
    localStorage.setItem('smartcare_offline_token', JSON.stringify(tokenData));
  } catch (err) {
    console.error('Failed to save offline token:', err);
  }
};

export const getOfflineToken = () => {
  try {
    const raw = localStorage.getItem('smartcare_offline_token');
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error('Failed to retrieve offline token:', err);
    return null;
  }
};
