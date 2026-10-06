"""Subset the official Noto Sans SC file for the atlas shell and source viewer."""
import argparse
import hashlib
import json
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
DESTINATION = ROOT / 'assets' / 'fonts'
SOURCE_HASH = 'a3041811a78c361b1de50f953c805e0244951c21c5bd412f7232ef0d899af0da'


def corpus():
    paths = [ROOT / name for name in ['app.js', 'data.js', 'index.html']]
    for directory in ['ui', 'demos', 'engines']:
        paths.extend(sorted((ROOT / directory).glob('*.js')))
        paths.extend(sorted((ROOT / directory).glob('*.html')))
    paths.append(ROOT / 'snapshots' / 'lang-flags.js')
    return ''.join(path.read_text(encoding='utf-8') for path in paths)


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def build(source):
    if digest(source) != SOURCE_HASH:
        raise ValueError('Source font hash differs from the recorded official asset')
    font = TTFont(source, recalcTimestamp=False)
    available = font.getBestCmap()
    # Latin comes from Inter or JetBrains Mono; include all rendered CJK and symbols.
    characters = sorted({ord(char) for char in corpus() if ord(char) > 255 and ord(char) in available})
    options = subset.Options()
    options.flavor = 'woff2'
    options.name_IDs = ['*']
    options.name_languages = ['*']
    options.name_legacy = True
    options.recalc_timestamp = False
    worker = subset.Subsetter(options=options)
    worker.populate(unicodes=characters)
    worker.subset(font)
    # A subset is a derivative. Give it a distinct primary family and keep OFL metadata.
    replacements = {1: 'Atlas CJK', 2: 'Regular', 3: 'AtlasCJK-Subset', 4: 'Atlas CJK', 6: 'AtlasCJK', 16: 'Atlas CJK', 17: 'Regular', 25: 'AtlasCJK'}
    for record in font['name'].names:
        if record.nameID in replacements:
            record.string = replacements[record.nameID].encode(record.getEncoding())
    font.flavor = 'woff2'
    font.save(DESTINATION / 'atlas-cjk.woff2')
    faces = []
    for filename, family in [('atlas-cjk.woff2', 'Atlas CJK'), ('inter-latin.woff2', 'Inter'), ('jetbrains-mono-400.woff2', 'JetBrains Mono')]:
        path = DESTINATION / filename
        face = TTFont(path)
        faces.append({
            'file': filename, 'family': family, 'bytes': path.stat().st_size, 'sha256': digest(path),
            'codepoints': sorted(face.getBestCmap()),
            'axes': {axis.axisTag: [axis.minValue, axis.maxValue] for axis in face['fvar'].axes} if 'fvar' in face else {},
        })
    manifest = {'source': {'sha256': SOURCE_HASH, 'bytes': source.stat().st_size}, 'faces': faces}
    (DESTINATION / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps([{'file': face['file'], 'bytes': face['bytes'], 'glyphs': len(face['codepoints'])} for face in faces]))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path, help='Official NotoSansSC[wght].ttf with the recorded SHA-256')
    build(parser.parse_args().source)
