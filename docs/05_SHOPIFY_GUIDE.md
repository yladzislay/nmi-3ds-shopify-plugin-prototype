# Руководство: Создание NMI Payment App для Shopify

## 1. Подготовка окружения
Перед началом работы убедитесь, что у вас есть:
1.  **Shopify Partner Account** (для создания дев-магазина).
2.  **Node.js 18+**.
3.  **NMI Sandbox Account** (для получения ключей API).

## 2. Инициализация Проекта
Мы используем официальный CLI Shopify.

```bash
npm init @shopify/app@latest
```

*   **Template:** Remix (рекомендуется для Backend).
*   **Name:** `nmi-payment-provider`.

## 3. Создание Payments Extension
Платежный интерфейс — это отдельное расширение внутри приложения.

```bash
cd nmi-payment-provider
npm run shopify app generate extension
```

*   **Type:** `Payment Customization` или `Payments App` (выбираем *Offsite Payment App* или *Credit Card Payment App* в зависимости от доступности API, для NMI обычно используется конфигурация провайдера).

## 4. Конфигурация (shopify.app.toml)
Этот файл связывает ваше приложение с экосистемой Shopify.

```toml
# shopify.app.toml

[extensions.targeting]
target = "purchase.checkout.payment-method.render"

[access_scopes]
scopes = "write_payment_sessions,read_payment_sessions"

[webhooks]
api_version = "2024-01"
```

## 5. Реализация Backend (Remix)
Самая важная часть. Нам нужно создать эндпоинт для обработки запроса на оплату.

### Файл: `app/routes/api.payment.session.tsx`

```typescript
import { ActionFunctionArgs, json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { paymentSession } = await authenticate.public.checkout(request);
  
  // 1. Получаем данные
  const payload = await request.json();
  const { amount, currency, paymentMethod } = payload;

  // 2. Отправляем в NMI (Ваша функция обертка)
  const nmiResponse = await sendToNmi({
    amount,
    card: paymentMethod.data
  });

  // 3. Обработка 3D Secure (Soft Decline)
  if (nmiResponse.response_code === '200') {
    return json({
      status: "redirect",
      redirectUrl: nmiResponse.acs_url, // URL банка
      sessionToken: paymentSession.id
    });
  }

  // 4. Успех
  if (nmiResponse.response_code === '100') {
    return json({ status: "success" });
  }

  // 5. Ошибка
  return json({ status: "failed", reason: nmiResponse.responsetext }, { status: 400 });
};
```

## 6. Frontend (Checkout Extension)
Здесь мы используем `Shopify UI Extensions API`.

### Файл: `extensions/payment-extension/src/Checkout.tsx`

```typescript
import {
  reactExtension,
  BlockStack,
  PaymentMethodHandler,
} from '@shopify/ui-extensions-react/checkout';

export default reactExtension('purchase.checkout.payment-method.render', () => <App />);

function App() {
  return (
    <BlockStack>
       {/* Здесь мы рендерим Hosted Fields от NMI через iFrame или
           используем нативные поля, если позволяет PCI Compliance */}
    </BlockStack>
  );
}
```

## 7. Следующие шаги
1.  Развернуть приложение на хостинге (Fly.io / Heroku).
2.  Настроить `App URL` в панели партнера.
3.  Протестировать тестовой картой NMI.
