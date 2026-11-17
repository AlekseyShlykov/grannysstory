import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0,str(Path(__file__).resolve().parents[2]/'scripts/research'))
import records
import checkpoint


class ResumableBatchTests(unittest.TestCase):
    def test_replay_deduplicates_and_preserves_verified_export_state(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory)
            progress=root/'research_progress'
            checkpoint.atomic_write(progress/'tasks.json',{'tasks':[{'id':'es.export','state':'completed'}]})
            checkpoint.atomic_write(progress/'countries/es.json',{'country':'ES'})
            event={'id':'es-local','geographic_scope':'municipal','location_ids':['es-oviedo'],'verification_status':'verified'}
            with patch.object(records,'ROOT',root), patch.object(records,'PROGRESS',progress), patch.object(checkpoint,'PROGRESS',progress):
                records.save_batch('ES','spain',[event],[])
                task=lambda: json.loads((progress/'tasks.json').read_text())['tasks'][0]['state']
                self.assertEqual(task(),'in_progress')
                checkpoint.update('es.export','completed','A verified export')
                records.save_batch('ES','spain',[event],[])
                self.assertEqual(task(),'completed')
                stored=json.loads((root/'data/historical/spain/cities/es-oviedo.json').read_text())['records']
                self.assertEqual(stored,[event])
                saved=json.loads((progress/'countries/es.json').read_text())
                self.assertEqual(saved['verified_event_ids'],['es-local'])

    def test_unverified_lead_is_not_a_verified_checkpoint(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory)
            progress=root/'research_progress'
            checkpoint.atomic_write(progress/'tasks.json',{'tasks':[{'id':'jp.export','state':'completed'}]})
            checkpoint.atomic_write(progress/'countries/jp.json',{'country':'JP','verified_event_ids':['jp-lead']})
            lead={'id':'jp-lead','geographic_scope':'municipal','location_ids':['jp-tokyo'],'verification_status':'needs_review'}
            with patch.object(records,'ROOT',root), patch.object(records,'PROGRESS',progress), patch.object(checkpoint,'PROGRESS',progress):
                records.save_batch('JP','japan',[lead],[])
                saved=json.loads((progress/'countries/jp.json').read_text())
                self.assertEqual(saved['verified_event_ids'],[])
                self.assertEqual(json.loads((root/'data/historical/japan/cities/jp-tokyo.json').read_text())['records'],[lead])

    def test_conflicting_evidence_never_overwrites_an_existing_record(self):
        with tempfile.TemporaryDirectory() as directory:
            path=Path(directory)/'records.json'
            original={'id':'event','source_ids':['read-primary-document']}
            records.append_unique(path,'records',[original])
            before=path.read_bytes()
            with self.assertRaisesRegex(ValueError,'Conflicting record'):
                records.append_unique(path,'records',[{'id':'another'}, {'id':'event','source_ids':['unread-lead']}])
            self.assertEqual(path.read_bytes(),before)

    def test_new_source_invalidates_only_its_country_export(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory)
            progress=root/'research_progress'
            checkpoint.atomic_write(progress/'tasks.json',{'tasks':[{'id':'es.export','state':'completed'},{'id':'jp.export','state':'completed'}]})
            checkpoint.atomic_write(progress/'countries/es.json',{'country':'ES'})
            with patch.object(records,'ROOT',root), patch.object(records,'PROGRESS',progress), patch.object(checkpoint,'PROGRESS',progress):
                records.source('ES','test-document','Document','https://example.org/document','es',accessed_on='2026-11-17')
                tasks={r['id']:r['state'] for r in json.loads((progress/'tasks.json').read_text())['tasks']}
                self.assertEqual(tasks,{'es.export':'in_progress','jp.export':'completed'})
                self.assertEqual(json.loads((progress/'countries/es.json').read_text())['last_source_id'],'test-document')


if __name__=='__main__':
    unittest.main()
