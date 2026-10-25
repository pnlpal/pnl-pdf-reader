import { Component, ChangeDetectionStrategy, CUSTOM_ELEMENTS_SCHEMA, OnInit, inject } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { PdfViewerComponent } from './pdf-viewer/pdf-viewer.component';
import { NavbarUser, UserService } from './user.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PdfViewerComponent, JsonPipe],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppComponent implements OnInit {
  private userService = inject(UserService);

  title = 'pnl-pdf-reader';
  user: NavbarUser | null = null;

  // Still loaded inside the main site's iframe: that page already shows the navbar.
  embeddedMode = (() => {
    try {
      return window.top !== window.self;
    } catch {
      return true;
    }
  })();

  async ngOnInit() {
    if (!this.embeddedMode) {
      this.user = await this.userService.getCurrentUser();
    }
  }
}
