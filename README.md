# Цветотип — Ирина Толпегина

AI-powered сервис определения цветотипа по фото. Загружаешь портретное фото — получаешь профессиональный анализ с палитрой.

## Технологии

- **Next.js 14** (Pages Router)
- **Anthropic Claude** (vision API для анализа фото)
- Deployed on **Vercel**

## Деплой на Vercel

### 1. Загрузи на GitHub

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. Подключи к Vercel

1. Зайди на [vercel.com](https://vercel.com) и нажми **New Project**
2. Выбери свой репозиторий
3. Настройки оставь дефолтными (Next.js определится автоматически)

### 3. Добавь переменную окружения

В Vercel → Settings → Environment Variables добавь:

```
ANTHROPIC_API_KEY = sk-ant-xxxxxxxxxx
```

Ключ можно получить на [console.anthropic.com](https://console.anthropic.com)

### 4. Deploy!

Нажми Deploy — через пару минут сайт будет готов.

## Локальная разработка

```bash
# Установи зависимости
npm install

# Создай файл с ключом
cp .env.local.example .env.local
# Отредактируй .env.local и добавь свой ключ

# Запусти
npm run dev
```

Открой [http://localhost:3000](http://localhost:3000)

## Структура

```
pages/
  index.js       — главная страница (загрузка + результаты)
  api/
    analyze.js   — API route, вызывает Claude Vision
styles/
  globals.css    — глобальные стили
```

## Как это работает

1. Пользователь вводит имя и загружает фото
2. Фото отправляется в `/api/analyze` 
3. Claude Vision анализирует тон кожи, цвет глаз, бровей, контраст
4. Результат отображается как красивая презентация с цветовыми палитрами
5. Если фото не подходит — дружелюбная ошибка с советами как переснять
