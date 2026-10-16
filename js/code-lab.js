(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const PREVIEW = new URLSearchParams(location.search).has('preview');
  const STORAGE_KEY = 'wangleyi.code-lab.v2';
  const languages = {
    cpp: { name: 'main.cpp', code: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, world!\\n";\n    return 0;\n}\n' },
    c: { name: 'main.c', code: '#include <stdio.h>\n\nint main(void) {\n    printf("Hello, world!\\n");\n    return 0;\n}\n' },
    python: { name: 'main.py', code: 'print("Hello, world!")\n' },
    javascript: { name: 'main.js', code: 'console.log("Hello, world!");\n\n// readline() reads a line from Input.\n// stdin contains all input.\n' },
    java: { name: 'Main.java', code: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, world!");\n    }\n}\n' },
  };
  const state = { version: 2, language: 'cpp', drafts: Object.fromEntries(Object.entries(languages).map(([key, value]) => [key, { ...value, stdin: '' }])) };
  let storageAvailable = true;
  if (!PREVIEW) {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (saved?.version === 2) {
        if (Object.hasOwn(languages, saved.language)) state.language = saved.language;
        for (const language of Object.keys(languages)) {
          const draft = saved.drafts?.[language];
          if (typeof draft?.code === 'string' && draft.code.length <= 500000) {
            state.drafts[language].code = draft.code;
            state.drafts[language].stdin = typeof draft.stdin === 'string' ? draft.stdin.slice(0, 100000) : '';
            if (typeof draft.name === 'string' && /^[\w.-]{1,80}$/.test(draft.name)) state.drafts[language].name = draft.name;
          }
        }
      } else {
        // Keep the original multi-file workspace untouched; copy one draft per language.
        const previous = JSON.parse(localStorage.getItem('wangleyi.code-lab.v1') || 'null');
        if (previous?.version === 1 && Array.isArray(previous.files)) {
          const extension = { cpp: 'cpp', cc: 'cpp', cxx: 'cpp', c: 'c', py: 'python', js: 'javascript', mjs: 'javascript', java: 'java' };
          const files = [...previous.files].sort((a, b) => Number(a.id === previous.activeId) - Number(b.id === previous.activeId));
          for (const file of files) {
            const language = extension[file.name?.split('.').pop()?.toLowerCase()];
            if (!language || typeof file.content !== 'string' || file.content.length > 500000) continue;
            state.drafts[language] = { name: /^[\w.-]{1,80}$/.test(file.name) ? file.name : languages[language].name, code: file.content, stdin: typeof file.stdin === 'string' ? file.stdin.slice(0, 100000) : '' };
            if (file.id === previous.activeId) state.language = language;
          }
        }
      }
    } catch { storageAvailable = false; }
  }
  let saveTimer;
  let running = null;
  const wideLayout = matchMedia('(min-width: 900px)');
  let explorerVisible = wideLayout.matches;
  const draft = () => state.drafts[state.language];
  const limitLabel = () => `${state.language === 'java' ? 30 : 10}s execution limit`;
  const escapeHTML = (text) => text.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const badges = { cpp: 'C++', c: 'C', python: 'PY', javascript: 'JS', java: 'J' };
  const keywordLists = {
    cpp: 'include define if else for while do break continue return switch case default class struct namespace using public private protected virtual const constexpr static void int long short char double float bool auto unsigned signed true false nullptr new delete template typename try catch throw',
    c: 'include define if else for while do break continue return switch case default struct typedef enum const static void int long short char double float unsigned signed sizeof',
    python: 'def class if elif else for while in is not and or return import from as with try except finally raise pass break continue lambda yield global nonlocal async await True False None',
    javascript: 'const let var function class extends new if else for while do break continue return switch case default true false null undefined import export from as async await try catch finally throw typeof instanceof this super',
    java: 'import package class interface extends implements public private protected static final abstract synchronized native void int long short char byte double float boolean if else for while do break continue return switch case default new this super true false null try catch finally throw throws',
  };

  function highlightCode() {
    const source = $('code-input').value;
    const target = $('highlight-text');
    if (source.length > 100000) { target.textContent = source + '\n'; return; }
    const words = new Set(keywordLists[state.language].split(' '));
    const comments = state.language === 'python' ? '#[^\\n]*' : '/\\*[\\s\\S]*?(?:\\*/|$)|//[^\\n]*';
    const strings = String.raw`"""[\s\S]*?(?:"""|$)|'''[\s\S]*?(?:'''|$)|"(?:\\.|[^"\\\r\n])*"|'(?:\\.|[^'\\\r\n])*'|\x60(?:\\[\s\S]|[^\x60\\])*\x60`;
    const tokens = new RegExp(`${comments}|${strings}|\\b\\d+(?:\\.\\d+)?\\b|[A-Za-z_$][\\w$]*`, 'g');
    let result = '';
    let offset = 0;
    for (const match of source.matchAll(tokens)) {
      const text = match[0];
      let kind = '';
      if (text.startsWith('//') || text.startsWith('/*') || (state.language === 'python' && text.startsWith('#'))) kind = 'comment';
      else if (/^["'`]/.test(text)) kind = 'string';
      else if (/^\d/.test(text)) kind = 'number';
      else if (words.has(text)) kind = 'keyword';
      result += escapeHTML(source.slice(offset, match.index));
      result += kind ? `<span class="token-${kind}">${escapeHTML(text)}</span>` : escapeHTML(text);
      offset = match.index + text.length;
    }
    target.innerHTML = result + escapeHTML(source.slice(offset)) + '\n';
  }

  function updateCursor() {
    const input = $('code-input');
    const lines = input.value.slice(0, input.selectionStart).split('\n');
    const row = lines.length;
    $('cursor-position').textContent = `Ln ${row}, Col ${lines.at(-1).length + 1}`;
    $('active-line').style.transform = `translateY(${(row - 1) * 24 - input.scrollTop}px)`;
    const gutter = $('line-numbers');
    gutter.querySelector('.current')?.classList.remove('current');
    gutter.children[row - 1]?.classList.add('current');
  }
  function syncEditorScroll() {
    const input = $('code-input');
    const mirror = $('code-highlight');
    mirror.style.width = `${input.clientWidth}px`;
    mirror.style.height = `${input.clientHeight}px`;
    $('line-numbers').scrollTop = input.scrollTop;
    mirror.scrollTop = input.scrollTop;
    mirror.scrollLeft = input.scrollLeft;
    updateCursor();
  }
  function showExplorer(visible) {
    explorerVisible = visible;
    document.querySelector('.lab').classList.toggle('explorer-hidden', !visible);
    $('explorer-toggle').setAttribute('aria-expanded', String(visible));
    $('explorer-toggle').classList.toggle('active', visible);
  }
  function showConsole(visible) {
    document.querySelector('.workspace').classList.toggle('console-hidden', !visible);
    $('console-toggle').setAttribute('aria-pressed', String(visible));
  }

  function persist() {
    if (PREVIEW) return;
    clearTimeout(saveTimer);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); $('save-state').textContent = 'Saved locally'; document.querySelector('.saved-dot').classList.remove('unsaved'); }
    catch { $('save-state').textContent = 'Local saving unavailable'; }
  }
  function scheduleSave() {
    if (PREVIEW) return;
    $('save-state').textContent = 'Saving…';
    document.querySelector('.saved-dot').classList.add('unsaved');
    clearTimeout(saveTimer);
    saveTimer = setTimeout(persist, 300);
  }
  function updateGutter() {
    $('line-numbers').innerHTML = Array.from({ length: $('code-input').value.split('\n').length }, (_, index) => `<span>${index + 1}</span>`).join('\n');
    highlightCode();
    syncEditorScroll();
  }
  function showLanguage() {
    $('language-select').value = state.language;
    $('code-input').value = draft().code;
    $('code-input').setSelectionRange(0, 0);
    $('stdin-input').value = draft().stdin;
    $('filename').textContent = draft().name;
    $('breadcrumb-file').textContent = draft().name;
    $('tab-icon').textContent = badges[state.language];
    $('language-status').textContent = $('language-select').selectedOptions[0].textContent;
    document.querySelectorAll('.file-button').forEach((button) => {
      const language = button.dataset.language;
      button.querySelector('[data-file-name]').textContent = state.drafts[language].name;
      button.title = state.drafts[language].name;
      button.classList.toggle('active', language === state.language);
      if (language === state.language) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });
    $('code-input').scrollTop = 0;
    $('code-input').scrollLeft = 0;
    $('java-credit').hidden = state.language !== 'java';
    $('runtime-note').hidden = state.language === 'java';
    $('run-time').textContent = limitLabel();
    updateGutter();
  }
  function status(text, busy = false) {
    $('run-result').textContent = text;
    $('run-result').title = text;
    $('run-result').classList.toggle('busy', busy);
  }
  function appendOutput(text) {
    if (typeof text !== 'string') return;
    const output = $('output-text');
    const remaining = 65536 - output.textContent.length;
    output.textContent += text.slice(0, Math.max(0, remaining));
    output.scrollTop = output.scrollHeight;
    if (text.length > remaining && running) stopRun('Output limit exceeded (64 KB)');
  }
  function endRun() {
    if (!running) return;
    clearTimeout(running.timeout);
    running.frame.contentWindow?.postMessage({ type: 'stop', token: running.token }, '*');
    running.frame.remove();
    running = null;
    $('run-button').disabled = false;
    $('stop-button').hidden = true;
  }
  function stopRun(reason = 'Stopped') {
    if (!running) return;
    status(reason);
    $('run-time').textContent = `${((performance.now() - running.start) / 1000).toFixed(1)}s total`;
    endRun();
  }
  function phaseUpdate(phase, detail) {
    if (!running || !['loading', 'compiling', 'running'].includes(phase)) return;
    if (running.phase !== phase) {
      clearTimeout(running.timeout);
      running.phase = phase;
      running.timeout = setTimeout(() => stopRun(`Time limit exceeded during ${phase}`), phase === 'running' ? running.language === 'java' ? 30000 : 10000 : phase === 'compiling' ? 90000 : 240000);
    }
    status(detail || phase, true);
  }
  function runCode() {
    if (running || PREVIEW) return;
    if (draft().code.length > 500000 || draft().stdin.length > 100000) return status('Source limit: 500 KB · Input limit: 100 KB');
    persist();
    showConsole(true);
    $('output-text').textContent = '';
    $('run-time').textContent = limitLabel();
    const frame = document.createElement('iframe');
    frame.className = 'runner-frame';
    frame.title = 'Isolated program runtime';
    frame.setAttribute('sandbox', 'allow-scripts');
    const token = crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
    const job = { language: state.language, name: draft().name, code: draft().code, stdin: draft().stdin, files: [{ name: draft().name, content: draft().code }] };
    const current = running = { frame, token, language: state.language, phase: null, timeout: null, start: performance.now() };
    $('run-button').disabled = true;
    $('stop-button').hidden = false;
    phaseUpdate('loading', 'Starting…');
    try {
      if (!window.CodeLabRuntime) throw new Error('Runtime unavailable. Reload the page and try again.');
      frame.addEventListener('load', () => {
        if (running === current) frame.contentWindow.postMessage({ type: 'start', token, source: CodeLabRuntime.source, job }, '*');
      }, { once: true });
      frame.srcdoc = CodeLabRuntime.document;
      document.body.appendChild(frame);
    } catch (error) { appendOutput(error.message); status('Could not start'); endRun(); }
  }
  addEventListener('message', ({ source, data }) => {
    if (!running || source !== running.frame.contentWindow || data?.channel !== 'code-lab' || data.token !== running.token) return;
    if (data.type === 'stage') phaseUpdate(data.phase, data.detail);
    if (data.type === 'output' || data.type === 'diagnostics') appendOutput(data.text);
    if (data.type === 'error') { appendOutput(`${data.message}\n`); status('Error'); endRun(); }
    if (data.type === 'done' && running) {
      status(data.compilationFailed ? 'Compilation failed' : `Exit code ${Number(data.exitCode) || 0}`);
      $('run-time').textContent = `${((performance.now() - running.start) / 1000).toFixed(1)}s total`;
      endRun();
    }
  });
  function selectLanguage(language) {
    if (running) stopRun();
    state.language = language;
    showLanguage();
    $('output-text').textContent = '';
    status('Ready');
    $('run-time').textContent = limitLabel();
    scheduleSave();
    if (!wideLayout.matches) showExplorer(false);
  }
  $('language-select').addEventListener('change', (event) => selectLanguage(event.target.value));
  document.querySelectorAll('.file-button').forEach((button) => button.addEventListener('click', () => selectLanguage(button.dataset.language)));
  $('explorer-toggle').addEventListener('click', () => showExplorer(!explorerVisible));
  $('console-toggle').addEventListener('click', () => showConsole($('console-toggle').getAttribute('aria-pressed') !== 'true'));
  wideLayout.addEventListener('change', () => showExplorer(wideLayout.matches));
  document.querySelector('.workspace').addEventListener('pointerdown', () => { if (!wideLayout.matches) showExplorer(false); });
  $('code-input').addEventListener('input', () => { draft().code = $('code-input').value; updateGutter(); scheduleSave(); });
  $('code-input').addEventListener('scroll', syncEditorScroll);
  $('code-input').addEventListener('keyup', updateCursor);
  $('code-input').addEventListener('click', updateCursor);
  $('code-input').addEventListener('select', updateCursor);
  $('code-input').addEventListener('keydown', (event) => {
    if (event.isComposing || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
    const input = event.target;
    let insertion;
    if (event.key === 'Tab') insertion = '    ';
    if (event.key === 'Enter') {
      const line = input.value.slice(0, input.selectionStart).split('\n').at(-1);
      const indent = line.match(/^\s*/)[0];
      insertion = '\n' + indent + (/[{[(]\s*$/.test(line) || (state.language === 'python' && /:\s*$/.test(line)) ? '    ' : '');
    }
    if (insertion === undefined) return;
    event.preventDefault();
    // Native insertion keeps indentation in the browser's normal undo history.
    if (!document.execCommand('insertText', false, insertion)) {
      input.setRangeText(insertion, input.selectionStart, input.selectionEnd, 'end');
      input.dispatchEvent(new Event('input'));
    }
  });
  $('stdin-input').addEventListener('input', () => { draft().stdin = $('stdin-input').value; scheduleSave(); });
  $('run-button').addEventListener('click', runCode);
  $('stop-button').addEventListener('click', () => stopRun());
  $('clear-output').addEventListener('click', () => { $('output-text').textContent = ''; });
  addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); runCode(); }
    if (event.key === 'Escape') { stopRun(); if (!wideLayout.matches) showExplorer(false); }
  });
  addEventListener('pagehide', () => { persist(); endRun(); });
  showLanguage();
  showExplorer(explorerVisible);
  new ResizeObserver(syncEditorScroll).observe(document.querySelector('.code-area'));
  document.querySelector('.code-area').classList.add('highlight-enabled');
  if (!storageAvailable) $('save-state').textContent = 'Local saving unavailable';
  if (PREVIEW) {
    $('save-state').textContent = 'Browser playground';
    $('run-button').disabled = true;
    $('code-input').readOnly = true;
    $('stdin-input').readOnly = true;
    $('language-select').disabled = true;
  }
})();
