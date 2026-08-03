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
  // Детали по клику на подрядчика в сводной (03.08.2026): оба листа маленькие,
  // отдаются в load целиком.
  SHEET_CONTR_RATES: 'Расценки подрядчиков',   // 757×9
  SHEET_SS_RATES: 'Расценки СС',               // 98×6
  SHEET_SS_MAP: 'Справочник СС',               // 152×7, мэппинг Работа СС -> Работа для АР

  SHEET_FLOORS: 'Поэтажка_работы',
  FLOOR_WORK: 'Работа',
  FLOOR_CORP: 'Корпус',
  FLOOR_CONTRACTOR: 'Подрядчик сводный',              // выбор пользователя 03.08.2026
  FLOOR_RATE: 'Расценка за работу на ед в бюджет',    // что показываем в ячейках
  FLOOR_SS: 'Расценка СС работа',                     // заполнена -> собственные силы
  FLOOR_SS_NAME: 'Название работы СС',                // кол. J -> мэппинг на «Расценки СС»
  FLOOR_FLOOR: 'Этаж',                                // для вкладки «Объемы»
  FLOOR_VOL: 'Объем'
};

var CACHE_FLOORS = 'floors_v2';   // сводка подрядчик × корпус + ssNames (см. action=floors)
var CACHE_VOLS = 'vols_v1';       // объёмы по этажам (см. action=volumes), чанкованный

/** Сбросить кэш вручную из редактора GAS — например, после правок в «Поэтажка_работы». */
function clearCache() {
  var cache = CacheService.getScriptCache();
  cache.remove(CACHE_FLOORS);
  var keys = [CACHE_VOLS + '_n'];
  for (var i = 0; i < 10; i++) keys.push(CACHE_VOLS + '_' + i);
  cache.removeAll(keys);
}

// Ответ «Объемов» больше лимита CacheService (100 КБ/ключ), поэтому кэш — кусками.
function cachePutBig_(cache, key, str, ttl) {
  var SIZE = 90000;
  var n = Math.ceil(str.length / SIZE);
  if (n > 10) return;   // слишком большой — живём без кэша
  var obj = {};
  for (var i = 0; i < n; i++) obj[key + '_' + i] = str.substr(i * SIZE, SIZE);
  obj[key + '_n'] = String(n);
  cache.putAll(obj, ttl);
}

