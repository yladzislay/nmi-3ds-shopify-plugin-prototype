import { Injectable, signal, computed } from '@angular/core';

export interface LogEntry {
  timestamp: string;
  source: 'SHOPIFY' | 'BACKEND' | 'NMI_GATEWAY' | 'BANK_ACS' | 'SYSTEM';
  type: 'INFO' | 'REQUEST' | 'RESPONSE' | 'ERROR';
  message: string;
  data?: unknown;
}

export interface CardData {
  cardNumber: string;
  expiry: string;
  cvv: string;
  name: string;
}

export interface SimulationStep {
  id: string;
  label: string;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'ERROR';
}

export type PaymentStatus = 'IDLE' | 'PROCESSING' | '3DS_REQUIRED' | 'SUCCESS' | 'FAILED';
export type ScenarioType = 'SUCCESS' | '3DS_CHALLENGE' | 'DECLINE';
export type ViewMode = 'CHECKOUT' | 'ADMIN_ORDER';

@Injectable({
  providedIn: 'root'
})
export class SimulationService {
  // State Signals
  readonly status = signal<PaymentStatus>('IDLE');
  readonly logs = signal<LogEntry[]>([]);
  readonly currentScenario = signal<ScenarioType>('SUCCESS');
  readonly viewMode = signal<ViewMode>('CHECKOUT');
  
  // Progress Steps
  readonly steps = signal<SimulationStep[]>([
    { id: 'tokenize', label: 'Токенизация карты (Hosted Fields)', status: 'PENDING' },
    { id: 'auth', label: 'Авторизация в NMI', status: 'PENDING' },
    { id: '3ds', label: 'Проверка 3D Secure', status: 'PENDING' },
    { id: 'capture', label: 'Финализация заказа', status: 'PENDING' }
  ]);
  
  // Computed
  readonly isProcessing = computed(() => this.status() === 'PROCESSING');
  readonly is3DS = computed(() => this.status() === '3DS_REQUIRED');

  constructor() {
    this.addLog('SYSTEM', 'INFO', 'Симуляция инициализирована. Готов к обработке платежей.');
  }

  setScenario(scenario: ScenarioType) {
    this.currentScenario.set(scenario);
    this.addLog('SYSTEM', 'INFO', `Сценарий тестирования изменен на: ${scenario}`);
  }

  setViewMode(mode: ViewMode) {
    this.viewMode.set(mode);
  }

  private updateStep(id: string, status: SimulationStep['status']) {
    this.steps.update(steps => 
      steps.map(s => s.id === id ? { ...s, status } : s)
    );
  }

  private resetSteps() {
    this.steps.update(steps => steps.map(s => ({ ...s, status: 'PENDING' })));
  }

  async startPayment(cardData: CardData) {
    this.status.set('PROCESSING');
    this.resetSteps();
    
    // Step 1: Tokenization
    this.updateStep('tokenize', 'ACTIVE');
    this.addLog('SHOPIFY', 'REQUEST', 'Инициация платежной сессии', { amount: 125.99, currency: 'USD' });
    await this.delay(600);
    this.updateStep('tokenize', 'COMPLETED');

    // Step 2: Auth Request
    this.updateStep('auth', 'ACTIVE');
    const maskedCard = {
      ...cardData,
      cardNumber: `**** **** **** ${cardData.cardNumber.slice(-4)}`,
      cvv: '***'
    };
    this.addLog('BACKEND', 'REQUEST', 'Отправка данных карты в NMI Gateway (XML/API)', maskedCard);
    await this.delay(800);

    const scenario = this.currentScenario();

    if (scenario === '3DS_CHALLENGE') {
      this.updateStep('auth', 'COMPLETED');
      this.handle3DSResponse();
    } else if (scenario === 'DECLINE') {
      this.updateStep('auth', 'ERROR');
      this.handleDecline();
    } else {
      this.updateStep('auth', 'COMPLETED');
      this.updateStep('3ds', 'COMPLETED'); // Skipped (Frictionless)
      this.handleSuccess();
    }
  }

  async complete3DS(success: boolean) {
    this.status.set('PROCESSING');
    this.updateStep('3ds', 'ACTIVE');
    this.addLog('BANK_ACS', 'INFO', 'Пользователь завершил 3DS проверку', { result: success ? 'SUCCESS' : 'CANCEL' });
    
    await this.delay(1000);

    if (success) {
      this.updateStep('3ds', 'COMPLETED');
      this.addLog('NMI_GATEWAY', 'RESPONSE', 'Транзакция одобрена (Post-3DS)', { auth_code: '883721', cavv: 'Valid' });
      this.handleSuccess();
    } else {
      this.updateStep('3ds', 'ERROR');
      this.addLog('NMI_GATEWAY', 'ERROR', 'Ошибка 3DS аутентификации');
      this.handleDecline();
    }
  }

  private handle3DSResponse() {
    this.addLog('NMI_GATEWAY', 'RESPONSE', 'Требуется 3D Secure (Soft Decline)', {
      response_code: '200',
      '3ds_redirect_url': 'https://acs.bank.com/verify',
      pa_req: 'eCx...'
    });
    this.updateStep('3ds', 'ACTIVE'); // Waiting for user
    this.status.set('3DS_REQUIRED');
  }

  private async handleSuccess() {
    this.updateStep('capture', 'ACTIVE');
    await this.delay(600);
    this.addLog('NMI_GATEWAY', 'RESPONSE', 'Транзакция успешна', { transaction_id: 'tr_998877', amount: '125.99' });
    this.updateStep('capture', 'COMPLETED');
    this.status.set('SUCCESS');
    this.addLog('SHOPIFY', 'INFO', 'Заказ оплачен. Переход на Thank You Page.');
  }

  private handleDecline() {
    this.addLog('NMI_GATEWAY', 'ERROR', 'Транзакция отклонена банком', { reason: 'Insufficient Funds', response_code: '300' });
    this.status.set('FAILED');
  }

  private addLog(source: LogEntry['source'], type: LogEntry['type'], message: string, data?: unknown) {
    const entry: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      source,
      type,
      message,
      data
    };
    this.logs.update(logs => [...logs, entry]);
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  reset() {
    this.status.set('IDLE');
    this.resetSteps();
    this.viewMode.set('CHECKOUT');
    this.addLog('SYSTEM', 'INFO', 'Состояние сброшено. Новая сессия.');
  }
}
