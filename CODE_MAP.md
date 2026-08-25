# CODE_MAP — Отделка

Карта кода `index.html` и `script.gs` — **читать перед правкой вместо чтения всего файла**;
после правки актуализировать сдвинувшиеся номера строк затронутых секций.
Номера строк — исторические ориентиры (на 2026-08-24 index.html ~3556 строк,
script.gs ~1443): правки бюджета 18–24.08 сдвинули секции ниже «Бюджета» ещё на
сотни строк, точечно обновлялись только затронутые секции. Надёжнее искать по
именам функций (Grep), номера воспринимать как порядок следования.

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

- ~1505 `loadBudget`; ~1519 `renderBudget` — статьи ПО АЛФАВИТУ (order с исходными
  индексами — на них ключи раскрытий), «Накладные расходы» пришпилена вниз
  (`isBottomItem`, 25.08); колонки Статья·Объем·Коэф.перед.·Сумма переделок
  (25.08: AG − AI «Стоимость без коэф», бэкенд отдаёт в cell[14] — 9..13 заняты
  Шамовым; `hasRedo`/`redoTd`/`wSumR`/`sumsR`/`totalR`, все уровни + Итого,
  оба фильтра; в colspan bdetail +1)·
  Работы·Материалы (18.08, `hasSplit`/`splitTd`/`wSumW`, значения на всех уровнях)·
  Стоимость·Факт работы·Факт материалы·Факт (21.08: итог — «К оплате» AA, cell[6],
  `hasFact`/`factTd`/`wSumF`; разбивка — Z×AB и Z×AC, cell[7]/cell[8],
  `hasFactSplit`/`factSplitTd`/`wSumFW`/`wSumFM`; все уровни + Итого, оба фильтра;
  старый кэш без этих элементов — колонок нет; колонки факта под общей шапкой
  «Модель факт» — thead в два ряда, rowspan у остальных, ширина «Модели» инлайном,
  `alignBudgetHead` двигает липкий второй ряд, вызов и из applyZoom; 24.08 блоки
  колонок разделены: класс `bsep` = вертикальная линия у первой колонки блока,
  шапки блоков подкрашены — `.modelhead`/`tr.sub th` голубым, `.h-lk` зелёным,
  `.h-kp` янтарным)·Выполнено (ЛК) (21.08: лист
  «Личные_кабинеты» из ответа budget `lk`/`state.budgetLk`, `hasLk`/`lkTd`/`lkByItem`,
  значения ТОЛЬКО в строках статей и Итого, МОЛ↔подрядчик по norm)·Базовый
  бюджет (25.08: сразу после «Стоимость» — из ответа budget `base`/
  `state.budgetBase` (слепок базы, свёрнутый бэкендом по работа×подрядчик),
  `hasBase`/`baseTd`/`baseByWork`/`wSumB`/`sumsB`/`totalB`, все уровни + Итого,
  оба фильтра (подрядчик — какой был в базе, склейки « + » по любому), шапка
  `.h-base` сиреневая, title = дата фиксации; в colspan bdetail +1)·Закрытие
  у заказчика (24.08: свод «Формы КП» из ответа budget `kp`/`state.budgetKp`,
  `hasKp`/`kpTd`/`kpByItem`, только статьи и Итого, фильтры НЕ влияют);
  иерархия статья (brow) → группа работ (bgrp) → работа
  (bwork, можно много открытых) → сводная (bdetail, синяя заливка, colspan 6)
