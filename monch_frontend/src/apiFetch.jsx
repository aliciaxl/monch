export async function apiFetch(url, options={}) {
  const res = await fetch(url, { credentials: 'include', ...options });
  if (res.status === 401) {
    // Try to refresh token
    const refresh = await fetch('/api/token/refresh/', { method: 'POST', credentials: 'include' });
    if (!refresh.ok) {
      throw new Error('Session expired');
    }
    // Retry original request
    const retry = await fetch(url, { credentials: 'include', ...options });
    if (!retry.ok) throw new Error(await retry.text());
    return retry;
  }
  return res;
}
