var CONFIG = {
  SPREADSHEET_ID: '1-Fd0eTinA8jiJ6UM5jazzj8vfW0wRceZPT7eKOSkutA',
  SHEET_WORKS: 'Работы',
  SHEET_MATERIALS: 'Материалы',
  SHEET_EXPENSES: 'Расходы'
};

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

  if (action === 'load') {
    try {
      var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
      var works = sheetToObjects_(ss.getSheetByName(CONFIG.SHEET_WORKS));
      var materials = sheetToObjects_(ss.getSheetByName(CONFIG.SHEET_MATERIALS));
      var expenses = sheetToObjects_(ss.getSheetByName(CONFIG.SHEET_EXPENSES));
      return jsonOut_({ ok: true, works: works, materials: materials, expenses: expenses });
    } catch (err) {
      return jsonOut_({ ok: false, error: 'load_failed', message: String(err) });
    }
  }

  return jsonOut_({ ok: false, error: 'unknown_action' });
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
