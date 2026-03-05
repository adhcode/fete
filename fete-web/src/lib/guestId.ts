/**
 * Guest identity management
 * Generates and stores a stable guestId per device per event
 */

function generateGuestId(): string {
  return `guest_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

export function getGuestId(eventCode: string): string {
  const key = `fete_guest_${eventCode}`;
  
  let guestId = localStorage.getItem(key);
  
  if (!guestId) {
    guestId = generateGuestId();
    localStorage.setItem(key, guestId);
  }
  
  return guestId;
}

export function clearGuestId(eventCode: string): void {
  const key = `fete_guest_${eventCode}`;
  localStorage.removeItem(key);
}
