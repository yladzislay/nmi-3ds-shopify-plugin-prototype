
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-architecture',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-5xl mx-auto bg-white min-h-full shadow-sm rounded-xl overflow-hidden mb-12">
      
      <!-- HERO SECTION -->
      <div class="bg-gray-50 border-b border-gray-100 p-8 md:p-12">
        <div class="flex flex-wrap gap-2 mb-6">
          <span class="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wide border border-indigo-200">
            Technical Specification
          </span>
          <span class="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wide border border-green-200">
            PCI DSS Scope: SAQ A-EP
          </span>
        </div>
        
        <h1 class="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
          Интеграция NMI Payment Gateway <br>
          <span class="text-indigo-600">Введение в предметную область</span>
        </h1>
        
        <p class="text-lg text-gray-600 max-w-3xl leading-relaxed mb-8">
          Комплексное руководство по реализации <strong>Custom Payment App</strong> для платформы Shopify. 
          Документ охватывает архитектурные решения, потоки данных 3D Secure и стратегию внедрения.
        </p>

        <!-- Quick Nav -->
        <div class="flex flex-wrap gap-4 text-sm font-medium text-gray-500">
          <a href="#context" class="hover:text-indigo-600 transition-colors flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-indigo-400"></span> Контекст
          </a>
          <a href="#architecture" class="hover:text-indigo-600 transition-colors flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-indigo-400"></span> Архитектура
          </a>
           <a href="#code-sample" class="hover:text-indigo-600 transition-colors flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-indigo-400"></span> Код
          </a>
          <a href="#roadmap" class="hover:text-indigo-600 transition-colors flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-indigo-400"></span> Roadmap
          </a>
        </div>
      </div>

      <div class="p-8 md:p-12 space-y-20">

        <!-- 1. CONTEXT & REQUIREMENTS -->
        <section id="context">
          <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-900 text-white text-sm font-mono">01</span>
            Контекст и Задача
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="prose text-sm text-gray-600">
              <p class="mb-4">
                <strong>Цель:</strong> Создать Shopify-плагин (Custom App), который позволяет клиентам интернет-магазина безопасно оплачивать товары банковскими картами через шлюз NMI.
              </p>
              <ul class="list-disc pl-5 space-y-2">
                <li><strong>Безопасность:</strong> Поддержка 3D Secure (3DS) обязательна для соответствия PSD2.</li>
                <li><strong>UX:</strong> Максимально бесшовная интеграция в Shopify Checkout.</li>
                <li><strong>Compliance:</strong> Данные карты не должны касаться нашего сервера (использование Hosted Fields / Tokenization).</li>
              </ul>
            </div>
            <div class="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
              <h3 class="font-bold text-indigo-900 mb-3 text-sm">Ключевые сущности</h3>
              <div class="space-y-3">
                 <div class="flex items-start gap-3">
                    <div class="w-6 h-6 rounded bg-indigo-200 text-indigo-700 flex items-center justify-center text-xs font-bold">1</div>
                    <div>
                      <span class="block text-xs font-bold text-gray-900">Shopify Checkout</span>
                      <span class="text-xs text-gray-600">Инициирует сессию и отображает UI формы.</span>
                    </div>
                 </div>
                 <div class="flex items-start gap-3">
                    <div class="w-6 h-6 rounded bg-indigo-200 text-indigo-700 flex items-center justify-center text-xs font-bold">2</div>
                    <div>
                      <span class="block text-xs font-bold text-gray-900">Middleware (Наш Backend)</span>
                      <span class="text-xs text-gray-600">Remix App. Хранит ключи, управляет транзакциями.</span>
                    </div>
                 </div>
                 <div class="flex items-start gap-3">
                    <div class="w-6 h-6 rounded bg-indigo-200 text-indigo-700 flex items-center justify-center text-xs font-bold">3</div>
                    <div>
                      <span class="block text-xs font-bold text-gray-900">NMI Gateway</span>
                      <span class="text-xs text-gray-600">Выполняет процессинг и 3DS проверку.</span>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 2. ARCHITECTURE & FLOW -->
        <section id="architecture">
          <h2 class="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-900 text-white text-sm font-mono">02</span>
            Архитектура и Потоки Данных
          </h2>
          
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <!-- Stack Cards -->
            <div class="space-y-6">
              <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-indigo-300 transition-all group">
                <div class="flex items-start gap-4">
                  <div class="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🛍️</div>
                  <div>
                    <h3 class="font-bold text-gray-900">Shopify App (Backend)</h3>
                    <p class="text-xs text-gray-500 font-mono mt-1">Node.js • Remix • Prisma</p>
                    <p class="text-sm text-gray-600 mt-2 leading-relaxed">
                      Middleware сервер. Хранит API ключи NMI, обрабатывает сессии, управляет базой данных транзакций.
                    </p>
                  </div>
                </div>
              </div>

              <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-indigo-300 transition-all group">
                <div class="flex items-start gap-4">
                  <div class="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">💳</div>
                  <div>
                    <h3 class="font-bold text-gray-900">Checkout Extension (UI)</h3>
                    <p class="text-xs text-gray-500 font-mono mt-1">React • Shopify Polaris</p>
                    <p class="text-sm text-gray-600 mt-2 leading-relaxed">
                      Изолированный UI компонент, который рендерится внутри чекаута Shopify. Собирает данные карты.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Visual Flow -->
            <div class="bg-gray-900 rounded-xl p-6 text-gray-300 font-mono text-xs leading-relaxed shadow-lg relative overflow-hidden flex flex-col justify-center">
              <div class="absolute top-0 right-0 p-4 opacity-10 text-7xl font-bold select-none">DATA</div>
              <div class="space-y-6 relative z-10">
                <div class="flex items-center gap-3">
                  <span class="w-16 text-right font-bold text-green-400">CLIENT</span> 
                  <span class="flex-1 border-b border-gray-700 border-dashed relative top-[-1px]"></span>
                  <span class="text-white">Secure Input (Hosted Fields)</span>
                </div>
                
                <div class="flex items-center gap-3">
                  <span class="w-16 text-right font-bold text-indigo-400">SERVER</span>
                  <span class="flex-1 border-b border-gray-700 border-dashed relative top-[-1px]"></span>
                  <span class="text-white">Authorize Request (XML)</span>
                </div>

                <div class="flex items-center gap-3">
                  <span class="w-16 text-right font-bold text-yellow-400">NMI</span>
                  <span class="flex-1 border-b border-gray-700 border-dashed relative top-[-1px]"></span>
                  <span class="text-white">3DS Check / Approval</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 3. PROJECT STRUCTURE -->
        <section id="structure">
           <h2 class="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-900 text-white text-sm font-mono">03</span>
            Структура Проекта (File Tree)
          </h2>
          <div class="bg-[#1e1e1e] rounded-xl p-6 shadow-md overflow-x-auto">
            <pre class="font-mono text-sm leading-6"><code class="language-bash" [innerHTML]="structureSnippet"></code></pre>
          </div>
        </section>

        <!-- 4. CODE IMPLEMENTATION -->
        <section id="code-sample">
           <h2 class="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-900 text-white text-sm font-mono">04</span>
            Пример Реализации (Backend)
          </h2>
          <div class="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
             <div class="px-4 py-2 bg-gray-900 border-b border-gray-700 flex justify-between items-center">
               <span class="text-xs text-gray-400 font-mono">app/routes/api.payment.tsx</span>
               <span class="text-[10px] text-gray-500">TypeScript</span>
             </div>
             <div class="p-4 overflow-x-auto">
                <pre class="text-sm font-mono text-gray-300 leading-relaxed"><code [innerHTML]="backendSnippet"></code></pre>
             </div>
          </div>
          <p class="mt-4 text-sm text-gray-500">
            * Пример логики обработки платежа на стороне Remix-сервера. Показан ключевой момент перехвата 200-го ответа для инициации редиректа.
          </p>
        </section>

        <!-- 5. DETAILED ROADMAP -->
        <section id="roadmap">
          <h2 class="text-2xl font-bold text-gray-900 mb-10 flex items-center gap-3">
            <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white text-sm font-mono">05</span>
            Roadmap Реализации
          </h2>

          <div class="relative border-l-2 border-indigo-100 ml-3 md:ml-6 space-y-12">
            
            <!-- Phase 1 -->
            <div class="relative pl-8 md:pl-12">
              <span class="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-indigo-600 ring-4 ring-white"></span>
              <div class="mb-2 flex items-center gap-3">
                <h3 class="text-xl font-bold text-gray-900">Фаза 1: Фундамент (MVP)</h3>
                <span class="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase">Спринт 1</span>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-gray-50 p-4 rounded border border-gray-100">
                  <div class="font-bold text-gray-800 text-sm mb-1">1. Setup & Config</div>
                  <p class="text-xs text-gray-500">Инициализация Shopify CLI, деплой на Fly.io, настройка переменных окружения (NMI Keys).</p>
                </div>
                <div class="bg-gray-50 p-4 rounded border border-gray-100">
                  <div class="font-bold text-gray-800 text-sm mb-1">2. Basic Transaction</div>
                  <p class="text-xs text-gray-500">Реализация методов <code>authorize</code> и <code>capture</code>. Проверка успешной оплаты без 3DS.</p>
                </div>
              </div>
            </div>

            <!-- Phase 2 -->
            <div class="relative pl-8 md:pl-12">
              <span class="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-yellow-500 ring-4 ring-white shadow-sm"></span>
              <div class="mb-2 flex items-center gap-3">
                <h3 class="text-xl font-bold text-gray-900">Фаза 2: Безопасность (3DS)</h3>
                <span class="px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 text-[10px] font-bold uppercase">Спринт 2</span>
              </div>
              <p class="text-gray-600 mb-4 text-sm">Самый критичный этап для Compliance.</p>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div class="bg-yellow-50 p-4 rounded border border-yellow-100">
                  <div class="font-bold text-gray-900 text-sm mb-1">3. Challenge Flow Logic</div>
                  <p class="text-xs text-gray-600">Обработка ответа <code>200 Soft Decline</code>. Редирект юзера на ACS URL.</p>
                </div>
                <div class="bg-yellow-50 p-4 rounded border border-yellow-100">
                  <div class="font-bold text-gray-900 text-sm mb-1">4. Callback Handling</div>
                  <p class="text-xs text-gray-600">Безопасный прием ответа от банка. Валидация подписи (если есть) и финализация заказа.</p>
                </div>
              </div>
            </div>

            <!-- Phase 3 -->
            <div class="relative pl-8 md:pl-12">
              <span class="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-green-500 ring-4 ring-white"></span>
              <div class="mb-2 flex items-center gap-3">
                <h3 class="text-xl font-bold text-gray-900">Фаза 3: Production Ready</h3>
                <span class="px-2 py-0.5 rounded bg-green-100 text-green-700 text-[10px] font-bold uppercase">Спринт 3</span>
              </div>
              <ul class="space-y-2 mt-3">
                <li class="flex items-center gap-2 text-sm text-gray-600">
                  <svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                  Логирование в БД (PostgreSQL)
                </li>
                <li class="flex items-center gap-2 text-sm text-gray-600">
                  <svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                  Админ-панель транзакций (Refund button)
                </li>
              </ul>
            </div>

          </div>
        </section>

        <!-- 6. GLOSSARY (COMPACT) -->
        <section id="glossary">
           <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-200 text-gray-600 text-sm font-mono">06</span>
            Глоссарий (Коротко)
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div class="bg-gray-50 p-4 rounded border border-gray-100">
                <h4 class="font-bold text-gray-900 text-sm">3DS (Challenge)</h4>
                <p class="text-xs text-gray-500 mt-1">Сценарий, когда банк требует ввода SMS кода (редирект на ACS).</p>
             </div>
             <div class="bg-gray-50 p-4 rounded border border-gray-100">
                <h4 class="font-bold text-gray-900 text-sm">Frictionless Flow</h4>
                <p class="text-xs text-gray-500 mt-1">"Оплата без трения". Банк доверяет юзеру, SMS не требуется.</p>
             </div>
             <div class="bg-gray-50 p-4 rounded border border-gray-100">
                <h4 class="font-bold text-gray-900 text-sm">Hosted Fields</h4>
                <p class="text-xs text-gray-500 mt-1">Поля ввода в iframe. Данные летят сразу в NMI, минуя наш сервер.</p>
             </div>
          </div>
        </section>

      </div>
      
      <!-- FOOTER -->
      <div class="bg-gray-50 border-t border-gray-200 p-8 text-center">
        <p class="text-xs text-gray-400 font-mono">
          Architecture designed for High-Load & High-Risk processing standards.
        </p>
      </div>

    </div>
  `
})
export class ArchitectureComponent {
  structureSnippet = `<span class="text-blue-400">my-nmi-app/</span>
