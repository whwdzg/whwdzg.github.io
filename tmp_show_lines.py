from pathlib import Path

def show(path, start, end):
    print(f"--- {path} {start}-{end}")
    lines = Path(path).read_text(encoding='utf-8').splitlines()
    for i in range(start, min(end, len(lines)) + 1):
        print(f"{i}: {lines[i-1]}")

show('includes/shell.html', 25, 110)
show('tool/base64.html', 1, 220)
