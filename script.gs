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
  SHEET_CHECK_RATES: 'Проверки расценки',      // готовая проверка «нет расценок» (40×6)

  SHEET_FLOORS: 'Поэтажка_работы',
  FLOOR_WORK: 'Работа',
  FLOOR_CORP: 'Корпус',
  FLOOR_CONTRACTOR: 'Подрядчик сводный',              // выбор пользователя 03.08.2026
  FLOOR_RATE: 'Расценка за работу на ед в бюджет',    // что показываем в ячейках
  FLOOR_RATE_MAT: 'Стоимость материалов на ед в бюджет',  // режим «Материалы» (04.08.2026)
  FLOOR_SS: 'Расценка СС работа',                     // заполнена -> собственные силы
  FLOOR_SS_NAME: 'Название работы СС',                // кол. J -> мэппинг на «Расценки СС»
  FLOOR_FLOOR: 'Этаж',                                // для вкладки «Объемы»
  FLOOR_VOL: 'Объем',

  // Вкладка «Бюджет» (04.08.2026): свод по поэтажке статья -> стоимость.
  FLOOR_BUDGET_FLAG: 'Признак для бюджета основной',             // кол. L — статья бюджета
  FLOOR_BUDGET_COST: 'Стоимость материалы + работа для бюджета', // кол. AG — что суммируем
  FLOOR_COST_WORK: 'Стоимость работ итого для бюджета',          // кол. AE — работы отдельно (18.08.2026)
  FLOOR_FACT_PAID: 'К оплате',                                   // кол. AA — факт выполненных работ (21.08.2026)

  // Лист «Личные_кабинеты» (21.08.2026): МОЛ × статья бюджета -> выполнено итого.
  // Отдаётся вместе со сводом бюджета (колонка «Выполнено (ЛК)» на витрине).
  SHEET_LK: 'Личные_кабинеты',
  LK_MOL: 'МОЛ',
  LK_ITEM: 'Статья бюждет',       // опечатка «бюждет» — так в заголовке листа
  LK_DONE: 'Выполнено итого',

  // Лист «Форма КП» (24.08.2026): закрытие у заказчика по статьям бюджета.
  // Кол. N — статья, кол. F — сумма закрытия; свод — колонка «Закрытие у заказчика».
  SHEET_KP: 'Форма КП',
  KP_ITEM: 'Признак бюджет деньги основной',                    // кол. N
  KP_DONE: 'Выполнено с начала строительства стоимость руб.',   // кол. F

  // Лист «Паркинг» (24.08.2026): ведомость отделки паркинга (из экселя
  // «Доп работы по СБ3 от 25.05.2026»), статья «Паркинг» в своде бюджета.
  // Стоимость статьи — колонка «Договор» (решение пользователя 24.08.2026).
  SHEET_PARK: 'Паркинг',
  PARK_ITEM: 'Статья бюджета',
  PARK_SECTION: 'Раздел',              // уровень «группа работ» в бюджете
  PARK_GROUP: 'Группа работ',          // подраздел (Полы/Стены/Потолок…), 24.08
  PARK_WORK: 'Наименование работ',
  PARK_VOL: 'Объем',
  PARK_COST_SMR: 'Стоимость СМР',
  PARK_COST_ALL: 'Стоимость всего',
  PARK_DOG: 'Договор',
  FLOOR_REDO: 'Плановый процент переделки',                      // кол. Q — коэф. переделки
  FLOOR_GROUP: 'Группа работ',                                   // кол. F — группировка работ

  // Вкладка «Факт» (10.08.2026): отметки фактического выполнения работ.
  // Отметки пишутся ЖУРНАЛОМ в отдельный лист «Факт» этой же таблицы (строки только
  // добавляются, последняя отметка по ключу работа|корпус|этаж — актуальная).
  // В поэтажку НЕ пишем никогда — она собрана IMPORTRANGE, запись затрётся формулами.
  // Справочно показываем факт из поэтажки: «Процент готовности» (V) и «Объем к закрытию» (Z).
  SHEET_FACT: 'Факт',
  FLOOR_READY: 'Процент готовности',
  FLOOR_CLOSE: 'Объем к закрытию'
};

var CACHE_FLOORS = 'floors_v3';   // сводка подрядчик × корпус + ssNames (см. action=floors)
var CACHE_VOLS = 'vols_v1';       // объёмы по этажам (см. action=volumes), чанкованный
var CACHE_BUDGET = 'budget_v17';  // свод бюджета: статья -> работы -> подрядчик×корпус (+lk, kp, base, паркинг, СС Шамов); чанкованный
var CACHE_BFL = 'bfloors_v1';     // расшифровка ячеек бюджета по этажам; чанкованный
var CACHE_CHANGES = 'changes_v1'; // дифф поэтажки против базового расчёта; чанкованный
var CACHE_FACTREF = 'factref_v1'; // справочный факт из поэтажки (V, Z) по этажам; чанкованный

/** Сбросить кэш вручную из редактора GAS — например, после правок в «Поэтажка_работы». */
function clearCache() {
  var cache = CacheService.getScriptCache();
  cache.remove(CACHE_FLOORS);
  var keys = [CACHE_VOLS + '_n', CACHE_BUDGET + '_n', CACHE_BFL + '_n', CACHE_CHANGES + '_n',
              CACHE_FACTREF + '_n'];
  for (var i = 0; i < 10; i++) {
    keys.push(CACHE_VOLS + '_' + i);
    keys.push(CACHE_BUDGET + '_' + i);
    keys.push(CACHE_BFL + '_' + i);
    keys.push(CACHE_CHANGES + '_' + i);
    keys.push(CACHE_FACTREF + '_' + i);
  }
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

/**
 * Вопросы по работам (04.08.2026): хранятся в JSON-файле на Google Drive владельца
 * скрипта (выбор пользователя — таблицу не трогаем). ID файла — в Script Properties
 * (QUESTIONS_FILE_ID), файл создаётся при первом обращении.
 * ⚠️ Доступ к Диску — новый scope: после деплоя владелец должен ОДИН РАЗ запустить
 * setupQuestions() в редакторе GAS и принять права, иначе вопросы не работают.
 */
var QUESTIONS_FILE_NAME = 'otdelka_questions.json';

/** Запустить один раз из редактора GAS — авторизует Drive и создаёт файл вопросов. */
function setupQuestions() {
  var file = questionsFile_();
  Logger.log('Файл вопросов готов: ' + file.getId());
}

function questionsFile_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('QUESTIONS_FILE_ID');
  if (id) {
    try {
      return DriveApp.getFileById(id);
    } catch (e) { /* файл удалили — создаём заново */ }
  }
  var file = DriveApp.createFile(QUESTIONS_FILE_NAME, '[]', 'application/json');
  props.setProperty('QUESTIONS_FILE_ID', file.getId());
  return file;
}

function readQuestions_() {
  // Ошибки прав доступа пробрасываются наверх — фронт покажет понятное сообщение.
  var raw = questionsFile_().getBlob().getDataAsString();
  try {
    var list = JSON.parse(raw || '[]');
    return Array.isArray(list) ? list : [];
  } catch (e) {
    return [];   // битый JSON — не роняем сервис, начинаем с пустого списка
  }
}

function writeQuestions_(list) {
  questionsFile_().setContent(JSON.stringify(list));
}