function cacheGetBig_(cache, key) {
  var meta = cache.get(key + '_n');
  if (!meta) return null;
  var n = parseInt(meta, 10);
  var names = [];
  for (var i = 0; i < n; i++) names.push(key + '_' + i);
  var got = cache.getAll(names);
  var parts = [];
  for (var j = 0; j < n; j++) {
    var p = got[key + '_' + j];
    if (!p) return null;   // кусок протух — пересчитываем целиком
    parts.push(p);
  }
  return parts.join('');
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
      var summary = buildFloorSummary_(ssF);
      var payload = JSON.stringify({ ok: true, floors: summary.floors, ssNames: summary.ssNames });
      if (payload.length < 95000) cache.put(CACHE_FLOORS, payload, 21600);
      return ContentService.createTextOutput(payload)
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      return jsonOut_({ ok: false, error: 'floors_failed', message: String(err) });
    }
  }

  // Объёмы по этажам для вкладки «Объемы». Тяжёлый расчёт (~20 сек по поэтажке),
  // кэш — кусками (ответ больше 100 КБ лимита CacheService).
  if (action === 'volumes') {
    try {
      var cacheV = CacheService.getScriptCache();
      var cachedV = cacheGetBig_(cacheV, CACHE_VOLS);
      if (cachedV) {
        return ContentService.createTextOutput(cachedV)
          .setMimeType(ContentService.MimeType.JSON);
      }
      var ssV = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
      var payloadV = JSON.stringify({ ok: true, vols: buildVolumes_(ssV) });
      cachePutBig_(cacheV, CACHE_VOLS, payloadV, 21600);
      return ContentService.createTextOutput(payloadV)
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      return jsonOut_({ ok: false, error: 'volumes_failed', message: String(err) });
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
      var contrRates = sheetToObjects_(ss.getSheetByName(CONFIG.SHEET_CONTR_RATES));
      var ssRates = sheetToObjects_(ss.getSheetByName(CONFIG.SHEET_SS_RATES));
      var ssMap = sheetToObjects_(ss.getSheetByName(CONFIG.SHEET_SS_MAP));
      return jsonOut_({
        ok: true, works: works, expenses: expenses, materials: materials,
        contrRates: contrRates, ssRates: ssRates, ssMap: ssMap
      });
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
  // Кол. J «Название работы СС» — мэппинг работы на «Расценки СС» (логика пользователя
  // 03.08.2026: в листе «Работы» эта колонка почти пустая, реальный источник — поэтажка).
  var ssNameCol = idx[CONFIG.FLOOR_SS_NAME] ? col(CONFIG.FLOOR_SS_NAME) : null;

  var map = {};
  var ssNames = {};   // работа -> { название СС: true }
  for (var k = 0; k < n; k++) {
    var work = String(w[k][0]).trim().toLowerCase();
    if (!work) continue;
    if (ssNameCol) {
      var sn = String(ssNameCol[k][0]).trim();
      if (sn) {
        if (!ssNames[work]) ssNames[work] = {};
        ssNames[work][sn] = true;
      }
    }
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
  var ssOut = {};
  Object.keys(ssNames).forEach(function (work) {
    ssOut[work] = Object.keys(ssNames[work]);
  });
  return { floors: out, ssNames: ssOut };
}

/**
 * Объёмы по этажам для вкладки «Объемы» (03.08.2026): из поэтажки читаются только
 * Работа / Корпус / Этаж / Объем и сворачиваются в
 * { работа(lowercase) : { корпус : [[этаж, объём], ...] } } (этажи по возрастанию,
 * объёмы просуммированы по этажу и округлены до 2 знаков).
 */
function buildVolumes_(ss) {
  var sh = ss.getSheetByName(CONFIG.SHEET_FLOORS);
  if (!sh) return {};
  var lastRow = sh.getLastRow();
  var lastCol = sh.getLastColumn();
  if (lastRow < 2) return {};

  var head = sh.getRange(1, 1, 1, lastCol).getValues()[0];
  var idx = {};
  head.forEach(function (h, i) { idx[String(h).trim()] = i + 1; });
  var need = [CONFIG.FLOOR_WORK, CONFIG.FLOOR_CORP, CONFIG.FLOOR_FLOOR, CONFIG.FLOOR_VOL];
  for (var i = 0; i < need.length; i++) {
    if (!idx[need[i]]) return {};
  }

  var n = lastRow - 1;
  var col = function (name) { return sh.getRange(2, idx[name], n, 1).getValues(); };
  var w = col(CONFIG.FLOOR_WORK);
  var c = col(CONFIG.FLOOR_CORP);
  var f = col(CONFIG.FLOOR_FLOOR);
  var v = col(CONFIG.FLOOR_VOL);

  var map = {};   // работа -> корпус -> этаж -> сумма объёма
  for (var k = 0; k < n; k++) {
    var work = String(w[k][0]).trim().toLowerCase();
    if (!work) continue;
    var corp = String(c[k][0]).trim();
    if (!corp) continue;
    var floor = f[k][0];
    if (floor === '' || floor === null) continue;
    var fl = typeof floor === 'number' ? floor : parseFloat(String(floor).replace(',', '.'));
    if (isNaN(fl)) continue;
    var vol = typeof v[k][0] === 'number' ? v[k][0] : 0;
    if (!map[work]) map[work] = {};
    if (!map[work][corp]) map[work][corp] = {};
    map[work][corp][fl] = (map[work][corp][fl] || 0) + vol;
  }

  var out = {};
  Object.keys(map).forEach(function (work) {
    out[work] = {};
    Object.keys(map[work]).forEach(function (corp) {
      var byFloor = map[work][corp];
      out[work][corp] = Object.keys(byFloor)
        .map(function (fl) { return [parseFloat(fl), Math.round(byFloor[fl] * 100) / 100]; })
        .sort(function (a, b) { return a[0] - b[0]; });
    });
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
