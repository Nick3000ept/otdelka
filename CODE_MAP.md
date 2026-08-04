# CODE_MAP — Отделка

Карта кода `index.html` и `script.gs` — **читать перед правкой вместо чтения всего файла**;
после правки актуализировать сдвинувшиеся номера строк затронутых секций.
Номера строк — на состояние 2026-08-05 (index.html ~2300 строк, script.gs ~730 строк).

## index.html — структура страницы

- `#gate` — экран пароля (общий пароль, localStorage `otdelka_token`)
- `#app` = `#sidebar` (тёмная панель: `.sb-brand`, `.sb-item` data-screen=`rates|volumes|budget`,
  блок `#sb-checks-toggle` → `#sb-checks` с проверками `check-rates|check-work-rates|check-no-cost|check-questions`,
  бейджи `#badge-check-*`) + `#content`
- `#content`: `header` (фильтры `#f-group/#f-place/#f-surface`, `#f-toggle-all`, `#f-reset`, `#search`)
  → `main`: `#status`, `#pane-top` (дерево, `#table/#thead-row/#tbody`), `#check-screen`,
  `#budget-screen`, `#pane-bottom` (`#pane-work`, `#bottom-cols`: `#ctr-body` + `#mat-body`)
- `#modal-overlay` (`#modal-title`, `#modal-sub`, `#modal-body`) — поэтажная ведомость,
  детали подрядчика, форма вопроса

## index.html — константы и state (строки ~513–680)

- 513 `GAS_URL`; 516 `HIDDEN_COLS`; 531 `WORK_KEY`; 534–540 `COL_GROUP/COL_PLACE/COL_SURFACE/NO_*`
- 552 `DETAIL_COLS` (колонки материалов); 565 `SUM_COL`
- 567 **`state`** — все данные и UI-состояние: works, byWork, unitByMaterial, screen,
  vols/volsTotals/volsStatus, floors/floorsSS/floorsStatus, contrRates, ssRates, ssMap,
  checkRates, checkOpen, budget/budgetStatus/budgetOpen(Set)/budgetWorkOpen(Set)/budgetGrpCollapsed(Set),
  noCostOpen(Set), questions/questionsStatus, userName, ctrSel, ctrMode, selected/selectedName,
  query, filters, collapsed(Set), checkCollapsed(Set)
- 615 `VOL_FLAG` (признак лидерного объёма); 616 `VOL_LABEL='Лид.'`; 618 `VOL_COL`; 619 `UNIT_COL`
- 627 `RENAME` (короткие заголовки); 673 `COL_ORDER` (порядок колонок работ — ⚠️ новые
  колонки Sheets сами на витрине не появятся, добавлять сюда)
- 999 `ALL_CORPS` (К1–К12); 1000 `BASE_RATE_COL`; 1001 `BASE_MAT_COL`; 1002 `fmtInt`

## index.html — дерево работ (вкладки Расценки/Объемы)

- 682 `workColumns(rows)` — колонки: rates = название+Лид.+COL_ORDER+теги;
  volumes = название(auto)+Ед.изм+Лид.+корпуса(53px)+Итого
- 709 `cellHtml(col, r)` — ячейка строки работы (корпус/итого/галочка/теги/кнопка «Вопрос»)
- 770 `groupWorks(rows)` — 3 уровня Место→Поверхность→Группа; сорт: лидерные по объёму вниз группы обычные
- 843 `renderTable()` — ГЛАВНЫЙ рендер дерева; чанки по 300 строк; при поиске всё раскрыто (showAll);
  класс `vols` на таблице = мелкий шрифт чисел
- 2110 `selectWork` / 2119 `toggleGroup` / 2125 клик по `#tbody` (вопрос/уровни/выбор работы)
- 2150 «Развернуть все» / 2157 «Сбросить» / 2285 поиск (debounce 150мс)

## index.html — нижняя панель (Расценки)

- 1004 `contractorsHtml(workKey)` — сводная подрядчик×корпус: кнопки режима `ctrMode`
  (work|mat|both), блоки Подрядчики/СС, строка «Базовая расценка» в незанятых корпусах
- 1092 `renderBottomPane()` — низ: сводная + материалы выбранной работы
- 1119 `contractorDetailHtml(name, isSS)` — модалка деталей: обычный → «Расценки подрядчиков»;
  СС → мэппинг ssNames(поэтажка кол. J)+Справочник СС → «Расценки СС»
- 2029 клик по `#ctr-body` — режимы/строки подрядчиков
- 2061 `materialsHtml(list)` — таблица материалов с итогом

