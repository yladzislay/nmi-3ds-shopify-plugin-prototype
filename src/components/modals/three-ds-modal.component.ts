
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimulationService } from '../../services/simulation.service';

@Component({
  selector: 'app-three-ds-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div class="bg-white rounded-lg shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100">
        <!-- Fake Browser Bar -->
        <div class="bg-gray-100 px-3 py-2 border-b flex items-center gap-2">
          <div class="flex gap-1.5">
              <div class="w-2.5 h-2.5 rounded-full bg-red-400"></div>
              <div class="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
              <div class="w-2.5 h-2.5 rounded-full bg-green-400"></div>
          </div>
          <div class="flex-1 bg-white rounded border border-gray-200 text-[10px] text-center text-gray-500 py-0.5 mx-2 flex items-center justify-center gap-1">
              <svg class="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
              acs.visa.com/verify
          </div>
        </div>

        <div class="p-6 text-center">
          <div class="mb-4">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" class="h-6 mx-auto opacity-80" alt="Visa Logo">
          </div>
          
          <h3 class="text-base font-bold text-gray-900 mb-1">Подтверждение личности</h3>
          <p class="text-xs text-gray-500 mb-6">Код подтверждения был отправлен на ваш номер ••88.</p>
          
          <div class="bg-blue-50/50 p-3 rounded border border-blue-100 mb-6 text-left text-xs">
              <div class="flex justify-between mb-1">
                  <span class="text-gray-500">Магазин</span>
                  <span class="font-semibold text-gray-900">SHOPIFY STORE</span>
              </div>
              <div class="flex justify-between">
                  <span class="text-gray-500">Сумма</span>
                  <span class="font-semibold text-gray-900">$125.99</span>
              </div>
          </div>

          <div class="flex justify-center mb-6 relative">
              <input type="text" class="w-32 text-center text-2xl font-mono tracking-widest border-b-2 border-blue-500 focus:outline-none bg-transparent" placeholder="1234">
              <div class="absolute -right-4 top-1 text-gray-400 text-[10px] animate-pulse">Введите любой код</div>
          </div>
          
          <div class="grid grid-cols-2 gap-3">
            <button (click)="cancel()" class="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50 transition-colors">Отмена</button>
            <button (click)="confirm()" class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 shadow-sm transition-all">Отправить код</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ThreeDSModalComponent {
  private simService = inject(SimulationService);

  confirm() {
    this.simService.complete3DS(true);
  }

  cancel() {
    this.simService.complete3DS(false);
  }
}