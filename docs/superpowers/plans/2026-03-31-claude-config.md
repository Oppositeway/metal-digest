# Claude Config Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Настроить глобальный ~/.claude/CLAUDE.md с личными предпочтениями, улучшить проектный CLAUDE.md для Metal Digest и создать .claude/settings.json с правилами permissions.

**Architecture:** Три независимых файла конфигурации. Глобальный CLAUDE.md задаёт поведение Claude во всех проектах. Проектный CLAUDE.md описывает контекст Metal Digest. settings.json ограничивает опасные операции на уровне permissions.

**Tech Stack:** Markdown, JSON, Claude Code CLI

---

## Файлы

| Действие | Путь | Что делает |
|----------|------|-----------|
| Создать | `~/.claude/CLAUDE.md` | Глобальные предпочтения пользователя |
| Изменить | `/Users/roma/ai-digest/CLAUDE.md` | Тематика, стиль статей, целевая аудитория Metal Digest |
| Создать | `/Users/roma/ai-digest/.claude/settings.json` | Permissions: allow безопасные команды, deny .env |

---

### Task 1: Глобальный ~/.claude/CLAUDE.md

**Files:**
- Create: `~/.claude/CLAUDE.md`

- [ ] **Step 1: Создать файл с личными предпочтениями**

Содержимое `~/.claude/CLAUDE.md`:

```markdown
# Мои глобальные предпочтения

## Язык и стиль
- Отвечай на русском языке, если я пишу по-русски.
- Будь краток: не пересказывай то, что я только что написал.
- Не добавляй эмодзи, если я явно не прошу.

## Код
- Не добавляй комментарии и docstring к коду, который не менял.
- Не добавляй обработку ошибок для сценариев, которые не могут произойти.
- Не создавай новые файлы, если можно изменить существующий.
- Предпочитай простое решение сложному.

## Git
- Не делай коммиты без явной просьбы.
- Не используй --no-verify и --force без прямого разрешения.

## Безопасность
- Никогда не читай и не выводи содержимое .env файлов.
- Не запускай деструктивные команды (rm -rf, DROP TABLE) без подтверждения.
```

- [ ] **Step 2: Проверить что файл создан**

```bash
cat ~/.claude/CLAUDE.md
```

Ожидаемый результат: содержимое файла выведено без ошибок.

- [ ] **Step 3: Коммит не нужен** — глобальный файл вне репозитория.

---

### Task 2: Проектный CLAUDE.md — Metal Digest

**Files:**
- Modify: `/Users/roma/ai-digest/CLAUDE.md`

- [ ] **Step 1: Дополнить CLAUDE.md секциями тематики, стиля и аудитории**

Заменить содержимое `/Users/roma/ai-digest/CLAUDE.md`:

```markdown
# Metal Digest — CLAUDE.md

## Проект

Дайджест новостей метал-музыки. Astro-сайт для публикации новостей, рецензий и анонсов из мира металла.

## Целевая аудитория

Фанаты метала 20–40 лет. Читают на русском языке. Знают жанровую терминологию (трэш, дэт, блэк, дум). Ценят конкретику: даты туров, названия альбомов, лейблы.

## Тематика статей

- Новости: туры, составы групп, даты релизов
- Рецензии: новые альбомы и EP (300–500 слов)
- Анонсы: фестивали, концерты, стриминговые премьеры

## Стиль статей

- Тон: уважительный к жанру, без снисхождения
- Язык: русский, допускается английский для названий групп и альбомов
- Без кликбейта в заголовках
- Факты важнее мнений; мнение — только в рецензиях
- Объём новости: 150–300 слов; рецензии: 300–500 слов

## Стек

- **Astro** v6 — статический генератор
- **TypeScript**
- **Vercel** — деплой

## Команды

\`\`\`bash
npm run dev      # dev-сервер на http://localhost:4321
npm run build    # сборка для продакшена
npm run preview  # предпросмотр сборки
\`\`\`

## Структура

\`\`\`
src/
├── content/blog/    — статьи дайджеста (.md)
├── components/      — Astro-компоненты
├── layouts/         — шаблоны страниц
├── pages/           — маршруты: главная, блог, RSS
├── styles/          — глобальные стили
└── assets/          — изображения и обложки
\`\`\`

## Формат статьи

Файл `src/content/blog/<slug>.md`:

\`\`\`markdown
---
title: 'Заголовок'
description: 'Краткое описание в 2–3 предложения.'
pubDate: '2026-03-31'
tags: ['metal', 'thrash', 'releases']
source: 'https://example.com/original'
---

Текст статьи.
\`\`\`

## Соглашения

- Статьи пишутся на русском языке
- Slug файла = дата + ключевое слово, например `2026-03-31-metallica-tour.md`
- Теги из: `metal`, `death-metal`, `black-metal`, `thrash`, `doom`, `releases`, `tours`, `reviews`
- Не коммитить `node_modules/` и `.astro/`
```

- [ ] **Step 2: Проверить что файл выглядит корректно**

```bash
cat /Users/roma/ai-digest/CLAUDE.md
```

- [ ] **Step 3: Коммит**

```bash
cd /Users/roma/ai-digest
git add CLAUDE.md
git commit -m "docs: добавить тематику, стиль и целевую аудиторию в CLAUDE.md"
```

---

### Task 3: .claude/settings.json с permissions

**Files:**
- Create: `/Users/roma/ai-digest/.claude/settings.json`

- [ ] **Step 1: Создать директорию и файл**

```bash
mkdir -p /Users/roma/ai-digest/.claude
```

Содержимое `/Users/roma/ai-digest/.claude/settings.json`:

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run dev)",
      "Bash(npm run build)",
      "Bash(npm run preview)",
      "Bash(git status)",
      "Bash(git diff*)",
      "Bash(git log*)",
      "Bash(git add*)",
      "Bash(git commit*)"
    ],
    "deny": [
      "Bash(cat .env*)",
      "Bash(cat **/.env*)",
      "Read(.env*)",
      "Read(**/.env*)"
    ]
  }
}
```

- [ ] **Step 2: Проверить валидность JSON**

```bash
cat /Users/roma/ai-digest/.claude/settings.json | python3 -m json.tool
```

Ожидаемый результат: JSON выводится без ошибок парсинга.

- [ ] **Step 3: Коммит**

```bash
cd /Users/roma/ai-digest
git add .claude/settings.json
git commit -m "config: добавить .claude/settings.json с permissions"
```

---

## Ручная задача (вне плана)

**Task 4: Отправить результаты в Telegram-чат группы** — выполняется вручную после завершения Task 1–3.
