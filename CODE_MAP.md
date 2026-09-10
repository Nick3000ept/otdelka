# CODE_MAP — Отделка

Карта кода `index.html` и `script.gs` — **читать перед правкой вместо чтения всего файла**;
после правки актуализировать сдвинувшиеся номера строк затронутых секций.
Номера строк **сверены с кодом 2026-09-10** (index.html 6883 строки, script.gs 2963):
82 ссылки на функции и константы пересчитаны по фактическим объявлениям в файлах,
плюс вручную поправлены указатели на обработчики событий и блоки стилей — номерам
можно верить. До этого они оставались от состояния на 2026-08-24 (index.html был
~3556 строк) и разъехались примерно на 500 строк. Правило прежнее: правишь код —
поправь номера затронутых секций, иначе карта снова начнёт врать. При сомнении
искать по именам функций (Grep) — это надёжнее любых номеров.

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

- ~952 `GAS_URL`; ~986 `filled`; 1006 **`state`** (все данные и UI-состояние; см. комменты;
  12.08 добавлены `budgetContr`/`budgetContrOpen`)
- 1123 `hasVolume` (признак лидерного объёма); 1131 `workVolD` — ЧИСТЫЙ объём работы
  из поэтажки D (сумма volsTotals; «Объем работ» справочника — с коэффициентом);
  если работы в поэтажке нет и volsStatus='ready' — запасной объём из справочника (05.08)
- 1155 `norm`; 1159 `fmtCell`; 1170 `fmtVol`; 1181 `escapeHtml`; 1195 `COL_ORDER`
  (⚠️ новые колонки Sheets сами на витрине не появятся — добавлять сюда)
- 1624 `ALL_CORPS`, `BASE_RATE_COL`, `BASE_MAT_COL`, `fmtInt`

## index.html — дерево работ (Расценки/Объемы)

- 1204 `workColumns`; 1254 `cellHtml` (VOL_COL: «…» пока volsStatus loading, потом workVolD;
  запасной объём из справочника — приглушённый, с title-подсказкой;
  кнопка «Вопрос» в wname на rates)
- 1338 `groupWorks` (Место→Поверхность→Группа; сумматоры групп по workVolD, лидерные сверху)
- 1409 `renderTable` — главный рендер; чанки по 300; поиск раскрывает всё (showAll);
  класс `vols` = мелкий шрифт чисел
- 6255 `selectWork`; 6264 `toggleGroup`; 6270 клик `#tbody`; 6373 сброс фильтров;
  6530 поиск (debounce)

## index.html — нижняя панель (Расценки)

- ~1629 `contractorsHtml` — сводная подрядчик×корпус; режимы `ctrMode` work|mat|both;
  блоки Подрядчики/СС; «Базовая расценка» в незанятых корпусах; с 14.08 сверка
  ячеек с contrRates (`vedom`/`misTxt`, класс `rate-bad` красным, СС не сверяется)
- 1753 `renderBottomPane`; 1780 `contractorDetailHtml` (СС — через ssNames поэтажки +
  Справочник СС); 1838 `miniTable`; 6169 клик `#ctr-body`; 6206 `materialsHtml`

## index.html — Объемы

- 1853 `loadVols` — action=volumes; totals → `state.volsTotals`; с 05.08 грузится ФОНОМ
  при старте (нужен для колонки «Объем работ» на Расценках); по готовности перерисовка
- 4879 `openVolModal` — поэтажная ведомость (модалка)

## index.html — Факт (отметки выполнения, 10.08.2026)

- 860 сайдбар `data-screen="fact"`; 817 CSS `.factgrid/.fcell/.fpct/.fdone/.fcorp-done`
- 1006 state: `factMarks/factStatus/factRef/factRefStatus/factPending/factSaving/factModalKey`
- 1236 `factPct` — средневзвешенный % готовности (веса — объёмы этажей vols);
  1254 `cellHtml` (ветки corp/total для fact); 1536 `factSums` в renderTable (группы —
  только лидерные работы)
- 4928 `loadFact` (action=fact); 4942 `loadFactRef` (action=factRef, по готовности
  перерисовывает открытую сетку, если пользователь не печатает); 4964 `refreshFactScreen`
- 4985 `openFactModal` — сетка этажи×корпуса (план-объём, input, ✓, «✓ все» на корпус,
  строка «Готовность», подсказки из factRef); 5057 `ensureUserName`
