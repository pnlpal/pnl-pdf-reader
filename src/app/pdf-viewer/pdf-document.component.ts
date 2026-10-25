import { Component, ChangeDetectionStrategy, inject, input, output } from '@angular/core';
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
      [page]="page()"
      (pageChange)="pageChange.emit($event ?? 1)"
      (pagesLoaded)="pagesLoaded.emit($event.pagesCount)"
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
  page = input(1);
  pageChange = output<number>();
  pagesLoaded = output<number>();
  private pdfService = inject(NgxExtendedPdfViewerService);

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

  print() {
    this.pdfService.print();
  }
}
