"""Run the supervisor against a local fake CLI, without model calls or authentication changes."""
import fcntl
import json
import os
from pathlib import Path
import signal
import subprocess
import sys
import tempfile
import time
import unittest
from unittest.mock import patch

SCRIPT_ROOT = Path(__file__).resolve().parents[2] / 'scripts/research'
sys.path.insert(0, str(SCRIPT_ROOT))
import supervisor

SESSION_ID = '12345678-1234-1234-1234-123456789abc'


class SupervisorProcessTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='granny-supervisor-test-')
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name).resolve()
        self.progress = self.root / 'research_progress'
        self.progress.mkdir()
        (self.progress / 'session.json').write_text(json.dumps({
            'cwd': str(self.root), 'session_id': SESSION_ID, 'supervisor_started': False}))
        (self.progress / 'tasks.json').write_text(json.dumps({'tasks': [{'id':'research', 'state':'pending'}]}))
        fake = self.root / 'codex'
        fake.write_text('#!' + sys.executable + '\n' + '''
import json, os, sys, time
from pathlib import Path
if sys.argv[1:] == ['login', 'status']:
    print('Logged in using ChatGPT')
    sys.exit(0)
with Path('calls.jsonl').open('a') as f:
    f.write(json.dumps({'argv':sys.argv[1:], 'cwd':os.getcwd()})+'\\n')
mode = os.environ.get('FAKE_CODEX_MODE', 'config')
if mode == 'wait':
    time.sleep(30)
if mode == 'quota':
    print(json.dumps({'type':'turn.failed','error':{'code':'usage_limit_reached'}}))
else:
    print(json.dumps({'type':'turn.failed','error':{'code':'model_not_found','message':'SECRET_DO_NOT_LOG'}}))
sys.exit(1)
''')
        fake.chmod(0o700)
        self.env = {key:value for key,value in os.environ.items()
                    if key not in {'OPENAI_API_KEY','CODEX_API_KEY','OPENAI_BASE_URL'}}
        self.env['PATH'] = str(self.root) + os.pathsep + self.env.get('PATH','')

    def run_local(self, mode):
        with patch.object(supervisor,'ROOT',self.root), patch.object(supervisor,'PROGRESS',self.progress), \
             patch.dict(os.environ,{**self.env,'FAKE_CODEX_MODE':mode},clear=True), patch.object(supervisor.signal,'signal'):
            return supervisor.main(['--max-attempts','1'])

    def test_configuration_failure_stops_and_redacts_output(self):
        self.assertEqual(self.run_local('config'), 2)
        calls = [json.loads(row) for row in (self.root/'calls.jsonl').read_text().splitlines()]
        self.assertEqual(len(calls),1)
        self.assertEqual(calls[0]['cwd'],str(self.root))
        self.assertIn(SESSION_ID,calls[0]['argv'])
        self.assertIn('forced_login_method="chatgpt"',calls[0]['argv'])
        self.assertIn('model_provider="openai"',calls[0]['argv'])
        self.assertNotIn('SECRET_DO_NOT_LOG',(self.progress/'supervisor.log').read_text())
        self.assertFalse(json.loads((self.progress/'session.json').read_text())['supervisor_started'])

    def test_bounded_quota_attempt_does_not_retry(self):
        self.assertEqual(self.run_local('quota'),2)
        self.assertEqual(len((self.root/'calls.jsonl').read_text().splitlines()),1)

    def test_second_supervisor_is_rejected_before_cli_start(self):
        with (self.progress/'.supervisor.lock').open('a') as lock:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
            with self.assertRaisesRegex(SystemExit,'Another supervisor'):
                self.run_local('config')
        self.assertFalse((self.root/'calls.jsonl').exists())

    def test_sigterm_stops_child_and_leaves_restartable_checkpoint(self):
        runner = ('import sys; from pathlib import Path; sys.path.insert(0,' + repr(str(SCRIPT_ROOT)) + '); '
                  'import supervisor as s; s.ROOT=Path(' + repr(str(self.root)) + '); '
                  's.PROGRESS=s.ROOT/"research_progress"; sys.exit(s.main(["--max-attempts","1"]))')
        process = subprocess.Popen([sys.executable,'-c',runner],cwd=self.root,
            env={**self.env,'FAKE_CODEX_MODE':'wait'},stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
        try:
            deadline = time.monotonic()+5
            while not (self.root/'calls.jsonl').exists() and process.poll() is None and time.monotonic()<deadline:
                time.sleep(0.02)
            self.assertTrue((self.root/'calls.jsonl').exists())
            process.send_signal(signal.SIGTERM)
            self.assertEqual(process.wait(timeout=5),130)
            self.assertFalse(json.loads((self.progress/'session.json').read_text())['supervisor_started'])
            self.assertEqual(self.run_local('config'),2)
        finally:
            if process.poll() is None:
                process.kill()
                process.wait(timeout=5)


if __name__ == '__main__':
    unittest.main()
