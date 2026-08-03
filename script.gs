var CONFIG = {
  SPREADSHEET_ID: '1-Fd0eTinA8jiJ6UM5jazzj8vfW0wRceZPT7eKOSkutA',
  SHEET_WORKS: 'Работы',
  SHEET_MATERIALS: 'Материалы',
  SHEET_EXPENSES: 'Расходы',
  WORK_KEY: 'Название работы из АР',  // связка «Работы» ↔ «Расходы»
  PLACE_KEY: 'Место',
  EXCLUDE_PLACES: ['1 этаж'],         // места, которые витрина не показывает (03.08.2026)

  // Лист поэтажных работ — источник сводки «подрядчик × корпус» (03.08.2026).
  // 25 тыс. строк × 34 колонки: целиком НИКОГДА не отдаём, только агрегат.
  SHEET_FLOORS: 'Поэтажка_работы',
  FLOOR_WORK: 'Работа',
  FLOOR_CORP: 'Корпус',
  FLOOR_CONTRACTOR: 'Подрядчик сводный',              // выбор пользователя 03.08.2026
  FLOOR_RATE: 'Расценка за работу на ед в бюджет',    // что показываем в ячейках
  FLOOR_SS: 'Расценка СС работа'                      // заполнена -> собственные силы
};

var CACHE_FLOORS = 'floors_v1';   // сводка подрядчик × корпус (см. action=floors)

/** Сбросить кэш вручную из редактора GAS — например, после правок в «Поэтажка_работы». */
function clearCache() {
  CacheService.getScriptCache().remove(CACHE_FLOORS);
}

function setup() {
  PropertiesService.getScriptProperties().setProperty('PASSWORD', 'otdelka2026');
}

