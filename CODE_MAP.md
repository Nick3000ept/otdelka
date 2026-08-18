# CODE_MAP — Отделка

Карта кода `index.html` и `script.gs` — **читать перед правкой вместо чтения всего файла**;
после правки актуализировать сдвинувшиеся номера строк затронутых секций.
Номера строк — на 2026-08-12 (index.html ~3160 строк, script.gs ~1210 строк).
Из-за фильтра подрядчиков в «Бюджете» (12.08) секции index.html ниже ~410 сдвинуты
на ~30–120 строк (точные номера обновлены только в секциях «константы/state» и «Бюджет»).

> Вопрос «не показывает объёмы» (05.08) закрыт: пусто было у работ, которых нет
> в поэтажке (46 из 137; объём в справочнике был у 2 — «Дверные откосы» и «Лифтовые
> откосы»). Решение — запасной объём из справочника, приглушённый (см. `workVolD`/`cellHtml`).

## index.html — структура страницы

- `#gate` — экран пароля (общий пароль, localStorage `otdelka_token`)
- `#app` = `#sidebar` (`.sb-item` data-screen=`rates|volumes|budget`; блок Проверки
  `#sb-checks`: `check-rates|check-work-rates|check-no-cost|check-formulas|check-changes|check-questions`,
  бейджи `#badge-check-*`) + `#content`
- `#content`: `header` (фильтры `#f-group/#f-place/#f-surface`, `#f-toggle-all`, `#f-reset`,
  кнопки масштаба `#zoom-out/#zoom-reset/#zoom-in` (`applyZoom`, localStorage
  `otdelka_zoom`, 14.08), `#search`) → `main`: `#status`, `#pane-top`
  (`#table/#thead-row/#tbody`), `#check-screen`,
  `#budget-screen`, `#pane-bottom` (`#pane-work`, `#ctr-body` + `#mat-body`)
- `#modal-overlay` (`#modal-title/#modal-sub/#modal-body`) — ведомости, детали, форма вопроса

## index.html — константы и state

- ~568 `GAS_URL`; ~600 `filled`; 649 **`state`** (все данные и UI-состояние; см. комменты;
  12.08 добавлены `budgetContr`/`budgetContrOpen`)
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

- ~1207 `contractorsHtml` — сводная подрядчик×корпус; режимы `ctrMode` work|mat|both;
  блоки Подрядчики/СС; «Базовая расценка» в незанятых корпусах; с 14.08 сверка
  ячеек с contrRates (`vedom`/`misTxt`, класс `rate-bad` красным, СС не сверяется)
- 1152 `renderBottomPane`; 1179 `contractorDetailHtml` (СС — через ssNames поэтажки +
  Справочник СС); 1237 `miniTable`; 2362 клик `#ctr-body`; 2394 `materialsHtml`

## index.html — Объемы

- 1252 `loadVols` — action=volumes; totals → `state.volsTotals`; с 05.08 грузится ФОНОМ
  при старте (нужен для колонки «Объем работ» на Расценках); по готовности перерисовка
- 1624 `openVolModal` — поэтажная ведомость (модалка)

## index.html — Факт (отметки выполнения, 10.08.2026)

- 497 сайдбар `data-screen="fact"`; 454 CSS `.factgrid/.fcell/.fpct/.fdone/.fcorp-done`
- 628 state: `factMarks/factStatus/factRef/factRefStatus/factPending/factSaving/factModalKey`
- 798 `factPct` — средневзвешенный % готовности (веса — объёмы этажей vols);
  816 `cellHtml` (ветки corp/total для fact); 1079 `factSums` в renderTable (группы —
  только лидерные работы)
- 1784 `loadFact` (action=fact); 1798 `loadFactRef` (action=factRef, по готовности
  перерисовывает открытую сетку, если пользователь не печатает); 1820 `refreshFactScreen`
- 1841 `openFactModal` — сетка этажи×корпуса (план-объём, input, ✓, «✓ все» на корпус,
  строка «Готовность», подсказки из factRef); 1913 `ensureUserName`
- 1923 `applyFactInput` (валидация 0..100, optimistic, очередь); 1972 `scheduleFactFlush`
  (пауза 1,2 с); 1977 `flushFactMarks` (POST saveFact пакетом, 3 ретрая, откат + alert);
  2020 beforeunload; 2779 `closeModal` — немедленный flush несохранённого
- 2697 setScreen ветка fact; клик tbody: fact -> openFactModal

## index.html — Бюджет

- 1431 `loadBudget`; 1445 `renderBudget` — статьи ПО АЛФАВИТУ (order с исходными
  индексами — на них ключи раскрытий); колонки Статья·Объем·Коэф.перед.·Стоимость
  (значения на уровне работ); иерархия статья (brow) → группа работ (bgrp) → работа
  (bwork, можно много открытых) → сводная (bdetail, синяя заливка)
- **Фильтр по подрядчикам** (12.08.2026, внутри renderBudget): кнопка `#bfilter-btn` +
  выпадающий список `.bfilter-dd` с мультивыбором (`state.budgetContr` Set,
  `budgetContrOpen`); пусто = все. Суммы статей/групп/работ (и объём/коэф) пересчитываются
  по выбранным (`wSum`/`cellOk`), пустые строки скрыты; CSS `.bfilter*` ~412