/**
 * Базовый расчёт (05.08.2026): слепок поэтажки в разрезе работа|корпус|этаж ->
 * [стоимость AG, объём D, подрядчик, расц. работы AB, расц. материалов AC].
 * Разрез до этажа — чтобы видеть смену подрядчика и точечные изменения объёмов
 * и расценок (уточнение пользователя 05.08.2026). Если на этаже несколько
 * подрядчиков/расценок — значения детерминированно склеиваются через « + » и « / ».
 * Хранится JSON-файлом на Google Drive владельца (как вопросы), ID — в Script
 * Properties BASELINE_FILE_ID. Перезаписывается кнопкой на экране «Изменения».
 */
var BASELINE_FILE_NAME = 'otdelka_baseline.json';

function baselineFile_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('BASELINE_FILE_ID');
  if (id) {
    try {
      return DriveApp.getFileById(id);
    } catch (e) { /* файл удалили — создаём заново */ }
  }
  var file = DriveApp.createFile(BASELINE_FILE_NAME, '{}', 'application/json');
  props.setProperty('BASELINE_FILE_ID', file.getId());
  return file;
}

function readBaseline_() {
  try {
    var obj = JSON.parse(baselineFile_().getBlob().getDataAsString() || '{}');
    return (obj && obj.data) ? obj : null;
  } catch (e) {
    return null;
  }
}

/** Текущий агрегат поэтажки для базового расчёта и диффа (разрез работа|корпус|этаж). */
function buildBaseline_(ss) {
  var sh = ss.getSheetByName(CONFIG.SHEET_FLOORS);
  if (!sh) return {};
  var lastRow = sh.getLastRow();
  var lastCol = sh.getLastColumn();
  if (lastRow < 2) return {};

  var head = sh.getRange(1, 1, 1, lastCol).getValues()[0];
  var idx = {};
  head.forEach(function (h, i) { idx[String(h).trim()] = i + 1; });
  var need = [CONFIG.FLOOR_WORK, CONFIG.FLOOR_CORP, CONFIG.FLOOR_CONTRACTOR,
              CONFIG.FLOOR_FLOOR, CONFIG.FLOOR_VOL, CONFIG.FLOOR_RATE,
              CONFIG.FLOOR_RATE_MAT, CONFIG.FLOOR_BUDGET_COST];
  for (var i = 0; i < need.length; i++) {
    if (!idx[need[i]]) return {};
  }

  var n = lastRow - 1;
  var col = function (name) { return sh.getRange(2, idx[name], n, 1).getValues(); };
  var w = col(CONFIG.FLOOR_WORK);
  var c = col(CONFIG.FLOOR_CORP);
  var p = col(CONFIG.FLOOR_CONTRACTOR);
  var fl = col(CONFIG.FLOOR_FLOOR);
  var vv = col(CONFIG.FLOOR_VOL);
  var rw = col(CONFIG.FLOOR_RATE);
  var rm = col(CONFIG.FLOOR_RATE_MAT);
  var cost = col(CONFIG.FLOOR_BUDGET_COST);

  var acc = {};   // key -> { c: стоимость, v: объём, p/rw/rm: наборы значений }
  for (var k = 0; k < n; k++) {
    var costV = typeof cost[k][0] === 'number' ? cost[k][0] : 0;
    var volV = typeof vv[k][0] === 'number' ? vv[k][0] : 0;
    if (!costV && !volV) continue;
    var work = String(w[k][0]).trim();
    if (!work) continue;
    var key = work + '|' + String(c[k][0]).trim() + '|' + String(fl[k][0]).trim();
    if (!acc[key]) acc[key] = { c: 0, v: 0, p: {}, rw: {}, rm: {} };
    var a = acc[key];
    a.c += costV;
    a.v += volV;
    a.p[String(p[k][0]).trim() || '— без подрядчика —'] = 1;
    var rwV = typeof rw[k][0] === 'number' ? rw[k][0] : 0;
    var rmV = typeof rm[k][0] === 'number' ? rm[k][0] : 0;
    if (rwV) a.rw[rwV] = 1;
    if (rmV) a.rm[rmV] = 1;
  }

  var joinNums = function (set) {
    return Object.keys(set).map(Number).sort(function (x, y) { return x - y; }).join(' / ');
  };
  var map = {};
  Object.keys(acc).forEach(function (key) {
    var a = acc[key];
    map[key] = [
      Math.round(a.c),
      Math.round(a.v * 100) / 100,
      Object.keys(a.p).sort().join(' + '),
      joinNums(a.rw),
      joinNums(a.rm)
    ];
  });
  return map;
}

/**
 * Дифф текущего агрегата против базового: t='add' (новая строка), 'del' (пропала),
 * 'mod' (изменились значения; d = [[индексПоля, было, стало], ...], поля:
 * 0 стоимость, 1 объём, 2 подрядчик, 3 расц. работы, 4 расц. материалов).
 */
function diffBaseline_(base, cur) {
  var changes = [];
  Object.keys(cur).forEach(function (key) {
    if (!base[key]) {
      changes.push({ t: 'add', k: key, n: cur[key] });
      return;
    }
    var d = [];
    for (var i = 0; i < 5; i++) {
      var oldV = base[key][i];
      var newV = cur[key][i];
      var changed = (i < 2)
        ? Math.abs((oldV || 0) - (newV || 0)) > 0.005
        : String(oldV === undefined ? '' : oldV) !== String(newV === undefined ? '' : newV);
      if (changed) d.push([i, oldV === undefined ? '' : oldV, newV === undefined ? '' : newV]);
    }
    if (d.length) changes.push({ t: 'mod', k: key, d: d });
  });
  Object.keys(base).forEach(function (key) {
    if (!cur[key]) changes.push({ t: 'del', k: key, o: base[key] });
  });
  // Крупные изменения сверху: по модулю разницы стоимости (для add/del — по стоимости).
  var weight = function (ch) {
    if (ch.t === 'add') return ch.n[0] || 0;
    if (ch.t === 'del') return ch.o[0] || 0;
    for (var i = 0; i < ch.d.length; i++) {
      if (ch.d[i][0] === 0) return Math.abs((ch.d[i][2] || 0) - (ch.d[i][1] || 0));
    }
    return 0;
  };
  changes.sort(function (a, b) { return weight(b) - weight(a); });
  return changes;
}

/**
 * Единственный POST в проекте (04.08.2026). Тело — JSON в text/plain (обход
 * CORS-preflight, который GAS не обрабатывает): { t, action, ... }.
 * addQuestion { work, text, author } — новый вопрос со статусом «Открыт»;
 * setQuestionStatus { id, status, author } — «Открыт»/«Закрыт» + кто и когда сменил.
 * Чтение-изменение-запись файла — под LockService: два одновременных вопроса
 * не должны затереть друг друга.
 */
