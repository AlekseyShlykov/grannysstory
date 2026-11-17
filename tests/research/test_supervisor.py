import importlib.util
import sys
from pathlib import Path
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'scripts' / 'research'))
from supervisor import assigned_work_complete, classify, command


class SupervisorTests(unittest.TestCase):
    def test_country_stop_rule_prevents_starting_deferred_work(self):
        checkpoint = {'execution_policy': {'stop_after_country': 'ES'}, 'tasks': [
            {'id': 'es.publish', 'state': 'completed'}, {'id': 'jp.national', 'state': 'pending'}]}
        self.assertTrue(assigned_work_complete(checkpoint))
        checkpoint['tasks'][0]['state'] = 'in_progress'
        self.assertFalse(assigned_work_complete(checkpoint))

    def test_only_explicit_quota_codes_retry(self):
        for code in ['usage_limit_reached', 'usage_limit_exceeded', 'quota_exceeded']:
            self.assertEqual(classify([{'type': 'turn.failed', 'error': {'code': code}}], 1), ('quota', None))
        for code in ['429', 'rate_limit_exceeded', 'invalid_api_key', 'permission_denied', 'network_error']:
            self.assertEqual(classify([{'type': 'error', 'code': code}], 1)[0], 'stop')
        self.assertEqual(classify([], 1)[0], 'stop')

    def test_permission_failure_takes_precedence(self):
        events = [{'type': 'error', 'code': code} for code in ['usage_limit_reached', 'permission_denied']]
        self.assertEqual(classify(events, 1)[0], 'stop')

    def test_success_stops(self):
        self.assertEqual(classify([], 0), ('success', None))

    def test_real_cli_wrapped_configuration_failure_is_not_quota(self):
        error = {'message': '{"type":"error","status":400,"error":{"type":"invalid_request_error","code":"model_not_found"}}'}
        self.assertEqual(classify([{'type':'turn.failed','error':error}], 1)[0], 'stop')

    def test_usage_message_only_in_error_channel(self):
        text = "You've hit your usage limit. Try again later."
        self.assertEqual(classify([{'type':'turn.failed','error':{'message':text}}], 1)[0], 'quota')
        self.assertEqual(classify([{'type':'item.completed','item':{'text':text}}], 1)[0], 'stop')

    def test_reset_timestamp_is_honored_without_guessing_prose(self):
        import time
        reset = time.time() + 3600
        self.assertEqual(classify([{'type':'error','code':'usage_limit_reached','resets_at':reset}], 1), ('quota', reset))
        self.assertEqual(classify([{'type':'error','code':'usage_limit_reached','resets_at':'tomorrow'}], 1), ('quota', None))

    def test_resume_is_explicit_and_safe(self):
        session = '12345678-1234-1234-1234-123456789abc'
        args = command(session)
        self.assertIn(session, args)
        self.assertNotIn('--last', args)
        self.assertNotIn('--dangerously-bypass-approvals-and-sandbox', args)
        self.assertIn('workspace-write', args)
        with self.assertRaises(ValueError):
            command('--last')


if __name__ == '__main__':
    unittest.main()
