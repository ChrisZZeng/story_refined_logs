import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import YAML from 'yaml';

import { loadPromptSources } from '../../scripts/prompt-replay-workbench/prompt-source.mjs';

async function makeFixture() {
  return mkdtemp(path.join(tmpdir(), 'prompt-source-'));
}

async function writeYamlConfig({ dir, file, symbol = 'buildPrompt', id = 'source.a' }) {
  const configPath = path.join(dir, 'prompt-sources.yaml');
  await writeFile(
    configPath,
    [
      'promptSources:',
      `  - id: ${id}`,
      '    label: Source A',
      '    stage: narrator',
      `    file: ${JSON.stringify(file)}`,
      '    extract:',
      '      type: function-body-return-array',
      `      symbol: ${symbol}`,
    ].join('\n'),
  );
  return configPath;
}

test('loadPromptSources extracts a joined return array from a function declaration', async () => {
  const dir = await makeFixture();
  const promptFile = path.join(dir, 'prompts.mts');
  await writeFile(
    promptFile,
    [
      'function buildPrompt() {',
      '  return [',
      "    'Line one',",
      '    `Line two`,',
      '    "Line three",',
      "  ].join('\\n');",
      '}',
    ].join('\n'),
  );
  const configPath = await writeYamlConfig({ dir, file: promptFile });

  const sources = await loadPromptSources({ configPath, oreturnRepo: dir });

  assert.equal(sources.length, 1);
  assert.deepEqual(
    {
      id: sources[0].id,
      label: sources[0].label,
      stage: sources[0].stage,
      file: sources[0].file,
      symbol: sources[0].symbol,
      originalText: sources[0].originalText,
      draftText: sources[0].draftText,
      dirty: sources[0].dirty,
    },
    {
      id: 'source.a',
      label: 'Source A',
      stage: 'narrator',
      file: promptFile,
      symbol: 'buildPrompt',
      originalText: 'Line one\nLine two\nLine three',
      draftText: 'Line one\nLine two\nLine three',
      dirty: false,
    },
  );
  assert.match(sources[0].sourceHash, /^sha256:[a-f0-9]{64}$/);
});

test('loadPromptSources supports export function and const arrow declarations', async () => {
  const dir = await makeFixture();
  const promptFile = path.join(dir, 'prompts.mts');
  await writeFile(
    promptFile,
    [
      'export function buildExportedPrompt() {',
      '  return ["Exported"].join("\\n");',
      '}',
      'export const buildArrowPrompt = (name) => {',
      '  return [',
      '    `Arrow ${name}`,',
      "    'Tail',",
      '  ].join("\\n");',
      '};',
    ].join('\n'),
  );
  const configPath = path.join(dir, 'prompt-sources.yaml');
  await writeFile(
    configPath,
    [
      'promptSources:',
      '  - id: exported',
      '    label: Exported',
      '    stage: director',
      `    file: ${JSON.stringify(promptFile)}`,
      '    extract:',
      '      type: function-body-return-array',
      '      symbol: buildExportedPrompt',
      '  - id: arrow',
      '    label: Arrow',
      '    stage: narrator',
      `    file: ${JSON.stringify(promptFile)}`,
      '    extract:',
      '      type: function-body-return-array',
      '      symbol: buildArrowPrompt',
    ].join('\n'),
  );

  const sources = await loadPromptSources({ configPath, oreturnRepo: dir });

  assert.equal(sources[0].originalText, 'Exported');
  assert.equal(sources[1].originalText, 'Arrow ${name}\nTail');
});

test('loadPromptSources extracts a joined return array wrapped in a helper call', async () => {
  const dir = await makeFixture();
  const promptFile = path.join(dir, 'prompts.mts');
  await writeFile(
    promptFile,
    [
      'export function buildPrompt() {',
      "  return renderPromptBlock('protocol', [",
      "    'Wrapped one',",
      "    'Wrapped two',",
      "  ].join('\\n'));",
      '}',
    ].join('\n'),
  );
  const configPath = await writeYamlConfig({ dir, file: promptFile });

  const sources = await loadPromptSources({ configPath, oreturnRepo: dir });

  assert.equal(sources[0].originalText, 'Wrapped one\nWrapped two');
});

test('loadPromptSources expands renderPromptBlock and local prompt helper calls', async () => {
  const dir = await makeFixture();
  const promptFile = path.join(dir, 'prompts.mts');
  await writeFile(
    promptFile,
    [
      'export function buildPrompt() {',
      '  return [',
      "    renderPromptBlock('system_context', [",
      "      'System one',",
      "      'System two',",
      "    ].join('\\n')),",
      "    renderPromptBlock('rules', renderRules(), 'Intro text'),",
      "  ].join('\\n\\n');",
      '}',
      'function renderRules() {',
      '  return [',
      "    'Rule one',",
      "    'Rule two',",
      "  ].join('\\n');",
      '}',
    ].join('\n'),
  );
  const configPath = await writeYamlConfig({ dir, file: promptFile });

  const sources = await loadPromptSources({ configPath, oreturnRepo: dir });

  assert.equal(
    sources[0].originalText,
    [
      '<system_context>',
      'System one',
      'System two',
      '</system_context>',
      '',
      '<rules>',
      'Intro text',
      '',
      'Rule one',
      'Rule two',
      '</rules>',
    ].join('\n'),
  );
});