function doPost(e) {
  var body;
  try {
    body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return jsonOut_({ ok: false, error: 'bad_json' });
  }
  var stored = PropertiesService.getScriptProperties().getProperty('PASSWORD');
  if (!stored || body.t !== stored) {
    return jsonOut_({ ok: false, error: 'unauthorized' });
  }

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
  } catch (err) {
    return jsonOut_({ ok: false, error: 'busy' });
  }
  try {
    // Отметки факта (10.08.2026): пакет { author, marks: [{work, corp, floor, pct}, …] }
    // дописывается журналом в лист «Факт» — существующие строки не трогаем никогда.
    // Ветка ДО чтения файла вопросов: Диск для записи факта не нужен.
    if (body.action === 'saveFact') {
      var factAuthor = safeCell_(String(body.author || '').trim().slice(0, 100));
      var marksIn = body.marks;
      if (!factAuthor || !Array.isArray(marksIn) || !marksIn.length) {
        return jsonOut_({ ok: false, error: 'empty_fields' });
      }
      if (marksIn.length > 300) {
        return jsonOut_({ ok: false, error: 'too_many_marks' });
      }
      var now = new Date();
      var factRows = [];
      for (var mi = 0; mi < marksIn.length; mi++) {
        var m = marksIn[mi] || {};
        var mWork = safeCell_(String(m.work || '').trim().slice(0, 300));
        var mCorp = safeCell_(String(m.corp || '').trim().slice(0, 10));
        var mFloor = parseFloat(m.floor);
        var mPct = parseFloat(m.pct);
        if (!mWork || !mCorp || isNaN(mFloor) || isNaN(mPct)) continue;
        mPct = Math.max(0, Math.min(100, Math.round(mPct)));
        factRows.push([now, factAuthor, mWork, mCorp, mFloor, mPct]);
      }
      if (!factRows.length) return jsonOut_({ ok: false, error: 'no_valid_marks' });
      var ssFact = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
      var shFact = ensureFactSheet_(ssFact);
      shFact.getRange(shFact.getLastRow() + 1, 1, factRows.length, 6).setValues(factRows);
      return jsonOut_({ ok: true, saved: factRows.length });
    }

    // Заливка расчёта собственных сил Шамова (24.08.2026): пишет ТОЛЬКО в лист
    // «расчет_Шамов» (создаёт при отсутствии, содержимое перезаписывает целиком —
    // повторный вызов = обновление расчёта). Другие листы не трогает.
    // Тело: { t, action: 'importShamov', header: [...], rows: [[...], ...] }.
    if (body.action === 'importShamov') {
      var impHeader = body.header;
      var impRows = body.rows;
      if (!Array.isArray(impHeader) || !impHeader.length ||
          !Array.isArray(impRows) || !impRows.length) {
        return jsonOut_({ ok: false, error: 'empty_fields' });
      }
      if (impRows.length > 2000) return jsonOut_({ ok: false, error: 'too_many_rows' });
      var impWide = impHeader.length;
      var impData = [impHeader];
      for (var ri = 0; ri < impRows.length; ri++) {
        var impSrc = impRows[ri] || [];
        var impDst = [];
        for (var ci = 0; ci < impWide; ci++) {
          var iv = impSrc[ci];
          if (typeof iv === 'number') impDst.push(iv);
          else impDst.push(safeCell_(String(iv == null ? '' : iv).slice(0, 500)));
        }
        impData.push(impDst);
      }
      var ssImp = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
      var shImp = ssImp.getSheetByName('расчет_Шамов');
      if (!shImp) shImp = ssImp.insertSheet('расчет_Шамов');
      shImp.clearContents();
      // «Месяц» — текстовый формат, иначе Sheets превратит «2026-08» в дату.
      var impMonCol = impHeader.indexOf('Месяц') + 1;
      if (impMonCol > 0) {
        shImp.getRange(1, impMonCol, impData.length, 1).setNumberFormat('@');
      }
      shImp.getRange(1, 1, impData.length, impWide).setValues(impData);
      return jsonOut_({ ok: true, rows: impRows.length });
    }

    var list = readQuestions_();

    if (body.action === 'addQuestion') {
      var work = String(body.work || '').trim();
      var text = String(body.text || '').trim();
      var author = String(body.author || '').trim();
      if (!work || !text || !author) return jsonOut_({ ok: false, error: 'empty_fields' });
      var q = {
        id: new Date().getTime() + '-' + Math.floor(Math.random() * 100000),
        work: work.slice(0, 500),
        text: text.slice(0, 2000),
        author: author.slice(0, 100),
        created: new Date().toISOString(),
        status: 'Открыт'
      };
      list.push(q);
      writeQuestions_(list);
      return jsonOut_({ ok: true, question: q });
    }

    // Фиксация базового расчёта (05.08.2026): слепок текущей поэтажки -> файл на Диске.
    if (body.action === 'saveBaseline') {
      // С 18.08.2026 фиксация базы — только для администратора: общий пароль
      // витрины один на всех, а перезапись базы — действие владельца. Отдельный
      // пароль лежит в Script Properties (ключ ADMIN_PASSWORD, задаётся вручную
      // в редакторе GAS: Настройки проекта -> Свойства скрипта). Пока свойство
      // не задано — фиксация закрыта для всех (fail closed).
      var adminPass = PropertiesService.getScriptProperties().getProperty('ADMIN_PASSWORD');
      if (!adminPass) {
        return jsonOut_({ ok: false, error: 'admin_not_configured',
          message: 'пароль администратора ещё не настроен (свойство ADMIN_PASSWORD в GAS)' });
      }
      if (String(body.at || '') !== adminPass) {
        return jsonOut_({ ok: false, error: 'admin_only',
          message: 'фиксировать базовый расчёт может только администратор' });
      }
      var ssBl = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
      var obj = { date: new Date().toISOString(), data: buildBaseline_(ssBl) };
      baselineFile_().setContent(JSON.stringify(obj));
      var cacheBl = CacheService.getScriptCache();
      // Сбрасываем и кэш бюджета: колонка «Базовый бюджет» на «Бюджете»
      // считается из этого же слепка (25.08.2026).
      var keysBl = [CACHE_CHANGES + '_n', CACHE_BUDGET + '_n'];
      for (var q2 = 0; q2 < 10; q2++) {
        keysBl.push(CACHE_CHANGES + '_' + q2);
        keysBl.push(CACHE_BUDGET + '_' + q2);
      }
      cacheBl.removeAll(keysBl);
      return jsonOut_({ ok: true, date: obj.date });
    }

    if (body.action === 'setQuestionStatus') {
      var id = String(body.id || '');
      var status = body.status === 'Закрыт' ? 'Закрыт' : 'Открыт';
      for (var i = 0; i < list.length; i++) {
        if (list[i].id === id) {
          list[i].status = status;
          list[i].statusBy = String(body.author || '').trim().slice(0, 100);
          list[i].statusAt = new Date().toISOString();
          writeQuestions_(list);
          return jsonOut_({ ok: true, question: list[i] });
        }
      }
      return jsonOut_({ ok: false, error: 'not_found' });
    }

    return jsonOut_({ ok: false, error: 'unknown_action' });
  } catch (err) {
    return jsonOut_({ ok: false, error: 'post_failed', message: String(err) });
  } finally {
    lock.releaseLock();
  }
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

  // Сброс кэша без редактора GAS (14.08.2026): после правок в «Поэтажка_работы»
  // данные на витрине обновятся при следующей загрузке, а не через 6 часов.
  if (action === 'clearCache') {
    clearCache();
    return jsonOut_({ ok: true, cleared: true });
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

  // Вопросы по работам — весь список (файл маленький, кэш не нужен).
  if (action === 'questions') {
    try {
      return jsonOut_({ ok: true, questions: readQuestions_() });
    } catch (err) {
      return jsonOut_({ ok: false, error: 'questions_failed', message: String(err) });
    }
  }

  // Свод бюджета для вкладки «Бюджет» (04.08.2026): статья -> суммарная стоимость.
  // Считается по поэтажке (~20 сек на холодном кэше), ответ крошечный — кэш 6 часов.
  if (action === 'budget') {
    try {
      var cacheB = CacheService.getScriptCache();
      var cachedB = cacheGetBig_(cacheB, CACHE_BUDGET);
      if (cachedB) {
        return ContentService.createTextOutput(cachedB)
          .setMimeType(ContentService.MimeType.JSON);
      }
      var ssB = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
      var payloadB = JSON.stringify({ ok: true,
                                      budget: buildBudget_(ssB).concat(readPark_(ssB))
                                                               .concat(readShamov_(ssB)),
                                      lk: readLk_(ssB), kp: readKp_(ssB),
                                      base: readBaseSums_() });
      cachePutBig_(cacheB, CACHE_BUDGET, payloadB, 21600);
      return ContentService.createTextOutput(payloadB)
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      return jsonOut_({ ok: false, error: 'budget_failed', message: String(err) });
    }
  }

  // Проверка «Изменения» (05.08.2026): дифф текущей поэтажки против базового расчёта.
  // Тяжёлый расчёт, кэш 6 ч; кэш сбрасывается при фиксации новой базы (saveBaseline).
  if (action === 'changes') {
    try {
      var cacheC = CacheService.getScriptCache();
      var cachedC = cacheGetBig_(cacheC, CACHE_CHANGES);
      if (cachedC) {
        return ContentService.createTextOutput(cachedC)
          .setMimeType(ContentService.MimeType.JSON);
      }
      var bl = readBaseline_();
      if (!bl) {
        return jsonOut_({ ok: true, noBaseline: true });
      }
      var ssC = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
      var payloadC = JSON.stringify({
        ok: true, date: bl.date, changes: diffBaseline_(bl.data, buildBaseline_(ssC))
      });
      cachePutBig_(cacheC, CACHE_CHANGES, payloadC, 21600);
      return ContentService.createTextOutput(payloadC)
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      return jsonOut_({ ok: false, error: 'changes_failed', message: String(err) });
    }
  }

  // Расшифровка ячеек бюджета по этажам (05.08.2026): работа -> подрядчик|корпус ->
  // { r: [расц.раб, расц.мат], f: [[этаж, объём, стоимость], ...] }. Тяжёлый расчёт
  // по поэтажке, кэш чанкованный на 6 часов; фронт грузит при первом клике по ячейке.
  if (action === 'budgetFloors') {
    try {
      var cacheBF = CacheService.getScriptCache();
      var cachedBF = cacheGetBig_(cacheBF, CACHE_BFL);
      if (cachedBF) {
        return ContentService.createTextOutput(cachedBF)
          .setMimeType(ContentService.MimeType.JSON);
      }
      var ssBF = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
      var payloadBF = JSON.stringify({ ok: true, bfloors: buildBudgetFloors_(ssBF) });
      cachePutBig_(cacheBF, CACHE_BFL, payloadBF, 21600);
      return ContentService.createTextOutput(payloadBF)
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      return jsonOut_({ ok: false, error: 'bfloors_failed', message: String(err) });
    }
  }

  // Актуальные отметки факта из журнала «Факт» (10.08.2026). Без кэша — лист
  // небольшой, а после записи отметки должны приходить свежими.
  if (action === 'fact') {
    try {
      var ssFa = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
      return jsonOut_({ ok: true, marks: readFactMarks_(ssFa) });
    } catch (err) {
      return jsonOut_({ ok: false, error: 'fact_failed', message: String(err) });
    }
  }

  // Справочный факт из поэтажки (V «Процент готовности», Z «Объем к закрытию») —
  // тяжёлый расчёт по 25 тыс. строк, кэш чанкованный на 6 часов (10.08.2026).
  if (action === 'factRef') {
    try {
      var cacheFR = CacheService.getScriptCache();
      var cachedFR = cacheGetBig_(cacheFR, CACHE_FACTREF);
      if (cachedFR) {
        return ContentService.createTextOutput(cachedFR)
          .setMimeType(ContentService.MimeType.JSON);
      }
      var ssFR = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
      var payloadFR = JSON.stringify({ ok: true, ref: buildFactRef_(ssFR) });
      cachePutBig_(cacheFR, CACHE_FACTREF, payloadFR, 21600);
      return ContentService.createTextOutput(payloadFR)
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      return jsonOut_({ ok: false, error: 'factref_failed', message: String(err) });
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
      var checkRates = sheetToObjects_(ss.getSheetByName(CONFIG.SHEET_CHECK_RATES));
      return jsonOut_({
        ok: true, works: works, expenses: expenses, materials: materials,
        contrRates: contrRates, ssRates: ssRates, ssMap: ssMap, checkRates: checkRates
      });
    } catch (err) {
      return jsonOut_({ ok: false, error: 'load_failed', message: String(err) });
    }
  }

  return jsonOut_({ ok: false, error: 'unknown_action' });
}

