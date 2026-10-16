# Leyi Wang Portfolio Site

This repository contains my personal website at wangleyi.top. It includes interactive physics simulations, statistics tools, computer science projects, and a radar visualization project.

Main sections:
- Physics visualizations
- Statistics calculators and dashboards
- Computer science projects
- Radar hardware/software project

## Code Lab

The CS section links to `pages/code-lab.html`, a restrained VS Code-inspired workspace in dark grayscale. It has a collapsible file sidebar with one draft per language, a current-file tab, lightweight grayscale syntax highlighting, line numbers, auto-indentation, and a compact cursor/status bar. Choose a language, edit code, add optional standard input, and run or stop the program. Output and compiler errors share one panel; input/output can be hidden to focus on editing. Drafts autosave separately for each language. No build step, editor CDN, API key, or execution server is required.

- C++20 and C17: `browsercc@0.1.1` (Clang/LLD compiled to WebAssembly) with `@bjorn3/browser_wasi_shim@0.4.2`. The first run fetches roughly 95 MB of uncompressed toolchain assets. One source file is compiled; common `bits/stdc++.h` headers are provided.
- Python: `pyodide@0.27.7`, with the standard library.
- JavaScript: an isolated browser worker with `stdin`, `readline()`, `print()`, and `console`. No DOM or local module imports.
- Java 8: [CheerpJ 4.3 by Leaning Technologies](https://cheerpj.com/), with the Java compiler from [the official JavaFiddle repository](https://github.com/leaningtech/javafiddle) pinned to revision `741b8ab2782a626a382464fe619a6f099b17a658`. Source is compiled locally, with `Scanner`/`System.in`, stdout, stderr, and compiler diagnostics. The JVM uses `fake-indexeddb@6.2.4` for an entirely in-memory virtual filesystem. First use downloads the runtime and an approximately 18 MB compiler. Only single-file console programs and the Java standard library are supported, not Swing or external JAR dependencies. CheerpJ is hosted by its vendor under its [Community License](https://cheerpj.com/docs/licensing); review licensing before expanding beyond a personal/FOSS project. It is not bundled or redistributed here.

User source executes in a worker inside an opaque-origin sandbox. Each run has a 10-second execution limit (30 seconds for Java, whose runtime loads classes lazily), separate from initial download and compilation, and a 64 KB output limit. Stop destroys the worker. This is a programming playground, not a native shell or step debugger. Runtime assets are loaded from pinned jsDelivr/unpkg URLs, with CheerpJ fetched from its vendor and the Java compiler from pinned jsDelivr/GitHub URLs. Source code is not sent to a compilation API. An internet connection is needed for runtime assets. Browser data is not a permanent backup; copy important source elsewhere.

The CS card uses `?preview=1` to display sample code without exposing locally saved drafts or downloading language runtimes. Code Lab also works when `pages/code-lab.html` is opened directly from disk: the application uses classic deferred scripts and an inline isolated runner, without fetching local files or requiring local ES modules. An HTTP preview is also available by serving the repository (for example `python -m http.server 8000`) and opening `/pages/code-lab.html`.

The minimal editor uses `wangleyi.code-lab.v2` in local storage. On first use it copies one draft per language from the earlier `v1` workspace, preferring its active file. The original `v1` data is retained unchanged, including any extra files.
