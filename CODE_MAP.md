# CODE_MAP — Отделка

Карта кода `index.html` и `script.gs` — **читать перед правкой вместо чтения всего файла**;
после правки актуализировать сдвинувшиеся номера строк затронутых секций.
Номера строк — на конец 2026-08-05 (index.html ~2627 строк, script.gs ~1015 строк).

> Вопрос «не показывает объёмы» (05.08) закрыт: пусто было у работ, которых нет
> в поэтажке (46 из 137; объём в справочнике был у 2 — «Дверные откосы» и «Лифтовые
> откосы»). Решение — запасной объём из справочника, приглушённый (см. `workVolD`/`cellHtml`).

## index.html — структура страницы

- `#gate` — экран пароля (общий пароль, localStorage `otdelka_token`)
- `#app` = `#sidebar` (`.sb-item` data-screen=`rates|volumes|budget`; блок Проверки
  `#sb-checks`: `check-rates|check-work-rates|check-no-cost|check-formulas|check-changes|check-questions`,
  бейджи `#badge-check-*`) + `#content`
- `#content`: `header` (фильтры `#f-group/#f-place/#f-surface`, `#f-toggle-all`, `#f-reset`,
  `#search`) → `main`: `#status`, `#pane-top` (`#table/#thead-row/#tbody`), `#check-screen`,
  `#budget-screen`, `#pane-bottom` (`#pane-work`, `#ctr-body` + `#mat-body`)
- `#modal-overlay` (`#modal-title/#modal-sub/#modal-body`) — ведомости, детали, форма вопроса

## index.html — константы и state

- 537 `GAS_URL`; 571 `filled`; 591 **`state`** (все данные и UI-состояние; см. комменты)
- 649 `hasVolume` (признак лидерного объёма); 657 `workVolD` — ЧИСТЫЙ объём работы
  из поэтажки D (сумма volsTotals; «Объем работ» справочника — с коэффициентом);
  если работы в поэтажке нет и volsStatus='ready' — запасной объём из справочника (05.08)
- 681 `norm`; 685 `fmtCell`; 696 `fmtVol`; 707 `escapeHtml`; 721 `COL_ORDER`
  (⚠️ новые колонки Sheets сами на витрине не появятся — добавлять сюда)
- 1059 `ALL_CORPS`, `BASE_RATE_COL`, `BASE_MAT_COL`, `fmtInt`

## index.html — дерево работ (Расценки/Объемы)

- 730 `workColumns`; 757 `cellHtml` (VOL_COL: «…» пока volsStatus loading, потом workVolD;
  запасной объём из справочника — приглушённый, с title-подсказкой;
  кнопка «Вопрос» в wname на rates)
- 832 `groupWorks` (Место→Поверхность→Группа; сумматоры групп по workVolD, лидерные сверху)
- 903 `renderTable` — главный рендер; чанки по 300; поиск раскрывает всё (showAll);
  класс `vols` = мелкий шрифт чисел
- 2443 `selectWork`; 2452 `toggleGroup`; 2458 клик `#tbody`; 2483/2490 развернуть/сбросить;
  2620 поиск (debounce)

## index.html — нижняя панель (Расценки)

- 1064 `contractorsHtml` — сводная подрядчик×корпус; режимы `ctrMode` work|mat|both;
  блоки Подрядчики/СС; «Базовая расценка» в незанятых корпусах
- 1152 `renderBottomPane`; 1179 `contractorDetailHtml` (СС — через ssNames поэтажки +
  Справочник СС); 1237 `miniTable`; 2362 клик `#ctr-body`; 2394 `materialsHtml`

## index.html — Объемы

- 1252 `loadVols` — action=volumes; totals → `state.volsTotals`; с 05.08 грузится ФОНОМ
  при старте (нужен для колонки «Объем работ» на Расценках); по готовности перерисовка
- 1624 `openVolModal` — поэтажная ведомость (модалка)

## index.html — Бюджет

- 1288 `loadBudget`; 1302 `renderBudget` — статьи ПО АЛФАВИТУ (order с исходными
  индексами — на них ключи раскрытий); колонки Статья·Объем·Коэф.перед.·Стоимость
  (значения на уровне работ); иерархия статья (brow) → группа работ (bgrp) → работа
  (bwork, можно много открытых) → сводная (bdetail, синяя заливка)
- 1408 `budgetWorkHtml` — сводная работы: строки подрядчик×расценка (разные расценки =
  отдельные строки), «Не определен» сверху (базовые расценки справочника), блоки
  Подрядчики/СС (плашки), колонка «Итого» справа, tfoot «Итого»; ячейки кликабельны (bcell)
