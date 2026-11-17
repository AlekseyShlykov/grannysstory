"""Optional bounded supervisor for the installed Codex CLI; never changes authentication.

Only typed JSON error events can trigger a quota retry. Output is consumed in memory,
not logged: model/CLI streams may contain credentials or archive personal data.
Use --dry-run to inspect the exact argv without starting a model session.
"""
import argparse
import datetime as dt
import fcntl
import json
import os
from pathlib import Path
import re
import signal
import subprocess
import sys
import threading
import time

from checkpoint import ROOT, PROGRESS, atomic_write

PROMPT = "Continue the Granny's Story historical archive expansion. Read AGENTS.md, PROJECT.md, DIALOGUE_BIBLE.md, and all files in research_progress/. Inspect the repository and continue from the last verified checkpoint. Do not repeat completed tasks. Preserve all existing verified data. Continue until the remaining assigned research and implementation tasks are complete."
PROMPT += " Obey the latest owner instruction and tasks.json execution_policy.active_country and stop_after_country. Complete only the assigned country, then stop with a remaining-work report; do not begin another country without a new owner instruction."
UUID = re.compile(r'^[0-9a-fA-F]{8}(?:-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12}$')
QUOTA_CODES = {'usage_limit_reached', 'usage_limit_exceeded', 'quota_exceeded'}
STOP_CODES = {'unauthorized', 'authentication_error', 'permission_denied', 'invalid_configuration', 'invalid_api_key'}
QUOTA_MESSAGE = re.compile(r"^(?:You've|You have) hit your usage limit\b", re.IGNORECASE)


def classify(events, returncode):
    """HTTP 429/rate_limit alone is not evidence of exhausted ChatGPT usage allowance."""
    errors = []
    for event in events:
        if event.get('type') == 'error':
            errors.append(event.get('error') or event)
        elif event.get('type') == 'turn.failed':
            errors.append(event.get('error') or {})
    if returncode == 0 and not errors:
        return 'success', None
    normalized = []
    for error in errors:
        if not isinstance(error, dict):
            normalized.append({'code': 'unknown'})
            continue
        # The installed CLI can wrap a server error as JSON inside error.message.
        message = error.get('message')
        if isinstance(message, str):
            try:
                wrapper = json.loads(message)
                if isinstance(wrapper, dict) and isinstance(wrapper.get('error'), dict):
                    error = wrapper['error']
            except ValueError:
                pass
        normalized.append(error)
    codes = {error.get('code') or error.get('type') or
             ('usage_limit_reached' if QUOTA_MESSAGE.match(str(error.get('message', ''))) else 'unknown')
             for error in normalized}
    if codes & STOP_CODES:
        return 'stop', None
    if not codes or not codes <= QUOTA_CODES:
        return 'stop', None
    # Honor only a machine-readable numeric Unix timestamp, never guess from prose.
    resets = [error.get('resets_at') for error in normalized]
    timestamps = [float(value) for value in resets if isinstance(value, (float, int)) and value > time.time()]
    return 'quota', max(timestamps) if timestamps else None


def command(session_id, executable='codex'):
    if session_id and not UUID.fullmatch(session_id):
        raise ValueError('Session ID must be an explicit saved-session UUID')
    base = [executable, '-a', 'never', '-c', 'forced_login_method="chatgpt"',
            '-c', 'model_provider="openai"', '--search', 'exec', '--sandbox', 'workspace-write', '--json']
    return base + (['resume', session_id, PROMPT] if session_id else [PROMPT])


def assigned_work_complete(checkpoint):
    tasks = checkpoint['tasks']
    stop_country = checkpoint.get('execution_policy', {}).get('stop_after_country')
    if stop_country and any(task['id'] == stop_country.lower()+'.publish'
                            and task['state'] == 'completed' for task in tasks):
        return True
    return all(task['state'] == 'completed' for task in tasks)


