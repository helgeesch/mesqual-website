# CLAUDE.md — MESQUAL Website

Public-facing landing page for the MESQUAL framework. Hosted as a static site.

## Purpose

Showcases MESQUAL's platform-agnostic multi-scenario analysis through an interactive code-viewer and module overview. The key demo: identical analysis scripts work across PyPSA and Plexos — only the study setup changes.

## Structure

```
mesqual-website/
├── index.html              # Single-page landing site
├── css/style.css           # All styling (Inter font, dark code theme, responsive)
├── js/main.js              # Tab switching, code loading, preview iframe management
├── code/
│   ├── pypsa/              # PyPSA code snippets (a_study_setup, fetch, heat, line, map)
│   └── plexos/             # Plexos code snippets (same filenames, different flags)
└── previews/               # HTML output previews (fetch, heat, line, map)
```

## Interactive Code-Viewer

Two-pane layout with a preview area below:
- **Left pane**: Study setup — tabs switch between `pypsa` and `plexos` platform setup
- **Right pane**: Analysis scripts — tabs switch between `fetch`, `heat`, `line`, `map`
- **Preview pane**: Shows the HTML output (`previews/{pipeline}.html`) for the selected right-pane tab

The JS loads snippets from `code/{setup}/{pipeline}.py` based on active tabs. Analysis snippets are mini-versions (≤15 lines) of real scripts from `studies/study_04_pypsa_eur_example/scripts/b_post_processing/`.

## Tech Stack

- Pure HTML/CSS/JS (no build step)
- [Lucide](https://lucide.dev/) for icons
- Inter font from Google Fonts
- Python syntax highlighting via custom CSS classes + JS highlighter

## Conventions

- Code snippets must stay ≤15 lines and be self-explanatory
- PyPSA and Plexos snippets for the same tab should be structurally identical — only `import`, dataset class, and flag names differ
- Preview HTML files are standalone (inline styles or load `../css/style.css`)
- Private interfaces (`euphemia`, `mesqual-euphemia`, `mesqual-plexos`) must never appear in public content
