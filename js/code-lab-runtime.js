// Loaded as a classic script so file:// previews work without module/fetch access.
// Only serialized here; the runtime body executes inside an isolated worker.
(function () {
function codeLabWorkerRuntime() {
// Runtime versions are pinned; no user source is submitted to a remote runner.
const CDN_HOSTS = ['https://cdn.jsdelivr.net/npm/', 'https://unpkg.com/'];
const COMPILER_PACKAGE = 'browsercc@0.1.1/dist/';
const WASI_PACKAGE = '@bjorn3/browser_wasi_shim@0.4.2/dist/index.js';
const PYTHON_PACKAGE = 'pyodide@0.27.7/';
const nativeFetch = globalThis.fetch.bind(globalThis);
const encoder = new TextEncoder();
const send = (data) => postMessage(data);
const stage = (phase, detail) => send({ type: 'stage', phase, detail });
const assets = new Map();
let downloaded = 0;
let lastProgress = 0;
let outputSize = 0;
let pendingOutput = '';
let pendingStream = 'stdout';
let flushTimer;

function flushOutput() {
  clearTimeout(flushTimer);
  if (pendingOutput) send({ type: 'output', stream: pendingStream, text: pendingOutput });
  pendingOutput = '';
}

function output(text, stream = 'stdout') {
  text = String(text);
  outputSize += text.length;
  if (outputSize > 65536) throw new Error('Output limit exceeded (64 KB). Reduce your output and run again.');
  if (pendingStream !== stream) flushOutput();
  pendingStream = stream;
  pendingOutput += text;
  if (pendingOutput.length >= 2048) flushOutput();
  else { clearTimeout(flushTimer); flushTimer = setTimeout(flushOutput, 32); }
}

async function importRuntime(packagePath) {
  let failure;
  for (const host of CDN_HOSTS) {
    try { return { module: await import(host + packagePath), host }; }
    catch (error) { failure = error; }
  }
  throw new Error(`Could not download the runtime. Check your connection to jsDelivr / unpkg, then retry. ${failure?.message || ''}`);
}

async function binary(packagePath, preferredHost, label) {
  let failure;
  for (const host of [...new Set([preferredHost, ...CDN_HOSTS])]) {
    try {
      const response = await nativeFetch(host + packagePath, { signal: AbortSignal.timeout(120000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const reader = response.body.getReader();
      const chunks = [];
      let size = 0;
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        chunks.push(value);
        size += value.length;
        downloaded += value.length;
        if (performance.now() - lastProgress > 350) {
          lastProgress = performance.now();
          stage('loading', `${label} · ${(downloaded / 1048576).toFixed(1)} MB received`);
        }
      }
      const bytes = new Uint8Array(size);
      let offset = 0;
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
      return bytes;
    } catch (error) { failure = error; }
  }
  throw new Error(`Unable to load ${label}: ${failure?.message || 'network error'}`);
}

globalThis.fetch = async (input, options) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  const name = url?.split('/').pop();
  if (url?.includes(COMPILER_PACKAGE) && assets.has(name)) {
    return new Response(assets.get(name), { headers: { 'content-type': name.endsWith('.wasm') ? 'application/wasm' : 'application/octet-stream' } });
  }
  return nativeFetch(input, options);
};

const bitsHeader = `#pragma once
#include <algorithm>
#include <array>
#include <bitset>
#include <cmath>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <deque>
#include <functional>
#include <iomanip>
#include <iostream>
#include <limits>
#include <map>
#include <numeric>
#include <queue>
#include <set>
#include <sstream>
#include <stack>
#include <string>
#include <tuple>
#include <unordered_map>
#include <unordered_set>
#include <utility>
#include <vector>
`;

async function runCompiled(job) {
  stage('loading', 'Preparing C/C++ compiler · first run downloads about 95 MB');
  const [{ module: compiler, host }, { module: shim }] = await Promise.all([
    importRuntime(COMPILER_PACKAGE + 'index.js'), importRuntime(WASI_PACKAGE),
  ]);
  await Promise.all(['clang.wasm', 'lld.wasm', 'sysroot.tar'].map(async (name) => {
    assets.set(name, await binary(COMPILER_PACKAGE + name, host, 'C/C++ runtime'));
  }));
  stage('compiling', `Compiling ${job.name}…`);
  const compileStart = performance.now();
  const extraFiles = Object.fromEntries(job.files.filter((file) => file.name !== job.name).map((file) => [file.name, file.content]));
  extraFiles['bits/stdc++.h'] = bitsHeader;
  const flags = [job.language === 'c' ? '-std=c17' : '-std=c++20', '-O0', '-fno-color-diagnostics', '-I', '/'];
  if (job.language === 'c') flags.unshift('--driver-mode=gcc');
  else flags.push('-fno-exceptions');
  const { module, compileOutput } = await compiler.compile({ source: job.code, fileName: job.name, flags, extraFiles });
  const compileMs = performance.now() - compileStart;
  assets.clear();
  const diagnostics = compileOutput.replace(/\x1b\[[0-9;]*m/g, '');
  if (diagnostics.trim()) send({ type: 'diagnostics', text: diagnostics });
  if (!module) return { exitCode: 1, compilationFailed: true, compileMs, durationMs: 0 };
  stage('running', `Running ${job.name}…`);
  const stdout = new TextDecoder();
  const stderr = new TextDecoder();
  const files = job.files.map((file) => [file.name, new shim.File(encoder.encode(file.content))]);
  const fds = [
    new shim.OpenFile(new shim.File(encoder.encode(job.stdin))),
    new shim.ConsoleStdout((bytes) => output(stdout.decode(bytes, { stream: true }))),
    new shim.ConsoleStdout((bytes) => output(stderr.decode(bytes, { stream: true }), 'stderr')),
    new shim.PreopenDirectory('.', files),
  ];
  const wasi = new shim.WASI([job.name], [], fds);
  const instance = await WebAssembly.instantiate(module, { wasi_snapshot_preview1: wasi.wasiImport });
  const start = performance.now();
  const exitCode = wasi.start(instance);
  output(stdout.decode());
  output(stderr.decode(), 'stderr');
  return { exitCode: typeof exitCode === 'number' ? exitCode : 0, durationMs: performance.now() - start, compileMs };
}

async function runPython(job) {
  stage('loading', 'Preparing Python · first run downloads the Python runtime');
  const { module: { loadPyodide }, host } = await importRuntime(PYTHON_PACKAGE + 'pyodide.mjs');
  const py = await loadPyodide({ indexURL: host + PYTHON_PACKAGE });
  const stdout = new TextDecoder();
  const stderr = new TextDecoder();
  py.setStdout({ write: (bytes) => { output(stdout.decode(bytes, { stream: true })); return bytes.length; } });
  py.setStderr({ write: (bytes) => { output(stderr.decode(bytes, { stream: true }), 'stderr'); return bytes.length; } });
  const inputBytes = encoder.encode(job.stdin);
  let offset = 0;
  py.setStdin({ read: (buffer) => { const count = Math.min(buffer.length, inputBytes.length - offset); buffer.set(inputBytes.subarray(offset, offset + count)); offset += count; return count; }, isatty: false });
  py.FS.mkdirTree('/workspace');
  py.FS.chdir('/workspace');
  for (const file of job.files) py.FS.writeFile('/workspace/' + file.name, file.content);
  py.runPython("import sys; sys.path.insert(0, '/workspace')");
  py.globals.set('__lab_source', job.code);
  py.globals.set('__lab_filename', job.name);
  stage('running', `Running ${job.name}…`);
  const start = performance.now();
  const exitCode = await py.runPythonAsync(`
import sys
__lab_exit = 0
__lab_namespace = {'__name__': '__main__', '__file__': __lab_filename}
try:
    exec(compile(__lab_source, __lab_filename, 'exec'), __lab_namespace)
except SystemExit as error:
    if isinstance(error.code, int):
        __lab_exit = error.code
    elif error.code is not None:
        print(error.code, file=sys.stderr)
        __lab_exit = 1
finally:
    sys.stdout.flush()
    sys.stderr.flush()
__lab_exit
`);
  output(stdout.decode());
  output(stderr.decode(), 'stderr');
  return { exitCode, durationMs: performance.now() - start };
}

function describe(value) {
  if (typeof value === 'string') return value;
  if (typeof value === 'undefined') return 'undefined';
  try { return JSON.stringify(value, null, 2) ?? String(value); } catch { return String(value); }
}

async function runJavaScript(job) {
  stage('running', `Running ${job.name}…`);
  const lines = job.stdin.replace(/\r\n/g, '\n').split('\n');
  if (!job.stdin || job.stdin.endsWith('\n')) lines.pop();
  let index = 0;
  const print = (...items) => output(items.map(describe).join(' ') + '\n');
  const logError = (...items) => output(items.map(describe).join(' ') + '\n', 'stderr');
  const console = { log: print, info: print, debug: print, warn: logError, error: logError, table: print, clear: () => {} };
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
  const program = new AsyncFunction('stdin', 'readline', 'print', 'console', `"use strict";\n${job.code}\n//# sourceURL=${job.name}`);
  const start = performance.now();
  await program(job.stdin, () => lines[index++] ?? null, print, console);
  return { exitCode: 0, durationMs: performance.now() - start };
}

async function runJava(job) {
  stage('loading', 'Loading Java · first run may take a moment…');
  // An in-memory IndexedDB keeps the JVM's virtual files inside this run only.
  // The opaque sandbox still cannot access any website/browser storage.
  const { module: memoryDB } = await importRuntime('fake-indexeddb@6.2.4/+esm');
  Object.defineProperty(self, 'indexedDB', { value: memoryDB.indexedDB });
  self.IDBKeyRange = memoryDB.IDBKeyRange;
  importScripts('https://cjrtnc.leaningtech.com/4.3/loader.js');
  const javaDecoders = [new TextDecoder(), new TextDecoder()];
  await cheerpjInit({
    version: 8, status: 'none', clipboardMode: 'java',
    natives: {
      async Java_WangleyiCodeLabRunner_emit(_lib, bytes, offset, length, stream) {
        const chunk = new Uint8Array(length);
        for (let i = 0; i < length; i++) chunk[i] = bytes[offset + i] & 255;
        output(javaDecoders[stream].decode(chunk, { stream: true }), stream ? 'stderr' : 'stdout');
      },
    },
  });

  const revision = '741b8ab2782a626a382464fe619a6f099b17a658';
  const compilerUrls = [
    `https://cdn.jsdelivr.net/gh/leaningtech/javafiddle@${revision}/static/tools.jar`,
    `https://raw.githubusercontent.com/leaningtech/javafiddle/${revision}/static/tools.jar`,
  ];
  let tools;
  for (const url of compilerUrls) {
    try {
      const response = await nativeFetch(url, { signal: AbortSignal.timeout(120000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      tools = new Uint8Array(await response.arrayBuffer());
      break;
    } catch { /* Try the other pinned mirror. */ }
  }
  if (!tools) throw new Error('Java compiler could not load. Check your connection and try again.');
  cheerpOSAddStringFile('/str/tools.jar', tools);
  const clean = job.code.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, ' ');
  const className = clean.match(/\bpublic\s+(?:(?:final|abstract|strictfp)\s+)*class\s+([\w$]+)/)?.[1]
    || clean.match(/\bclass\s+([\w$]+)/)?.[1] || 'Main';
  const packageName = clean.match(/\bpackage\s+([\w.]+)\s*;/)?.[1];
  const entry = packageName ? `${packageName}.${className}` : className;
  const sourcePath = `/str/${className}.java`;
  cheerpOSAddStringFile(sourcePath, encoder.encode(job.code));
  cheerpOSAddStringFile('/str/stdin.txt', encoder.encode(job.stdin));
  // RunMain creates its own Java session, so stdin must be set in that session.
  cheerpOSAddStringFile('/str/WangleyiCodeLabRunner.java', `
public class WangleyiCodeLabRunner {
    private static native void emit(byte[] bytes, int offset, int length, int stream);
    private static class Console extends java.io.OutputStream {
        private final int stream;
        Console(int stream) { this.stream = stream; }
        public void write(int value) { emit(new byte[] { (byte) value }, 0, 1, stream); }
        public void write(byte[] bytes, int offset, int length) { emit(bytes, offset, length, stream); }
    }
    public static void main(String[] args) throws Throwable {
        System.setIn(new java.io.FileInputStream("/str/stdin.txt"));
        System.setOut(new java.io.PrintStream(new Console(0), true, "UTF-8"));
        System.setErr(new java.io.PrintStream(new Console(1), true, "UTF-8"));
        try {
            java.lang.reflect.Method main = Class.forName(args[0]).getDeclaredMethod("main", String[].class);
            main.setAccessible(true);
            main.invoke(null, (Object) new String[0]);
        } catch (java.lang.reflect.InvocationTargetException error) {
            throw error.getCause();
        }
    }
}`);

  let compiling = true;
  // CheerpJ writes print() chunks and newline chunks separately. Preserve both.
  const javaOutput = (...items) => {
    const text = items.map(String).join(' ');
    if (compiling && text !== 'CheerpJ runtime ready' && text !== 'Class is loaded, main is starting') send({ type: 'diagnostics', text });
  };
  console.log = javaOutput;
  console.error = javaOutput;
  console.warn = javaOutput;
  stage('compiling', `Compiling ${className}.java…`);
  const compileStart = performance.now();
  const compileExit = await cheerpjRunMain('com.sun.tools.javac.Main', '/str/tools.jar', '-encoding', 'UTF-8', '-d', '/files/', sourcePath, '/str/WangleyiCodeLabRunner.java');
  const compileMs = performance.now() - compileStart;
  if (compileExit !== 0) return { exitCode: compileExit, compilationFailed: true, compileMs, durationMs: 0 };
  compiling = false;
  stage('running', `Running ${className}.java…`);
  const start = performance.now();
  const exitCode = await cheerpjRunMain('WangleyiCodeLabRunner', '/files/', entry);
  output(javaDecoders[0].decode());
  output(javaDecoders[1].decode(), 'stderr');
  return { exitCode, durationMs: performance.now() - start, compileMs };
}

self.onmessage = async ({ data: job }) => {
  try {
    const result = job.language === 'javascript' ? await runJavaScript(job) : job.language === 'python' ? await runPython(job) : job.language === 'java' ? await runJava(job) : await runCompiled(job);
    flushOutput();
    send({ type: 'done', ...result });
  } catch (error) {
    flushOutput();
    send({ type: 'error', message: String(error?.message || error) });
  }
};
}

function codeLabFrameBridge() {
  let worker;
  let workerUrl;
  let activeToken;
  addEventListener('message', (event) => {
    if (event.source !== parent) return;
    if (event.data?.type === 'stop' && event.data.token === activeToken) { worker?.terminate(); return; }
    if (event.data?.type !== 'start' || worker) return;
    const { token, source, job } = event.data;
    activeToken = token;
    const send = (payload) => parent.postMessage({ ...payload, channel: 'code-lab', token }, '*');
    try {
      workerUrl = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
      worker = new Worker(workerUrl, { name: 'code-lab-program' });
      worker.onmessage = ({ data }) => send(data);
      worker.onerror = (error) => { error.preventDefault(); send({ type: 'error', message: error.message || 'The runtime could not start.' }); };
      worker.postMessage(job);
    } catch (error) { send({ type: 'error', message: error.message }); }
  });
  addEventListener('pagehide', () => { worker?.terminate(); if (workerUrl) URL.revokeObjectURL(workerUrl); });
  addEventListener('unload', () => worker?.terminate());
}

window.CodeLabRuntime = Object.freeze({
  source: `(${codeLabWorkerRuntime.toString()})();`,
  document: `<!doctype html><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' blob: https://cdn.jsdelivr.net https://unpkg.com https://cjrtnc.leaningtech.com; worker-src blob:; connect-src https://cdn.jsdelivr.net https://unpkg.com https://cjrtnc.leaningtech.com https://raw.githubusercontent.com; base-uri 'none'; form-action 'none'"><title>Code Lab isolated runner</title><script>(${codeLabFrameBridge.toString()})();<\/script>`,
});
})();
