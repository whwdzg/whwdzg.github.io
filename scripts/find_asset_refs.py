from pathlib import Path

root = Path(__file__).resolve().parent.parent
skip_dirs = {'.git', 'Legacy-1.0', 'resource'}
patterns = ['/img/', '/font/', '/vid/', '/aud/', '../img/', '../font/', '../vid/', '../aud/', './img/', './font/', './vid/', './aud/']
files = {}
for path in root.rglob('*'):
    if not path.is_file():
        continue
    if any(part in skip_dirs for part in path.parents):
        continue
    if path.parts[0] == '.git':
        continue
    try:
        text = path.read_text(encoding='utf-8')
    except Exception:
        continue
    hits = {pat for pat in patterns if pat in text}
    if hits:
        files[path] = hits
for path in sorted(files):
    print(path.relative_to(root), sorted(files[path]))