function doGet(e) {
  var params = (e && e.parameter) || {};
  var action = params.action || 'load';
  var token = params.t || '';
  var stored = PropertiesService.getScriptProperties().getProperty('PASSWORD');

  if (!stored || token !== stored) {
    return jsonOut_({ ok: false, error: 'unauthorized' });
  }

  if (action === 'ping') {
    return jsonOut_({ ok: true, time: new Date().toISOString() });
  }

  // Оглавление таблицы: имена вкладок, размеры, заголовки колонок. Без данных —
  // безопасно смотреть из чата, ответ измеряется килобайтами, а не мегабайтами.
  if (action === 'meta') {
    try {
      var ssMeta = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
      var sheets = ssMeta.getSheets().map(function (sh) {
        var lastRow = sh.getLastRow();
        var lastCol = sh.getLastColumn();
        var headers = (lastRow > 0 && lastCol > 0)
          ? sh.getRange(1, 1, 1, lastCol).getValues()[0]
          : [];
        return {
          name: sh.getName(),
          rows: Math.max(lastRow - 1, 0),
          cols: lastCol,
          headers: headers
        };
      });
      return jsonOut_({ ok: true, spreadsheet: ssMeta.getName(), sheets: sheets });
    } catch (err) {
      return jsonOut_({ ok: false, error: 'meta_failed', message: String(err) });
    }
  }

  // Разведка листа «Поэтажка_работы»: только агрегаты (сколько уникальных значений,
  // насколько заполнены колонки). Данные наружу не отдаются.
  if (action === 'probe') {
    try {
      var ssP = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
      var shP = ssP.getSheetByName(CONFIG.SHEET_FLOORS);
      var lastRowP = shP.getLastRow();
      var lastColP = shP.getLastColumn();
      var headP = shP.getRange(1, 1, 1, lastColP).getValues()[0];

      var want = ['Подрядчик сводный', 'Подрядчик договор', 'Подрядчик шахматка'];
      var moneyCols = ['Стоимость работ итого для бюджета', 'К оплате',
                       'Стоимость материалы + работа для бюджета', 'Расценка СП работы'];

      var idx = function (name) {
        for (var i = 0; i < headP.length; i++) {
          if (String(headP[i]).trim() === name) return i + 1;
        }
        return 0;
      };

      var colVals = function (name) {
        var c = idx(name);
        if (!c) return null;
        return shP.getRange(2, c, lastRowP - 1, 1).getValues();
      };

      var out = { rows: lastRowP - 1, cols: lastColP, contractors: {}, money: {} };

      var corp = colVals(CONFIG.FLOOR_CORP);
      var corpSet = {};
      if (corp) corp.forEach(function (r) { var v = String(r[0]).trim(); if (v) corpSet[v] = (corpSet[v] || 0) + 1; });
      out.corps = corpSet;

      want.forEach(function (name) {
        var vals = colVals(name);
        if (!vals) { out.contractors[name] = 'нет колонки'; return; }
        var set = {}, filled = 0;
        vals.forEach(function (r) {
          var v = String(r[0]).trim();
          if (v) { filled++; set[v] = (set[v] || 0) + 1; }
        });
        out.contractors[name] = { filled: filled, uniq: Object.keys(set).length, values: set };
      });

      moneyCols.forEach(function (name) {
        var vals = colVals(name);
        if (!vals) { out.money[name] = 'нет колонки'; return; }
        var filled = 0, sum = 0;
        vals.forEach(function (r) {
          if (typeof r[0] === 'number' && r[0] !== 0) { filled++; sum += r[0]; }
        });
        out.money[name] = { filledNonZero: filled, sum: Math.round(sum) };
      });

      // Сколько работ витрины реально встречаются в поэтажке.
      var workCol = colVals(CONFIG.FLOOR_WORK);
      var floorWorks = {};
      if (workCol) workCol.forEach(function (r) {
        var v = String(r[0]).trim().toLowerCase();
        if (v) floorWorks[v] = true;
      });
      out.floorWorksUniq = Object.keys(floorWorks).length;

      var shownWorks = sheetToObjects_(ssP.getSheetByName(CONFIG.SHEET_WORKS))
        .filter(function (row) {
          if (String(row[CONFIG.WORK_KEY] || '').trim() === '') return false;
          return CONFIG.EXCLUDE_PLACES.indexOf(String(row[CONFIG.PLACE_KEY] || '').trim()) === -1;
        });
      var matched = 0;
      shownWorks.forEach(function (row) {
        if (floorWorks[String(row[CONFIG.WORK_KEY]).trim().toLowerCase()]) matched++;
      });
      out.shownWorks = shownWorks.length;
      out.shownWorksFoundInFloors = matched;

      // Есть ли «собственные силы» = строки без подрядчика, но с расценкой СС.
      var contr = colVals('Подрядчик сводный');
      var money = colVals('Стоимость работ итого для бюджета');
      var ss = colVals('Расценка СС работа');
      var cross = { noContr: 0, noContrWithMoney: 0, noContrWithSS: 0,
                    withContr: 0, withContrWithMoney: 0, withContrWithSS: 0,
                    noContrMoneySum: 0, withContrMoneySum: 0 };
      if (contr && money && ss) {
        for (var k = 0; k < contr.length; k++) {
          var hasC = String(contr[k][0]).trim() !== '';
          var m = typeof money[k][0] === 'number' ? money[k][0] : 0;
          var hasSS = typeof ss[k][0] === 'number' && ss[k][0] !== 0;
          if (hasC) {
            cross.withContr++;
            if (m) { cross.withContrWithMoney++; cross.withContrMoneySum += m; }
            if (hasSS) cross.withContrWithSS++;
          } else {
            cross.noContr++;
            if (m) { cross.noContrWithMoney++; cross.noContrMoneySum += m; }
            if (hasSS) cross.noContrWithSS++;
          }
        }
        cross.noContrMoneySum = Math.round(cross.noContrMoneySum);
        cross.withContrMoneySum = Math.round(cross.withContrMoneySum);
      }
      out.cross = cross;

      // 1) Какие подрядчики работают «собственными силами» (есть расценка СС),
      //    и бывает ли у одного подрядчика и СС, и не-СС.
      // 2) Уникальна ли «Расценка за работу на ед в бюджет» внутри тройки
      //    работа+подрядчик+корпус (иначе в ячейку нечего положить однозначно).
      var rate = colVals('Расценка за работу на ед в бюджет');
      var workC = colVals(CONFIG.FLOOR_WORK);
      var corpC = colVals(CONFIG.FLOOR_CORP);
      var byContr = {}, triples = {}, rateFilled = 0;
      if (contr && ss && rate && workC && corpC) {
        for (var q = 0; q < contr.length; q++) {
          var cName = String(contr[q][0]).trim();
          var isSS = typeof ss[q][0] === 'number' && ss[q][0] !== 0;
          var rv = typeof rate[q][0] === 'number' ? rate[q][0] : null;
          if (rv !== null && rv !== 0) rateFilled++;
          if (cName) {
            if (!byContr[cName]) byContr[cName] = { ss: 0, nonSS: 0 };
            if (isSS) byContr[cName].ss++; else byContr[cName].nonSS++;
          }
          if (rv === null || rv === 0) continue;
          var key = String(workC[q][0]).trim().toLowerCase() + '|' + cName + '|' + String(corpC[q][0]).trim();
          if (!triples[key]) triples[key] = {};
          triples[key][rv] = true;
        }
      }
      var tripleKeys = Object.keys(triples);
      var multi = 0;
      tripleKeys.forEach(function (k) { if (Object.keys(triples[k]).length > 1) multi++; });
      out.rate = {
        filledNonZero: rateFilled,
        triples: tripleKeys.length,
        triplesWithDifferentRates: multi
      };
      out.byContractorSS = byContr;

      return jsonOut_({ ok: true, probe: out });
    } catch (err) {
      return jsonOut_({ ok: false, error: 'probe_failed', message: String(err) });
    }
  }

  // Сводка «подрядчик × корпус» по работам. Считается по листу «Поэтажка_работы»
  // (~20 сек), поэтому кэшируется на 6 часов: агрегат ~21 КБ, в лимит CacheService
  // (100 КБ на ключ) укладывается с запасом.
  if (action === 'floors') {
    try {
      var cache = CacheService.getScriptCache();
      var cached = cache.get(CACHE_FLOORS);
      if (cached) {
        return ContentService.createTextOutput(cached)
          .setMimeType(ContentService.MimeType.JSON);
      }
      var ssF = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
      var payload = JSON.stringify({ ok: true, floors: buildFloorSummary_(ssF) });
      if (payload.length < 95000) cache.put(CACHE_FLOORS, payload, 21600);
      return ContentService.createTextOutput(payload)
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      return jsonOut_({ ok: false, error: 'floors_failed', message: String(err) });
    }
  }

  if (action === 'load') {
    try {
      var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
      // Из справочника «Материалы» витрине нужна ед. изм. материала (03.08.2026).
      // Лист маленький (273 строки), отдаём целиком.
      var materials = sheetToObjects_(ss.getSheetByName(CONFIG.SHEET_MATERIALS));
      // В листе «Работы» ~818 строк-призраков: реальных данных нет, заполнена только
      // ячейка «Плановый процент переделки» (формула растянута вниз по столбцу).
      // Работа без названия витрине не нужна — отсекаем, заодно ответ легчает втрое.
      var works = sheetToObjects_(ss.getSheetByName(CONFIG.SHEET_WORKS))
        .filter(function (row) {
          if (String(row[CONFIG.WORK_KEY] || '').trim() === '') return false;
          // Место «1 этаж» на витрине не показываем (190 работ из 321).
          var place = String(row[CONFIG.PLACE_KEY] || '').trim();
          return CONFIG.EXCLUDE_PLACES.indexOf(place) === -1;
        });
      var expenses = sheetToObjects_(ss.getSheetByName(CONFIG.SHEET_EXPENSES));
      // Сводка по подрядчикам здесь НЕ считается: чтение поэтажки добавляло ~20 сек
      // к загрузке витрины. Она отдаётся отдельно — action=floors, фронт грузит её фоном.
      return jsonOut_({ ok: true, works: works, expenses: expenses, materials: materials });
    } catch (err) {
      return jsonOut_({ ok: false, error: 'load_failed', message: String(err) });
    }
  }

  return jsonOut_({ ok: false, error: 'unknown_action' });
}

