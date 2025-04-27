import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PdfViewerComponent } from './pdf-viewer/pdf-viewer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PdfViewerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'pnl-pdf-reader';
}
