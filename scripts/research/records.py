"""Helpers for manually reviewed research batches. No silent updates or network calls."""
import json
import sys
import datetime as dt
from pathlib import Path
from urllib.parse import urlparse

from checkpoint import ROOT, PROGRESS, atomic_write, update

sys.path.insert(0, str(ROOT / 'scripts/historical-data/lib'))
from primary_evidence import evidence_errors
from dataset import CATEGORIES, CONTEXT_TYPES, SCOPES


def append_unique(path, key, records, id_field='id'):
    payload = json.loads(path.read_text()) if path.exists() else {key: []}
    existing = {row[id_field]: row for row in payload[key]}
    changed = False
    for row in records:
        old = existing.get(row[id_field])
        if old is not None and old != row:
            raise ValueError('Conflicting record; inspect before updating: ' + row[id_field])
        if old is None:
            payload[key].append(row)
            existing[row[id_field]] = row
            changed = True
    if changed or not path.exists():
        atomic_write(path, payload)
    return changed


def mark_unexported(country):
    update(country.lower()+'.export', 'in_progress',
           'Новые авторские данные ещё не включены в проверенный SQLite → JSON checkpoint.')


def spanish_source_kind(url):
    """Repository type describes its owner, independently of whether a document is primary."""
    host = urlparse(url).netloc.lower()
    for fragment, kind in [('wikipedia.org', 'encyclopedia'), ('elpais.com', 'newspaper_archive'),
                           ('mundodeportivo.com', 'newspaper_archive'), ('seat-cupra', 'corporate'),
                           ('rtve.es', 'broadcaster'), ('mhcat.cat', 'museum'), ('museopicassomalaga.org', 'museum'),
                           ('fundacionlito.es', 'archive'), ('la84.org', 'library'), ('fpa.es', 'foundation'),
                           ('coam.org', 'academic'), ('rebiun.org', 'library'), ('digibuo.uniovi.es', 'library'),
                           ('archivomunicipal.malaga.eu', 'archive')]:
        if fragment in host:
            return kind
    return 'government'


def source(country, source_id, name, url, language, kind=None, status='accessed', notes='', publisher=None, accessed_on=None, rights=None, restrictions=None):
    kind = kind or (spanish_source_kind(url) if country == 'ES' else 'government')
    record = dict(source_id=source_id, name=name, publisher=publisher or name, repository=publisher or name, country=country, url=url,
        historical_coverage=None, geographic_coverage=[country],
        categories=['history'], access_method='website' if status == 'accessed' else 'not_accessible',
        bulk_download=False, license=rights or 'Открытая лицензия не установлена. В игре только собственный пересказ фактов; сканы, фото, цитаты и персональные данные не воспроизводятся.',
        attribution_required=True, access_restrictions=restrictions if restrictions is not None else ['Публичный просмотр; разрешение на перепубликацию материалов не установлено.'],
        status=status, accessed=(accessed_on or dt.date.today().isoformat()) if status == 'accessed' else None,
        source_type=kind, languages=[language], location_ids=[], notes=notes,
        api={'available': None, 'verified': False, 'note': 'API и массовая выгрузка не проверялись.'})
    if append_unique(ROOT / 'data/sources' / (country.lower() + '.json'), 'sources', [record], 'source_id'):
        mark_unexported(country)
    # Each registry update gets its own durable checkpoint.
    path = PROGRESS / 'countries' / (country.lower() + '.json')
    progress = json.loads(path.read_text())
    progress['last_source_id'] = source_id
    progress['stage'] = 'sources'
    progress['next_action'] = 'Проверить содержание следующего документа; уже зарегистрированные ID не переписывать.'
    atomic_write(path, progress)
    return record


def evidence(repo, title, identifier, document_date, language, evidence_type, supports, primary=True, locator=None):
    item = dict(source_id=repo['source_id'], url=repo['url'], title=title, record_identifier=identifier,
        repository=repo.get('repository', repo['publisher']),
        document_date=document_date, language=language, evidence_type=evidence_type, supports=supports,
        is_primary=primary, reviewed_content=True, verification_status='verified', accessed=repo['accessed'],
        rights=repo['license'], access_conditions='Документ открыт и прочитан; без обхода ограничений. Способ доступа и прочитанные разделы указаны в реестре источников.')
    if locator:
        item['locator'] = locator
    errors = evidence_errors(item, {repo['source_id']: repo})
    if errors:
        raise ValueError(errors)
    return item


def event(country, slug, date, place, title_ru, title_en, summary_ru, summary_en, ev, category='infrastructure_transport', scope='municipal', sensitive=False):
    year = int(date[:4])
    if not 1900 <= year <= 2020:
        raise ValueError('Event outside 1900–2020')
    if category not in CATEGORIES or scope not in SCOPES:
        raise ValueError('Use the existing event category and geographic scope registries')
    return dict(id=country.lower() + '-' + slug, title=title_ru, title_en=title_en, title_original=ev['title'],
        start_date=date, end_date=None, date_precision={4:'year', 7:'month', 10:'day'}[len(date)], approximate=False,
        country_codes=[country], geographic_scope=scope, location_ids=[place], category=category, subcategory=None,
        historical_summary=summary_ru, historical_summary_en=summary_en, affected_groups=['all_residents'],
        potential_impacts=[], narrative_hooks=[], sensitive=sensitive, source_ids=[ev['source_id']], evidence=[ev],
        verification_status='verified', confidence='high', batch='world-1.3', research_standard='primary-archive-v1')


def context(country, slug, place, first, last, kind, title_ru, title_en, text_ru, text_en, ev, statistics=None):
    if kind not in CONTEXT_TYPES or not 1900 <= first <= last <= 2020:
        raise ValueError('Use an existing context type and a period within 1900–2020')
    return dict(id=country.lower() + '-ctx-' + slug, country_code=country, location_id=place,
        period_start=first, period_end=last, context_type=kind, attribute=slug, title=title_ru, title_en=title_en,
        description=text_ru, description_en=text_en, statistics=statistics or [], source_ids=[ev['source_id']],
        evidence=[ev], verification_status='verified', confidence='high', batch='world-1.3', research_standard='primary-archive-v1')


def save_batch(country, folder, events, contexts):
    changed = False
    for record in events:
        scope = record['geographic_scope']
        group = 'cities' if scope == 'municipal' else 'regions' if scope in {'regional', 'district'} else 'national'
        changed |= append_unique(ROOT / 'data/historical' / folder / group / (record['location_ids'][0] + '.json'), 'records', [record])
    changed |= append_unique(ROOT / 'data/contexts' / folder / 'reviewed.json', 'records', contexts)
    if changed:
        mark_unexported(country)
    path = PROGRESS / 'countries' / (country.lower() + '.json')
    progress = json.loads(path.read_text())
    progress.update(stage='extracted_batch', next_action='Проверить batch валидатором, дополнить недостающие эпохи и независимые документы.')
    for field, rows in [('verified_event_ids', events), ('verified_context_ids', contexts)]:
        verified = {row['id'] for row in rows if row.get('verification_status') == 'verified'}
        pending_review = {row['id'] for row in rows if row.get('verification_status') != 'verified'}
        progress[field] = sorted((set(progress.get(field, [])) | verified) - pending_review)
    atomic_write(path, progress)