- 5067 `applyFactInput` (валидация 0..100, optimistic, очередь); 5116 `scheduleFactFlush`
  (пауза 1,2 с); 5121 `flushFactMarks` (POST saveFact пакетом, 3 ретрая, откат + alert);
  5164 beforeunload; 6189 `closeModal` — немедленный flush несохранённого
- 5970 setScreen ветка fact; клик tbody: fact -> openFactModal

## index.html — Аналитика (26.08.2026)

- Пункт сайдбара `data-screen="analytics"` (под «Бюджетом»), контейнер
  `#analytics-screen`, CSS `.an-legend`/`.an-dot`/`.an-chart` (~611);
  `state.analytics`/`analyticsStatus`; ветка isAnalytics в `setScreen`
## index.html — шапка (26.08.2026)

- Шапка видна везде, кроме «Аналитики», в ДВЕ строки `.frow` (26.08): в
  `setScreen` `header.compact` на Проверках (CSS прячет .flt/.fss/#f-reset),
  `header.bmode` на Бюджете (прячет #flt-place-wrap/#flt-surface-wrap;
  «Группа работ» действует на бюджете — grpSel/w[3] в renderBudget); кнопка
  «Развернуть все» убрана; #f-reset сбрасывает и budgetContr/budgetSS/
  budgetQuery/workSel
- Поиск `#search` контекстный (обработчик у поля): rates/volumes/fact →
  `state.query`+renderTable; budget → `state.budgetQuery`+renderBudget
  (синхронизация с #bsearch в обе стороны); проверки → `state.checkQuery` +
  `applyCheckSearch` (скрытие строк, MutationObserver на #check-screen)
- Фильтр «Подрядчик» `#f-contr` (`state.contrSel`, `populateContrFilter` из
  floors) + галочка «Собственные силы» `#f-ss` (`state.ssSel`): в renderTable
  фильтр `contrOk` (набор = подрядчик ∪ BUDGET_SS_CONTRS при галочке); на
  budget транслируются в budgetContr/budgetSS; на проверках скрыты
  (#flt-contr-wrap display none)
- Список работ у поиска `#search-dd` (26.08): `searchWorkList` (дерево или
  бюджет) → `buildSearchDd` (выбранные сверху, кап 300), `state.workSel`,
  `refreshAfterWorkSel`; в renderTable `wSelOk`, в renderBudget wMatch по Set +
  q-маркер 'sel'. Блок фильтров бюджета (.bfilter/#bsearch/#bss-check) и
  `budgetContrOpen` УДАЛЕНЫ 26.08 — управление из шапки

- `TZ_TOP`/`TZ_COLORS`/`TZ_REST`/`TZ_DOCS_LIMIT`/`tzMonthLabel`/`tzInt` +
  `loadTuzio`/`renderTuzio`/`tzDetailRow` + делегированный клик на `#tuzio-screen`
  (перед resize-обработчиком «Аналитики», 31.08) — вкладка **ТУЗИО**: оплата
  почасовщикам. Накопительные столбики по месяцам, сегменты = статьи бюджета
  (топ-12 цветом + серые «Прочие»); порядок слоёв в SVG важен — прозрачная
  кнопка-колонка рисуется ПОД сегментами, иначе перехватывает наведение и
  title-подсказки по статьям не показываются. `state.tzMonth` (выбранный месяц,
  `data-tzm` на колонке/сегменте/подписи), `state.tzHl` (подсветка статьи из
  легенды, `data-tzg`), `state.tzCum` (накопительно / только месяц, `data-tzcum`),
  `state.tzOpen` (раскрытые статьи, `tr.tzrow` → `tzDetailRow`: сотрудники +
  табели). Данные — `action=tuzio`, CSS `.tz-*`/`table.check.tztab`.
  **Вторая итерация 31.08**: `tzInBudget` (= `anMatch`) делит расшифровку на два
  блока `tzBlock` — «Статьи бюджета отделки» и «Справочно»; `tzIsFinish`/
  `TZ_FIN_CREWS` — разметка отделка/общестрой по названию статьи для фильтра
  `state.tzKind` (`data-tzkind`); мультивыбор статей `state.tzSel`/
  `state.tzSelOpen`/`tzPickable` (`data-tzdd` — открыть список, `data-tzitemchk` —
  статья, `data-tzsel` — все/ничего, `data-tzreset` — сброс). Список статей
  собран из div'ов (`.tz-opt`), НЕ из label+checkbox: у label клик приходит
  дважды и выбор не менялся. Оба фильтра применяются до расчёта топ-12,
  поэтому диаграмма перестраивается вместе с таблицей.
  **Третья итерация 31.08**: `openTuzioPerson`/`tzPersonHtml` — модалка
  сотрудника по клику на `tr.tzp`/`data-tzpi` в списке людей раскрытой статьи
  (итоги, разбивка по месяцам, полный список табелей; блок «Бригада —
  с кем работает» убран с экрана 31.08 по просьбе пользователя, бэкенд
  напарников в `mates` отдавать не перестал).
  `tzPivot` — сводная «статьи × месяцы» (часы за месяц, столбец и строка
  «Итого», пометка «спр.» у статей вне бюджета, клик по месяцу в шапке =
  `data-tzm`); CSS `.tz-pivot-wrap`/`table.check.tzpiv` с `table-layout: auto`.
  **Четвёртая итерация 31.08**: сводная раскрывается — `data-tzpivitem`
  (статья, `state.tzPivOpen`) → строка «Без бригады» `data-tzpivbr`
  (`state.tzPivBrClosed`, хранит свёрнутые) → строки сотрудников; клик по
  `td.tzpiv-cell`/`data-tzday` ('статья|человек|месяц', `state.tzPivDay`) →
  `tzPivDaysRow` с днями. Данные дней — `tzLoadPerson` (кэш
  `state.tzPersonCache`, тот же `action=tuzioPerson`, что у карточки).
  Столбец статьи 340px.
  **Пятая итерация 31.08**: диаграмма переделана в вид «Аналитики» —
  заливки-полигоны по статьям накопительно + `polyline` итога с точками
  (`data-tzm` на точке, прозрачном кружке r=13 и подписях), столбиков
  (`tz-bar`) больше нет. Сводная разделена на две таблицы: `tzIsSb5`
  отбирает статьи «СБ5 …» во вторую, обе рисует `tzPivotTable`. В карточке
  сотрудника — свод по статьям бюджета, табели раскрываются по клику
  (`data-tzpitem` — статья, `data-tzpall` — все табели, `tzRenderPerson`
  перерисовывает модалку, клики ловит слушатель на `#modal-body`).
  **Шестая итерация 31.08**: блок СБ5 свёрнут в справочный внизу
  (`data-tzsb5`/`state.tzSb5Open`), порядок блоков — диаграмма → расшифровка
  месяца → сводная → СБ5.
  **Седьмая итерация 31.08**: сводная `tzPivot` УБРАНА с экрана (код оставлен,
  вызов снят), статьи СБ5 вынесены из блоков расшифровки в свой свёрнутый блок
  внизу (`sb5List` в `renderTuzio`, у `tzBlock` флаг `bare`) Бэк — `action=tuzioPerson`
  + `buildTuzioPerson_` (перед `buildAnalytics_`), кэш `CACHE_TUZP` на каждое
  ФИО. CSS `.tzp-*`/`table.check.tzp-tab`

- `AN_ITEMS`/`anNorm`/`anMatch` (перед `loadAnalytics`) — зашитый список статей
  отделки (26.08): только они входят в линии; «паркинг»/«лобби» по префиксу
- `loadAnalytics`/`renderAnalytics` (после `renderBudget`, перед `alignBudgetHead`) —
  накопительные линии «затраты (МОРС + ТУЗИО, одна линия с 27.08: `cTotal`,
  двухслойная заливка `band` — снизу МОРС, сверху ТУЗИО, точки `dotsCost`
  с разбивкой месяца)» и «поступления (Форма КП)»; клик по легенде
  (`data-hl`, `state.anHl`) выделяет ряд на графике (27.08), рукописный SVG
  (сетка с «круглым» шагом, подписи месяцев под −45°, title-подсказки на точках,
  легенда с итогами и разницей); суммы в млн руб. График вписывается в ширину
  экрана без прокрутки (26.08: stepX от el.clientWidth, подписи месяцев
  прореживаются `labelEvery`, у window resize-обработчик перерисовки). Ниже —
  таблица «По статьям» (26.08, вместо столбцов): `perItem`/`anKey` (паркинг/
  лобби схлопнуты), с 27.08 колонка ТУЗИО (`tuzItems`, разница =
  КП − МОРС − ТУЗИО, `rowDiff`), колонки «Прогнозный бюджет» (`budItems`
  из state.budget) и «Остаток» (`rest` = бюджет − МОРС − ТУЗИО за всё время,
  `morsAll`/`tuzAll`), сортировка по разнице, CSS `.anitems`;
  клик по `tr.anrow`
  (делегирование на #analytics-screen) пишет `state.anSel` — линии только по
  выбранной статье; кнопка `button.anpay` «Платежи» → `openAnPayments`/
  `anPaymentsHtml` — модалка всех строк МОРС статьи (action=morsRows, бэк:
  обработчик в doGet перед changes, лимит 2000). Выбор месяца `state.anMonth`
  (26.08): data-m на точках/подписях графика + selBand-подсветка; таблица
  считает tblMonths, openAnPayments фильтрует строки по месяцу даты
  (new Date, не substring ISO)

## index.html — МОЛ и Материалы (28.08.2026)

- Пункты сайдбара `data-screen="mol"` и `data-screen="materials"` (под
  «Аналитикой»), контейнеры `#mol-screen`/`#materials-screen`, CSS `.mtab`,
  `.mol-block`/`.mol-name`/`.mol-sec`, `tr.mrow`/`tr.mdetail`;
  `state.writeoff`/`writeoffStatus`/`expenses`/`matOpen`; ветки isMol/isMaterials
  в `setScreen`; обработчик кликов `#materials-screen` (раскрытие материала) —
  сразу после навешивания кликов на `.sb-item`
- Общий слой (после обработчика `#analytics-screen`, перед `openAnPayments`):
  `M_TYPES`, `GKL_RE`/`GKL_TITLE`/`matKey`/`matTitle`, `MOL_LIST`,
  `buildMaterialCalc(volByWork)` (материал → объём/стоимость + список работ;
  без аргумента — объёмы работ из «Расходов», с аргументом — из бюджета по МОЛ),
  `molWorkVolumes(mol)`, `molBudget(mol)`, `fmtQ`/`fmtR`,
  `loadWriteoff`, `renderMol`, `renderMaterials`
- script.gs: `readWriteoff_` (перед `readLk_`), обработчик `action=writeoff`
  в doGet перед `morsRows`, `CACHE_WO = 'writeoff_v1'` (+ в `clearCache`),
  блок CONFIG `SHEET_WRITEOFF`/`WO_*`
- Поставка из 1С (09.09.2026): фронт — `loadMat1c` (рядом с `loadWriteoff`),
  `state.mat1c`/`mat1cStatus`/`mat1cInfo`, внутри `renderMol` карта `supByMat`
  и `supCell` (ячейка с подписью единицы 1С), колонка «Поставка (1С)» между
  «К списанию ЛК» и «Стоимость материала итого»; с 09.09 колонки таблицы
  сгруппированы в три блока (Модель · Личный кабинет · 1С) — шапка в два ряда;
  с 09.09 (вторая итерация) блоков четыре — Модель · Личный кабинет · 1С ·
  Стоимость, «Остаток» убран, обе стоимости справа;
  «Выполнено натурально» — `cell[16]` бюджета (объём D × процент готовности V,
  `buildBudget_`/`maxReady`/`pctScale`, кэш `budget_v30`), фронт —
  `molWorkVolumes(mol, 16)`/`allFactVolumes`;
  расшифровка поставки по клику — `openSupplyModal`/`loadMat1cDetail`/`objQueue`,
  `state.mat1cDet`, ячейки с `data-supmat`/`data-supmol`/`data-supname` и классом
  `sup-click`, обработчики в начале кликов `#mol-screen` и `#materials-screen`;
  бэкенд `buildMat1cDetail_` + `action=mat1cDetail` + `CACHE_M1CD` (чанкованный);
  проверка «Единицы 1С» — `renderCheckUnits`/`loadMat1cUnits`/`state.mat1cUnits`/
  `unitsOpen`, пункт `check-units` в `#sb-checks` и в `CHECK_SCREENS`, бейдж
  `badge-check-units`, обработка клика — в начале обработчика `#check-screen`;
  бэкенд `buildMat1cUnits_` + `action=mat1cUnits` + `CACHE_M1CU`;
  пересчёт в единицы витрины — `m1cOurUnits_`/`m1cNorm_`/`m1cSameUnit_` и колонка
  «Коэф. в ед. витрины» (9-я) листа сопоставления; `action=map1cRows` — прочитать
  лист целиком; флаги `overwrite`/`reset` у doPost `syncMap1c`;
  счётчики ответа mat1c: `unmappedRows/Sum` и отдельно `skipRows/Sum`
  (услуги и инструмент), на фронте — `mat1cSkipNote`;
  та же шапка и те же колонки 1С в `renderMaterials` (`supTotal`/`sup1c`/
  `sup1cCells`/`total1c`, материалы «только из 1С» дописываются в `list`),
  класс `mmat`, стоимость 1С берётся из того же ответа (r[4]); предупреждение о
  несопоставленных позициях — сразу под шапкой вкладки.
- Поставка и перемещение РАЗНЫМИ колонками (10.09.2026): блок «1С» — три
  колонки «Поставка · Перемещение · Итого». Общие помощники сразу после
  `fmtQ`/`fmtR`: `newSupBucket`, `addSup` (раскладывает девятипольную строку
  агрегата), `supCellText` (бывшие локальные `supCell`/`supCellM`),
  `supHasSplit` (старый пятипольный кэш → одна колонка, как было).
  В `renderMol` и `renderMaterials` — по своей `sup1cCells` (ячейки блока «1С»,
  все три кликабельны, `data-supmat`), `const supSplit` рядом с картами
  поставки; colspan шапки `1С` и расшифровки `mdetail` (8 или 10) считаются от
  `supSplit`. Ширины при трёх колонках — CSS `table.check.mmat.m1c3` (рядом
  с `.mmat th.grphead.g-*`), класс вешается на таблицу при `supSplit`.
  script.gs — `buildMat1c_`/`m1cText_`/`m1cNum_`/`m1cMol_` (перед `readLk_`;
  внутри `buildMat1c_` переменная `docType` и счётчики `qtyIn/sumIn/qtyMv/sumMv`
  в `agg`), `action=mat1c` в doGet (перед `tuzio`), doPost `syncMap1c` (перед
  `addQuestion`) — пересборка листа `Сопоставление_1С` с сохранением ручных
  колонок, `CACHE_M1C = 'mat1c_v2'` (+ в `clearCache`), блок CONFIG `M1C_*`.
  Разведка листа без данных наружу — `action=probe1c` (агрегаты: МОЛ, объекты,
  типы документов, месяцы, совпадения названий).

## index.html — выгрузка таблиц (10.09.2026)

- Весь блок — в САМОМ КОНЦЕ скрипта, перед `if (state.token)`. Порядок функций:
  `SCREEN_TITLES`/`PANE_TITLES` → `prevHeading` → `exportTitleFor` → `dlFileName` →
  `exportTableClone` → `downloadTableExcel` → `printTablePdf` → `exportBar` →
  `DL_ROOTS`/`dlHidden`/`mountExportBars` → `scheduleExportBars` + два
  `MutationObserver` (на `main` и на `#modal-body`) → делегированный обработчик
  кликов на `document` (`.dl-opt` — выгрузить, клик мимо — закрыть меню).
- CSS `.dl-bar`/`.dl-menu`/`.dl-options`/`.dl-opt` — сразу после `.check-desc`.
- Ещё одна строка: вызов `scheduleExportBars()` в конце `setStatus` (показ панелей
  меняет только стиль, наблюдатель за разметкой такое не ловит).
- Кнопка вставляется перед таблицей (или перед её `.bdetail-wrap`), таблицу находит
  в момент клика через `bar.nextElementSibling`. Вложенные `table.inner` пропускаются
  по `tbl.parentElement.closest('table')`.
- Автотесты на jsdom (19 проверок) писались в scratchpad сессии 10.09, в проект
  не сохранялись; при правках блока проще написать заново — образец в CLAUDE.md.

## index.html — Бюджет

- ~1892 `loadBudget`; ~1928 `renderBudget` — статьи ПО АЛФАВИТУ (order с исходными
  индексами — на них ключи раскрытий), «Накладные расходы» пришпилена вниз
  (`isBottomItem`, 25.08); колонки Статья·Объем·
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
  `state.budgetBase` (слепок базы, свёрнутый бэкендом по работа×подрядчик;
  с 26.08 плюс `base.extras` — слепок доп-статей, на фронте `baseExtra`/`bexKey`,
  ключ статья|группа|подгруппа|работа, `wSumB(w, item)`),
  `hasBase`/`baseTd`/`baseByWork`/`wSumB`/`sumsB`/`totalB`, все уровни + Итого,
  оба фильтра (подрядчик — какой был в базе, склейки « + » по любому), шапка
  `.h-base` сиреневая, title = дата фиксации; в colspan bdetail +1)·Закрытие
  у заказчика (24.08: свод «Формы КП» из ответа budget `kp`/`state.budgetKp`,
  `hasKp`/`kpTd`/`kpByItem`, только статьи и Итого, фильтры НЕ влияют)·блок
  «Переделки» В ПРАВОМ КРАЮ (25.08: Коэф. перед. + Сумма переделок, руб под
  общей шапкой `.redohead`, сабы `.h-redo`, тон терракотовый; сумма = AG − AI
  «Стоимость без коэф», бэкенд отдаёт в cell[14] — 9..13 заняты Шамовым;
  `hasRedo`/`redoCols`/`redoTd`/`wSumR`/`sumsR`/`totalR`, все уровни + Итого,
  оба фильтра; в colspan bdetail +1; второй ряд шапки теперь ЕСТЬ ВСЕГДА,
  thSpan=rowspan 2 безусловный);
  иерархия СЕКЦИЯ (bsect: «Квартиры» = статьи MR Base, «МОП» = «СБ3 - МОП -»,
  прочие статьи вне секций; `sectOf`/`renderItem`/`entries`, 25.08) → статья
  (brow) → группа работ (bgrp) → [подгруппа-поверхность bsub, только паркинг
  и лобби] → работа (bwork, можно много открытых) → сводная (bdetail,
  синяя заливка). Секции, группы и подгруппы ПО УМОЛЧАНИЮ СВЕРНУТЫ (25.08:
  `budgetSectOpen`/`budgetGrpOpen`/`budgetSubOpen` хранят РАСКРЫТЫЕ,
  не свёрнутые; поиск по работе раскрывает сам). Статьи внутри секций и вся их
  иерархия — с классом `insec` и отступом на шаг глубже (26.08: renderItem(pair,
  insec), CSS-лесенка ~442: brow 24 / bgrp 40 / bsub 52 / bwork 60 / bindent 74)
- **Фильтр по подрядчикам** (12.08.2026, внутри renderBudget): кнопка `#bfilter-btn` +
  выпадающий список `.bfilter-dd` с мультивыбором (`state.budgetContr` Set,
  `budgetContrOpen`); пусто = все. Суммы статей/групп/работ (и объём/коэф) пересчитываются
  по выбранным (`wSum`/`cellOk`), пустые строки скрыты; CSS `.bfilter*` ~412.
  С 18.08 действующий набор — `budgetSelSet()` = ручной выбор ∪ СС-четвёрка
  `BUDGET_SS_CONTRS` при галочке «Собственные силы» (`#bss-check`/`state.budgetSS`,
  change-обработчик на #budget-screen); при галочке статья «Накладные расходы»
  исключена из таблицы и «Итого» (`rowsT`, 25.08)
- `budgetSSHtml` (24.08) — сводная работ СС Шамова: Позиция (с корпусами) · МОЛ ·
  Месяцев · Ср. людей · Чел.-часы · Ставка ₽/час · Стоимость (corp='СС',
  поля cell[9..13]); работы паркинга (corp='Паркинг') и подрядчики статьи
  «Накладные расходы» (corp='НР', 25.08) не раскрываются
  (класс `bflat`, проверка в workRowHtml и клике #budget-screen)
- ~4603 `budgetWorkHtml` — сводная работы: строки подрядчик×расценка (разные расценки =
  отдельные строки), «Не определен» сверху (базовые расценки справочника), блоки
  Подрядчики/СС (плашки), колонка «Итого» справа, tfoot «Итого»; ячейки кликабельны (bcell);
  фильтр подрядчиков действует и здесь (fSel/fActive); с 18.08 в ячейках две суммы —
  работы (cell[5], AE) и материалы (AG−AE, класс `.bmat`), fallback `hasSplit` для
  старого кэша; в renderBudget — фильтр по работе `#bsearch`/`budgetQuery` (wMatch,
  автораскрытие при поиске, input-обработчик на #budget-screen с debounce)
- 4761 `loadBudgetFloors`; 4774 `openBudgetCellModal` — расшифровка ячейки по этажам
  (модалка: Этаж·Объем·Раб/ед·Мат/ед·Стоимость; action=budgetFloors, грузится при 1-м клике)
- 1783 клик `#budget-screen` (сначала bfilter-item/reset/btn и закрытие списка,
  потом bcell/bgrp/bwork/brow)

## index.html — Проверки

- 5200 `renderCheckRates` — «Недостающие расценки» (лист «Проверки расценки» как есть)
- 5232 `DEV_LIMIT`; 5234 `workRateChecks`; 5265 `renderCheckWorkRates` — «Отклонения
  расценок» (базовая vs средние из floors; группы sect сворачиваются); 5330 `checkDetailHtml`
- 5366 `noCostChecks` (только объём>0); 5388 `renderCheckNoCost` — «Без стоимости»
  (группы, всё свернуто по умолчанию)
- 5440 `FORMULA_ERR_RE`; 5442 `formulaChecks`; 5487 `renderCheckFormulas` — «Формулы»
  (ошибки #N/A и т.п. в листе «Работы» И в «Расходах»; ошибки приходят текстом)
- ~5518 `CHANGE_FIELDS`; ~5525 `loadChanges`; ~5541 `renderCheckChanges` — «Изменения»:
  с 14.08 иерархия как в «Бюджете» (статья → группа → работа, соответствие из
  state.budget w[3]; state `chgOpen/chgGrpCollapsed/chgWorkOpen`; классы строк
  brow/bgrp/bwork с data-chgart/chggrp/chgwork — стили бюджета переиспользованы,
  клики в обработчике #check-screen; работы «— вне бюджета —» отдельной статьёй;
  budget error → плоский список; детали строк — столбцами CH_COLS/fieldCell:
  Подрядчик · Стоимость мат./работ за ед. · Объём · Стоимость, mod красным);
  кнопка `#baseline-save`; ~5744 `saveBaseline` (с 18.08 требует админ-пароль:
  prompt -> localStorage `otdelka_admin` -> POST `at`, бэк сверяет с ADMIN_PASSWORD)
- 5862 `renderCheckQuestions` — «Вопросы» (кнопка статуса qstatus)
- 5940 `updateCheckBadges`; 5960 `CHECK_SCREENS` (экран → рендер; новые проверки сюда);
  2325 клик `#check-screen` (qstatus/baseline-save/ncgrp/grp/wrow)

## index.html — Вопросы (запись)

- 5784 `postJson` (POST text/plain — обход CORS-preflight); 5799 `loadQuestions` (фоном);
  5814 `openQuestionModal`; 5831 `submitQuestion`; 5909 `toggleQuestionStatus`
  (optimistic + откат); имя — localStorage `otdelka_user`

## index.html — каркас

- 5970 `setScreen`; 6390 `setStatus`; 6404 `fetchWithRetry` (3 попытки)
- 6426 `loadData` — action=load; затем фоном: `loadFloors` + `loadQuestions` + `loadVols`
- 6484 `loadFloors`; 2593/2600 gate/app; 6520 `submitPassword`

## script.gs (деплой ТОЛЬКО clasp update-deployment, сейчас v24+)

- 1 `CONFIG` — ID таблицы, листы, колонки поэтажки FLOOR_* (WORK A, CORP B, FLOOR C,
  VOL D, GROUP F, SS_NAME J, BUDGET_FLAG L, REDO Q, CONTRACTOR S, SS W,
  FACT_PAID AA «К оплате», RATE AB, RATE_MAT AC, COST_WORK AE, BUDGET_COST AG);
  SHEET_FACT «Факт» + FLOOR_READY V / FLOOR_CLOSE Z
- ~48–53 ключи кэша (`floors_v3`, `vols_v1`, `budget_v27`, `bfloors_v1`, `changes_v1`,
  `factref_v1`, `analytics_v4` — все кроме floors чанкованные); ~55 `clearCache`
  (⚠️ новый ключ добавлять сюда). В CONFIG с 26.08 блок «Аналитики»: SHEET_MORS
  «МОРС» (MORS_SUM/MORS_DATE/MORS_ITEM) + KP_MONTHS_START 24 (кол. X «Формы КП»)
- ~70 `cachePutBig_/cacheGetBig_` (чанки 90 КБ, лимит 10 шт)
- ~96 `setup` (пароль); ~107–140 вопросы: `setupQuestions` (разовая авторизация Drive —
  ВЫПОЛНЕНА), `questionsFile_/readQuestions_/writeQuestions_` (QUESTIONS_FILE_ID)
- ~152–167 базовый расчёт: `baselineFile_/readBaseline_` (otdelka_baseline.json,
  BASELINE_FILE_ID; первая база зафиксирована 2026-08-05; с 26.08 в файле также
  `extras` — слепок доп-статей бюджета, `buildBaselineExtras_` рядом с
  `readBaseSums_`, пишется в saveBaseline)
- ~271 `buildBaseline_` — слепок работа|корпус|этаж → [стоимость, объём, подрядчик,
  расц.раб, расц.мат]; ~340 `diffBaseline_` (add/del/mod)
- ~382 `doPost` — saveFact (журнал в лист «Факт», append-only, лимит 300, safeCell_;
  ветка ДО чтения вопросов) / importShamov (перезапись листа «расчет_Шамов»
  целиком, «Месяц» текстовым форматом; 24.08) / addQuestion / saveBaseline /
  setQuestionStatus (LockService, пароль)
- `buildAnalytics_` (26.08, перед `readSsFact_`) — затраты МОРС × месяц и закрытия
  «Формы КП» по месячным колонкам (даты в строке 1, без даты — пропуск), для
  action=analytics (вкладка «Аналитика»; ответ статья → {месяц: сумма} + morsStatus)
- ~694 `doGet`: ping · clearCache (сброс кэша с витрины, 14.08; на фронте кнопка
  `#sb-refresh` «Обновить данные» внизу сайдбара) · meta (безопасно из чата) ·
  probe (агрегаты) · floors · volumes · questions · budget · analytics (26.08) · changes ·
  budgetFloors · fact (отметки, без кэша) · factRef (справка V/Z) · load
- ~1406 `buildFloorSummary_` — работа → [[подрядчик, корпус, расц.раб, СС, расц.мат], …]
  ⚠️ ключ склеен через НЕВИДИМЫЙ символ (код 1) — Edit его не находит, править вокруг
- ~1487 `buildVolumes_`; ~1885 `readLk_` («Личные_кабинеты» → [[МОЛ, статья,
  выполнено], …], в ответе budget — `lk`); дальше `readKp_` («Форма КП» →
  [[статья N, закрытие F], …], в ответе budget — `kp`); `readBaseSums_`
  (слепок базы → {date, works: [[работа, подрядчик, сумма], …]}, в ответе
  budget — `base`, для колонки «Базовый бюджет», 25.08; saveBaseline теперь
  сбрасывает и кэш бюджета); `readOverhead_` (кол. AH × «Подрядчик сводный» →
  статья «Накладные расходы», работы = подрядчики, corp='НР', 25.08,
  тоже `.concat`); `parkNum_` + `readPark_`
  (лист «Паркинг» → статья «Паркинг» в формате buildBudget_, сумма = «Договор»,
  ключ работ раздел+работа через невидимый символ, подмешивается `.concat`
  в ответ budget; группы = «Раздел» — типы помещений, поверхность в w[4]
  (вложенные подгруппы `tr.bsub` на фронте, `budgetSubOpen`, работы
  класс `bindent`; финал 25.08); + зашитая группа «Не учтенные работы
  в расчете с заказчиком», 5 работ / 34,2 млн, список `extras` в коде, 25.08);
  `readSsFact_` (зашитая статья «Собственные силы факт на 01.08.2026…»,
  228,9 млн, corp='СС факт', 25.08, `.concat`);
  `readLobby_` (лист «Лобби» → статья «Лобби»: группы = зоны Лобби К1…К12,
  подгруппы w[4] = Группа работ, подрядчик МПСИ-2/ВЕЛМИ/СК-Авангард,
  corp='Лобби' — bflat, cell[5]=СМР+косвенные; 25.08, тоже `.concat`);
  `shamovKind_` + `readShamov_` (лист «расчет_Шамов» → статья «Подсоба Шамов»
  (переименована 25.08), группы = разделы БЕЗ Общестроя и Теплового контура
  (исключены 25.08), работы = виды (shamovKind_), ячейки = позиция×МОЛ,
  сумма в cell[5], чел.-часы/ставка/месяцы/ср.людей/позиция в cell[9..13],
  тоже `.concat`); затем `buildBudget_`
  (статья → работы (+группа F) → ячейки
  [подрядчик, корпус, стоимость AG, объём, коэф, работы AE, факт AA,
  факт работы Z×AB, факт материалы Z×AC, 0×5, переделки AG−AI в cell[14]];
  строки без стоимости AG пропускаются; тот же невидимый символ);
  ~2742 `buildBudgetFloors_` (работа → 'подрядчик|корпус' → {r:[расц], f:[[этаж,объём,стоимость]]})
- 2822 `safeCell_` (экранирование =+-@, лимит 1000); 2830 `ensureFactSheet_` (создаёт
  лист «Факт» с заголовками); 2844 `readFactMarks_` (журнал → последняя отметка по
  ключу); 2870 `buildFactRef_` (поэтажка V/Z → работа|корпус|этаж, % средневзв. по
  объёму, доли ×100 по максимуму колонки)
- ~2940 `sheetToObjects_`; ~2959 `jsonOut_`
