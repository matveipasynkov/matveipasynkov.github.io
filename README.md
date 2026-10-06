# Matvey Pasynkov — personal website

**[matveipasynkov.github.io](https://matveipasynkov.github.io/)**

Bilingual personal portfolio covering process optimization, business analysis, AI automation, experience and education.

Static HTML, CSS and JavaScript. Hosted on GitHub Pages from the root of `main`.

- RU / EN content with a language preference saved locally when available.
- Responsive layout and reduced-motion support.
- No build step. Three.js 0.180.0 is self-hosted in `vendor/` with its MIT license; web fonts fall back to system fonts.

The GitHub profile README is maintained in [matveipasynkov/matveipasynkov](https://github.com/matveipasynkov/matveipasynkov).

The scroll narrative uses one WebGL canvas, bounded perspective framing and reduced-motion support. Desktop lighting uses a self-hosted 1K CC0 studio HDRI by Sergej Majboroda / Poly Haven; attribution is in `assets/THIRD-PARTY.txt`. Mobile uses lighter studio lighting, capped resolution, and no dynamic shadows or fastener detail.

## Video introduction

The opt-in 24-second film in `#intro-film` has Russian and English versions. It follows the existing graphite/acid design and uses a 4×5×3 modular cube to illustrate analysis, prototyping, tools and the proposal-builder case. No autoplay or audio. Switching language changes the movie; the shared pause control pauses it.

Regenerate with `python tools/render-film.py` (Pillow, NumPy, ffmpeg; the current font paths target macOS). Copy, palette, timing and geometry are defined separately in that file. Rendered H.264 files and posters are checked into `assets/`; GitHub Pages requires no build step.
