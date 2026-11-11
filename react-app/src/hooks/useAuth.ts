// Gives components the login state. It listens to tokenStore, so when client.ts clears the
// token after a 401 the whole app re-renders and RequireAuth sends the user to /login.

import { useSyncExternalStore } from 'react';
import { clearToken, getToken, subscribeToToken, wasSessionExpired } from '../api/tokenStore';

export interface AuthState {
  isSignedIn: boolean;
  /** true when the user was sent back to login because the API answered 401 */
  sessionExpired: boolean;
  signOut: () => void;
}

const signOut = (): void => clearToken('logout');

export function useAuth(): AuthState {
  const token = useSyncExternalStore(subscribeToToken, getToken, getToken);
  return { isSignedIn: token !== null, sessionExpired: wasSessionExpired(), signOut };
}
