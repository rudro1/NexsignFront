/**
 * Browser GPS for legal signing audit (iOS Safari, Android Chrome, etc.)
 * Requires HTTPS and user permission on submit.
 */
export async function getBrowserGPS() {
  return new Promise(resolve => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      p => resolve({
        latitude:  p.coords.latitude,
        longitude: p.coords.longitude,
        accuracy:  p.coords.accuracy,
      }),
      () => resolve(null),
      { timeout: 10000, maximumAge: 0, enableHighAccuracy: true },
    );
  });
}

export function getClientTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  } catch {
    return '';
  }
}
