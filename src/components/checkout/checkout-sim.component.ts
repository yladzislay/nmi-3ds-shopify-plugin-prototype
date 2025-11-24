
import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { SimulationService, ScenarioType, CardData } from '../../services/simulation.service';
import { LogViewerComponent } from '../logs/log-viewer.component';
import { ThreeDSModalComponent } from '../modals/three-ds-modal.component';
import { StatusOverlayComponent } from '../modals/status-overlay.component';

@Component({
  selector: 'app-checkout-sim',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    LogViewerComponent,
    ThreeDSModalComponent,
    StatusOverlayComponent
  ],
  template: `
    <!-- Main Layout Grid -->
    <div class="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[calc(100vh-140px)] pb-12 md:pb-0 relative">
      
      <!-- LEFT ZONE: Main Interface (Checkout or Admin) -->
      <div class="md:col-span-8 flex border border-gray-200 rounded-lg shadow-sm overflow-hidden bg-white min-h-[500px] md:min-h-0 md:h-full relative">
        
        <!-- MODE 1: CUSTOMER CHECKOUT -->
        @if (simService.viewMode() === 'CHECKOUT') {
          <div class="flex-1 flex flex-col min-w-0 overflow-y-auto relative h-full">
            
            <!-- Breadcrumbs -->
            <div class="px-6 md:px-8 pt-6 pb-4 border-b border-gray-100 flex items-center gap-2 text-xs text-gray-500 flex-shrink-0">
               <span class="text-blue-600 cursor-pointer">Магазин Shopify</span>
               <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
               <span class="font-bold text-gray-800">Оформление заказа</span>
            </div>

            <div class="p-6 md:p-8 max-w-xl mx-auto w-full flex-shrink-0 relative">
              
              <!-- Processing Overlay (Stepper) -->
              @if (simService.isProcessing() || simService.is3DS()) {
                <div class="absolute inset-0 bg-white/90 z-20 flex flex-col items-center justify-center p-6 animate-fade-in backdrop-blur-[1px]">
                  <div class="w-full max-w-sm space-y-4">
                     <h3 class="text-lg font-bold text-gray-900 text-center mb-4">Обработка платежа</h3>
                     
                     @for (step of simService.steps(); track step.id) {
                       <div class="flex items-center gap-3 transition-all duration-300" [class.opacity-40]="step.status === 'PENDING'">
                         <div class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                            [class.bg-gray-200]="step.status === 'PENDING'"
                            [class.bg-blue-100]="step.status === 'ACTIVE'"
                            [class.bg-green-100]="step.status === 'COMPLETED'"
                            [class.bg-red-100]="step.status === 'ERROR'">
                            
                            @if (step.status === 'PENDING') { <span class="w-2 h-2 rounded-full bg-gray-400"></span> }
                            @if (step.status === 'ACTIVE') { <svg class="w-4 h-4 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> }
                            @if (step.status === 'COMPLETED') { <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> }
                            @if (step.status === 'ERROR') { <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg> }
                         </div>
                         <span class="text-sm font-medium" 
                            [class.text-gray-900]="step.status !== 'PENDING'"
                            [class.text-gray-500]="step.status === 'PENDING'">
                            {{ step.label }}
                         </span>
                       </div>
                     }
                  </div>
                </div>
              }

              <h2 class="text-xl font-medium text-gray-900 mb-1">Оплата</h2>
              <p class="text-sm text-gray-500 mb-6">Все транзакции защищены шифрованием NMI.</p>
              
              <form [formGroup]="paymentForm" (ngSubmit)="onSubmit()">
                
                <div class="border rounded-md border-gray-300 overflow-hidden mb-8">
                  <div class="bg-gray-50 p-4 flex items-center justify-between border-b border-gray-200">
                     <span class="font-medium text-gray-900 text-sm flex items-center gap-2">
                       <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                       Банковская карта
                     </span>
                     <div class="flex gap-1 opacity-70">
                        <div class="h-5 w-8 bg-white border rounded flex items-center justify-center"><span class="text-[8px] font-bold italic text-blue-800">VISA</span></div>
                        <div class="h-5 w-8 bg-white border rounded flex items-center justify-center"><span class="text-[8px] font-bold text-red-600">MC</span></div>
                     </div>
                  </div>
                  
                  <div class="bg-white p-5 space-y-4">
                    <!-- Secure Field Container -->
                    <div class="relative group">
                      <div class="absolute -inset-0.5 bg-gradient-to-r from-blue-100 to-indigo-100 rounded opacity-0 group-hover:opacity-50 transition duration-500"></div>
                      <div class="relative">
                         <input formControlName="cardNumber" type="text" 
                          class="peer w-full px-3 pt-5 pb-2 border rounded border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none bg-white placeholder-transparent transition-all font-mono text-gray-900" 
                          placeholder="0000 0000 0000 0000">
                        <label class="absolute text-xs text-gray-500 top-2 left-3 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs pointer-events-none">Номер карты</label>
                        <div class="absolute right-3 top-3 text-gray-400 group-hover:text-indigo-500 transition-colors">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        </div>
                      </div>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                      <div class="relative">
                        <input formControlName="expiry" type="text" 
                          class="peer w-full px-3 pt-5 pb-2 border rounded border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none bg-white placeholder-transparent text-gray-900" 
                          placeholder="MM/YY">
                        <label class="absolute text-xs text-gray-500 top-2 left-3 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs pointer-events-none">Срок действия (MM/YY)</label>
                      </div>
                      <div class="relative">
                        <input formControlName="cvv" type="text" 
                          class="peer w-full px-3 pt-5 pb-2 border rounded border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none bg-white placeholder-transparent text-gray-900" 
                          placeholder="123">
                        <label class="absolute text-xs text-gray-500 top-2 left-3 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs pointer-events-none">CVV код</label>
                      </div>
                    </div>

                    <div class="relative">
                      <input formControlName="name" type="text" 
                        class="peer w-full px-3 pt-5 pb-2 border rounded border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none bg-white placeholder-transparent text-gray-900" 
                        placeholder="Name on card">
                      <label class="absolute text-xs text-gray-500 top-2 left-3 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs pointer-events-none">Имя на карте</label>
                    </div>
                  </div>
                </div>

                <button 
                    type="submit" 
                    [disabled]="paymentForm.invalid || simService.isProcessing()"
                    class="w-full bg-black hover:bg-gray-800 text-white font-medium py-4 rounded-md shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3 text-lg mt-4">
                    Оплатить $125.99
                </button>
              </form>
            </div>
            
            <div class="mt-auto border-t border-gray-100 p-4 text-center text-xs text-gray-400 flex-shrink-0 bg-gray-50">
               <span class="flex items-center justify-center gap-1">
                 <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                 Безопасная обработка через NMI Payment Gateway
               </span>
            </div>
          </div>

          <!-- Order Summary (Visible on large screens) -->
          <div class="w-80 bg-gray-50 border-l border-gray-200 hidden xl:flex flex-col p-6 overflow-y-auto h-full flex-shrink-0">
             <div class="flex gap-4 mb-6">
                <div class="w-16 h-16 bg-white border border-gray-200 rounded-lg flex items-center justify-center relative flex-shrink-0">
                   <span class="absolute -top-2 -right-2 bg-gray-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-sm">1</span>
                   <span class="text-2xl">👟</span>
                </div>
                <div>
                   <p class="text-sm font-medium text-gray-900">Nike Air Max 90</p>
                   <p class="text-xs text-gray-500">Лимитированная серия</p>
                </div>
                <div class="text-sm font-medium text-gray-900 ml-auto">$125.99</div>
             </div>
             <div class="border-t border-gray-200 my-4"></div>
             <div class="space-y-3 text-sm">
               <div class="flex justify-between"><span class="text-gray-500">Подытог</span><span class="font-medium text-gray-900">$125.99</span></div>
               <div class="flex justify-between"><span class="text-gray-500">Доставка</span><span class="text-gray-500">Бесплатно</span></div>
             </div>
             <div class="border-t border-gray-200 my-4"></div>
             <div class="flex justify-between items-baseline">
               <span class="text-base font-medium text-gray-900">Итого</span>
               <div class="flex items-baseline gap-2"><span class="text-xs text-gray-500">USD</span><span class="text-xl font-bold text-gray-900">$125.99</span></div>
             </div>
          </div>
        }

        <!-- MODE 2: SHOPIFY ADMIN SIMULATION -->
        @if (simService.viewMode() === 'ADMIN_ORDER') {
           <div class="flex-1 flex flex-col h-full bg-[#f6f6f7] overflow-y-auto">
              <!-- Admin Header -->
              <div class="bg-[#1a1a1a] h-12 flex items-center px-4 justify-between flex-shrink-0">
                 <div class="flex items-center gap-3">
                   <div class="w-6 h-6 bg-white rounded-full flex items-center justify-center text-[10px] font-bold text-[#1a1a1a]">S</div>
                   <span class="text-gray-300 text-sm font-medium">Администратор Shopify</span>
                 </div>
                 <div class="flex items-center gap-2">
                    <input type="text" placeholder="Поиск" class="bg-[#303030] border-none rounded text-xs px-2 py-1 text-white w-48 focus:ring-0">
                    <div class="w-6 h-6 rounded-full bg-pink-600 text-white text-xs flex items-center justify-center">D</div>
                 </div>
              </div>

              <!-- Page Content -->
              <div class="p-6 md:p-8 max-w-4xl mx-auto w-full">
                 <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center gap-3">
                       <button (click)="resetView()" class="p-1 rounded hover:bg-gray-200 text-gray-500">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                       </button>
                       <h1 class="text-2xl font-bold text-gray-900">Заказ #1001</h1>
                       <span class="px-2 py-0.5 rounded bg-green-100 text-green-800 text-xs font-bold border border-green-200">Оплачен</span>
                       <span class="px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 text-xs font-bold border border-yellow-200">Не отправлен</span>
                    </div>
                    <div class="text-sm text-gray-500">Только что</div>
                 </div>

                 <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <!-- Left Column -->
                    <div class="md:col-span-2 space-y-6">
                       <!-- Product Card -->
                       <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                          <div class="flex items-center justify-between mb-4">
                             <h3 class="font-bold text-sm text-gray-900">Не отправлен</h3>
                             <span class="text-xs text-blue-600">Склад отгрузки</span>
                          </div>
                          <div class="flex gap-4">
                             <div class="w-10 h-10 border rounded bg-gray-50 flex items-center justify-center">👟</div>
                             <div class="flex-1">
                                <div class="text-sm text-blue-600 font-medium hover:underline cursor-pointer">Nike Air Max 90</div>
                                <div class="text-xs text-gray-500">Лимитированная серия</div>
                             </div>
                             <div class="text-sm text-gray-900">$125.99 x 1</div>
                             <div class="text-sm font-bold text-gray-900">$125.99</div>
                          </div>
                          <div class="mt-4 pt-4 border-t border-gray-100 flex justify-end gap-2">
                             <button class="px-3 py-1.5 border border-gray-300 rounded shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50">Создать накладную</button>
                             <button class="px-3 py-1.5 bg-green-700 rounded shadow-sm text-xs font-medium text-white hover:bg-green-800">Отправить товар</button>
                          </div>
                       </div>

                       <!-- Payment Card -->
                       <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                          <div class="flex items-center justify-between mb-4">
                             <h3 class="font-bold text-sm text-gray-900">Оплачен</h3>
                             <span class="text-xs text-gray-500">Выплата скоро поступит на счет</span>
                          </div>
                          <div class="flex justify-between items-center text-sm mb-2">
                             <span class="text-gray-600">Подытог</span>
                             <span>$125.99</span>
                          </div>
                          <div class="flex justify-between items-center text-sm mb-4">
                             <span class="text-gray-600">Итого</span>
                             <span class="font-bold">$125.99</span>
                          </div>
                          <div class="border-t border-gray-100 pt-4">
                             <div class="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Оплачено клиентом</span>
                                <span>$125.99</span>
                             </div>
                             <div class="flex items-center justify-between">
                                <div class="flex items-center gap-2">
                                   <div class="w-8 h-5 border rounded flex items-center justify-center bg-white"><span class="text-[8px] font-bold text-blue-800">VISA</span></div>
                                   <div class="text-sm text-gray-900">•••• 4242</div>
                                </div>
                                <div class="flex items-center gap-2 text-xs text-gray-500">
                                   <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/></svg>
                                   Обработано шлюзом NMI
                                </div>
                             </div>
                          </div>
                       </div>

                       <!-- Timeline -->
                       <div class="pl-4 border-l-2 border-gray-200 space-y-6 relative">
                          <div class="relative">
                             <div class="absolute -left-[21px] top-1 w-3 h-3 bg-gray-400 rounded-full border-2 border-white box-content"></div>
                             <p class="text-xs text-gray-500">Заказ оформлен в онлайн-магазине</p>
                          </div>
                          <div class="relative">
                             <div class="absolute -left-[21px] top-1 w-3 h-3 bg-gray-400 rounded-full border-2 border-white box-content"></div>
                             <p class="text-sm text-gray-900 mb-1">Авторизация прошла успешно</p>
                             <div class="bg-white p-3 border rounded text-xs text-gray-600 font-mono space-y-1">
                                <div class="flex justify-between"><span>Шлюз (Gateway):</span> <span class="text-gray-900">NMI</span></div>
                                <div class="flex justify-between"><span>Код авт. (Auth):</span> <span class="text-gray-900">883721</span></div>
                                <div class="flex justify-between"><span>ID Транзакции:</span> <span class="text-gray-900">tr_998877</span></div>
                                <div class="flex justify-between"><span>Результат AVS:</span> <span class="text-green-600">Совпадение (Y)</span></div>
                                <div class="flex justify-between"><span>Статус 3DS:</span> <span class="text-green-600">Успех (Liability Shift)</span></div>
                             </div>
                          </div>
                       </div>
                    </div>

                    <!-- Right Column -->
                    <div class="space-y-6">
                       <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                          <h3 class="font-bold text-sm text-gray-900 mb-3">Клиент</h3>
                          <div class="text-sm text-blue-600 mb-1 hover:underline cursor-pointer">Джон Доу</div>
                          <p class="text-xs text-gray-500">1 заказ</p>
                          <div class="mt-4 pt-4 border-t border-gray-100">
                             <h4 class="font-bold text-xs text-gray-900 mb-1">Контакты</h4>
                             <p class="text-xs text-blue-600 hover:underline cursor-pointer">john@example.com</p>
                          </div>
                          <div class="mt-4 pt-4 border-t border-gray-100">
                             <h4 class="font-bold text-xs text-gray-900 mb-1">Адрес доставки</h4>
                             <p class="text-xs text-gray-600">
                                123 Main St<br>
                                New York, NY 10001<br>
                                США
                             </p>
                          </div>
                       </div>
                       
                       <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                          <h3 class="font-bold text-sm text-gray-900 mb-2">Анализ рисков</h3>
                          <div class="flex items-center gap-2 mb-2">
                             <div class="w-2 h-2 rounded-full bg-green-500"></div>
                             <span class="text-sm text-gray-900">Низкий</span>
                          </div>
                          <p class="text-xs text-gray-500 leading-relaxed">
                             Проверка 3D Secure пройдена. Код CVV верен.
                          </p>
                          <button class="mt-3 text-xs text-blue-600 hover:underline border border-gray-200 rounded px-2 py-1 bg-gray-50 w-full">Полный отчет</button>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        }

      </div>

      <!-- RIGHT ZONE: DEVELOPER TOOLS -->
      <div class="md:col-span-4 flex flex-col gap-4 md:h-full">
        
        <!-- Scenario Switcher -->
        <div class="bg-white p-4 rounded-lg border border-indigo-200 shadow-sm flex-shrink-0">
           <div class="flex items-center gap-2 mb-3 pb-2 border-b border-indigo-50">
             <div class="p-1 bg-indigo-100 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-indigo-600" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" /></svg>
             </div>
             <h4 class="text-sm font-bold text-gray-900">Панель Управления</h4>
          </div>
          
          <div class="space-y-2">
            <label class="flex items-center gap-3 p-2 rounded border border-transparent hover:bg-gray-50 cursor-pointer transition-all"
                   [class.bg-indigo-50]="simService.currentScenario() === 'SUCCESS'"
                   [class.border-indigo-100]="simService.currentScenario() === 'SUCCESS'">
              <input type="radio" name="scenario" [checked]="simService.currentScenario() === 'SUCCESS'" (change)="setScenario('SUCCESS')" class="text-indigo-600 focus:ring-indigo-500">
              <div>
                 <div class="text-xs font-bold text-gray-900">Happy Path (Успех)</div>
                 <div class="text-[10px] text-gray-500">Стандартная одобренная транзакция</div>
              </div>
            </label>
            
            <label class="flex items-center gap-3 p-2 rounded border border-transparent hover:bg-gray-50 cursor-pointer transition-all"
                   [class.bg-indigo-50]="simService.currentScenario() === '3DS_CHALLENGE'"
                   [class.border-indigo-100]="simService.currentScenario() === '3DS_CHALLENGE'">
              <input type="radio" name="scenario" [checked]="simService.currentScenario() === '3DS_CHALLENGE'" (change)="setScenario('3DS_CHALLENGE')" class="text-indigo-600 focus:ring-indigo-500">
              <div>
                 <div class="text-xs font-bold text-gray-900">Проверка 3DS</div>
                 <div class="text-[10px] text-gray-500">Запускает сценарий перенаправления на банк</div>
              </div>
            </label>
            
            <label class="flex items-center gap-3 p-2 rounded border border-transparent hover:bg-gray-50 cursor-pointer transition-all"
                   [class.bg-indigo-50]="simService.currentScenario() === 'DECLINE'"
                   [class.border-indigo-100]="simService.currentScenario() === 'DECLINE'">
              <input type="radio" name="scenario" [checked]="simService.currentScenario() === 'DECLINE'" (change)="setScenario('DECLINE')" class="text-indigo-600 focus:ring-indigo-500">
               <div>
                 <div class="text-xs font-bold text-gray-900">Отказ Банка</div>
                 <div class="text-[10px] text-gray-500">Ошибка: недостаточно средств</div>
              </div>
            </label>
          </div>
        </div>

        <!-- Logs Container -->
        <div class="h-96 md:h-auto md:flex-1 flex flex-col rounded-lg overflow-hidden shadow-sm relative min-h-0">
           <app-log-viewer class="absolute inset-0"></app-log-viewer>
        </div>

      </div>

    </div>

    <!-- Modals and Overlays -->
    @if (simService.is3DS()) {
      <app-three-ds-modal></app-three-ds-modal>
    }

    <app-status-overlay></app-status-overlay>
  `
})
export class CheckoutSimComponent {
  simService = inject(SimulationService);
  fb: FormBuilder = inject(FormBuilder);

  private readonly DEFAULT_CARD = {
    cardNumber: '4242 4242 4242 4242',
    expiry: '12/26',
    cvv: '123',
    name: 'Test User'
  };

  paymentForm = this.fb.group({
    cardNumber: [this.DEFAULT_CARD.cardNumber, Validators.required],
    expiry: [this.DEFAULT_CARD.expiry, Validators.required],
    cvv: [this.DEFAULT_CARD.cvv, Validators.required],
    name: [this.DEFAULT_CARD.name, Validators.required]
  });

  constructor() {
    // Automatically reset the form values when the service status goes back to IDLE
    effect(() => {
      if (this.simService.status() === 'IDLE') {
        this.paymentForm.reset(this.DEFAULT_CARD);
      }
    });
  }

  onSubmit() {
    if (this.paymentForm.valid) {
      const formValue = this.paymentForm.value as unknown as CardData;
      this.simService.startPayment(formValue);
    }
  }

  setScenario(sc: ScenarioType) {
    this.simService.setScenario(sc);
  }

  resetView() {
    this.simService.reset();
  }
}
