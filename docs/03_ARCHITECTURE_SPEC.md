# Техническая Архитектура

## 1. Компоненты Системы

### A. Client Side (Shopify Checkout)
*   Отвечает за рендеринг формы (Hosted Fields).
*   Собирает данные карты и токенизирует их (через NMI JS library) или отправляет в зашифрованном виде.
*   Обрабатывает ответ Backend (Успех / Редирект / Ошибка).

### B. Middleware (Payment App Backend)
*   Выступает посредником между Shopify и NMI.
*   Хранит `API_KEY` и секреты.
*   Формирует XML/JSON запросы к NMI Gateway.
*   Управляет статусом `PaymentSession` в Shopify (Resolve/Reject/Pending).

### C. NMI Gateway
*   Внешний провайдер платежей.
*   Выполняет процессинг карт и 3DS инициацию.

## 2. Поток Данных (Happy Path)
1.  **User:** Вводит данные карты -> Нажимает "Оплатить".
2.  **Client:** Отправляет запрос на Backend `/process-payment`.
3.  **Backend:** Формирует запрос в NMI (Sale).
4.  **NMI:** Возвращает `response_code: 100` (Approved).
5.  **Backend:** Вызывает Shopify API `paymentSessionResolve`.
6.  **Client:** Перенаправляет на Thank You Page.

## 3. Поток Данных (3DS Challenge)
1.  **User:** Вводит данные карты -> Нажимает "Оплатить".
2.  **Backend:** Формирует запрос в NMI.
3.  **NMI:** Возвращает `response_code: 200` + `3ds_url` (Soft Decline).
4.  **Backend:** Вызывает Shopify API `paymentSessionRedirect` с URL банка.
5.  **Client:** Shopify открывает iframe/окно с сайтом банка.
6.  **User:** Вводит SMS код.
7.  **Client:** После возврата, повторяет запрос на финализацию.
8.  **Backend:** Подтверждает транзакцию в NMI и закрывает сессию Shopify.