- **Фильтр по подрядчикам** (12.08.2026, внутри renderBudget): кнопка `#bfilter-btn` +
  выпадающий список `.bfilter-dd` с мультивыбором (`state.budgetContr` Set,
  `budgetContrOpen`); пусто = все. Суммы статей/групп/работ (и объём/коэф) пересчитываются
  по выбранным (`wSum`/`cellOk`), пустые строки скрыты; CSS `.bfilter*` ~412.
  С 18.08 действующий набор — `budgetSelSet()` = ручной выбор ∪ СС-четвёрка
  `BUDGET_SS_CONTRS` при галочке «Собственные силы» (`#bss-check`/`state.budgetSS`,
  change-обработчик на #budget-screen)
- `budgetSSHtml` (24.08) — сводная работ СС Шамова: Позиция (с корпусами) · МОЛ ·
  Месяцев · Ср. людей · Чел.-часы · Ставка ₽/час · Стоимость (corp='СС',
  поля cell[9..13]); работы паркинга (corp='Паркинг') и подрядчики статьи
  «Накладные расходы» (corp='НР', 25.08) не раскрываются
  (класс `bflat`, проверка в workRowHtml и клике #budget-screen)
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
  кнопка `#baseline-save`; ~2720 `saveBaseline` (с 18.08 требует админ-пароль:
  prompt -> localStorage `otdelka_admin` -> POST `at`, бэк сверяет с ADMIN_PASSWORD)
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
  VOL D, GROUP F, SS_NAME J, BUDGET_FLAG L, REDO Q, CONTRACTOR S, SS W,
  FACT_PAID AA «К оплате», RATE AB, RATE_MAT AC, COST_WORK AE, BUDGET_COST AG);
  SHEET_FACT «Факт» + FLOOR_READY V / FLOOR_CLOSE Z
- ~48–53 ключи кэша (`floors_v3`, `vols_v1`, `budget_v18`, `bfloors_v1`, `changes_v1`,
  `factref_v1` — все кроме floors чанкованные); ~55 `clearCache` (⚠️ новый ключ добавлять сюда)
- ~70 `cachePutBig_/cacheGetBig_` (чанки 90 КБ, лимит 10 шт)
- ~96 `setup` (пароль); ~107–140 вопросы: `setupQuestions` (разовая авторизация Drive —
  ВЫПОЛНЕНА), `questionsFile_/readQuestions_/writeQuestions_` (QUESTIONS_FILE_ID)
- ~152–167 базовый расчёт: `baselineFile_/readBaseline_` (otdelka_baseline.json,
  BASELINE_FILE_ID; первая база зафиксирована 2026-08-05)
- ~177 `buildBaseline_` — слепок работа|корпус|этаж → [стоимость, объём, подрядчик,
  расц.раб, расц.мат]; ~246 `diffBaseline_` (add/del/mod)
- ~315 `doPost` — saveFact (журнал в лист «Факт», append-only, лимит 300, safeCell_;
  ветка ДО чтения вопросов) / importShamov (перезапись листа «расчет_Шамов»
  целиком, «Месяц» текстовым форматом; 24.08) / addQuestion / saveBaseline /
  setQuestionStatus (LockService, пароль)
- ~393 `doGet`: ping · clearCache (сброс кэша с витрины, 14.08; на фронте кнопка
  `#sb-refresh` «Обновить данные» внизу сайдбара) · meta (безопасно из чата) ·
  probe (агрегаты) · floors · volumes · questions · budget · changes ·
  budgetFloors · fact (отметки, без кэша) · factRef (справка V/Z) · load
- ~737 `buildFloorSummary_` — работа → [[подрядчик, корпус, расц.раб, СС, расц.мат], …]
  ⚠️ ключ склеен через НЕВИДИМЫЙ символ (код 1) — Edit его не находит, править вокруг
- ~818 `buildVolumes_`; ~935 `readLk_` («Личные_кабинеты» → [[МОЛ, статья,
  выполнено], …], в ответе budget — `lk`); дальше `readKp_` («Форма КП» →
  [[статья N, закрытие F], …], в ответе budget — `kp`); `readBaseSums_`
  (слепок базы → {date, works: [[работа, подрядчик, сумма], …]}, в ответе
  budget — `base`, для колонки «Базовый бюджет», 25.08; saveBaseline теперь
  сбрасывает и кэш бюджета); `readOverhead_` (кол. AH × «Подрядчик сводный» →
  статья «Накладные расходы», работы = подрядчики, corp='НР', 25.08,
  тоже `.concat`); `parkNum_` + `readPark_`
  (лист «Паркинг» → статья «Паркинг» в формате buildBudget_, сумма = «Договор»,
  группа = «Раздел», ключ работ раздел+работа через невидимый символ,
  подмешивается `.concat` в ответ budget; группы = «Раздел · Группа работ»);
  `shamovKind_` + `readShamov_` (лист «расчет_Шамов» → статья «Собственные силы
  (Шамов)», группы = разделы, работы = виды (shamovKind_), ячейки = позиция×МОЛ,
  сумма в cell[5], чел.-часы/ставка/месяцы/ср.людей/позиция в cell[9..13],
  тоже `.concat`); затем `buildBudget_`
  (статья → работы (+группа F) → ячейки
  [подрядчик, корпус, стоимость AG, объём, коэф, работы AE, факт AA,
  факт работы Z×AB, факт материалы Z×AC, 0×5, переделки AG−AI в cell[14]];
  строки без стоимости AG пропускаются; тот же невидимый символ);
  ~959 `buildBudgetFloors_` (работа → 'подрядчик|корпус' → {r:[расц], f:[[этаж,объём,стоимость]]})
- 1070 `safeCell_` (экранирование =+-@, лимит 1000); 1078 `ensureFactSheet_` (создаёт
  лист «Факт» с заголовками); 1092 `readFactMarks_` (журнал → последняя отметка по
  ключу); 1118 `buildFactRef_` (поэтажка V/Z → работа|корпус|этаж, % средневзв. по
  объёму, доли ×100 по максимуму колонки)
- ~1186 `sheetToObjects_`; ~1205 `jsonOut_`
