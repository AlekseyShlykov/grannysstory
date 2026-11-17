"""Document and geographic quality gates for the released Japanese archive."""
import json
import sys
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT/'scripts/historical-data/lib'))
from dataset import Dataset
from primary_evidence import share, evidence_errors, has_primary

class JapanArchiveTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data=Dataset.load()
        cls.rows=[r for r in cls.data.events if 'JP' in r.get('country_codes',[]) and r.get('verification_status')=='verified']

    def test_country_and_each_own_city_pass_55_percent(self):
        self.assertTrue(share(self.rows,self.data.sources)['meets55Percent'])
        for city in ['jp-tokyo','jp-kyoto','jp-osaka','jp-hiroshima']:
            rows=[r for r in self.rows if r['geographic_scope']=='municipal' and r['location_ids']==[city]]
            self.assertGreaterEqual(len(rows),8)
            self.assertTrue(share(rows,self.data.sources)['meets55Percent'],city)

    def test_all_evidence_is_traceable_and_secondary_is_not_primary(self):
        for row in self.rows:
            for ev in row['evidence']:
                self.assertEqual(evidence_errors(ev,self.data.sources),[],row['id'])
                self.assertEqual(ev['repository'],self.data.sources[ev['source_id']]['repository'])
                if 'wikipedia.org' in ev['url']:self.assertFalse(ev['is_primary'])
        tokyo=next(r for r in self.rows if r['id']=='jp-tokyo-1923-kanto-earthquake')
        self.assertFalse(has_primary(tokyo,self.data.sources),'A partial street photo cannot prove the whole earthquake claim')

    def test_all_seven_periods_and_no_out_of_range_export(self):
        national=[r for r in self.rows if r['geographic_scope']=='national']
        for first,last in [(1900,1919),(1920,1939),(1940,1959),(1960,1979),(1980,1999),(2000,2009),(2010,2020)]:
            self.assertTrue(any(first<=int(r['start_date'][:4])<=last for r in national))
        for row in self.rows:
            self.assertLessEqual(1900,int(row['start_date'][:4]))
            self.assertLessEqual(int((row.get('end_date') or row['start_date'])[:4]),2020)

    def test_national_and_local_counts_are_disjoint_and_stats_keep_scope(self):
        ids=[r['id'] for r in self.rows]
        self.assertEqual(len(ids),len(set(ids)))
        for row in self.rows:
            if row['geographic_scope']=='national':self.assertEqual(row['location_ids'],['jp'])
        expo=next(r for r in self.rows if r['id']=='jp-osaka-prefecture-1970-expo')
        self.assertEqual(expo['location_ids'],['jp-osaka-prefecture'])
        census=next(r for r in self.data.contexts if r['id']=='jp-ctx-2020-aging-population')
        self.assertEqual(census['statistics'][0]['area_id'],'jp')
        self.assertIn('imputation',census['statistics'][0]['method_note'])

if __name__=='__main__':unittest.main()