/**
 * Сводка «подрядчик × корпус» по каждой работе из листа «Поэтажка_работы».
 * Лист огромный (25 тыс. строк), поэтому читаем ТОЛЬКО 6 нужных колонок и сразу
 * сворачиваем в агрегат:
 * работа -> [[подрядчик, корпус, расценка работы, признак СС, расценка материалов], ...].
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
  // Стоимость материалов на ед — для переключателя «Работа/Материалы» (04.08.2026).
  var rm = idx[CONFIG.FLOOR_RATE_MAT] ? col(CONFIG.FLOOR_RATE_MAT) : null;
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
    var mat = (rm && typeof rm[k][0] === 'number') ? rm[k][0] : 0;
    if (!rate && !mat) continue;               // ни работы, ни материалов — не строка сводной
    var contr = String(p[k][0]).trim();
    if (!contr) continue;                      // подрядчик не указан — не строка сводной
    var corp = String(c[k][0]).trim();
    if (!corp) continue;
    var isSS = (typeof s[k][0] === 'number' && s[k][0] !== 0) ? 1 : 0;

    if (!map[work]) map[work] = {};
    var key = contr + '' + corp;
    if (!map[work][key]) {
      map[work][key] = [contr, corp, rate, isSS, mat];
    } else {
      var entry = map[work][key];
      if (isSS) entry[3] = 1;
      if (!entry[2] && rate) entry[2] = rate;   // берём первое непустое значение
      if (!entry[4] && mat) entry[4] = mat;
    }
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

/**
 * Лист «Личные_кабинеты» (21.08.2026): МОЛ × статья бюджета -> выполнено итого.
 * Возвращает [[МОЛ, статья, выполнено], ...] — лист крошечный (~35 строк),
 * отдаётся вместе со сводом бюджета для колонки «Выполнено (ЛК)».
 * Нет листа или нужных колонок — пустой массив, витрина колонку не покажет.
 */
function readLk_(ss) {
  var sh = ss.getSheetByName(CONFIG.SHEET_LK);
  if (!sh) return [];
  var lastRow = sh.getLastRow();
  var lastCol = sh.getLastColumn();
  if (lastRow < 2) return [];
  var data = sh.getRange(1, 1, lastRow, lastCol).getValues();
  var idx = {};
  data[0].forEach(function (h, i) { idx[String(h).trim()] = i; });
  if (idx[CONFIG.LK_MOL] === undefined || idx[CONFIG.LK_ITEM] === undefined ||
      idx[CONFIG.LK_DONE] === undefined) return [];
  var out = [];
  for (var k = 1; k < data.length; k++) {
    var mol = String(data[k][idx[CONFIG.LK_MOL]]).trim();
    var item = String(data[k][idx[CONFIG.LK_ITEM]]).trim();
    var done = data[k][idx[CONFIG.LK_DONE]];
    if (!mol && !item) continue;
    out.push([mol, item, typeof done === 'number' ? Math.round(done) : 0]);
  }
  return out;
}

