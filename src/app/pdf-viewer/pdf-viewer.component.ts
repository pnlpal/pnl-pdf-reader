import { Component } from '@angular/core';
import {
  NgxExtendedPdfViewerModule,
  NgxExtendedPdfViewerService,
  pdfDefaultOptions,
} from 'ngx-extended-pdf-viewer';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.css'],
  standalone: true,
  imports: [NgxExtendedPdfViewerModule, CommonModule],
  providers: [NgxExtendedPdfViewerService],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})

// const testPdf = '/assets/pdfs/Bootstrap-vs-Material-Design-vs-Prime-vs-Tailwind.pdf';
export class PdfViewerComponent {
  pdfSrc: string | ArrayBuffer | null = null;
  isDragging = false;
  isReading = false;
  progress = 0;
  constructor(private pdfService: NgxExtendedPdfViewerService) {
    /* More likely than not you don't need to tweak the pdfDefaultOptions.
       They are a collecton of less frequently used options.
       To illustrate how they're used, here are two example settings: */
    // pdfDefaultOptions.doubleTapZoomFactor = '150%'; // The default value is '200%'
    // pdfDefaultOptions.maxCanvasPixels = 4096 * 4096 * 5; // The default value is 4096 * 4096 pixels,
    // but most devices support much higher resolutions.
    // Increasing this setting allows your users to use higher zoom factors,
    // trading image quality for performance.

    window.addEventListener('message', (event) => {
      // console.log('Received message: ', event);
      if (event.data.type === 'PDF_CONTENT') {
        this.pdfSrc = event.data.arrayBuffer;
      }
    });
  }
  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      console.log('Selected file:', input.files[0]);
      this.readFile(input.files[0]);
    }
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      console.log('Dropped file:', event.dataTransfer.files[0]);
      this.readFile(event.dataTransfer.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  private readFile(file: File): void {
    if (file.type === 'application/pdf') {
      const reader = new FileReader();
      this.isReading = true;
      this.progress = 0;
      reader.onload = () => {
        console.log('File read successfully:', reader.result);
        this.isReading = false;
        this.progress = 100;
        this.pdfSrc = reader.result;
      };
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        this.isReading = false;
        this.progress = 0;
        alert('Error reading file. Please try again.');
      };
      // reading progress
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          this.progress = Math.round((event.loaded / event.total) * 100);
          console.log(`File reading progress: ${this.progress}%`);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert('Please upload a valid PDF file.');
    }
  }
}
