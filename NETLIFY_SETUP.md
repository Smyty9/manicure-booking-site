# 🚀 Размещение сайта на Netlify с n8n на Beget

Пошаговая инструкция по размещению сайта записи к мастеру маникюра на Netlify с интеграцией n8n на Beget.

## 📋 Подготовка файлов

### 1. Обновите webhook URL
В файле `script.js` замените строку:
```javascript
const WEBHOOK_URL = 'https://your-domain.beget.com/webhook-test/c31eacd5-e2d4-4bbd-b62f-647e52ebc493';
```

На ваш реальный URL n8n на Beget:
```javascript
const WEBHOOK_URL = 'https://ваш-домен.beget.com/webhook-test/c31eacd5-e2d4-4bbd-b62f-647e52ebc493';
```

### 2. Структура файлов
Убедитесь, что у вас есть все файлы в одной папке:
```
manicure-booking-site/
├── index.html
├── style.css
├── script.js
└── README.md
```

## 🌐 Размещение на Netlify

### Способ 1: Drag & Drop (Быстрый)

1. **Перейдите на Netlify:**
   - Откройте [netlify.com](https://netlify.com)
   - Нажмите "Sign up" или войдите в аккаунт

2. **Загрузите файлы:**
   - Перетащите папку с файлами в область "Drag and drop your site output folder here"
   - Дождитесь загрузки (обычно 10-30 секунд)

3. **Получите URL:**
   - Netlify автоматически создаст URL типа: `https://amazing-name-123456.netlify.app`
   - Сайт сразу станет доступен

### Способ 2: Через GitHub (Рекомендуется)

1. **Создайте GitHub репозиторий:**
   ```bash
   # Создайте папку для проекта
   mkdir manicure-booking-site
   cd manicure-booking-site
   
   # Скопируйте все файлы в папку
   # index.html, style.css, script.js, README.md
   
   # Инициализируйте git
   git init
   git add .
   git commit -m "Initial commit: Manicure booking site"
   
   # Создайте репозиторий на GitHub
   # Затем выполните:
   git remote add origin https://github.com/ваш-username/manicure-booking-site.git
   git push -u origin main
   ```

2. **Подключите к Netlify:**
   - В Netlify нажмите "New site from Git"
   - Выберите "GitHub"
   - Выберите ваш репозиторий
   - Нажмите "Deploy site"

## ⚙️ Настройка n8n на Beget

### 1. Создайте webhook в n8n
1. Откройте ваш n8n на Beget
2. Создайте новый workflow
3. Добавьте **Webhook Trigger**:
   - HTTP Method: `POST`
   - Path: `booking-webhook`
   - Получите URL: `https://ваш-домен.beget.com/webhook-test/booking-webhook`

### 2. Добавьте обработку данных
После webhook добавьте узлы для обработки:

#### Узел Telegram (для уведомлений):
```json
{
  "operation": "sendMessage",
  "chatId": "ВАШ_CHAT_ID",
  "text": "=Новая запись на маникюр:\n\n👤 Имя: {{$json.clientName}}\n📞 Телефон: {{$json.clientPhone}}\n📱 Telegram: {{$json.clientTelegram}}\n📅 Дата: {{$json.date}}\n⏰ Время: {{$json.time}}\n\n🕐 Время записи: {{$json.timestamp}}"
}
```

#### Узел Google Sheets (для сохранения):
```json
{
  "operation": "append",
  "sheetName": "Записи",
  "columns": {
    "Дата": "={{$json.date}}",
    "Время": "={{$json.time}}",
    "Имя": "={{$json.clientName}}",
    "Телефон": "={{$json.clientPhone}}",
    "Telegram": "={{$json.clientTelegram}}",
    "Время записи": "={{$json.timestamp}}"
  }
}
```

### 3. Активируйте workflow
- Нажмите "Active" в правом верхнем углу
- Скопируйте webhook URL

## 🔧 Настройка домена

### Бесплатный домен Netlify
- URL будет типа: `https://amazing-name-123456.netlify.app`
- Можно изменить в настройках сайта

### Кастомный домен (опционально)
1. В настройках сайта на Netlify нажмите "Domain settings"
2. Нажмите "Add custom domain"
3. Введите ваш домен
4. Настройте DNS записи у регистратора

## 🧪 Тестирование

### 1. Проверьте сайт
- Откройте ваш Netlify URL
- Проверьте работу календаря
- Попробуйте создать тестовую запись

### 2. Проверьте webhook
- Откройте Developer Tools (F12)
- Перейдите на вкладку Network
- Создайте запись и проверьте отправку данных

### 3. Проверьте n8n
- Откройте ваш n8n на Beget
- Проверьте выполнение workflow
- Убедитесь, что данные приходят корректно

## 📱 Мобильная оптимизация

Сайт уже оптимизирован для мобильных устройств:
- Адаптивный дизайн
- Touch-friendly интерфейс
- Оптимизированные размеры кнопок
- Правильные viewport настройки

## 🔒 Безопасность

### CORS настройки
Если возникают проблемы с CORS, добавьте в n8n workflow узел **Set**:
```json
{
  "operation": "set",
  "values": {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  }
}
```

### Валидация данных
В n8n добавьте проверку данных:
```json
{
  "operation": "if",
  "conditions": {
    "string": [
      {
        "value1": "={{$json.clientName}}",
        "operation": "notEmpty"
      },
      {
        "value1": "={{$json.clientPhone}}",
        "operation": "notEmpty"
      }
    ]
  }
}
```

## 📊 Мониторинг

### Netlify Analytics
- В настройках сайта включите "Analytics"
- Получите статистику посещений
- Отслеживайте производительность

### n8n Executions
- В n8n перейдите в "Executions"
- Отслеживайте успешные и неудачные выполнения
- Настройте уведомления об ошибках

## 🚀 Дополнительные возможности

### 1. Автоматические обновления
При использовании GitHub:
- Каждый push в main ветку автоматически обновляет сайт
- Netlify показывает статус деплоя
- Можно настроить preview деплои для pull requests

### 2. Формы Netlify
Можно использовать встроенные формы Netlify:
```html
<form name="booking" netlify>
  <!-- поля формы -->
</form>
```

### 3. Environment Variables
В Netlify можно настроить переменные окружения:
- Перейдите в "Site settings" → "Environment variables"
- Добавьте переменные для разных окружений

## 🆘 Решение проблем

### Сайт не загружается
1. Проверьте правильность файлов
2. Убедитесь, что index.html в корне папки
3. Проверьте консоль браузера на ошибки

### Webhook не работает
1. Проверьте URL в script.js
2. Убедитесь, что n8n workflow активен
3. Проверьте CORS настройки
4. Посмотрите логи в n8n

### Данные не приходят
1. Проверьте формат данных в script.js
2. Убедитесь, что Content-Type: application/json
3. Проверьте структуру JSON

## 📞 Поддержка

- **Netlify**: [docs.netlify.com](https://docs.netlify.com)
- **n8n**: [docs.n8n.io](https://docs.n8n.io)
- **Beget**: [beget.com/ru/help](https://beget.com/ru/help)

---

**🎉 Поздравляем! Ваш сайт записи к мастеру маникюра теперь доступен всему миру!** 