/**
 * Лист «Форма КП» (24.08.2026): закрытие у заказчика. Сворачиваем на сервере:
 * статья бюджета (кол. N «Признак бюджет деньги основной») -> сумма закрытия
 * (кол. F «Выполнено с начала строительства стоимость руб.»).
 * Возвращает [[статья, сумма], ...]; строки с пустой статьёй пропускаются.
 * Нет листа или нужных колонок — пустой массив, витрина колонку не покажет.
 */
function readKp_(ss) {
  var sh = ss.getSheetByName(CONFIG.SHEET_KP);
  if (!sh) return [];
  var lastRow = sh.getLastRow();
  var lastCol = sh.getLastColumn();
  if (lastRow < 2) return [];
  var head = sh.getRange(1, 1, 1, lastCol).getValues()[0];
  var idx = {};
  head.forEach(function (h, i) { idx[String(h).trim()] = i + 1; });
  if (!idx[CONFIG.KP_ITEM] || !idx[CONFIG.KP_DONE]) return [];
  var n = lastRow - 1;
  var item = sh.getRange(2, idx[CONFIG.KP_ITEM], n, 1).getValues();
  var done = sh.getRange(2, idx[CONFIG.KP_DONE], n, 1).getValues();
  var map = {};
  for (var k = 0; k < n; k++) {
    var name = String(item[k][0]).trim();
    if (!name) continue;
    var v = typeof done[k][0] === 'number' ? done[k][0] : 0;
    map[name] = (map[name] || 0) + v;
  }
  return Object.keys(map).map(function (name) {
    return [name, Math.round(map[name])];
  });
}

/**
 * Суммы зафиксированного базового расчёта для колонки «Базовый бюджет» на
 * «Бюджете» (25.08.2026): слепок базы (otdelka_baseline.json, разрез
 * работа|корпус|этаж) сворачивается в { date, works: [[работа, подрядчик,
 * сумма], ...] }. Подрядчик — как в слепке (несколько на этаже — склеены
 * « + »), фильтр по подрядчикам к нему применяет фронт. Статей в слепке нет —
 * по статьям бюджета суммы раскладывает фронт по названию работы.
 * База не зафиксирована — null, колонка на фронте не показывается.
 */
function readBaseSums_() {
  var bl = readBaseline_();
  if (!bl || !bl.data) return null;
  var acc = {};   // работа -> подрядчик -> сумма
  Object.keys(bl.data).forEach(function (key) {
    var row = bl.data[key];
    var cost = row && typeof row[0] === 'number' ? row[0] : 0;
    if (!cost) return;
    // Ключ = работа|корпус|этаж; отрезаем два хвостовых куска — название
    // работы с «|» внутри (маловероятно, но) не потеряется.
    var parts = key.split('|');
    var work = parts.slice(0, Math.max(1, parts.length - 2)).join('|');
    var contr = String(row[2] || '— без подрядчика —');
    if (!acc[work]) acc[work] = {};
    acc[work][contr] = (acc[work][contr] || 0) + cost;
  });
  var out = [];
  Object.keys(acc).forEach(function (work) {
    Object.keys(acc[work]).forEach(function (contr) {
      out.push([work, contr, Math.round(acc[work][contr])]);
    });
  });
  return { date: bl.date || '', works: out };
}

/** Число из ячейки листа «Паркинг»: число как есть, строку «1 234,56» — разобрать. */
function parkNum_(v) {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    var f = parseFloat(v.replace(/\s/g, '').replace(',', '.'));
    return isNaN(f) ? 0 : f;
  }
  return 0;
}

/**
 * Лист «Паркинг» (24.08.2026): ведомость отделки паркинга -> статьи для свода
 * бюджета в том же формате, что buildBudget_: [[статья, сумма, [[работа, сумма,
 * cells, группа], ...]], ...]. Сумма — колонка «Договор» (решение 24.08.2026);
 * «группа работ» в иерархии — колонка «Раздел». Подрядчиков и корпусов в
 * ведомости нет: одна ячейка на работу [— без подрядчика —, 'Паркинг', договор,
 * объём, 0, договорная часть работ (пропорция СМР/всего из ведомости), 0, 0, 0]
 * — так колонки «Работы/Материалы, руб» делят договор в пропорции ведомости,
 * а колонки факта остаются пустыми. Нет листа — пустой массив.
 */
function readPark_(ss) {
  var sh = ss.getSheetByName(CONFIG.SHEET_PARK);
  if (!sh) return [];
  var lastRow = sh.getLastRow();
  var lastCol = sh.getLastColumn();
  if (lastRow < 2) return [];
  var data = sh.getRange(1, 1, lastRow, lastCol).getValues();
  var idx = {};
  data[0].forEach(function (h, i) { idx[String(h).trim()] = i; });
  if (idx[CONFIG.PARK_WORK] === undefined || idx[CONFIG.PARK_DOG] === undefined) return [];

  var map = {};   // статья -> { total, works: { работа: {total, vol, w, grp} } }
  for (var k = 1; k < data.length; k++) {
    var row = data[k];
    var work = String(row[idx[CONFIG.PARK_WORK]]).trim();
    if (!work) continue;
    var item = idx[CONFIG.PARK_ITEM] !== undefined
      ? (String(row[idx[CONFIG.PARK_ITEM]]).trim() || 'Паркинг') : 'Паркинг';
    var dog = parkNum_(row[idx[CONFIG.PARK_DOG]]);
    var vol = idx[CONFIG.PARK_VOL] !== undefined ? parkNum_(row[idx[CONFIG.PARK_VOL]]) : 0;
    var smr = idx[CONFIG.PARK_COST_SMR] !== undefined ? parkNum_(row[idx[CONFIG.PARK_COST_SMR]]) : 0;
    var all = idx[CONFIG.PARK_COST_ALL] !== undefined ? parkNum_(row[idx[CONFIG.PARK_COST_ALL]]) : 0;
    var grp = idx[CONFIG.PARK_SECTION] !== undefined
      ? String(row[idx[CONFIG.PARK_SECTION]]).trim() : '';
    // Разбивка раздела на подразделы Полы/Стены/Потолок… (просьба 24.08.2026):
    // группа бюджета = «Раздел · Подраздел».
    var grp2 = idx[CONFIG.PARK_GROUP] !== undefined
      ? String(row[idx[CONFIG.PARK_GROUP]]).trim() : '';
    if (grp2) grp = grp + ' · ' + grp2;
    if (!map[item]) map[item] = { total: 0, works: {} };
    map[item].total += dog;
    var w = map[item].works;
    // Ключ — раздел+работа: одинаковые названия работ в разных разделах
    // не должны сливаться (иначе суммы разделов смещаются).
    var wKey = grp + '' + work;
    if (!w[wKey]) w[wKey] = { name: work, total: 0, vol: 0, w: 0, grp: grp };
    w[wKey].total += dog;
    w[wKey].vol += vol;
    if (all > 0) w[wKey].w += dog * (smr / all);   // договорная часть работ
  }
  return Object.keys(map).map(function (item) {
    var works = Object.keys(map[item].works)
      .map(function (wKey) {
        var w = map[item].works[wKey];
        var cell = ['— без подрядчика —', 'Паркинг', Math.round(w.total),
                    Math.round(w.vol * 100) / 100, 0, Math.round(w.w), 0, 0, 0];
        return [w.name, Math.round(w.total), [cell], w.grp || '— без группы —'];
      })
      .sort(function (a, b) { return b[1] - a[1]; });
    return [item, Math.round(map[item].total), works];
  }).sort(function (a, b) { return b[1] - a[1]; });
}

