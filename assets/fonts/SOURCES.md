# Atlas shell fonts

The user confirmed on 2026-10-06 that free fonts permitting noncommercial use are acceptable, including fonts that also permit commercial use. These three fonts use SIL OFL 1.1. They are not restricted to noncommercial use. Preserve their copyright and license notices when distributing the font files; do not sell a font file by itself.

| Role | Font | Local source | Version |
| --- | --- | --- | --- |
| Latin UI and terms | Inter | `../../../bubbbly-jukebox/src/fonts/inter-latin.woff2` | 4.001, git-66647c0bb |
| Chinese UI and prose | Noto Sans SC, renamed Atlas CJK for the subset | Official Google Fonts TTF | 2.004-H2 |
| Source code, file paths and numeric counters | JetBrains Mono | `../../../catalyst/assets/fonts/jetbrains-mono-400.woff2` | 2.211 |

The two copied WOFF2 files retain their original bytes and embedded author records. Their SHA-256 values are in `manifest.json`. The matching license texts are `Inter-OFL.txt` and `JetBrainsMono-OFL.txt`.

The Noto source was retrieved anonymously from:

https://raw.githubusercontent.com/google/fonts/main/ofl/notosanssc/NotoSansSC%5Bwght%5D.ttf

The asset returned HTTP 200, `application/octet-stream`, and decoded as a TrueType variable font. It is 17,772,300 bytes. SHA-256: `a3041811a78c361b1de50f953c805e0244951c21c5bd412f7232ef0d899af0da`.

The same font is pinned to its last file revision for rebuilding:

https://raw.githubusercontent.com/google/fonts/2894aab31764f10f29c421bdfd2340d3b382d384/ofl/notosanssc/NotoSansSC%5Bwght%5D.ttf

License URLs were checked anonymously on 2026-10-06. Each returned HTTP 200 and `text/plain; charset=utf-8`:

- https://raw.githubusercontent.com/google/fonts/main/ofl/notosanssc/OFL.txt
- https://raw.githubusercontent.com/google/fonts/main/ofl/inter/OFL.txt
- https://raw.githubusercontent.com/JetBrains/JetBrainsMono/master/OFL.txt

`tools/build-fonts.py` retains Noto's license and author records, changes the derivative's primary name to Atlas CJK, and includes the non-Latin characters used by shell content and source-viewer files. The source font stays outside the committed runtime assets. A corpus check fails when new Chinese characters require rebuilding. Missing characters outside the corpus retain the system fallback.

The design-system specimen update rebuilt this corpus on 2026-10-06. Atlas CJK contains 650 codepoints and uses 176,828 bytes. The three shell font files total 264,212 bytes. `manifest.json` records their current hashes. The source specimen uses the existing local Montserrat file; its provenance and learning scope remain in `../SOURCES.md`.

Runtime files total less than 300KB. Inter and Atlas CJK preload; all faces use `font-display: swap`. JetBrains Mono disables code ligatures through CSS. Component iframe fonts, original snapshots and their existing material boundaries are unchanged.

To regenerate after adding Chinese UI content, download the pinned TTF to `test-results/font-source/NotoSansSC.ttf`, then run:

```powershell
uv run --no-project --with-requirements tools/font-requirements.txt python tools/build-fonts.py test-results/font-source/NotoSansSC.ttf
node tools/check-fonts.mjs
```

Normal browsing and `pnpm verify` use the committed WOFF2 files and require no Python font tools.