- 1529 `loadBudgetFloors`; 1542 `openBudgetCellModal` — расшифровка ячейки по этажам
  (модалка: Этаж·Объем·Раб/ед·Мат/ед·Стоимость; action=budgetFloors, грузится при 1-м клике)
- 1590 клик `#budget-screen` (bcell/bgrp/bwork/brow)

## index.html — Проверки

- 1669 `renderCheckRates` — «Недостающие расценки» (лист «Проверки расценки» как есть)
- 1701 `DEV_LIMIT`; 1703 `workRateChecks`; 1734 `renderCheckWorkRates` — «Отклонения
  расценок» (базовая vs средние из floors; группы sect сворачиваются); 1799 `checkDetailHtml`
- 1835 `noCostChecks` (только объём>0); 1857 `renderCheckNoCost` — «Без стоимости»
  (группы, всё свернуто по умолчанию)
- 1909 `FORMULA_ERR_RE`; 1911 `formulaChecks`; 1956 `renderCheckFormulas` — «Формулы»
  (ошибки #N/A и т.п. в листе «Работы» И в «Расходах»; ошибки приходят текстом)
- 1987 `CHANGE_FIELDS`; 1994 `loadChanges`; 2010 `renderCheckChanges` — «Изменения»
  (дифф против базового расчёта; кнопка `#baseline-save`); 2081 `saveBaseline`
- 2183 `renderCheckQuestions` — «Вопросы» (кнопка статуса qstatus)
- 2261 `updateCheckBadges`; 2279 `CHECK_SCREENS` (экран → рендер; новые проверки сюда);
  2325 клик `#check-screen` (qstatus/baseline-save/ncgrp/grp/wrow)

## index.html — Вопросы (запись)

- 2105 `postJson` (POST text/plain — обход CORS-preflight); 2120 `loadQuestions` (фоном);
  2135 `openQuestionModal`; 2152 `submitQuestion`; 2230 `toggleQuestionStatus`
  (optimistic + откат); имя — localStorage `otdelka_user`

## index.html — каркас

- 2288 `setScreen`; 2498 `setStatus`; 2509 `fetchWithRetry` (3 попытки)
- 2531 `loadData` — action=load; затем фоном: `loadFloors` + `loadQuestions` + `loadVols`
- 2575 `loadFloors`; 2593/2600 gate/app; 2610 `submitPassword`

## script.gs (деплой ТОЛЬКО clasp update-deployment, сейчас v24+)

- 1 `CONFIG` — ID таблицы, листы, колонки поэтажки FLOOR_* (WORK A, CORP B, FLOOR C,
  VOL D, GROUP F, SS_NAME J, BUDGET_FLAG L, REDO Q, CONTRACTOR S, SS W, RATE AB,
  RATE_MAT AC, BUDGET_COST AG)
- 37–41 ключи кэша (`floors_v3`, `vols_v1`, `budget_v5`, `bfloors_v1`, `changes_v1` —
  все кроме floors чанкованные); 44 `clearCache` (⚠️ новый ключ добавлять сюда)
- 58/68 `cachePutBig_/cacheGetBig_` (чанки 90 КБ, лимит 10 шт)
- 84 `setup` (пароль); 95–127 вопросы: `setupQuestions` (разовая авторизация Drive —
  ВЫПОЛНЕНА), `questionsFile_/readQuestions_/writeQuestions_` (QUESTIONS_FILE_ID)
- 140–155 базовый расчёт: `baselineFile_/readBaseline_` (otdelka_baseline.json,
  BASELINE_FILE_ID; первая база зафиксирована 2026-08-05)
- 165 `buildBaseline_` — слепок работа|корпус|этаж → [стоимость, объём, подрядчик,
  расц.раб, расц.мат]; 234 `diffBaseline_` (add/del/mod)
- 276 `doPost` — addQuestion / saveBaseline / setQuestionStatus (LockService, пароль)
- 350 `doGet`: 360 ping · 366 meta (безопасно из чата) · 390 probe (агрегаты) ·
  534 floors · 555 volumes · 574 questions · 584 budget · 604 changes ·
  631 budgetFloors · 649 load
- 694 `buildFloorSummary_` — работа → [[подрядчик, корпус, расц.раб, СС, расц.мат], …]
  ⚠️ ключ склеен через НЕВИДИМЫЙ символ (код 1) — Edit его не находит, править вокруг
- 775 `buildVolumes_`; 837 `buildBudget_` (статья → работы (+группа F) → ячейки
  [подрядчик, корпус, стоимость, объём, коэф]; тот же невидимый символ);
  916 `buildBudgetFloors_` (работа → 'подрядчик|корпус' → {r:[расц], f:[[этаж,объём,стоимость]]})
- 991 `sheetToObjects_`; 1010 `jsonOut_`