/**
 * Лист «расчет_Шамов» (24.08.2026): бюджет собственных сил -> отдельная статья
 * «Собственные силы (Шамов)» в своде бюджета (формат buildBudget_).
 * Иерархия: статья -> раздел листа (Отделка/Паркинг/Сдельщики/Тепловой
 * контур/Общестрой) как «группа работ» -> работа (суммы месяцев сложены).
 * Ячейки — по МОЛам (МОЛ выступает «подрядчиком», корпус 'СС'); у сдельщиков
 * МОЛа нет — «— без подрядчика —». Вся сумма кладётся в cell[5] («Работы, руб»)
 * — это трудозатраты, материалов в расчёте нет. Нет листа — пустой массив.
 */
/**
 * Основной вид работы СС (24.08.2026): от названия позиции отрезается перечень
 * корпусов («… К1,К4,Паркинг», «… Корпус 1,2,8») — по нему группируются работы
 * Шамова («Отделка · Уборка Мусора» и т.п.). «Бригадир/Бригадиры» склеиваются,
 * опечатка «выполненых» приводится к «выполненных».
 */
function shamovKind_(name) {
  var n = String(name).replace(/выполненых/g, 'выполненных');
  var m = n.search(/\s+(К\d|Корпус)/);
  if (m > 0) n = n.slice(0, m);
  n = n.replace(/[\s,.:;–-]+$/, '').replace(/\s+/g, ' ').trim();
  if (/^бригадир/i.test(n)) n = 'Бригадир';
  return n || String(name);
}

function readShamov_(ss) {
  var sh = ss.getSheetByName('расчет_Шамов');
  if (!sh) return [];
  var lastRow = sh.getLastRow();
  var lastCol = sh.getLastColumn();
  if (lastRow < 2) return [];
  var data = sh.getRange(1, 1, lastRow, lastCol).getValues();
  var idx = {};
  data[0].forEach(function (h, i) { idx[String(h).trim()] = i; });
  if (idx['Раздел'] === undefined || idx['Работа'] === undefined ||
      idx['Сумма, ₽'] === undefined) return [];

  var ITEM = 'Собственные силы (Шамов)';
  var total = 0;
  var works = {};   // раздел+работа -> { name, grp, total, cells: {МОЛ: {c, h}} }
  for (var k = 1; k < data.length; k++) {
    var row = data[k];
    var work = String(row[idx['Работа']]).trim();
    if (!work) continue;
    var grp = String(row[idx['Раздел']]).trim() || '— без группы —';
    // Иерархия (просьбы 24.08.2026): группа = раздел (верхний уровень как был),
    // строка работы = ВИД работы (без перечня корпусов), позиции с корпусами —
    // в раскрытии (ячейки). У сдельщиков вид = полное название.
    var kind = grp === 'Затраты на сдельщиков' ? work : shamovKind_(work);
    var mol = idx['МОЛ'] !== undefined ? String(row[idx['МОЛ']]).trim() : '';
    var sum = parkNum_(row[idx['Сумма, ₽']]);
    // Чел.-часы = количество x часов в месяц (для сводной по МОЛам, 24.08.2026).
    var ppl = idx['Количество, чел'] !== undefined ? parkNum_(row[idx['Количество, чел']]) : 0;
    var hrs = idx['Часов в месяц'] !== undefined ? parkNum_(row[idx['Часов в месяц']]) : 0;
    var mon = idx['Месяц'] !== undefined ? String(row[idx['Месяц']]).trim() : '';
    var wKey = grp + '|' + kind;
    if (!works[wKey]) works[wKey] = { name: kind, grp: grp, total: 0, cells: {} };
    works[wKey].total += sum;
    var molKey = mol || '— без подрядчика —';
    // Ячейка = позиция (полное название с корпусами) x МОЛ.
    var posKey = work + '|' + molKey;
    if (!works[wKey].cells[posKey]) {
      works[wKey].cells[posKey] = { mol: molKey, pos: work, c: 0, h: 0, ppl: 0, months: {} };
    }
    var cellSS = works[wKey].cells[posKey];
    cellSS.c += sum;
    cellSS.h += ppl * hrs;
    cellSS.ppl += ppl;
    if (mon) cellSS.months[mon] = true;   // число месяцев + среднее людей (24.08)
    total += sum;
  }
  var list = Object.keys(works)
    .map(function (wKey) {
      var w = works[wKey];
      var cells = Object.keys(w.cells).map(function (posKey) {
        var o = w.cells[posKey];
        var v = Math.round(o.c);
        // Позиции 9..13 — чел.-часы, средняя ставка ₽/час (стоимость/часы),
        // число месяцев, среднее людей в месяц (решение пользователя 24.08:
        // остаёмся на чел.-часах), полное название позиции с корпусами —
        // для спец-сводной работ СС на фронте; объём/коэф (3/4) не занимаем.
        var rate = o.h > 0 ? Math.round(o.c / o.h * 100) / 100 : 0;
        var nMon = Object.keys(o.months).length;
        var avgP = nMon > 0 ? Math.round(o.ppl / nMon * 10) / 10 : 0;
        return [o.mol, 'СС', v, 0, 0, v, 0, 0, 0, Math.round(o.h), rate, nMon, avgP, o.pos];
      });
      return [w.name, Math.round(w.total), cells, w.grp];
    })
    .sort(function (a, b) { return b[1] - a[1]; });
  if (!list.length) return [];
  return [[ITEM, Math.round(total), list]];
}

/**
 * Свод бюджета (04.08.2026): по листу «Поэтажка_работы» суммируем
 * «Стоимость материалы + работа для бюджета» (кол. AG) в разрезе
 * «Признак для бюджета основной» (кол. L — статья бюджета), внутри статьи —
 * разбивка по работам (кол. A), внутри работы — по подрядчикам и корпусам
 * (для сводной по клику на работу, просьба 05.08.2026).
 * Возвращает [[статья, сумма, [[работа, сумма,
 *   [[подрядчик, корпус, стоимость, объём, коэфПеределки, стоимостьРабот AE,
 *    факт «К оплате» AA, факт работы Z×AB, факт материалы Z×AC], ...],
 *   группаРабот], ...]], ...]
 * — всё по убыванию суммы; строки без статьи собираются в «— без статьи —»,
 * строки без подрядчика — в «— без подрядчика —».
 */