├── <span class="text-yellow-400">shopify.app.toml</span>        <span class="text-gray-500"># Конфигурация приложения (scopes, webhooks)</span>
├── <span class="text-blue-400">app/</span>                    <span class="text-gray-500"># Remix Backend Logic</span>
│   ├── <span class="text-blue-400">routes/</span>
│   │   ├── <span class="text-green-400">api.payment.tsx</span>   <span class="text-gray-500"># ⚡️ Main Payment Endpoint (Handle 3DS here)</span>
│   │   └── <span class="text-green-400">webhooks.tsx</span>      <span class="text-gray-500"># Обработка Refund/Capture событий</span>
│   └── <span class="text-green-400">db.server.ts</span>        <span class="text-gray-500"># Prisma Client</span>
├── <span class="text-blue-400">extensions/</span>             <span class="text-gray-500"># UI Extensions</span>
│   └── <span class="text-blue-400">nmi-payment-ui/</span>
│       ├── <span class="text-yellow-400">shopify.extension.toml</span>
│       └── <span class="text-blue-400">src/</span>
│           └── <span class="text-green-400">Checkout.tsx</span>  <span class="text-gray-500"># 🎨 React компонент формы оплаты</span>
└── <span class="text-blue-400">package.json</span>`;

  backendSnippet = `<span class="text-pink-400">export</span> <span class="text-pink-400">const</span> action = <span class="text-pink-400">async</span> ({ request }: ActionFunctionArgs) => {
  <span class="text-gray-500">// 1. Аутентификация запроса от Shopify Checkout</span>
  <span class="text-pink-400">const</span> { paymentSession } = <span class="text-pink-400">await</span> authenticate.public.checkout(request);
  
  <span class="text-pink-400">const</span> payload = <span class="text-pink-400">await</span> request.json();

  <span class="text-gray-500">// 2. Отправка в NMI (Server-to-Server)</span>
  <span class="text-pink-400">const</span> nmiResponse = <span class="text-pink-400">await</span> nmiService.authorize({
    amount: payload.amount,
    token: payload.encryptedToken
  });

  <span class="text-gray-500">// 3. Обработка 3D Secure (Soft Decline)</span>
  <span class="text-pink-400">if</span> (nmiResponse.response_code === <span class="text-yellow-300">'200'</span>) {
    <span class="text-pink-400">return</span> json({
      status: <span class="text-yellow-300">"redirect"</span>,
      redirectUrl: nmiResponse.acs_url, <span class="text-gray-500">// URL банка</span>
      sessionToken: paymentSession.id
    });
  }

  <span class="text-gray-500">// 4. Успех</span>
  <span class="text-pink-400">return</span> json({ status: <span class="text-green-400">"success"</span> });
};`;
}
