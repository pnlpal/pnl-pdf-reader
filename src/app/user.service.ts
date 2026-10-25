import { Injectable, isDevMode } from '@angular/core';

export interface NavbarUser {
  username: string;
  avatar: string;
  uid: number;
}

// Same-origin in production, so the forum's session cookie is sent along.
const pnlBase = isDevMode() ? 'http://localhost:4567' : '';

@Injectable({ providedIn: 'root' })
export class UserService {
  // Resolves to the pnl.dev user, or null when logged out (or the forum is unreachable).
  async getCurrentUser(): Promise<NavbarUser | null> {
    try {
      const meRes = await fetch(`${pnlBase}/api/me`, { credentials: 'include' });
      if (!meRes.ok) return null;
      // NodeBB answers /api/me with the user's path, e.g. "/user/john".
      const userslug: string = await meRes.json();
      const userRes = await fetch(`${pnlBase}/api${userslug}`, { credentials: 'include' });
      if (!userRes.ok) return null;
      const user = await userRes.json();
      return {
        username: user.username,
        avatar: user.picture ? `${pnlBase}${user.picture}` : '',
        uid: user.uid,
      };
    } catch (error) {
      console.log('User not logged in or error checking authentication:', error);
      return null;
    }
  }
}
