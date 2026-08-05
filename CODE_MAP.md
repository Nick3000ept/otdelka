# CODE_MAP — Отделка

Карта кода `index.html` и `script.gs` — **читать перед правкой вместо чтения всего файла**;
после правки актуализировать сдвинувшиеся номера строк затронутых секций.
Номера строк — на конец 2026-08-05 (index.html ~2610 строк, script.gs ~1015 строк).

## ⚠️ Открытый вопрос (на 2026-08-05, конец дня)

Пользователь сообщал «не показывает объёмы» после перевода колонки «Объем работ»
на чистый объём из поэтажки (`workVolD`), но где именно пусто — не уточнил (разговор
прерван). Проверено с сервера: данные и матчинг ключей в порядке (91 из 134 работ
находят объёмы; напр. «…стяжек 80 мм в квартирах. Тип пола К1» → 95 086), у остальных
43 работ объёмов в поэтажке нет вовсе. Кандидаты: кэш браузера пользователя; либо он
смотрит на статьи/группы в «Бюджете», где столбец «Объем» намеренно пуст. Начать
следующую сессию с уточнения, где именно пусто.

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
  из поэтажки D (сумма volsTotals; «Объем работ» справочника — с коэффициентом, не используем)
- 673 `norm`; 677 `fmtCell`; 688 `fmtVol`; 699 `escapeHtml`; 713 `COL_ORDER`
  (⚠️ новые колонки Sheets сами на витрине не появятся — добавлять сюда)
- 1042 `ALL_CORPS`, `BASE_RATE_COL`, `BASE_MAT_COL`, `fmtInt`

## index.html — дерево работ (Расценки/Объемы)

- 722 `workColumns`; 749 `cellHtml` (VOL_COL: «…» пока volsStatus loading, потом workVolD;
  кнопка «Вопрос» в wname на rates)
- 815 `groupWorks` (Место→Поверхность→Группа; сумматоры групп по workVolD, лидерные сверху)
- 886 `renderTable` — главный рендер; чанки по 300; поиск раскрывает всё (showAll);
  класс `vols` = мелкий шрифт чисел
- 2426 `selectWork`; 2435 `toggleGroup`; 2441 клик `#tbody`; 2466/2473 развернуть/сбросить;
  2603 поиск (debounce)

## index.html — нижняя панель (Расценки)

- 1047 `contractorsHtml` — сводная подрядчик×корпус; режимы `ctrMode` work|mat|both;
  блоки Подрядчики/СС; «Базовая расценка» в незанятых корпусах
- 1135 `renderBottomPane`; 1162 `contractorDetailHtml` (СС — через ssNames поэтажки +
  Справочник СС); 1220 `miniTable`; 2345 клик `#ctr-body`; 2377 `materialsHtml`

## index.html — Объемы

- 1235 `loadVols` — action=volumes; totals → `state.volsTotals`; с 05.08 грузится ФОНОМ
  при старте (нужен для колонки «Объем работ» на Расценках); по готовности перерисовка
- 1607 `openVolModal` — поэтажная ведомость (модалка)

## index.html — Бюджет

- 1271 `loadBudget`; 1285 `renderBudget` — статьи ПО АЛФАВИТУ (order с исходными
  индексами — на них ключи раскрытий); колонки Статья·Объем·Коэф.перед.·Стоимость
  (значения на уровне работ); иерархия статья (brow) → группа работ (bgrp) → работа
  (bwork, можно много открытых) → сводная (bdetail, синяя заливка)
- 1391 `budgetWorkHtml` — сводная работы: строки подрядчик×расценка (разные расценки =
  отдельные строки), «Не определен» сверху (базовые расценки справочника), блоки
  Подрядчики/СС (плашки), колонка «Итого» справа, tfoot «Итого»; ячейки кликабельны (bcell)
- 1512 `loadBudgetFloors`; 1525 `openBudgetCellModal` — расшифровка ячейки по этажам
  (модалка: Этаж·Объем·Раб/ед·Мат/ед·Стоимость; action=budgetFloors, грузится при 1-м клике)
- 1573 клик `#budget-screen` (bcell/bgrp/bwork/brow)

## index.html — Проверки

- 1652 `renderCheckRates` — «Недостающие расценки» (лист «Проверки расценки» как есть)
- 1684 `DEV_LIMIT`; 1686 `workRateChecks`; 1717 `renderCheckWorkRates` — «Отклонения
  расценок» (базовая vs средние из floors; группы sect сворачиваются); 1782 `checkDetailHtml`
- 1818 `noCostChecks` (только объём>0); 1840 `renderCheckNoCost` — «Без стоимости»
  (группы, всё свернуто по умолчанию)
- 1892 `FORMULA_ERR_RE`; 1894 `formulaChecks`; 1939 `renderCheckFormulas` — «Формулы»
  (ошибки #N/A и т.п. в листе «Работы» И в «Расходах»; ошибки приходят текстом)
- 1970 `CHANGE_FIELDS`; 1977 `loadChanges`; 1993 `renderCheckChanges` — «Изменения»
  (дифф против базового расчёта; кнопка `#baseline-save`); 2064 `saveBaseline`
- 2166 `renderCheckQuestions` — «Вопросы» (кнопка статуса qstatus)
- 2244 `updateCheckBadges`; 2262 `CHECK_SCREENS` (экран → рендер; новые проверки сюда);
  2308 клик `#check-screen` (qstatus/baseline-save/ncgrp/grp/wrow)

## index.html — Вопросы (запись)

- 2088 `postJson` (POST text/plain — обход CORS-preflight); 2103 `loadQuestions` (фоном);
  2118 `openQuestionModal`; 2135 `submitQuestion`; 2213 `toggleQuestionStatus`
  (optimistic + откат); имя — localStorage `otdelka_user`

## index.html — каркас

- 2271 `setScreen`; 2481 `setStatus`; 2492 `fetchWithRetry` (3 попытки)
- 2514 `loadData` — action=load; затем фоном: `loadFloors` + `loadQuestions` + `loadVols`
- 2558 `loadFloors`; 2576/2583 gate/app; 2593 `submitPassword`

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
