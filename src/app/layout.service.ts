import { Injectable, computed, signal } from '@angular/core';

const NAVBAR_HIDDEN_KEY = 'pdf-reader:navbar-hidden';

// Page layout shared by the app shell (navbar) and the PDF viewer.
@Injectable({ providedIn: 'root' })
export class LayoutService {
  // Still loaded inside the main site's iframe: that page already shows the navbar.
  readonly embeddedMode = (() => {
    try {
      return window.top !== window.self;
    } catch {
      return true;
    }
  })();

  readonly pdfOpen = signal(false);
  // The reader's preference, applied only while a PDF is open.
  readonly navbarHidden = signal(this.readNavbarHidden());
  readonly showNavbar = computed(
    () => !this.embeddedMode && !(this.pdfOpen() && this.navbarHidden()),
  );

  toggleNavbar() {
    this.navbarHidden.update((hidden) => !hidden);
    try {
      localStorage.setItem(NAVBAR_HIDDEN_KEY, this.navbarHidden() ? '1' : '0');
    } catch {
      // Storage blocked: the choice just won't survive a refresh.
    }
  }

  private readNavbarHidden(): boolean {
    try {
      return localStorage.getItem(NAVBAR_HIDDEN_KEY) === '1';
    } catch {
      return false;
    }
  }
}
