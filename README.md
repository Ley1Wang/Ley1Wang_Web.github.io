# Leyi Wang Portfolio Site

This repository contains my personal website at wangleyi.top. It includes interactive physics simulations, statistics tools, computer science projects, and a radar visualization project.

Main sections:

- Physics visualizations
- Statistics calculators and dashboards
- Computer science projects
- Radar hardware/software project

## Shared presentation

The portfolio is buildless HTML, CSS, and JavaScript. The home page and the three collections use a restrained paper-white/forest-green design; the experiments share navigation, responsive controls, contextual notes, and related-project links. Code Lab keeps its separate dark editor interface.

- `assets/site.css`: shared visual system, home/collection layouts, and presentation overrides for existing tools.
- `js/site-content.js`: project descriptions, execution modes, suggested experiments, observation prompts, and scope notes. These are static editorial data, not visitor data.
- `js/site.js`: navigation/footer, mobile menu, collection search/topic filtering, and experiment context. Classic deferred scripts also allow the main presentation to open from disk.
- `assets/previews/`: 27 compressed JPEG captures of the actual project interfaces (about 1 MB combined), replacing nested live iframes on collection pages. The main radar photo is the original hardware image.

Collection cards remain ordinary HTML so their content and links are readable without JavaScript. Keep their copy consistent with `site-content.js` when editing descriptions. Tools that fetch bundled JSON should be previewed through HTTP; a browser can block those fetches on `file://`.

Projects are explicitly labeled as browser tools, archived data, simulated requests, or local-service integrations. The public radar sweep is a demonstration, and digit recognition needs the local trained-model service. The public website does not start services, run crawlers, train models, or connect hardware automatically. The local AI workspace is identified as an ongoing project rather than a finished service.

Polish also includes finite-number feedback and sample data for regression, a distinct-x fit guard, clearer induction assumptions, invalid-table/resampling feedback, a confidence-interval visualization that responds to the inputs, safe table-row rendering, and corrected local inference routing when previewing the portfolio on a port other than 5000.

## Project-internal refinements

The project pages prioritize explicit units, states, assumptions, and inspectable results, without adding another visual redesign:

- Freefall (`js/freefalling.js`): constant-gravity motion ends at physical impact, independent of the responsive drawing height. It supports pause/resume, playback speed, finite height bounds, labeled numeric axes, 0.1-second trial sampling, and CSV export with an exact impact endpoint. Editing parameters starts a fresh trial; hiding the tab pauses playback.
- Thin lens (`js/lens-lab.js`): signed image distance and magnification, real/virtual/focal presets, dashed virtual-ray extensions, automatic diagram fitting, explicit off-screen states, and a singular focus state rather than fabricated finite values.
- Sorting (`js/sorting-lab.js`): generator-driven single-step/pause/resume, safe cancellation, a reusable starting array, numeric array inspection, per-input comparison records, and explicit value-comparison / array-write conventions. Animation delay is not a speed benchmark.
- Sampling (`js/clt-lab.js`): a reproducible 32-bit seed, bounded integer inputs, theoretical population mean/SE versus observed results, relative-frequency histogram axes, an optional scaled normal reference, and raw-means CSV exports with run metadata.
- API inspector (`js/api-lab.js`): explicit GET/POST handling, query/JSON/schema validation, deterministic page-memory fixtures and creations, 201/400/405 outcomes, response headers, and reset behavior. It performs no actual API requests and invents no measured latency.

The lens, sorting, and sampling canvases redraw for the actual display width and device pixel ratio, keeping labels readable on narrow/high-density screens. Model equations, counter definitions, and assumptions are placed in compact expandable notes rather than decorative panels. All five refined projects can also be opened directly from their local HTML files.

## Code Lab

The CS section links to `pages/code-lab.html`, a restrained VS Code-inspired workspace in dark grayscale. It has a collapsible file sidebar with one draft per language, a current-file tab, lightweight grayscale syntax highlighting, line numbers, auto-indentation, and a compact cursor/status bar. Choose a language, edit code, add optional standard input, and run or stop the program. Output and compiler errors share one panel; input/output can be hidden to focus on editing. Drafts autosave separately for each language. No build step, editor CDN, API key, or execution server is required.

- C++20 and C17: `browsercc@0.1.1` (Clang/LLD compiled to WebAssembly) with `@bjorn3/browser_wasi_shim@0.4.2`. The first run fetches roughly 95 MB of uncompressed toolchain assets. One source file is compiled; common `bits/stdc++.h` headers are provided.
- Python: `pyodide@0.27.7`, with the standard library.
- JavaScript: an isolated browser worker with `stdin`, `readline()`, `print()`, and `console`. No DOM or local module imports.
- Java 8: [CheerpJ 4.3 by Leaning Technologies](https://cheerpj.com/), with the Java compiler from [the official JavaFiddle repository](https://github.com/leaningtech/javafiddle) pinned to revision `741b8ab2782a626a382464fe619a6f099b17a658`. Source is compiled locally, with `Scanner`/`System.in`, stdout, stderr, and compiler diagnostics. The JVM uses `fake-indexeddb@6.2.4` for an entirely in-memory virtual filesystem. First use downloads the runtime and an approximately 18 MB compiler. Only single-file console programs and the Java standard library are supported, not Swing or external JAR dependencies. CheerpJ is hosted by its vendor under its [Community License](https://cheerpj.com/docs/licensing); review licensing before expanding beyond a personal/FOSS project. It is not bundled or redistributed here.

User source executes in a worker inside an opaque-origin sandbox. Each run has a 10-second execution limit (30 seconds for Java, whose runtime loads classes lazily), separate from initial download and compilation, and a 64 KB output limit. Stop destroys the worker. This is a programming playground, not a native shell or step debugger. Runtime assets are loaded from pinned jsDelivr/unpkg URLs, with CheerpJ fetched from its vendor and the Java compiler from pinned jsDelivr/GitHub URLs. Source code is not sent to a compilation API. An internet connection is needed for runtime assets. Browser data is not a permanent backup; copy important source elsewhere.

The CS card uses `?preview=1` to display sample code without exposing locally saved drafts or downloading language runtimes. Code Lab also works when `pages/code-lab.html` is opened directly from disk: the application uses classic deferred scripts and an inline isolated runner, without fetching local files or requiring local ES modules. An HTTP preview is also available by serving the repository (for example `python -m http.server 8000`) and opening `/pages/code-lab.html`.

The minimal editor uses `wangleyi.code-lab.v2` in local storage. On first use it copies one draft per language from the earlier `v1` workspace, preferring its active file. The original `v1` data is retained unchanged, including any extra files.
