
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimulationService } from '../../services/simulation.service';

@Component({
  selector: 'app-status-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (status() === 'SUCCESS') {
      <div class="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
        <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border border-gray-100">
          <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm animate-bounce-short">
            <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2 class="text-2xl font-extrabold text-gray-900 mb-2">Оплата прошла успешно!</h2>
          <p class="text-gray-600 mb-8 text-sm">Ваш заказ #1001 подтвержден. Транзакция обработана через шлюз NMI.</p>
          
          <div class="space-y-3">
             <button (click)="viewAdmin()" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-xl transition-all font-bold shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 group">
                <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
                Посмотреть в Админке
             </button>
             <button (click)="reset()" class="w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-6 py-3.5 rounded-xl transition font-medium">
                Новый платеж
             </button>
          </div>
        </div>
      </div>
    }

    @if (status() === 'FAILED') {
      <div class="fixed inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
        <div class="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full text-center border-t-8 border-red-500 ring-1 ring-gray-100">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </div>
          <h2 class="text-xl font-bold text-gray-900 mb-2">Ошибка Оплаты</h2>
          <p class="text-sm text-gray-600 mb-6">Банк отклонил транзакцию. <br>Причина: <span class="font-mono bg-gray-100 px-1 rounded">INSUFFICIENT_FUNDS</span></p>
          <button (click)="reset()" class="w-full bg-gray-900 text-white px-6 py-3 rounded hover:bg-gray-800 transition font-medium">Попробовать снова</button>
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes bounce-short {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    .animate-bounce-short {
      animation: bounce-short 1s ease-in-out infinite;
    }
  `]
})
export class StatusOverlayComponent {
  private simService = inject(SimulationService);
  
  status = this.simService.status;

  reset() {
    this.simService.reset();
  }

  viewAdmin() {
    this.simService.status.set('IDLE'); // Hide overlay
    this.simService.setViewMode('ADMIN_ORDER'); // Switch view
  }
}
