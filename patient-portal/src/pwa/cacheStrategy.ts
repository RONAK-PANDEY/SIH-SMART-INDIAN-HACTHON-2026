export const saveOfflineToken = (token: any) => localStorage.setItem('offline_token', JSON.stringify(token));
export const getOfflineToken = () => JSON.parse(localStorage.getItem('offline_token') || 'null');
