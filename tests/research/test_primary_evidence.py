import copy
import hashlib
import json
import sys
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'scripts/historical-data/lib'))
sys.path.insert(0, str(ROOT / 'scripts/historical-data/export'))
from dataset import Dataset
from primary_evidence import evidence_errors, has_primary, share
from export import in_game_period
sys.path.insert(0, str(ROOT / 'scripts/historical-data/validate'))
from validate import Validator


class PrimaryEvidenceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = Dataset.load()
        cls.record = next(row for row in cls.data.events if row['id'] == 'es-1978-constitution')

    def test_registered_primary_document(self):
        self.assertTrue(has_primary(self.record, self.data.sources))

    def test_official_secondary_page_is_not_primary(self):
        record = next(row for row in self.data.events if row['id'] == 'es-malaga-1926-park-library')
        self.assertFalse(has_primary(record, self.data.sources))

    def test_homepage_and_unread_document_do_not_count(self):
        record = copy.deepcopy(self.record)
        record['evidence'][0]['url'] = 'https://www.boe.es/'
        self.assertFalse(has_primary(record, self.data.sources))
        record = copy.deepcopy(self.record)
        record['evidence'][0]['reviewed_content'] = False
        self.assertFalse(has_primary(record, self.data.sources))

    def test_wikipedia_is_never_primary(self):
        record = copy.deepcopy(self.record)
        record['evidence'][0]['url'] = 'https://en.wikipedia.org/wiki/Spain'
        self.assertFalse(has_primary(record, self.data.sources))

    def test_reviewed_wikipedia_may_be_secondary_without_inflating_archive_share(self):
        record = copy.deepcopy(self.record)
        source_id = 'test_wikipedia_secondary'
        doc = record['evidence'][0]
        doc.update(source_id=source_id, url='https://en.wikipedia.org/wiki/Spain',
                   repository='Wikipedia contributors', evidence_type='encyclopedia', is_primary=False)
        record['source_ids'] = [source_id]
        data = copy.copy(self.data)
        data.sources = {**self.data.sources, source_id: {'status': 'accessed'}}
        validator = Validator(data)
        validator.problems = []
        validator._sources_and_evidence(record)
        self.assertEqual(validator.problems, [])
        self.assertFalse(has_primary(record, data.sources))
        doc['is_primary'] = True
        validator._sources_and_evidence(record)
        self.assertTrue(any('Wikipedia cannot be primary' in row.message for row in validator.problems))

    def test_partial_document_does_not_substantiate_a_wider_claim(self):
        record = copy.deepcopy(self.record)
        record['evidence'][0]['claim_coverage'] = 'partial'
        self.assertFalse(has_primary(record, self.data.sources))

    def test_duplicate_events_and_missing_data_do_not_inflate_share(self):
        self.assertEqual(share([self.record, self.record], self.data.sources)['verified'], 1)
        self.assertIsNone(share([], self.data.sources)['percentage'])
        self.assertFalse(share([], self.data.sources)['meets55Percent'])

    def test_threshold_uses_integer_counts(self):
        primary = [{**self.record, 'id': str(i)} for i in range(54)]
        secondary = [{**self.record, 'id': str(i), 'evidence':[]} for i in range(54,100)]
        self.assertFalse(share(primary+secondary, self.data.sources)['meets55Percent'])
        primary.append({**self.record,'id':'54'})
        self.assertTrue(share(primary+secondary[1:], self.data.sources)['meets55Percent'])

    def test_export_rejects_spans_crossing_2020_and_context_overruns(self):
        self.assertTrue(in_game_period(self.record))
        self.assertFalse(in_game_period({**self.record,'end_date':'2021'}))
        self.assertFalse(in_game_period({**self.record,'start_date':'1899'}))
        self.assertFalse(in_game_period({'country_code':'ES','period_start':2000,'period_end':2021}))
        # Previously published records retain their historical policy.
        self.assertTrue(in_game_period({'country_codes':['FR'],'start_date':'2021'}))

    def test_exported_checksums_match_actual_files(self):
        base = ROOT / 'public/data/world'
        manifest = json.loads((base / 'manifest.json').read_text())
        entries = list(manifest['packs'].values()) + [manifest['locations'], manifest['sources']]
        for entry in entries:
            self.assertEqual(hashlib.sha256((base / entry['file']).read_bytes()).hexdigest(), entry['sha256'], entry['file'])


if __name__ == '__main__':
    unittest.main()