test('loadPromptSources falls back to an older prompt symbol name', async () => {
  const dir = await makeFixture();
  const promptFile = path.join(dir, 'prompts.mts');
  await writeFile(
    promptFile,
    [
      'function buildOldPrompt() {',
      '  return [',
      "    'Old one',",
      "    'Old two',",
      "  ].join('\\n');",
      '}',
    ].join('\n'),
  );
  const configPath = await writeYamlConfig({ dir, file: promptFile, symbol: 'buildNewPrompt' });
  const configText = await import('node:fs/promises').then(({ readFile }) => readFile(configPath, 'utf8'));
  await writeFile(configPath, `${configText}\n      fallbackSymbols:\n        - buildOldPrompt\n`);

  const sources = await loadPromptSources({ configPath, oreturnRepo: dir });

  assert.equal(sources[0].symbol, 'buildNewPrompt');
  assert.equal(sources[0].originalText, 'Old one\nOld two');
});

test('loadPromptSources ignores return-like text inside strings and comments', async () => {
  const dir = await makeFixture();
  const promptFile = path.join(dir, 'prompts.mts');
  await writeFile(
    promptFile,
    [
      'export function buildPrompt() {',
      '  const sample = "return [\'wrong string\'].join(\'\\\\n\')";',
      '  // return ["wrong comment"].join("\\n")',
      '  return [',
      "    'Right one',",
      "    'Right two',",
      "  ].join('\\n');",
      '}',
    ].join('\n'),
  );
  const configPath = await writeYamlConfig({ dir, file: promptFile });

  const sources = await loadPromptSources({ configPath, oreturnRepo: dir });

  assert.equal(sources[0].originalText, 'Right one\nRight two');
});

test('loadPromptSources resolves relative source files against oreturnRepo', async () => {
  const dir = await makeFixture();
  const oreturnRepo = path.join(dir, 'oreturn');
  const relativeFile = 'packages/core/prompts.mts';
  const promptFile = path.join(oreturnRepo, relativeFile);
  await mkdir(path.dirname(promptFile), { recursive: true });
  await writeFile(promptFile, 'function buildPrompt() { return ["Relative"].join("\\n"); }\n');
  const configPath = await writeYamlConfig({ dir, file: relativeFile });

  const sources = await loadPromptSources({ configPath, oreturnRepo });

  assert.equal(sources[0].file, promptFile);
  assert.equal(sources[0].originalText, 'Relative');
});

test('default prompt sources list prompt fragments that are present in replay calls', async () => {
  const configPath = path.resolve('scripts/prompt-replay-workbench/default-prompt-sources.yaml');
  const config = YAML.parse(await readFile(configPath, 'utf8'));

  assert.deepEqual(
    config.promptSources.map((source) => source.id),
    [
      'narrator.v3-html-protocol',
      'narrator.v3-html-tail',
      'choice.system',
      'choice.judgement-flow',
      'director.system',
      'director.output-guidance',
      'director.output-discipline',
      'director.checklist',
    ],
  );
});

test('loadPromptSources throws PROMPT_SOURCE_EXTRACT_FAILED when symbol is missing', async () => {
  const dir = await makeFixture();
  const promptFile = path.join(dir, 'prompts.mts');
  await writeFile(promptFile, 'function otherPrompt() { return ["Nope"].join("\\n"); }\n');
  const configPath = await writeYamlConfig({ dir, file: promptFile, symbol: 'buildMissingPrompt' });

  await assert.rejects(
    () => loadPromptSources({ configPath, oreturnRepo: dir }),
    (error) => {
      assert.equal(error.code, 'PROMPT_SOURCE_EXTRACT_FAILED');
      assert.equal(error.sourceId, 'source.a');
      assert.equal(error.file, promptFile);
      assert.equal(error.symbol, 'buildMissingPrompt');
      return true;
    },
  );
});

test('loadPromptSources can mark incompatible sources unavailable when allowed', async () => {
  const dir = await makeFixture();
  const promptFile = path.join(dir, 'prompts.mts');
  await writeFile(promptFile, 'function otherPrompt() { return ["Nope"].join("\\n"); }\n');
  const configPath = await writeYamlConfig({ dir, file: promptFile, symbol: 'buildMissingPrompt' });

  const sources = await loadPromptSources({ configPath, oreturnRepo: dir, allowUnavailable: true });

  assert.equal(sources.length, 1);
  assert.equal(sources[0].id, 'source.a');
  assert.equal(sources[0].unavailable, true);
  assert.equal(sources[0].unavailableCode, 'PROMPT_SOURCE_EXTRACT_FAILED');
  assert.match(sources[0].unavailableReason, /Failed to extract prompt source source\.a/);
  assert.equal(sources[0].originalText, '');
  assert.equal(sources[0].draftText, '');
  assert.equal(sources[0].dirty, false);
});

test('loadPromptSources throws PROMPT_SOURCE_READ_FAILED when source file does not exist', async () => {
  const dir = await makeFixture();
  const missingFile = path.join(dir, 'missing.mts');
  const configPath = await writeYamlConfig({ dir, file: missingFile });

  await assert.rejects(
    () => loadPromptSources({ configPath, oreturnRepo: dir }),
    (error) => {
      assert.equal(error.code, 'PROMPT_SOURCE_READ_FAILED');
      assert.equal(error.sourceId, 'source.a');
      assert.equal(error.file, missingFile);
      return true;
    },
  );
});
