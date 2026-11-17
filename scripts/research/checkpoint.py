"""Atomic, idempotent checkpoints. No network or model calls."""
import argparse
import datetime as dt
import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PROGRESS = ROOT / 'research_progress'


def atomic_write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(path.name + '.tmp')
    with temporary.open('w', encoding='utf-8') as handle:
        handle.write(value if isinstance(value, str) else json.dumps(value, ensure_ascii=False, indent=2) + '\n')
        handle.flush()
        os.fsync(handle.fileno())
    os.replace(temporary, path)


def update(task_id, state, note):
    path = PROGRESS / 'tasks.json'
    data = json.loads(path.read_text())
    task = next((item for item in data['tasks'] if item['id'] == task_id), None)
    if task is None:
        raise ValueError('Unknown task id: ' + task_id)
    if task['state'] == state and task.get('note') == note:
        return
    task.update(state=state, note=note, updated_at=dt.datetime.now(dt.timezone.utc).isoformat())
    atomic_write(path, data)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('task_id')
    parser.add_argument('state', choices=['pending', 'in_progress', 'completed', 'blocked', 'failed'])
    parser.add_argument('note')
    args = parser.parse_args()
    update(args.task_id, args.state, args.note)