function buildBudget_(ss) {
  var sh = ss.getSheetByName(CONFIG.SHEET_FLOORS);
  if (!sh) return [];
  var lastRow = sh.getLastRow();
  var lastCol = sh.getLastColumn();
  if (lastRow < 2) return [];

  var head = sh.getRange(1, 1, 1, lastCol).getValues()[0];
  var idx = {};
  head.forEach(function (h, i) { idx[String(h).trim()] = i + 1; });
  if (!idx[CONFIG.FLOOR_BUDGET_FLAG] || !idx[CONFIG.FLOOR_BUDGET_COST] ||
      !idx[CONFIG.FLOOR_WORK] || !idx[CONFIG.FLOOR_CORP] ||
      !idx[CONFIG.FLOOR_CONTRACTOR]) return [];

  var n = lastRow - 1;
  var flag = sh.getRange(2, idx[CONFIG.FLOOR_BUDGET_FLAG], n, 1).getValues();
  var cost = sh.getRange(2, idx[CONFIG.FLOOR_BUDGET_COST], n, 1).getValues();
  var wrk = sh.getRange(2, idx[CONFIG.FLOOR_WORK], n, 1).getValues();
  var corp = sh.getRange(2, idx[CONFIG.FLOOR_CORP], n, 1).getValues();
  var contr = sh.getRange(2, idx[CONFIG.FLOOR_CONTRACTOR], n, 1).getValues();
  // Объём (кол. D) и коэффициент переделки (кол. Q) — для строки работы (05.08.2026).
  var vol = idx[CONFIG.FLOOR_VOL] ? sh.getRange(2, idx[CONFIG.FLOOR_VOL], n, 1).getValues() : null;
  var redo = idx[CONFIG.FLOOR_REDO] ? sh.getRange(2, idx[CONFIG.FLOOR_REDO], n, 1).getValues() : null;
  // Группа работ (кол. F) — группировка работ внутри статьи (просьба 05.08.2026).
  var grp = idx[CONFIG.FLOOR_GROUP] ? sh.getRange(2, idx[CONFIG.FLOOR_GROUP], n, 1).getValues() : null;
  // Стоимость работ отдельно (кол. AE, 18.08.2026) — чтобы сводная делила итог
  // на работы и материалы (материалы фронт считает как AG − AE).
  var cw = idx[CONFIG.FLOOR_COST_WORK] ? sh.getRange(2, idx[CONFIG.FLOOR_COST_WORK], n, 1).getValues() : null;
  // Факт выполненных работ «К оплате» (кол. AA, 21.08.2026) — колонка «Факт, руб».
  var fp = idx[CONFIG.FLOOR_FACT_PAID] ? sh.getRange(2, idx[CONFIG.FLOOR_FACT_PAID], n, 1).getValues() : null;
  // Разбивка факта на работы и материалы (21.08.2026): «Объем к закрытию» (кол. Z)
  // × расценка за работу (кол. AB) и × расценка материалов (кол. AC).
  var zc = idx[CONFIG.FLOOR_CLOSE] ? sh.getRange(2, idx[CONFIG.FLOOR_CLOSE], n, 1).getValues() : null;
  var rb = idx[CONFIG.FLOOR_RATE] ? sh.getRange(2, idx[CONFIG.FLOOR_RATE], n, 1).getValues() : null;
  var rm = idx[CONFIG.FLOOR_RATE_MAT] ? sh.getRange(2, idx[CONFIG.FLOOR_RATE_MAT], n, 1).getValues() : null;

  var map = {};
  for (var k = 0; k < n; k++) {
    var v = typeof cost[k][0] === 'number' ? cost[k][0] : 0;
    if (!v) continue;
    var item = String(flag[k][0]).trim() || '— без статьи —';
    var work = String(wrk[k][0]).trim() || '— без работы —';
    var c = String(corp[k][0]).trim();
    var p = String(contr[k][0]).trim() || '— без подрядчика —';
    var vv = (vol && typeof vol[k][0] === 'number') ? vol[k][0] : 0;
    var rr = (redo && typeof redo[k][0] === 'number') ? redo[k][0] : 0;
    if (!map[item]) map[item] = { total: 0, works: {} };
    map[item].total += v;
    var w = map[item].works;
    if (!w[work]) w[work] = { total: 0, cells: {}, grp: '' };
    w[work].total += v;
    if (!w[work].grp && grp) {
      var gName = String(grp[k][0]).trim();
      if (gName) w[work].grp = gName;
    }
    var cellKey = p + '' + c;
    if (!w[work].cells[cellKey]) w[work].cells[cellKey] = { c: 0, v: 0, r: 0, w: 0, f: 0, fw: 0, fm: 0 };
    var cellObj = w[work].cells[cellKey];
    cellObj.c += v;                       // стоимость (кол. AG)
    cellObj.v += vv;                      // объём (кол. D)
    if (!cellObj.r && rr) cellObj.r = rr; // коэф. переделки — первое непустое
    if (cw && typeof cw[k][0] === 'number') cellObj.w += cw[k][0]; // работы (кол. AE)
    if (fp && typeof fp[k][0] === 'number') cellObj.f += fp[k][0]; // факт «К оплате» (кол. AA)
    var z = (zc && typeof zc[k][0] === 'number') ? zc[k][0] : 0;   // объём к закрытию (кол. Z)
    if (z) {
      if (rb && typeof rb[k][0] === 'number') cellObj.fw += z * rb[k][0]; // факт работы (Z × AB)
      if (rm && typeof rm[k][0] === 'number') cellObj.fm += z * rm[k][0]; // факт материалы (Z × AC)
    }
  }
  return Object.keys(map)
    .map(function (item) {
      var works = Object.keys(map[item].works)
        .map(function (wName) {
          var w = map[item].works[wName];
          var cells = Object.keys(w.cells).map(function (key) {
            var parts = key.split('');
            var cell = w.cells[key];
            return [parts[0], parts[1], Math.round(cell.c),
                    Math.round(cell.v * 100) / 100, cell.r, Math.round(cell.w),
                    Math.round(cell.f || 0), Math.round(cell.fw || 0),
                    Math.round(cell.fm || 0)];
          });
          return [wName, Math.round(w.total), cells, w.grp || '— без группы —'];
        })
        .sort(function (a, b) { return b[1] - a[1]; });
      return [item, Math.round(map[item].total), works];
    })
    .sort(function (a, b) { return b[1] - a[1]; });
}

/**
 * Расшифровка ячеек бюджета по этажам (05.08.2026): из поэтажки собираем
 * { работа(lowercase): { 'подрядчик|корпус': { r: [расц. работы AB, расц. материалов AC],
 *   f: [[этаж, объём D, стоимость AG], ...] } } }.
 * Берём только строки с деньгами (как в buildBudget_), объёмы и стоимость суммируются
 * по этажу, этажи по возрастанию. Расценки внутри тройки работа+подрядчик+корпус
 * уникальны (проверено 03.08.2026), поэтому хранятся один раз на группу.
 */
function buildBudgetFloors_(ss) {
  var sh = ss.getSheetByName(CONFIG.SHEET_FLOORS);
  if (!sh) return {};
  var lastRow = sh.getLastRow();
  var lastCol = sh.getLastColumn();
  if (lastRow < 2) return {};

  var head = sh.getRange(1, 1, 1, lastCol).getValues()[0];
  var idx = {};
  head.forEach(function (h, i) { idx[String(h).trim()] = i + 1; });
  var need = [CONFIG.FLOOR_WORK, CONFIG.FLOOR_CORP, CONFIG.FLOOR_CONTRACTOR,
              CONFIG.FLOOR_FLOOR, CONFIG.FLOOR_VOL, CONFIG.FLOOR_RATE,
              CONFIG.FLOOR_RATE_MAT, CONFIG.FLOOR_BUDGET_COST];
  for (var i = 0; i < need.length; i++) {
    if (!idx[need[i]]) return {};
  }

  var n = lastRow - 1;
  var col = function (name) { return sh.getRange(2, idx[name], n, 1).getValues(); };
  var w = col(CONFIG.FLOOR_WORK);
  var c = col(CONFIG.FLOOR_CORP);
  var p = col(CONFIG.FLOOR_CONTRACTOR);
  var fl = col(CONFIG.FLOOR_FLOOR);
  var vv = col(CONFIG.FLOOR_VOL);
  var rw = col(CONFIG.FLOOR_RATE);
  var rm = col(CONFIG.FLOOR_RATE_MAT);
  var cost = col(CONFIG.FLOOR_BUDGET_COST);

  var map = {};
  for (var k = 0; k < n; k++) {
    var v = typeof cost[k][0] === 'number' ? cost[k][0] : 0;
    if (!v) continue;
    var work = String(w[k][0]).trim().toLowerCase();
    if (!work) continue;
    var corp = String(c[k][0]).trim();
    var contr = String(p[k][0]).trim() || '— без подрядчика —';
    var key = contr + '|' + corp;
    var floor = fl[k][0];
    var flNum = typeof floor === 'number'
      ? floor : parseFloat(String(floor).replace(',', '.'));
    if (isNaN(flNum)) flNum = String(floor).trim();
    var vol = typeof vv[k][0] === 'number' ? vv[k][0] : 0;

    if (!map[work]) map[work] = {};
    if (!map[work][key]) {
      map[work][key] = {
        r: [typeof rw[k][0] === 'number' ? rw[k][0] : 0,
            typeof rm[k][0] === 'number' ? rm[k][0] : 0],
        fl: {}
      };
    }
    var g = map[work][key];
    if (!g.fl[flNum]) g.fl[flNum] = [flNum, 0, 0];
    g.fl[flNum][1] += vol;
    g.fl[flNum][2] += v;
  }

  // Словарь этажей -> отсортированный массив, объёмы/стоимость округляем.
  Object.keys(map).forEach(function (work) {
    Object.keys(map[work]).forEach(function (key) {
      var g = map[work][key];
      g.f = Object.keys(g.fl).map(function (fk) {
        var row = g.fl[fk];
        return [row[0], Math.round(row[1] * 100) / 100, Math.round(row[2])];
      }).sort(function (a, b) {
        var an = typeof a[0] === 'number' ? a[0] : 9999;
        var bn = typeof b[0] === 'number' ? b[0] : 9999;
        return an - bn;
      });
      delete g.fl;
    });
  });
  return map;
}

