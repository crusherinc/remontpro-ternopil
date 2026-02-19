# РемПро Тернопіль — Landing Page

Повноцінний лендинг для компанії з ремонту квартир та будинків у Тернополі.

## Структура проекту

```
remontpro-ternopil/
├── index.html              # Головна HTML-сторінка
├── css/
│   ├── styles.css          # Головні стилі (дизайн-система)
│   └── animations.css      # Анімації та ефекти
├── js/
│   ├── main.js             # Основна логіка (tabs, FAQ, counters...)
│   └── telegram.js         # Інтеграція з Telegram Bot API
└── README.md
```

## Особливості сайту

- **Tabs** — сервіси та портфоліо з переключенням вкладок
- **Картки** — послуги, переваги, відгуки, портфоліо
- **FAQ Accordion** — часті запитання
- **Counter Animation** — лічильники статистики
- **Scroll Reveal** — анімація появи елементів
- **Scroll Progress Bar** — прогрес прокрутки сторінки
- **Mobile Responsive** — адаптивний для всіх пристроїв
- **Telegram Form** — заявки надходять у Telegram
- **Back to Top** — кнопка повернення вгору
- **Toast Notifications** — повідомлення про успіх/помилку

## Налаштування Telegram Bot

### Крок 1: Створення бота
1. Відкрийте Telegram і знайдіть **@BotFather**
2. Надішліть `/newbot`
3. Введіть ім'я бота (наприклад: "РемПро Тернопіль")
4. Введіть username бота (наприклад: `remprotop_bot`)
5. Збережіть отриманий **токен** (виглядає як `7123456789:AAHxx...`)

### Крок 2: Отримання Chat ID
1. Надішліть будь-яке повідомлення вашому новому боту
2. Відкрийте у браузері:
   ```
   https://api.telegram.org/bot<ВАШ_ТОКЕН>/getUpdates
   ```
3. У відповіді знайдіть `"chat":{"id":XXXXXXX}` — це ваш **Chat ID**

### Крок 3: Налаштування сайту
Відкрийте `js/telegram.js` і замініть:

```javascript
const TELEGRAM_BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE';
// → замініть на ваш токен, наприклад:
const TELEGRAM_BOT_TOKEN = '7123456789:AAHxxxxxxxxxxxxxx';

const TELEGRAM_CHAT_ID = 'YOUR_CHAT_ID_HERE';
// → замініть на ваш chat_id, наприклад:
const TELEGRAM_CHAT_ID = '123456789';
```

### Тестування
Після заміни заповніть форму на сайті та натисніть "Надіслати заявку".
Повідомлення повинно з'явитися у Telegram.

---

## Налаштування контактних даних

Відкрийте `index.html` та знайдіть/замініть:

| Що замінити | Де шукати |
|---|---|
| `+380 50 123 45 67` | Секції Contact, Footer, Navbar |
| `+380 67 123 45 67` | Секція Contact |
| `info@remontpro.te.ua` | Секції Contact, Footer |
| `вул. Руська, 15, оф. 301` | Секції Contact, Footer |
| `@remprotop` | Посилання на Telegram |
| `РемПро` | Назва компанії (логотип) |

---

## Безпека (важливо для продакшн)

> ⚠ Токен Telegram Bot видимий у клієнтському JavaScript. Будь-хто може його знайти у DevTools → Sources.

**Рішення для продакшн:**

### Варіант A: Netlify Functions (безкоштовно)
1. Задеплойте сайт на [Netlify](https://netlify.com)
2. Створіть `netlify/functions/send-telegram.js`:
   ```javascript
   exports.handler = async (event) => {
     const data = JSON.parse(event.body);
     const res  = await fetch(
       `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
       { method: 'POST', headers: {'Content-Type':'application/json'},
         body: JSON.stringify({ chat_id: process.env.CHAT_ID, text: data.text, parse_mode: 'MarkdownV2' }) }
     );
     return { statusCode: 200, body: await res.text() };
   };
   ```
3. Задайте Environment Variables у Netlify Dashboard: `BOT_TOKEN`, `CHAT_ID`
4. У `telegram.js` змініть URL на `/.netlify/functions/send-telegram`

### Варіант B: Vercel Edge Functions
Аналогічно через `api/send-telegram.js`

### Варіант C: Власний PHP-бекенд
```php
<?php
$data = json_decode(file_get_contents('php://input'), true);
$token = 'YOUR_TOKEN'; // зберігати у конфігу, не у публічному файлі
$chat  = 'YOUR_CHAT_ID';
$url   = "https://api.telegram.org/bot{$token}/sendMessage";
file_get_contents($url . '?' . http_build_query([
    'chat_id' => $chat,
    'text'    => $data['text'],
    'parse_mode' => 'MarkdownV2'
]));
echo json_encode(['ok' => true]);
```

---

## Деплой

### Простий варіант (статичний хостинг)
1. [Netlify Drop](https://app.netlify.com/drop) — перетягніть папку
2. [Vercel](https://vercel.com) — підключіть GitHub репозиторій
3. [GitHub Pages](https://pages.github.com) — безкоштовно

### Локально
```bash
# Простий Python сервер
python3 -m http.server 3000
# або
npx serve .
```

Відкрийте: `http://localhost:3000`

---

## Персоналізація

### Кольори (css/styles.css)
```css
:root {
  --primary:   #1B3C6B;  /* Темно-синій */
  --secondary: #E8701A;  /* Помаранчевий */
  --accent:    #F4C136;  /* Золотий */
}
```

### Шрифти
Сайт використовує Google Fonts:
- **Montserrat** (заголовки) — сучасний, потужний
- **Open Sans** (тіло) — читабельний, дружній

### Зображення
Замініть CSS-градієнти у картках портфоліо на реальні фото:
```css
.portfolio-card {
  /* Замість: */
  background: linear-gradient(...);
  /* Використайте: */
  background-image: url('assets/photos/project-1.jpg');
  background-size: cover;
}
```

---

## Технічний стек

- **HTML5** — семантична розмітка, ARIA-атрибути
- **CSS3** — Custom Properties, Grid, Flexbox, анімації
- **Vanilla JavaScript (ES2020)** — без залежностей
- **Google Fonts** — Montserrat + Open Sans
- **Font Awesome 6** — іконки
- **Telegram Bot API** — відправка заявок

---

## Ліцензія
Зроблено для РемПро Тернопіль. Всі права захищені.
