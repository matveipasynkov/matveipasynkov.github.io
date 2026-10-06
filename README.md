# Matvey Pasynkov — personal website

**[matveipasynkov.github.io](https://matveipasynkov.github.io/)**

Bilingual personal portfolio covering process optimization, business analysis, AI automation, experience and education.

Static HTML, CSS and JavaScript. Hosted on GitHub Pages from the root of `main`.

- RU / EN content with a language preference saved locally when available.
- Responsive layout and reduced-motion support.
- No build step. Three.js 0.180.0 is self-hosted in `vendor/` with its MIT license; web fonts fall back to system fonts.

The GitHub profile README is maintained in [matveipasynkov/matveipasynkov](https://github.com/matveipasynkov/matveipasynkov).

The scroll narrative uses one WebGL canvas, bounded perspective framing and reduced-motion support. Desktop lighting uses a self-hosted 1K CC0 studio HDRI by Sergej Majboroda / Poly Haven; attribution is in `assets/THIRD-PARTY.txt`. Mobile uses lighter studio lighting, capped resolution, and no dynamic shadows or fastener detail.

## Case film

An optional 28-second case film opens from the hero in a native modal dialog. Closing it or hiding the page pauses playback; Escape and native focus restoration are supported. RU/EN versions track the site language. The existing scroll story is separate.

The film shows the proposal-builder case: manual preparation, client data, recommendation rules, a schematic tool visualization, and the documented ≈60 → up to 10 minute result. The graphite/acid palette, Manrope type and mp. identity match the site. UI imagery is explicitly schematic, not a screenshot of the production tool.

`studio/film.js` renders Three.js objects with antialiasing, then draws sharp text in a separate 2560×1440 canvas. There is no global blur or bloom. Every frame is exported deterministically at 60 fps, independent of real-time browser performance.

To render: run `python studio/server.py`, open `http://127.0.0.1:8765/studio/`, select a language and click **Экспорт кадров**. Lossless PNG frames are written outside the repository to `../cinema-v5/frames/{ru,en}`. Encode them using ffmpeg at 60 fps, H.264 CRF 14, yuv420p and faststart. The final assets are `assets/resume-story-{ru,en}.mp4` and matching posters. Run `python tools/sound-film.py` (NumPy required) to produce `../cinema-v5/sound.wav` and mux it into both movies. The film includes original synthesized sound accents and a sparse electronic score, with no voice narration. The earlier renderers remain as studies.

GitHub Pages requires no build step.

The native page and dialog scroll rails are hidden while scrolling remains available. Scroll chapters use quiet numbered stage markers instead of progress bars. The introduction has one main case-film action; GitHub remains in the contact links. Continuous backgrounds, a transparent skill ribbon, heading reveals and monotone scene interpolation connect sections.

All scroll-driven elements use `scroll-timeline.js`, a shared smoothed clock. Native wheel, touch and keyboard scrolling remain available. Section titles have restrained depth movement without scaling type. The clock synchronizes after restoring the reading position when animation is toggled.

The film loads Manrope Latin and Cyrillic before creating any textures. Headline widths are measured once with consistent line spacing, and complete glyphs fade into position without clipping. The camera uses bounded Hermite interpolation; rigid cards keep continuous position and scale, including hidden cards. Captions fade as the physical action advances. The export status reports typography QA, and every final movie contains 1,680 deterministic frames.

The 3D pass renders at 3840×2160 before high-quality downsampling into the 1440p film. A studio HDRI, brushed anisotropic metal, rounded machined edges, face insets and physical paper surfaces replace flat generic shading. Presentation labels use Manrope; decorative signature slogans and scroll instructions were removed.

The current film is one continuous 28-second camera journey through a single connected 3D set. Papers leave the source cube, flow in six separated lanes, dock into the builder, and emerge as a finished proposal. Typography accompanies that action; there are no chapter cards, full-screen wipes, or scene resets. The clock contracts from approximately 60 to at most 10 minutes. The finished document turns to reveal the brand. Both languages share identical camera and object choreography.

Completed objects retire physically: the source cube moves out after release, the builder leaves after issuing the result. Six papers retain their row/column identity with shared orientation and positive separation during the entire formation and docking.

The homepage cube uses one shared scroll frame with direct rendering, 1.5 DPR with MSAA, and studio lighting without a second shadow pass. Fine screws are omitted during motion. Cursor response is damped and settles to idle. Holding the hero object separates its layers, release reassembles them; Enter toggles the same interaction and Space supports hold/release. A small point field and rim light follow the interaction. No visible control panel or captions are added. The studio also stops rendering when paused.