/**
 * Вкладка «Факт» (10.08.2026): защита пользовательского ввода перед записью в Sheets —
 * значения, начинающиеся с =, +, -, @, экранируются апострофом (formula injection),
 * длина ограничена (паттерн из шахматки СБ3).
 */
function safeCell_(v) {
  if (typeof v !== 'string') return v;
  var s = v.slice(0, 1000);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

/** Лист «Факт» (журнал отметок): найти или создать с заголовками. */
function ensureFactSheet_(ss) {
  var sh = ss.getSheetByName(CONFIG.SHEET_FACT);
  if (sh) return sh;
  sh = ss.insertSheet(CONFIG.SHEET_FACT);
  sh.getRange(1, 1, 1, 6).setValues([['Дата', 'Кто', 'Работа', 'Корпус', 'Этаж', 'Процент']]);
  sh.setFrozenRows(1);
  return sh;
}

/**
 * Актуальные отметки факта из журнала «Факт»: строки читаются по порядку, последняя
 * отметка по ключу работа|корпус|этаж побеждает. Ключ — как во vols: работа lowercase,
 * этаж нормализован через parseFloat. Возвращает { ключ: [процент, кто, когдаISO] }.
 */
function readFactMarks_(ss) {
  var sh = ss.getSheetByName(CONFIG.SHEET_FACT);
  if (!sh) return {};
  var lastRow = sh.getLastRow();
  if (lastRow < 2) return {};
  var data = sh.getRange(2, 1, lastRow - 1, 6).getValues();
  var marks = {};
  for (var i = 0; i < data.length; i++) {
    var work = String(data[i][2]).trim().toLowerCase();
    var corp = String(data[i][3]).trim();
    var fl = parseFloat(String(data[i][4]).replace(',', '.'));
    var pct = data[i][5];
    if (!work || !corp || isNaN(fl) || typeof pct !== 'number') continue;
    var when = data[i][0] instanceof Date ? data[i][0].toISOString() : String(data[i][0]);
    marks[work + '|' + corp + '|' + fl] = [pct, String(data[i][1]).trim(), when];
  }
  return marks;
}

/**
 * Справочный факт из поэтажки для вкладки «Факт» (10.08.2026): «Процент готовности»
 * (кол. V) и «Объем к закрытию» (кол. Z) в разрезе работа|корпус|этаж.
 * Процент по этажу — средневзвешенный по объёму (кол. D); проценты в Sheets могут
 * лежать долями (0.5 = 50%) — если максимум по колонке <= 1.01, умножаем всё на 100.
 * Возвращает { работа(lowercase): { корпус: [[этаж, готовность %, объём к закрытию], …] } }.
 */
function buildFactRef_(ss) {
  var sh = ss.getSheetByName(CONFIG.SHEET_FLOORS);
  if (!sh) return {};
  var lastRow = sh.getLastRow();
  var lastCol = sh.getLastColumn();
  if (lastRow < 2) return {};

  var head = sh.getRange(1, 1, 1, lastCol).getValues()[0];
  var idx = {};
  head.forEach(function (h, i) { idx[String(h).trim()] = i + 1; });
  var need = [CONFIG.FLOOR_WORK, CONFIG.FLOOR_CORP, CONFIG.FLOOR_FLOOR, CONFIG.FLOOR_VOL,
              CONFIG.FLOOR_READY, CONFIG.FLOOR_CLOSE];
  for (var i = 0; i < need.length; i++) {
    if (!idx[need[i]]) return {};
  }

  var n = lastRow - 1;
  var col = function (name) { return sh.getRange(2, idx[name], n, 1).getValues(); };
  var w = col(CONFIG.FLOOR_WORK);
  var c = col(CONFIG.FLOOR_CORP);
  var f = col(CONFIG.FLOOR_FLOOR);
  var v = col(CONFIG.FLOOR_VOL);
  var ready = col(CONFIG.FLOOR_READY);
  var close = col(CONFIG.FLOOR_CLOSE);

  var maxReady = 0;
  var map = {};   // работа -> корпус -> этаж -> { num, den, cnt, sum, close }
  for (var k = 0; k < n; k++) {
    var readyV = typeof ready[k][0] === 'number' ? ready[k][0] : 0;
    var closeV = typeof close[k][0] === 'number' ? close[k][0] : 0;
    if (!readyV && !closeV) continue;
    var work = String(w[k][0]).trim().toLowerCase();
    if (!work) continue;
    var corp = String(c[k][0]).trim();
    if (!corp) continue;
    var fl = typeof f[k][0] === 'number' ? f[k][0] : parseFloat(String(f[k][0]).replace(',', '.'));
    if (isNaN(fl)) continue;
    if (readyV > maxReady) maxReady = readyV;
    var vol = typeof v[k][0] === 'number' ? v[k][0] : 0;
    if (!map[work]) map[work] = {};
    if (!map[work][corp]) map[work][corp] = {};
    if (!map[work][corp][fl]) map[work][corp][fl] = { num: 0, den: 0, cnt: 0, sum: 0, close: 0 };
    var a = map[work][corp][fl];
    a.num += vol * readyV;
    a.den += vol;
    a.sum += readyV;
    a.cnt++;
    a.close += closeV;
  }

  var scale = maxReady > 0 && maxReady <= 1.01 ? 100 : 1;   // доли -> проценты
  var out = {};
  Object.keys(map).forEach(function (work) {
    out[work] = {};
    Object.keys(map[work]).forEach(function (corp) {
      var byFloor = map[work][corp];
      out[work][corp] = Object.keys(byFloor)
        .map(function (fl) {
          var a = byFloor[fl];
          var pct = a.den > 0 ? a.num / a.den : (a.cnt ? a.sum / a.cnt : 0);
          return [parseFloat(fl),
                  Math.round(pct * scale * 10) / 10,
                  Math.round(a.close * 100) / 100];
        })
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
