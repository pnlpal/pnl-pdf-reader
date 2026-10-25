import { Component, ChangeDetectionStrategy, CUSTOM_ELEMENTS_SCHEMA, OnInit, inject } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { PdfViewerComponent } from './pdf-viewer/pdf-viewer.component';
import { NavbarUser, UserService } from './user.service';
import { LayoutService } from './layout.service';

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
  layout = inject(LayoutService);

  title = 'pnl-pdf-reader';
  user: NavbarUser | null = null;

  async ngOnInit() {
    if (!this.layout.embeddedMode) {
      this.user = await this.userService.getCurrentUser();
    }
  }
}
