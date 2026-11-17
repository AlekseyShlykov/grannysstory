"""Reproducible document-level coverage, gaps and preservation audit for all 18 cities."""
import argparse
import datetime as dt
import hashlib
import json
from pathlib import Path
import sys

from checkpoint import ROOT, PROGRESS, atomic_write
sys.path.insert(0, str(ROOT / 'scripts/historical-data/lib'))
from dataset import Dataset, event_span
from primary_evidence import COUNTRIES, PERIODS, share


def eras(records):
    return [f'{first}–{last}' for first, last in PERIODS
            if any(event_span(record)[0].year <= last and event_span(record)[1].year >= first for record in records)]


def preserved_files():
    baseline = json.loads((PROGRESS / 'BASELINE.json').read_text())
    changed = []
    for path, checksum in baseline['files'].items():
        # Generated merged registries and SQLite are expected to change. Authored existing records are not.
        authored = path.startswith(('data/historical/', 'data/contexts/'))
        # Historical JSON and the existing milestone corpus are records; the schema is implementation code.
        authored |= path.startswith('content/historical/') and path.endswith('.json')
        authored |= path == 'content/historical/milestones.ts'
        authored |= path.startswith('data/sources/') and not path.endswith('/source_registry.json')
        authored |= path.startswith('data/locations/') and Path(path).name not in {'locations.json', 'historical_names.json', 'historical_boundaries.json'}
        if authored and (not (ROOT / path).exists() or hashlib.sha256((ROOT / path).read_bytes()).hexdigest() != checksum):
            changed.append(path)
    return changed


