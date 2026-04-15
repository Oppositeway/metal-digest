# Поиск по дайджесту — Design Spec

**Дата:** 2026-04-10  
**Статус:** Approved

---

## Контекст

Сайт статический (Astro SSG), без серверного рендеринга. Пользователи не могут найти статьи по конкретной группе или жанру без прокрутки. Цель — добавить мгновенный поиск в шапке и тег-фильтр на странице блога.

---

## Ограничения

- Не трогать навигационные ссылки в `Header.astro`
- Не создавать новые Astro-компоненты — HTML и JS встраиваются в существующие файлы
- Поиск только на клиенте, без серверного API

---

## Архитектура

Три независимых части:

1. **Build-time индекс** — Astro static endpoint `src/pages/search.json.ts` генерирует `search.json` из всех постов.
2. **Search UI** — встраивается напрямую в `src/components/Header.astro` (не новый компонент), работает на ванильном JS с MiniSearch.
3. **Тег-фильтр** — встраивается напрямую в `src/pages/blog/index.astro`, клик по тегу фильтрует список через URL-параметр.

---

## Файлы

### Новые

| Файл | Назначение |
|------|-----------|
| `src/pages/search.json.ts` | Build-time JSON-индекс (endpoint, не компонент) |

### Изменяемые

| Файл | Изменение |
|------|-----------|
| `src/components/Header.astro` | Добавить поисковое поле и JS под существующей навигацией |
| `src/pages/blog/index.astro` | Добавить тег-кнопки и JS-фильтр |

---

## Build-time индекс (`src/pages/search.json.ts`)

```ts
// Структура каждой записи в search.json
{
  id: string,          // slug поста (ключ MiniSearch)
  url: string,         // "/blog/{slug}/"
  title: string,
  description: string,
  tags: string,        // теги объединены пробелом: "metal thrash releases"
  body: string         // markdown без синтаксиса (##, **, [], изображения)
}
```

- Источник: `getCollection('blog')` — Astro Content Collections
- `entry.body` даёт сырой markdown; синтаксис убирается regex без сторонних парсеров
- Файл попадает в `dist/search.json` при `astro build`

---

## Search UI (в `src/components/Header.astro`)

Навигационные ссылки (`<nav>` / `<HeaderLink>`) не трогаются. Поисковое поле добавляется рядом — в шапку, вне блока навигации.

### Структура (HTML добавляется в Header.astro)

```html
<div class="search-wrapper">
  <input type="search" placeholder="Поиск..." id="search-input" />
  <ul class="search-results" id="search-results" hidden>
    <li><a href="/blog/slug/">
      <span class="result-title">Заголовок</span>
      <span class="result-tags">metal · thrash</span>
    </a></li>
    <!-- или: -->
    <li class="no-results">Ничего не найдено</li>
  </ul>
</div>
```

### Поведение (vanilla JS в `<script>`)

- При первом фокусе: лениво грузит MiniSearch через dynamic `import()` + `fetch('/search.json')`
- Поиск запускается при длине запроса ≥ 2 символов
- Максимум 6 результатов
- Escape / клик вне wrapper — закрывает dropdown
- Клик по результату — переход на `/blog/{slug}/`

### MiniSearch конфигурация

```js
{
  fields: ['title', 'description', 'tags', 'body'],
  storeFields: ['url', 'title', 'tags'],
  searchOptions: {
    boost: { title: 3, description: 2, tags: 2, body: 1 },
    prefix: true,   // "Nerv" найдёт "Nervosa"
    fuzzy: 0.2
  }
}
```

---

## Тег-фильтр (в `src/pages/blog/index.astro`)

### Структура (добавляется в blog/index.astro)

```html
<nav class="tag-filters">
  <button data-tag="" class="active">Все</button>
  <button data-tag="metal">metal</button>
  <button data-tag="thrash">thrash</button>
  <!-- все уникальные теги из постов, собранные при build -->
</nav>

<div class="post-grid">
  <article data-tags="metal thrash releases">...</article>
  <!-- каждая карточка получает атрибут data-tags -->
</div>
```

### Поведение (vanilla JS в `<script>`)

- Теги-кнопки собираются из всех постов при build (дедупликация + сортировка)
- Клик по тегу → `history.pushState` с `?tag=thrash`, фильтр через `dataset.tags`
- При загрузке страницы с `?tag=...` в URL фильтр применяется автоматически
- Кнопки тегов на карточках постов ведут на `/blog?tag=...`
- Активная кнопка получает класс `active`

---

## Обработка ошибок

| Сценарий | Поведение |
|----------|-----------|
| `search.json` недоступен | Input остаётся, dropdown не открывается (silent fail) |
| Нет результатов | Показывается «Ничего не найдено» |
| MiniSearch не загрузился | Input получает `disabled` |

---

## Зависимости

- `minisearch` — npm-пакет (~7 KB gzip). Загружается через ESM dynamic import в `<script>`.
- Никаких UI-фреймворков (React/Vue) — не нужны.

---

## Верификация

1. `npm run build` → в `dist/` появляется `search.json`
2. `npm run preview` → ввести «Nervosa» в поле поиска → появляется карточка поста
3. Ввести «nerv» → тот же результат (prefix search)
4. Перейти на `/blog` → кликнуть тег «thrash» → видны только посты с этим тегом
5. URL меняется на `/blog?tag=thrash`; обновить страницу → фильтр применяется снова
6. Нажать «Все» → все посты возвращаются
7. Убедиться что навигационные ссылки в шапке работают без изменений