/**
 * Сводка «подрядчик × корпус» по каждой работе из листа «Поэтажка_работы».
 * Лист огромный (25 тыс. строк), поэтому читаем ТОЛЬКО 5 нужных колонок и сразу
 * сворачиваем в агрегат: работа -> [[подрядчик, корпус, расценка, признак СС], ...].
 * Проверено 03.08.2026: внутри тройки работа+подрядчик+корпус расценка всегда одна
 * (0 расхождений на 1073 тройки), поэтому в ячейку кладём её как есть, без усреднения.
 * Собственные силы — по строке: заполнена «Расценка СС работа» (у Смирнова есть и те,
 * и другие строки, поэтому признак нельзя вешать на подрядчика целиком).
 */
function buildFloorSummary_(ss) {
  var sh = ss.getSheetByName(CONFIG.SHEET_FLOORS);
  if (!sh) return {};
  var lastRow = sh.getLastRow();
  var lastCol = sh.getLastColumn();
  if (lastRow < 2) return {};

  var head = sh.getRange(1, 1, 1, lastCol).getValues()[0];
  var idx = {};
  head.forEach(function (h, i) { idx[String(h).trim()] = i + 1; });

  var need = [CONFIG.FLOOR_WORK, CONFIG.FLOOR_CORP, CONFIG.FLOOR_CONTRACTOR,
              CONFIG.FLOOR_RATE, CONFIG.FLOOR_SS];
  for (var i = 0; i < need.length; i++) {
    if (!idx[need[i]]) return {};   // колонку переименовали — сводку просто не строим
  }

  var n = lastRow - 1;
  var col = function (name) { return sh.getRange(2, idx[name], n, 1).getValues(); };
  var w = col(CONFIG.FLOOR_WORK);
  var c = col(CONFIG.FLOOR_CORP);
  var p = col(CONFIG.FLOOR_CONTRACTOR);
  var r = col(CONFIG.FLOOR_RATE);
  var s = col(CONFIG.FLOOR_SS);

  var map = {};
  for (var k = 0; k < n; k++) {
    var work = String(w[k][0]).trim().toLowerCase();
    if (!work) continue;
    var rate = typeof r[k][0] === 'number' ? r[k][0] : 0;
    if (!rate) continue;                       // нет расценки — нечего показывать
    var contr = String(p[k][0]).trim();
    if (!contr) continue;                      // подрядчик не указан — не строка сводной
    var corp = String(c[k][0]).trim();
    if (!corp) continue;
    var isSS = (typeof s[k][0] === 'number' && s[k][0] !== 0) ? 1 : 0;

    if (!map[work]) map[work] = {};
    var key = contr + '' + corp;
    if (!map[work][key]) map[work][key] = [contr, corp, rate, isSS];
    else if (isSS) map[work][key][3] = 1;
  }

  var out = {};
  Object.keys(map).forEach(function (work) {
    var byKey = map[work];
    out[work] = Object.keys(byKey).map(function (key) { return byKey[key]; });
  });
  return out;
}

function sheetToObjects_(sheet) {
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  var headers = data[0];
  var rows = data.slice(1);
  return rows
    .filter(function (r) {
      return r.some(function (c) { return c !== '' && c !== null; });
    })
    .map(function (r) {
      var obj = {};
      headers.forEach(function (h, i) {
        if (h) obj[h] = r[i];
      });
      return obj;
    });
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
