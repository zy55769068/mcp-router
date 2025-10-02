// Stubbed auth service (feature removed)
export async function status(_forceRefresh = false): Promise<{
  authenticated: boolean;
  userId?: string;
  user?: any;
  token?: string;
}> {
  return { authenticated: false };
}

export async function getDecryptedAuthToken(): Promise<string | null> {
  return null;
}

export function handleAuthToken(_token: string, _state?: string): boolean {
  return false;
}

export function logout(): boolean {
  return true;
}

