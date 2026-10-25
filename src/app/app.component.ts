import { Component, ChangeDetectionStrategy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PdfViewerComponent } from './pdf-viewer/pdf-viewer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PdfViewerComponent],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppComponent {
  title = 'pnl-pdf-reader';

  // Still loaded inside the main site's iframe: that page already shows the navbar.
  embeddedMode = (() => {
    try {
      return window.top !== window.self;
    } catch {
      return true;
    }
  })();
}
