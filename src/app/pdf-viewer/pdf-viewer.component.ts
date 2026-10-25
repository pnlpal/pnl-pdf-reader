import { Component, ChangeDetectionStrategy } from '@angular/core';
import { PdfDocumentComponent } from './pdf-document.component';

const browser = /Firefox\//.test(navigator.userAgent)
  ? 'Firefox'
  : /Edg\//.test(navigator.userAgent)
    ? 'Edge'
    : 'Chrome';

const stores: Record<string, Record<string, string>> = {
  dictionariez: {
    Chrome: 'https://chromewebstore.google.com/detail/dictionaries/diojcfpekhhnndfmggknljpnfpcccbhc',
    Firefox: 'https://addons.mozilla.org/en-US/firefox/addon/dictionaries/',
    Edge: 'https://microsoftedge.microsoft.com/addons/detail/dictionaries-one-to-rule/jdgglojanbnghagoeffacmjodigadoof',
  },
  pnlReader: {
    Chrome: 'https://chromewebstore.google.com/detail/pnl-reader/amdebfiljmlhfkenbhhpckmmpkonpdfh',
    Firefox: 'https://addons.mozilla.org/en-US/firefox/addon/pnl-reader/',
    Edge: 'https://microsoftedge.microsoft.com/addons/detail/pnl-reader/gdpndpkknkgkmoikgpldekejoabkplmd',
  },
};

@Component({
  selector: 'app-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.css'],
  standalone: true,
  imports: [PdfDocumentComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  // changeDetection: ChangeDetectionStrategy.OnPush,
})

// const testPdf = '/assets/pdfs/Bootstrap-vs-Material-Design-vs-Prime-vs-Tailwind.pdf';
export class PdfViewerComponent {
  pdfSrc: string | ArrayBuffer | null = null;
  isDragging = false;
  isReading = false;
  progress = 0;
  browser = browser;
  dictionariezStore = stores['dictionariez'][browser];
  pnlReaderStore = stores['pnlReader'][browser];
  constructor() {
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