def log(kind, **fields):
    # Only allow caller-controlled metadata; never store stderr/error messages/prompts/env.
    record = {'at': dt.datetime.now(dt.timezone.utc).isoformat(), 'kind': kind, **fields}
    with (PROGRESS / 'supervisor.log').open('a', encoding='utf-8') as handle:
        handle.write(json.dumps(record) + '\n')


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--dry-run', action='store_true')
    parser.add_argument('--max-attempts', type=int, default=4)
    parser.add_argument('--max-wait-hours', type=float, default=168)
    args = parser.parse_args(argv)
    session_path = PROGRESS / 'session.json'
    session = json.loads(session_path.read_text())
    if Path(session['cwd']).resolve() != ROOT:
        raise SystemExit('Checkpoint belongs to another working directory')
    if not 1 <= args.max_attempts <= 10 or not 1 <= args.max_wait_hours <= 336:
        raise SystemExit('Retry bounds are invalid')
    # A paid API must never be substituted for the saved ChatGPT account.
    if any(os.environ.get(name) for name in ('OPENAI_API_KEY', 'CODEX_API_KEY', 'OPENAI_BASE_URL')):
        raise SystemExit('API override present; supervisor requires existing ChatGPT login')
    argv_cli = command(session.get('session_id'))
    if args.dry_run:
        print(json.dumps({'cwd': str(ROOT), 'argv': argv_cli, 'started': False}, ensure_ascii=False))
        return 0
    if assigned_work_complete(json.loads((PROGRESS / 'tasks.json').read_text())):
        log('assigned_scope_completed')
        return 0
    stopped = threading.Event()
    child = [None]
    def shutdown(_signum, _frame):
        stopped.set()
        if child[0] is not None and child[0].poll() is None:
            os.killpg(child[0].pid, signal.SIGTERM)
            def kill_unresponsive_child():
                if child[0] is not None and child[0].poll() is None:
                    os.killpg(child[0].pid, signal.SIGKILL)
            timer = threading.Timer(10, kill_unresponsive_child)
            timer.daemon = True
            timer.start()
    signal.signal(signal.SIGTERM, shutdown)
    signal.signal(signal.SIGINT, shutdown)
    # flock is released by the OS even after crashes. Never unlink the lock inode.
    with (PROGRESS / '.supervisor.lock').open('a') as lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            raise SystemExit('Another supervisor owns this task')
        auth = subprocess.run(['codex', 'login', 'status'], cwd=ROOT, capture_output=True, text=True)
        if auth.returncode or 'Logged in using ChatGPT' not in auth.stdout + auth.stderr:
            log('stopped', reason='chatgpt_auth_required')
            return 2
        session.update(supervisor_started=True, supervisor_pid=os.getpid())
        atomic_write(session_path, session)
        try:
            for attempt in range(args.max_attempts):
                if assigned_work_complete(json.loads((PROGRESS / 'tasks.json').read_text())):
                    log('completed')
                    return 0
                if stopped.is_set():
                    return 130
                log('attempt', number=attempt + 1)
                # stderr is deliberately discarded; it is not a reliable quota signal.
                events = []
                child[0] = subprocess.Popen(command(session.get('session_id')), cwd=ROOT,
                    stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True, start_new_session=True)
                for line in child[0].stdout:
                    try:
                        event = json.loads(line)
                    except (ValueError, TypeError):
                        continue
                    if event.get('type') == 'thread.started' and UUID.fullmatch(event.get('thread_id', '')):
                        session['session_id'] = event['thread_id']
                        atomic_write(session_path, session)
                    if event.get('type') in {'error', 'turn.failed'}:
                        events.append(event)
                child[0].stdout.close()
                code = child[0].wait()
                if stopped.is_set():
                    return 130
                kind, reset = classify(events, code)
                log('result', result=kind, exit_code=code)
                # A successful turn stops for review; it must not create an unbounded request loop.
                if kind != 'quota' or attempt + 1 == args.max_attempts:
                    return 0 if kind == 'success' else 2
                delay = (max(0, reset - time.time()) + 120) if reset else min(21600, 1800 * 2 ** attempt)
                if delay > args.max_wait_hours * 3600:
                    log('stopped', reason='reset_beyond_wait_bound')
                    return 2
                log('waiting', seconds=round(delay), has_reset_timestamp=bool(reset))
                if stopped.wait(delay):
                    return 130
            return 2
        finally:
            session.update(supervisor_started=False, supervisor_pid=None)
            atomic_write(session_path, session)
            log('shutdown')


if __name__ == '__main__':
    sys.exit(main())