- ~1660 `budgetWorkHtml` — сводная работы: строки подрядчик×расценка (разные расценки =
  отдельные строки), «Не определен» сверху (базовые расценки справочника), блоки
  Подрядчики/СС (плашки), колонка «Итого» справа, tfoot «Итого»; ячейки кликабельны (bcell);
  фильтр подрядчиков действует и здесь (fSel/fActive); с 18.08 в ячейках две суммы —
  работы (cell[5], AE) и материалы (AG−AE, класс `.bmat`), fallback `hasSplit` для
  старого кэша; в renderBudget — фильтр по работе `#bsearch`/`budgetQuery` (wMatch,
  автораскрытие при поиске, input-обработчик на #budget-screen с debounce)
- 1722 `loadBudgetFloors`; 1735 `openBudgetCellModal` — расшифровка ячейки по этажам
  (модалка: Этаж·Объем·Раб/ед·Мат/ед·Стоимость; action=budgetFloors, грузится при 1-м клике)
- 1783 клик `#budget-screen` (сначала bfilter-item/reset/btn и закрытие списка,
  потом bcell/bgrp/bwork/brow)

## index.html — Проверки

- 1669 `renderCheckRates` — «Недостающие расценки» (лист «Проверки расценки» как есть)
- 1701 `DEV_LIMIT`; 1703 `workRateChecks`; 1734 `renderCheckWorkRates` — «Отклонения
  расценок» (базовая vs средние из floors; группы sect сворачиваются); 1799 `checkDetailHtml`
- 1835 `noCostChecks` (только объём>0); 1857 `renderCheckNoCost` — «Без стоимости»
  (группы, всё свернуто по умолчанию)
- 1909 `FORMULA_ERR_RE`; 1911 `formulaChecks`; 1956 `renderCheckFormulas` — «Формулы»
  (ошибки #N/A и т.п. в листе «Работы» И в «Расходах»; ошибки приходят текстом)
- ~2489 `CHANGE_FIELDS`; ~2496 `loadChanges`; ~2512 `renderCheckChanges` — «Изменения»:
  с 14.08 иерархия как в «Бюджете» (статья → группа → работа, соответствие из
  state.budget w[3]; state `chgOpen/chgGrpCollapsed/chgWorkOpen`; классы строк
  brow/bgrp/bwork с data-chgart/chggrp/chgwork — стили бюджета переиспользованы,
  клики в обработчике #check-screen; работы «— вне бюджета —» отдельной статьёй;
  budget error → плоский список; детали строк — столбцами CH_COLS/fieldCell:
  Подрядчик · Стоимость мат./работ за ед. · Объём · Стоимость, mod красным);
  кнопка `#baseline-save`; ~2720 `saveBaseline`
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
  RATE_MAT AC, BUDGET_COST AG); 41 SHEET_FACT «Факт» + FLOOR_READY V / FLOOR_CLOSE Z
- 47–51 ключи кэша (`floors_v3`, `vols_v1`, `budget_v5`, `bfloors_v1`, `changes_v1`,
  `factref_v1` — все кроме floors чанкованные); 54 `clearCache` (⚠️ новый ключ добавлять сюда)
- ~70 `cachePutBig_/cacheGetBig_` (чанки 90 КБ, лимит 10 шт)
- ~96 `setup` (пароль); ~107–140 вопросы: `setupQuestions` (разовая авторизация Drive —
  ВЫПОЛНЕНА), `questionsFile_/readQuestions_/writeQuestions_` (QUESTIONS_FILE_ID)
- ~152–167 базовый расчёт: `baselineFile_/readBaseline_` (otdelka_baseline.json,
  BASELINE_FILE_ID; первая база зафиксирована 2026-08-05)
- ~177 `buildBaseline_` — слепок работа|корпус|этаж → [стоимость, объём, подрядчик,
  расц.раб, расц.мат]; ~246 `diffBaseline_` (add/del/mod)
- 288 `doPost` — 310 saveFact (журнал в лист «Факт», append-only, лимит 300, safeCell_;
  ветка ДО чтения вопросов) / addQuestion / saveBaseline / setQuestionStatus
  (LockService, пароль)
- ~393 `doGet`: ping · clearCache (сброс кэша с витрины, 14.08; на фронте кнопка
  `#sb-refresh` «Обновить данные» внизу сайдбара) · meta (безопасно из чата) ·
  probe (агрегаты) · floors · volumes · questions · budget · changes ·
  budgetFloors · fact (отметки, без кэша) · factRef (справка V/Z) · load
- ~737 `buildFloorSummary_` — работа → [[подрядчик, корпус, расц.раб, СС, расц.мат], …]
  ⚠️ ключ склеен через НЕВИДИМЫЙ символ (код 1) — Edit его не находит, править вокруг
- ~818 `buildVolumes_`; ~880 `buildBudget_` (статья → работы (+группа F) → ячейки
  [подрядчик, корпус, стоимость, объём, коэф]; тот же невидимый символ);
  ~959 `buildBudgetFloors_` (работа → 'подрядчик|корпус' → {r:[расц], f:[[этаж,объём,стоимость]]})
- 1070 `safeCell_` (экранирование =+-@, лимит 1000); 1078 `ensureFactSheet_` (создаёт
  лист «Факт» с заголовками); 1092 `readFactMarks_` (журнал → последняя отметка по
  ключу); 1118 `buildFactRef_` (поэтажка V/Z → работа|корпус|этаж, % средневзв. по
  объёму, доли ×100 по максимуму колонки)
- ~1186 `sheetToObjects_`; ~1205 `jsonOut_`
