
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArchitectureComponent } from './components/docs/architecture.component';
import { CheckoutSimComponent } from './components/checkout/checkout-sim.component';
import { LogViewerComponent } from './components/logs/log-viewer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ArchitectureComponent, CheckoutSimComponent, LogViewerComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  activeTab = signal<'DOCS' | 'SIMULATOR'>('DOCS');

  setTab(tab: 'DOCS' | 'SIMULATOR') {
    this.activeTab.set(tab);
  }
}