## index.html — Объемы

- 1192 `loadVols()` — лениво, action=volumes; totals в `state.volsTotals`
- 1496 `openVolModal(key, name)` — поэтажная ведомость в модалке

## index.html — Бюджет

- 1225 `loadBudget()` — action=budget, лениво
- 1239 `renderBudget()` — таблица: Статья · Объем · Коэф. перед. · Стоимость;
  статья (brow) → группы работ (bgrp, из кол. F) → работы (bwork, объём+коэф в столбцах)
  → выпадающая сводная (bdetail, синяя заливка)
- 1339 `budgetWorkHtml(w)` — сводная работы: строки подрядчик×расценка (разные расценки =
  отдельные строки), блоки Подрядчики/СС, «Не определен» сверху (базовые расценки),
  сумматоры «Итого <подрядчик>» (csub) и «Итого» (tfoot), колонка «Итого» справа
- 1469 клик по `#budget-screen` — bgrp/bwork/brow

## index.html — Проверки

- 1541 `renderCheckRates()` — «Недостающие расценки»: лист «Проверки расценки» как есть
- 1573 `DEV_LIMIT=15`; 1575 `workRateChecks()`; 1606 `renderCheckWorkRates()` —
  «Отклонения расценок»: базовая vs средние (floors), группировка по группе работ
  (sect data-grp, сворачиваются), клик по строке — 1671 `checkDetailHtml`
- 1707 `noCostChecks()` (только объём>0); 1729 `renderCheckNoCost()` — «Без стоимости»:
  группы (sect data-ncgrp), по умолчанию свернуто (`noCostOpen`)
- 1858 `renderCheckQuestions()` — «Вопросы»: список + кнопка статуса (qstatus)
- 1936 `updateCheckBadges()`; 1950 `CHECK_SCREENS` (имя экрана → рендер — новые проверки сюда)
- 1994 клик по `#check-screen` — qstatus / ncgrp / grp / wrow

## index.html — Вопросы (запись!)

- 1780 `postJson(payload)` — POST text/plain (обход CORS-preflight)
- 1795 `loadQuestions()` (фоном из loadData); 1810 `openQuestionModal`; 1827 `submitQuestion`
- 1905 `toggleQuestionStatus(id)` — optimistic UI с откатом; имя из localStorage `otdelka_user`

## index.html — каркас

- 1957 `setScreen(screen)` — переключение вкладок (rates/volumes/budget/проверки)
- 2165 `setStatus`; 2176 `fetchWithRetry` (3 попытки); 2198 `loadData()` (action=load →
  works/expenses/materials/contrRates/ssRates/ssMap/checkRates; затем фоном loadFloors+loadQuestions)
- 2240 `loadFloors()` — сводка подрядчиков, после неё бейджи и перерисовка
- 2258 `showGate` / 2265 `showApp` / 2275 `submitPassword`

## script.gs (бэкенд, deployment обновлять только update-deployment!)

- 1 `CONFIG` — ID таблицы, имена листов/колонок (FLOOR_* — колонки поэтажки)
- 37–39 ключи кэша: `floors_v3`, `vols_v1` (чанк.), `budget_v5` (чанк.); 42 `clearCache()`
  (⚠️ новый ключ кэша добавлять сюда)
- 54/64 `cachePutBig_/cacheGetBig_` — чанки по 90 КБ (лимит CacheService 100 КБ/ключ)
- 80 `setup()` (пароль); 94 `setupQuestions()` — разовая авторизация Drive (запуск владельцем)
- 99–123 `questionsFile_/readQuestions_/writeQuestions_` — JSON-файл вопросов на Диске
  (ID в Script Properties `QUESTIONS_FILE_ID`)
- 135 `doPost` — addQuestion / setQuestionStatus, под LockService
- 197 `doGet`: 207 ping · 213 meta (оглавление, безопасно из чата) · 237 probe (агрегаты
  поэтажки) · 381 floors · 402 volumes · 421 questions · 431 budget · 449 load
- 494 `buildFloorSummary_` — работа → [[подрядчик, корпус, расц.раб, СС, расц.мат], …]
  ⚠️ склейка ключа через НЕВИДИМЫЙ символ (код 1) — Edit по этой строке не находит текст
- 575 `buildVolumes_` — работа → корпус → [[этаж, объём], …]
- 637 `buildBudget_` — статья → работы (с группой, кол. F) → ячейки
  [подрядчик, корпус, стоимость AG, объём D, коэф. Q]; ⚠️ тот же невидимый символ в ключе
- 708 `sheetToObjects_`; 727 `jsonOut_`
