import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import {
  NgxExtendedPdfViewerModule,
  NgxExtendedPdfViewerService,
  pdfDefaultOptions,
} from 'ngx-extended-pdf-viewer';

// Wraps ngx-extended-pdf-viewer so PdfViewerComponent can lazy-load it with @defer.
@Component({
  selector: 'app-pdf-document',
  template: `
    <ngx-extended-pdf-viewer
      [textLayer]="true"
      [handTool]="false"
      [ignoreKeyboard]="false"
      [showFindButton]="true"
      [src]="src()"
      >
    </ngx-extended-pdf-viewer>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
      width: 100%;
    }
  `,
  imports: [NgxExtendedPdfViewerModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [NgxExtendedPdfViewerService],
})
export class PdfDocumentComponent {
  src = input.required<string | ArrayBuffer>();

  constructor() {
    /* More likely than not you don't need to tweak the pdfDefaultOptions.
       They are a collecton of less frequently used options.
       To illustrate how they're used, here are two example settings: */
    // pdfDefaultOptions.doubleTapZoomFactor = '150%'; // The default value is '200%'
    // pdfDefaultOptions.maxCanvasPixels = 4096 * 4096 * 5; // The default value is 4096 * 4096 pixels,
    // but most devices support much higher resolutions.
    // Increasing this setting allows your users to use higher zoom factors,
    // trading image quality for performance.
  }
}