def build_report():
    data = Dataset.load()
    tasks = json.loads((PROGRESS / 'tasks.json').read_text())
    manifest_path = ROOT / 'public/data/world/manifest.json'
    manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else {}
    rows = [event for event in data.events if set(event.get('country_codes', [])) & COUNTRIES
            and event.get('verification_status') == 'verified']
    contexts = [row for row in data.contexts if row.get('country_code') in COUNTRIES and row.get('verification_status') == 'verified']
    country_reports = {}
    city_reports = {}
    period_labels = [f'{first}–{last}' for first, last in PERIODS]
    for code, cities in tasks['countries'].items():
        own_country = [row for row in rows if code in row['country_codes']]
        blocked = [dict(id=sid, url=source['url'], note=source.get('notes')) for sid, source in data.sources.items()
                   if source.get('country') == code and source.get('status') == 'inaccessible']
        country_reports[code] = {**share(own_country, data.sources), 'includedInThisCheckout': code.lower() in data.locations,
            'periods': eras(own_country),
            'missingPeriods': [label for label in period_labels if label not in eras(own_country)],
            'nationalEvents': sum(row['geographic_scope'] == 'national' for row in own_country),
            'regionalEvents': sum(row['geographic_scope'] in {'regional', 'district'} for row in own_country),
            'contexts': sum(row['country_code'] == code for row in contexts), 'inaccessibleArchives': blocked}
        for slug in cities:
            city = code.lower() + '-' + slug
            own = [row for row in own_country if row['geographic_scope'] in {'municipal', 'local'} and city in row['location_ids']]
            # Inherited regional records are relevant background, never city archival records.
            inherited = []
            for row in own_country:
                if row['geographic_scope'] not in {'regional', 'district'}:
                    continue
                if set(row['location_ids']) & set(data.ancestors_at(city, event_span(row)[0])):
                    inherited.append(row)
            local_contexts = [row for row in contexts if row['location_id'] == city]
            country_contexts = [row for row in contexts if row['country_code'] == code and row['location_id'] == code.lower()]
            periods = eras(own)
            used_ids = sorted({sid for row in own + local_contexts for sid in row.get('source_ids',[])})
            supported = manifest.get('coverage', {}).get(city, {}).get('readiness') == 'supported'
            remaining = (['Человеческая редактура чувствительных реплик по D-019 остаётся открытой.'] if supported else
                ['Историческая география, недостающие эпохи и местные документы.',
                 'Повседневные контексты, авторские тексты и полные сравнительные биографии.'])
            if supported and any(label not in periods for label in period_labels):
                remaining.append('Необязательное пополнение местных событий: '+', '.join(label for label in period_labels if label not in periods)+'.')
            published = next((task['state']=='completed' for task in tasks['tasks'] if task['id']==code.lower()+'.publish'),False)
            if not published:
                remaining.append('Публикация страны на GitHub.')
            city_reports[city] = {'country': code, **share(own, data.sources), 'regionalEvents': len(inherited),
                'localContexts': len(local_contexts), 'nationalContexts': len(country_contexts),
                'periods': periods, 'missingPeriods': [label for label in period_labels if label not in periods],
                'contextPeriods': [f'{a}–{b}' for a,b in PERIODS if any(row['period_start'] <= b and row['period_end'] >= a for row in local_contexts)],
                'localEverydayTypes': sorted({row['context_type'] for row in local_contexts}),
                'readiness': manifest.get('coverage', {}).get(city, {}).get('readiness', 'registered'),
                'registeredInThisCheckout': city in data.locations,
                'geographyReview': data.locations.get(city, {}).get('geography_review', 'not_in_release'),
                'sourceIds': used_ids,
                'licensing': [{'sourceId':sid, 'url':data.sources[sid]['url'],
                               'conditions':data.sources[sid].get('license'),
                               'access':data.sources[sid].get('access_restrictions',[])} for sid in used_ids],
                'inaccessibleCountryLeads': blocked,
                'integration': ('enabled' if supported else 'research_only') if city in data.locations else 'not_in_release',
                'tests': 'See research_progress/validation.json for executed checks; no manual gameplay approval implied',
                'remaining': remaining}
    result = {'schema': 1, 'method': 'unique verified events; direct reviewed primary documents only; no inherited city duplicates',
              'combined': share(rows, data.sources), 'countries': country_reports, 'cities': city_reports,
              'changedExistingAuthoredFiles': preserved_files()}
    atomic_write(ROOT / 'docs/EXPANSION_COVERAGE.json', result)
    lines = ['# Расширение шести стран: фактическое покрытие', '',
        'Числа относятся к файлам этой копии репозитория. Невключённые страны обозначены not_in_release; их местные черновики не опубликованы. '
        'Готовность каждого города указана отдельно; наличие города в реестре не означает его готовность к игре. '
        '55% считаются по уникальным проверенным событиям с прямыми прочитанными первичными документами. '
        'Современный официальный пересказ не входит в числитель. Нулевой знаменатель обозначается н/д.', '',
        '## Страны', '', '| Страна | События | Первичные | Доля | Национальные | Региональные | Контексты |',
        '|---|---:|---:|---:|---:|---:|---:|']
    def percentage(item):
        return 'н/д' if item['percentage'] is None else str(item['percentage']) + '%'
    for code,item in country_reports.items():
        lines.append(f"| {code} | {item['verified']} | {item['primary']} | {percentage(item)} | {item['nationalEvents']} | {item['regionalEvents']} | {item['contexts']} |")
    total = result['combined']
    lines += ['', f"Совместно: {total['verified']} событий, {total['primary']} с первичными документами, {percentage(total)}.", '',
        '## Города', '', '| Город | Местные | Первичные | Доля | Региональные в цепочке | Местные контексты | Эпохи местных событий | Готовность |',
        '|---|---:|---:|---:|---:|---:|---|---|']
    for city,item in city_reports.items():
        lines.append(f"| {city} | {item['verified']} | {item['primary']} | {percentage(item)} | {item['regionalEvents']} | {item['localContexts']} | {', '.join(item['periods']) or '—'} | {item['readiness']} |")
    lines += ['', '## Пробелы и ограничения по городам', '']
    for city,item in city_reports.items():
        lines += [f'### {city}', '',
            f"Не представлены местными событиями: {', '.join(item['missingPeriods']) or 'нет'}. "
            f"Историческая география: {item['geographyReview']}. Интеграция: {item['integration']}.", '',
            'Источники местных записей: ' + ', '.join(f"[{sid}]({data.sources[sid]['url']})" for sid in item['sourceIds']) + '.', '',
            'Недоступные документы страны (не все относятся к этому городу): ' + (', '.join(source['id'] for source in item['inaccessibleCountryLeads']) or 'не зафиксированы') + '.', '',
            'Осталось: '+ ' '.join(item['remaining']) + ' '
            'Для источников без открытой лицензии экспортируется собственный пересказ фактов, без сканов и цитат.', '']
    lines += ['## Недоступные документы', '']
    for code,item in country_reports.items():
        lines += [f"- {code}: [{source['id']}]({source['url']}), {source['note']}" for source in item['inaccessibleArchives']]
    lines += ['', '## Сохранение прежних данных и проверки', '',
        'Авторские файлы прежнего набора: ' + ('не изменены, сверены SHA-256 с начальным состоянием.' if not result['changedExistingAuthoredFiles'] else str(result['changedExistingAuthoredFiles'])),
        'Фактически выполненные команды и результаты: `research_progress/validation.json`. '
        'Проверки исследовательского пакета не означают ручную историческую или литературную рецензию.', '']
    atomic_write(ROOT / 'docs/EXPANSION_COVERAGE.md', '\n'.join(lines))
    return result


if __name__ == '__main__':
    report = build_report()
    print(json.dumps({'combined': report['combined'], 'cities': len(report['cities']),
                      'preservation_ok': not report['changedExistingAuthoredFiles']}, ensure_ascii=False))
    if report['changedExistingAuthoredFiles']:
        sys.exit(1)
