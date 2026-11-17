"""Checkpoint only after a successful normalisation/export, never certify country readiness."""
import datetime as dt
import hashlib
import json
from pathlib import Path
import sys

from checkpoint import ROOT, PROGRESS, atomic_write
from report import build_report
sys.path.insert(0, str(ROOT/'scripts/historical-data/lib'))
from dataset import Dataset


def main():
    report = build_report()
    if report['changedExistingAuthoredFiles']:
        raise SystemExit('Preservation audit failed; export is not checkpointed')
    data = Dataset.load()
    manifest_path = ROOT/'public/data/world/manifest.json'
    manifest = json.loads(manifest_path.read_text())
    checkpoint = {
        'schema':1, 'at':dt.datetime.now(dt.timezone.utc).isoformat(),
        'dataset_version':manifest['worldDatasetVersion'], 'counts':manifest['counts'],
        'manifest_sha256':hashlib.sha256(manifest_path.read_bytes()).hexdigest(),
        'sqlite_sha256':hashlib.sha256((ROOT/'data/research/historical.sqlite').read_bytes()).hexdigest(),
        'combined_evidence':report['combined'],
        'country_readiness': {code: ('not_in_release' if code.lower() not in data.locations else
            'supported' if all(report['cities'][code.lower()+'-'+slug]['integration']=='enabled'
            for slug in cities) else 'research_only') for code,cities in tasks_countries().items()},
        'validation':'authoring validator and export succeeded; see validation.json for gameplay checks'
    }
    atomic_write(PROGRESS/'exports/latest.json',checkpoint)
    tasks=json.loads((PROGRESS/'tasks.json').read_text())
    for code in tasks['countries']:
        # A one-country publication must not erase checkpoints for unpublished local workstreams.
        if code.lower() not in data.locations:
            continue
        path=PROGRESS/'countries'/(code.lower()+'.json')
        current=json.loads(path.read_text())
        if current.get('stage') not in {'release_validated', 'published'}:
            current['stage']='validated_export' if checkpoint['country_readiness'][code]=='supported' else 'validated_research_export'
        current.update(last_export=checkpoint['manifest_sha256'],
            updated_at=checkpoint['at'], updated=checkpoint['at'][:10],
            verified_event_ids=sorted(r['id'] for r in data.events if code in r.get('country_codes',[]) and r.get('verification_status')=='verified'),
            verified_context_ids=sorted(r['id'] for r in data.contexts if code==r.get('country_code') and r.get('verification_status')=='verified'))
        current.setdefault('next_action', 'Продолжить недостающие эпохи, историческую географию и местные первичные документы; исследовательский экспорт не завершает страну.')
        atomic_write(path,current)
        task=next(r for r in tasks['tasks'] if r['id']==code.lower()+'.export')
        task.update(state='completed', note='SQLite → JSON экспорт проверен. Готовность и публикация учитываются отдельно.',updated_at=checkpoint['at'])
    atomic_write(PROGRESS/'tasks.json',tasks)
    print(json.dumps({'checkpointed':True,'manifest_sha256':checkpoint['manifest_sha256'],
                      'expansion_events':report['combined']['verified'],'supported_cities':sum(r['integration']=='enabled' for r in report['cities'].values())}))


def tasks_countries():
    return json.loads((PROGRESS/'tasks.json').read_text())['countries']


if __name__=='__main__':
    main()
