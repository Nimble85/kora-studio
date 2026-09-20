const VALID_USERNAME = 'Koracandle';
const PASSWORD_HASH = '2d5a7f5eb7bfe7982f9088828ea07a63fab462d834e9cf458064c6815bde8f21';

const SESSION_KEY = 'kora_session';
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'kora_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  if (username !== VALID_USERNAME) return false;
  const hash = await hashPassword(password);
  return hash === PASSWORD_HASH;
}

export function createSession(): void {
  const session = {
    token: crypto.randomUUID(),
    expiresAt: Date.now() + SESSION_DURATION,
  };
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // localStorage may be unavailable
  }
}

export function isAuthenticated(): boolean {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return false;
    const session = JSON.parse(stored);
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(SESSION_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function logout(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}
