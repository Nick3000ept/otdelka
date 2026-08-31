# -*- coding: utf-8 -*-
r"""
Заливка почасовых начислений рабочим в лист «ТУЗИО_часы» таблицы «Отделка ИИ».

Источник — эксель «Часы 2026.xlsx» (папка «Контроль_договоров/Приложения»):
журнал начислений и выплат физлицам, по листу на месяц. В витрину отделки
попадают ТОЛЬКО строки, где:
  * документ — «Табель ежедневный» (в нём заполнена статья бюджета;
    во втором табеле — «СКУД» — статьи нет ни в одной строке, и он дублирует
    те же человеко-дни с другими часами, поэтому складывать их нельзя;
    решение пользователя 31.08.2026);
  * заполнена «Ставка» — значит зарплата начисляется за час работы (почасовщик).

Запуск (пароль витрины НЕ хранится в файле — передаётся аргументом):
  python tuzio_import.py --xlsx "..\..\Контроль_договоров\Приложения\Часы 2026.xlsx" ^
      --url "https://script.google.com/macros/s/.../exec" --t "пароль" [--dry]

--dry — только посчитать и показать итоги, ничего никуда не отправлять.
"""
import argparse
import json
import re
import sys
import urllib.request

HEADER = ['Месяц', 'Статья', 'Табель', 'День', 'ФИО', 'Часы', 'Сумма']
CHUNK = 5000

MONTHS = {'январь': 1, 'февраль': 2, 'март': 3, 'апрель': 4, 'май': 5, 'июнь': 6,
          'июль': 7, 'август': 8, 'сентябрь': 9, 'октябрь': 10, 'ноябрь': 11,
          'декабрь': 12}


def num(v):
    if isinstance(v, (int, float)):
        return float(v)
    if v is None:
        return 0.0
    try:
        return float(str(v).replace(' ', '').replace(',', '.'))
    except ValueError:
        return 0.0


def day_and_month(cell, fallback):
    """«День» приходит строкой «05.01.2026» или датой. Возвращает (день, «ГГГГ-ММ»)."""
    if hasattr(cell, 'year'):
        return cell.day, '%04d-%02d' % (cell.year, cell.month)
    m = re.match(r'\s*(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{4})', str(cell or ''))
    if m:
        return int(m.group(1)), '%s-%02d' % (m.group(3), int(m.group(2)))
    return 0, fallback


def sheet_month(title):
    """«Август 2026 часы» -> «2026-08» (запасной вариант, если дата в строке битая)."""
    t = title.lower()
    for name, n in MONTHS.items():
        if name in t:
            y = re.search(r'(20\d{2})', t)
            return '%s-%02d' % (y.group(1) if y else '2026', n)
    return ''


def collect(path):
    import openpyxl
    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    rows = []
    for ws in wb.worksheets:
        fallback = sheet_month(ws.title)
        head = None
        for r in ws.iter_rows(min_row=1, values_only=True):
            if head is None:
                head = [str(h or '').strip() for h in r]
                idx = {name: head.index(name) for name in
                       ('Объект строительства', 'Этап строительства', 'Физ лицо', 'День',
                        'Табель', 'Ставка', 'Часы табель', 'Сумма табель')
                       if name in head}
                missing = [n for n in ('Этап строительства', 'Физ лицо', 'День', 'Табель',
                                       'Ставка', 'Часы табель', 'Сумма табель')
                           if n not in idx]
                if missing:
                    sys.exit('Лист «%s»: нет колонок %s' % (ws.title, ', '.join(missing)))
                continue
            doc = str(r[idx['Табель']] or '')
            if not doc.startswith('Табель ежедневный'):
                continue
            if not r[idx['Ставка']]:
                continue
            fio = str(r[idx['Физ лицо']] or '').strip()
            if not fio:
                continue
            day, month = day_and_month(r[idx['День']], fallback)
            item = str(r[idx['Этап строительства']] or '').strip() or '(без статьи)'
            no = re.search(r'(\d{4,})', doc)
            no = no.group(1).lstrip('0') if no else ''
            rows.append([month, item, no, day, fio,
                         round(num(r[idx['Часы табель']]), 2),
                         round(num(r[idx['Сумма табель']]), 2)])
    return rows


def post(url, payload):
    req = urllib.request.Request(
        url, data=json.dumps(payload, ensure_ascii=False).encode('utf-8'),
        headers={'Content-Type': 'text/plain;charset=utf-8'})
    with urllib.request.urlopen(req, timeout=300) as resp:
        return json.loads(resp.read().decode('utf-8'))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--xlsx', required=True)
    ap.add_argument('--url')
    ap.add_argument('--t')
    ap.add_argument('--dry', action='store_true')
    a = ap.parse_args()

    rows = collect(a.xlsx)
    months = sorted({r[0] for r in rows})
    print('строк: %d   месяцев: %d (%s … %s)' % (len(rows), len(months),
                                                 months[0], months[-1]))
    print('статей: %d   людей: %d   табелей: %d'
          % (len({r[1] for r in rows}), len({r[4] for r in rows}),
             len({(r[0], r[2]) for r in rows})))
    print('часов: %s   сумма: %s руб.'
          % (format(round(sum(r[5] for r in rows)), ','),
             format(round(sum(r[6] for r in rows)), ',')))
    for m in months:
        s = sum(r[6] for r in rows if r[0] == m)
        print('   %s  %14s' % (m, format(round(s), ',')))
    if a.dry:
        return
    if not a.url or not a.t:
        sys.exit('Для заливки нужны --url и --t')

    res = post(a.url, {'t': a.t, 'action': 'importTuzio', 'mode': 'start',
                       'header': HEADER, 'total': len(rows)})
    if not res.get('ok'):
        sys.exit('start не прошёл: %s' % res)
    print('лист очищен, заголовок записан')
    sent = 0
    for i in range(0, len(rows), CHUNK):
        part = rows[i:i + CHUNK]
        res = post(a.url, {'t': a.t, 'action': 'importTuzio', 'mode': 'append',
                           'rows': part})
        if not res.get('ok'):
            sys.exit('порция %d не прошла: %s' % (i // CHUNK + 1, res))
        sent += res.get('rows', 0)
        print('  залито %d из %d (в листе %s)' % (sent, len(rows), res.get('total')))
    print('готово')


if __name__ == '__main__':
    main()
