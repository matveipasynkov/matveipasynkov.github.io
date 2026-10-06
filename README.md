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

The opt-in 26-second 1080p film in `#intro-film` has Russian and English versions. Its typography uses Manrope and the site's graphite/acid palette. One Three.js scene carries the modular cube through camera traversals, exploded views, type reveals, prototype panels, the proposal-builder result and the mp. signature. Camera passes and lettering create the transitions; a shader adds bloom and directional motion blur. No autoplay or audio.

Source: `studio/film.js`. Run `python studio/server.py`, open `http://127.0.0.1:8765/studio/`, and use the record button for each language. This records the WebGL canvas at 1920×1080. Convert the local `assets/cinema-ru.webm` and `assets/cinema-en.webm` captures with ffmpeg to H.264, 30 fps, 26 seconds, yuv420p and faststart. Captures are ignored by Git. The final movies and posters use the `resume-cinema-*` names. The original Python renderer remains available as an earlier study.

The language switch keeps the selected movie synchronized with the page; the shared pause control pauses it. GitHub Pages requires no build step.
