import { Component, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { PdfDocumentComponent } from './pdf-document.component';
import { MAX_RECENT_FILES, RecentFile, RecentFilesService } from './recent-files.service';

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
export class PdfViewerComponent implements OnInit {
  private recentFilesService = inject(RecentFilesService);
  private savePositionTimer?: ReturnType<typeof setTimeout>;

  pdfSrc: string | ArrayBuffer | null = null;
  fileName = '';
  currentFileId: string | null = null;
  startPage = 1;
  pagesCount = 0;
  recentFiles: RecentFile[] = [];
  maxRecentFiles = MAX_RECENT_FILES;
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
        this.openNew(event.data.name ?? 'Untitled.pdf', event.data.arrayBuffer);
      }
    });
  }

  async ngOnInit() {
    const currentId = this.recentFilesService.currentId;
    if (currentId && (await this.openRecent(currentId))) return;
    await this.loadRecentFiles();
  }

  async openRecent(id: string): Promise<boolean> {
    const file = await this.recentFilesService.get(id);
    if (!file) {
      await this.loadRecentFiles();
      return false;
    }
    this.show(file.id, file.name, file.data, file.page, file.pagesCount);
    this.recentFilesService.touch(file.id);
    return true;
  }

  async removeRecent(id: string, event: Event) {
    event.stopPropagation();
    await this.recentFilesService.remove(id);
    await this.loadRecentFiles();
  }

  async clearRecent() {
    if (!confirm('Remove all recent files from this browser?')) return;
    await this.recentFilesService.clear();
    await this.loadRecentFiles();
  }

  async close() {
    clearTimeout(this.savePositionTimer);
    if (this.currentFileId) {
      await this.recentFilesService.updatePosition(this.currentFileId, this.startPage, this.pagesCount);
    }
    this.recentFilesService.currentId = null;
    this.pdfSrc = null;
    this.currentFileId = null;
    await this.loadRecentFiles();
  }

  onPageChange(page: number) {
    this.startPage = page;
    const id = this.currentFileId;
    if (!id) return;
    clearTimeout(this.savePositionTimer);
    this.savePositionTimer = setTimeout(
      () => this.recentFilesService.updatePosition(id, page, this.pagesCount),
      500,
    );
  }

  onPagesLoaded(pagesCount: number) {
    this.pagesCount = pagesCount;
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  timeAgo(time: number): string {
    const minutes = Math.round((Date.now() - time) / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.round(hours / 24);
    return days === 1 ? 'yesterday' : `${days} days ago`;
  }

  private async openNew(name: string, data: ArrayBuffer) {
    // Save before showing: the viewer takes over the buffer once it has it.
    const id = await this.recentFilesService.add(name, data);
    this.show(id, name, data, 1, 0);
  }

  private show(id: string | null, name: string, data: ArrayBuffer, page: number, pagesCount: number) {
    this.currentFileId = id;
    this.recentFilesService.currentId = id;
    this.fileName = name;
    this.startPage = page;
    this.pagesCount = pagesCount;
    this.pdfSrc = data;
  }

  private async loadRecentFiles() {
    this.recentFiles = await this.recentFilesService.list();
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
        this.openNew(file.name, reader.result as ArrayBuffer);
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
