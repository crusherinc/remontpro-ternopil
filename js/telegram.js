/**
 * REMONTPRO TERNOPIL — TELEGRAM BOT INTEGRATION
 * ==============================================
 * Надсилає заявки з контактної форми у Telegram-чат власника.
 *
 * НАЛАШТУВАННЯ (обов'язково!):
 * 1. Створіть бота через @BotFather у Telegram → /newbot
 * 2. Збережіть токен бота у змінну TELEGRAM_BOT_TOKEN
 * 3. Надішліть будь-яке повідомлення вашому боту
 * 4. Відкрийте: https://api.telegram.org/bot<TOKEN>/getUpdates
 *    та знайдіть "chat":{"id":XXXXXXX} — це ваш TELEGRAM_CHAT_ID
 * 5. Замініть значення нижче та збережіть файл
 *
 * ⚠ БЕЗПЕКА: Токен бота буде видимий у клієнтському коді.
 *   Для продакшн-сайту рекомендується проксі через Netlify Functions /
 *   Vercel Edge Functions або власний backend (Node.js/PHP).
 *   Детальніше: README.md → розділ "Безпека"
 */

'use strict';

// =========================================================
//  КОНФІГУРАЦІЯ — ЗАМІНІТЬ ЦІ ЗНАЧЕННЯ!
// =========================================================
const TELEGRAM_BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE';
// Приклад: '7123456789:AAHxxx-xxxxxxxxxxxxxxxxxxxxxx'

const TELEGRAM_CHAT_ID = 'YOUR_CHAT_ID_HERE';
// Приклад: '123456789'   (особистий чат власника)
// або:     '-1001234567890'  (груповий чат / канал)
// =========================================================

/**
 * Формує текстове повідомлення для Telegram (MarkdownV2 escaping)
 * @param {Object} data - дані форми
 * @returns {string}
 */
function buildMessage(data) {
  const esc = (s) => String(s).replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');

  const area    = data.area ? `${esc(data.area)} м²` : 'не вказано';
  const message = data.message?.trim() ? esc(data.message) : '_не вказано_';
  const date    = new Date().toLocaleString('uk-UA', {
    timeZone: 'Europe/Kiev',
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return `🏗 *Нова заявка з сайту РемПро\\!*

👤 *Ім'я:* ${esc(data.name)}
📞 *Телефон:* ${esc(data.phone)}
🔧 *Послуга:* ${esc(data.service)}
📐 *Площа:* ${area}
💬 *Повідомлення:* ${message}

🕐 *Час:* ${esc(date)}
🌐 *Джерело:* Сайт remontpro\\.te\\.ua`;
}

/**
 * Надсилає заявку у Telegram через Bot API
 * @param {Object} formData - { name, phone, service, area, message }
 * @returns {Promise<{ok: boolean, description?: string}>}
 */
async function sendToTelegram(formData) {
  // Перевірка конфігурації
  if (
    TELEGRAM_BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE' ||
    TELEGRAM_CHAT_ID   === 'YOUR_CHAT_ID_HERE'
  ) {
    console.warn(
      '⚠ Telegram не налаштований!\n' +
      'Відредагуйте js/telegram.js і вкажіть TELEGRAM_BOT_TOKEN та TELEGRAM_CHAT_ID.\n' +
      'Деталі: README.md'
    );
    // У режимі розробки — симулюємо успіх, щоб сайт можна було тестувати
    return new Promise(resolve =>
      setTimeout(() => resolve({ ok: true, _dev: true }), 900)
    );
  }

  const url  = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const body = {
    chat_id:    TELEGRAM_CHAT_ID,
    text:       buildMessage(formData),
    parse_mode: 'MarkdownV2',
    disable_web_page_preview: true
  };

  const response = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Telegram API HTTP ${response.status}: ${errText}`);
  }

  return response.json();
}

// Expose for main.js
window.sendToTelegram = sendToTelegram;
