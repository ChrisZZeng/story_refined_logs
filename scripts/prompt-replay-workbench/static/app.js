import { parseNarrativeSegments } from './speaker-to.js';
import { formatRate, formatRunResultText, runStatusFromSummary } from './run-summary.js';
import {
  buildPendingReplayProgress,
  buildReplayProgress,
  replayJudgeText,
  replayOutputText,
} from './replay-progress.js';
import {
  caseTurnSelection,
  promptTurnLoadState,
} from './turn-selection.js';
import { modelPayload, setupModelFormState } from './setup-model.js';
import { groupPromptSourcesByAccess, isEditablePromptSource } from './prompt-source-access.js';

const DEFAULT_REPLAY_ATTEMPTS = 20;
const DEFAULT_JUDGE_REQUESTS = 50;

const state = {
  task: null,
  resolvedSource: null,
  sources: [],
  cases: [],
  selectedId: null,
  selectedCaseTurn: null,
  selectedPromptTurn: null,
  selectedCaseView: 'issue',
  selectedRunIndex: 1,
  replayResult: null,
  replaySummary: null,
  replayHistory: [],
  activeReplayJob: null,
  pendingReplayProgress: null,
  runArtifacts: new Map(),
  bootstrapConfig: null,
  setupConfig: null,
};

const elements = {
  taskMeta: document.querySelector('#taskMeta'),
  setupView: document.querySelector('#setupView'),
  setupForm: document.querySelector('#setupForm'),
  setupError: document.querySelector('#setupError'),
  setupLoadButton: document.querySelector('#setupLoadButton'),
  workbenchBlocks: document.querySelectorAll('.workbenchOnly'),
  configButton: document.querySelector('#configButton'),
  caseContext: document.querySelector('.caseContext'),
  caseSummary: document.querySelector('#caseSummary'),
  caseTurnTabs: document.querySelector('#caseTurnTabs'),
  caseContent: document.querySelector('#caseContent'),
  replayProgress: document.querySelector('#replayProgress'),
  replayHistory: document.querySelector('#replayHistory'),
  splitResizeBar: document.querySelector('#splitResizeBar'),
  sourceTabs: document.querySelector('#sourceTabs'),
  sourceTitle: document.querySelector('#sourceTitle'),
  sourcePath: document.querySelector('#sourcePath'),
  promptTurnNotice: document.querySelector('#promptTurnNotice'),
  loadPromptTurnButton: document.querySelector('#loadPromptTurnButton'),
  editStatePanel: document.querySelector('#editStatePanel'),
  dirtyBadge: document.querySelector('#dirtyBadge'),
  originalText: document.querySelector('#originalText'),
  draftText: document.querySelector('#draftText'),
  diffView: document.querySelector('#diffView'),
  fullscreenButtons: document.querySelectorAll('[data-fullscreen-target]'),
  fullscreenViewer: document.querySelector('#fullscreenViewer'),
  fullscreenViewerTitle: document.querySelector('#fullscreenViewerTitle'),
  fullscreenViewerMeta: document.querySelector('#fullscreenViewerMeta'),
  fullscreenViewerContent: document.querySelector('#fullscreenViewerContent'),
  fullscreenViewerClose: document.querySelector('#fullscreenViewerClose'),
  resultView: document.querySelector('#resultView'),
  runStatus: document.querySelector('#runStatus'),
  refreshButton: document.querySelector('#refreshButton'),
  runButton: document.querySelector('#runButton'),
};

const setupFields = {
  replayId: document.querySelector('#setupReplayId'),
  logGroupDir: document.querySelector('#setupLogGroupDir'),
  runId: document.querySelector('#setupRunId'),
  turns: document.querySelector('#setupTurns'),
  repeats: document.querySelector('#setupRepeats'),
  oreturnRepo: document.querySelector('#setupOreturnRepo'),
  versionPolicy: document.querySelector('#setupVersionPolicy'),
  replayAttempts: document.querySelector('#setupReplayAttempts'),
  judgeRequests: document.querySelector('#setupJudgeRequests'),
  replayBaseUrl: document.querySelector('#setupReplayBaseUrl'),
  replayKeySource: document.querySelector('#setupReplayKeySource'),
  replayApiKeyEnv: document.querySelector('#setupReplayApiKeyEnv'),
  replayApiKeyToken: document.querySelector('#setupReplayApiKeyToken'),
  replayModel: document.querySelector('#setupReplayModel'),
  judgeBaseUrl: document.querySelector('#setupJudgeBaseUrl'),
  judgeKeySource: document.querySelector('#setupJudgeKeySource'),
  judgeApiKeyEnv: document.querySelector('#setupJudgeApiKeyEnv'),
  judgeApiKeyToken: document.querySelector('#setupJudgeApiKeyToken'),
  judgeModel: document.querySelector('#setupJudgeModel'),
  issueRepairJudger: document.querySelector('#setupIssueRepairJudger'),
  consistencyJudger: document.querySelector('#setupConsistencyJudger'),
};

let fullscreenTrigger = null;
let stopActiveCaseResize = null;

elements.configButton.addEventListener('click', () => {
  if (hasDirtyPromptEdits() && !window.confirm('返回配置页会丢弃当前未运行的 prompt 修改，继续吗？')) {
    return;
  }
  populateSetupForm(state.setupConfig ?? state.task ?? state.bootstrapConfig);
  showSetupView();
});

elements.setupForm.addEventListener('submit', (event) => {
  event.preventDefault();
  void loadConfiguredWorkbench();
});

setupFields.replayKeySource.addEventListener('change', updateKeySourceFields);
setupFields.judgeKeySource.addEventListener('change', updateKeySourceFields);

elements.refreshButton.addEventListener('click', () => {
  void loadWorkbench();
});

elements.runButton.addEventListener('click', () => {
  void runReplay();
});

elements.loadPromptTurnButton.addEventListener('click', () => {
  void loadPromptsForSelectedCaseTurn();
});

for (const button of elements.fullscreenButtons) {
  button.addEventListener('click', () => {
    openFullscreenViewer(button.dataset.fullscreenTarget, button);
  });
}

elements.fullscreenViewerClose.addEventListener('click', () => {
  closeFullscreenViewer();
});

elements.fullscreenViewer.addEventListener('click', (event) => {
  if (event.target === elements.fullscreenViewer) {
    closeFullscreenViewer();
  }
});

elements.fullscreenViewer.addEventListener('close', () => {
  elements.fullscreenViewerContent.replaceChildren();
  fullscreenTrigger?.focus();
  fullscreenTrigger = null;
});

elements.draftText.addEventListener('input', () => {
  const source = selectedSource();
  if (!source) return;
  if (!isEditablePromptSource(source)) {
    elements.draftText.value = source.draftText;
    return;
  }
  source.draftText = elements.draftText.value;
  source.dirty = source.originalText !== source.draftText;
  renderSource();
  updateRunStatusForDirtyEdits();
  void renderDiff(source);
});

initCaseResize();
void loadBootstrap();

async function loadBootstrap() {
  const response = await apiGet('/api/bootstrap/defaults');
  state.setupConfig = response.setupConfig ?? null;
  state.bootstrapConfig = response.setupConfig ?? response.config;
  populateSetupForm(state.bootstrapConfig);
  if (response.hasActiveTask) {
    await loadWorkbench();
  } else {
    showSetupView();
  }
}

async function loadWorkbench() {
  setResult('Loading...');
  try {
    const [taskResponse, casesResponse] = await Promise.all([
      apiGet('/api/task'),
      apiGet('/api/cases'),
    ]);
    state.task = taskResponse.config;
    state.resolvedSource = taskResponse.resolvedSource ?? null;
    state.bootstrapConfig = state.setupConfig ?? taskResponse.config;
    state.cases = casesResponse.cases;
    state.selectedCaseTurn = state.cases[0]?.turn ?? null;
    state.selectedPromptTurn = state.selectedCaseTurn;
    state.selectedCaseView = 'issue';
    state.selectedRunIndex = 1;
    state.replayResult = null;
    state.replaySummary = null;
    state.replayHistory = [];
    state.activeReplayJob = null;
    state.pendingReplayProgress = null;
    state.runArtifacts.clear();
    await loadPromptSourcesForSelectedTurn();
    const restoredReplayState = await restoreReplayState();
    renderTask();
    renderCaseContext();
    await renderDiff(selectedSource());
    if (!restoredReplayState) {
      setResult('Idle');
      updateRunStatusForDirtyEdits();
    }
    showWorkbenchView();
  } catch (error) {
    if (error.code === 'WORKBENCH_TASK_NOT_CONFIGURED') {
      showSetupView();
      return;
    }
    setResult(`Failed: ${error.message}`);
    throw error;
  }
}

async function loadConfiguredWorkbench() {
  elements.setupLoadButton.disabled = true;
  elements.setupError.textContent = '';
  const payload = setupPayload();
  try {
    const response = await apiPost('/api/bootstrap/load', payload);
    state.task = response.config;
    state.setupConfig = payload;
    state.bootstrapConfig = payload;
    await loadWorkbench();
  } catch (error) {
    elements.setupError.textContent = error.message;
  } finally {
    elements.setupLoadButton.disabled = false;
  }
}

function renderTask() {
  if (!state.task) return;
  const resolvedSource = state.resolvedSource;
  const sourceMeta = resolvedSource
    ? [
        `source=${shortCommit(resolvedSource.sourceOreturnCommit)}`,
        `worktree=${resolvedSource.replayEngineOreturnRepo ?? resolvedSource.oreturnRepo ?? '-'}`,
        `matched=${String(resolvedSource.matched)}`,
        `dirty=${String(resolvedSource.dirty)}`,
      ]
    : [];
  elements.taskMeta.textContent = [
    state.task.replayId,
    `run=${state.task.runId}`,
    `turns=${state.task.turns.join(',')}`,
    `repeats=${state.task.repeats}`,
    ...sourceMeta,
  ].join(' | ');
}

function showSetupView() {
  elements.setupView.hidden = false;
  for (const block of elements.workbenchBlocks) {
    block.hidden = true;
  }
  elements.configButton.hidden = true;
  elements.refreshButton.hidden = true;
  elements.runButton.hidden = true;
  elements.taskMeta.textContent = 'Configure a replay task to load badcase context and prompt sources.';
}

function showWorkbenchView() {
  elements.setupView.hidden = true;
  for (const block of elements.workbenchBlocks) {
    block.hidden = false;
  }
  elements.configButton.hidden = false;
  elements.refreshButton.hidden = false;
  elements.runButton.hidden = false;
}

function populateSetupForm(config) {
  if (!config) return;
  setupFields.replayId.value = config.replayId ?? '';
  setupFields.logGroupDir.value = config.logGroupDir ?? '';
  setupFields.runId.value = config.runId ?? '';
  setupFields.turns.value = setupTurnsFormValue(config.turns);
  setupFields.repeats.value = String(config.repeats ?? 1);
  setupFields.oreturnRepo.value = config.oreturnRepo ?? config.source?.oreturnRepo ?? '';
  setupFields.versionPolicy.value = config.versionPolicy ?? config.source?.versionPolicy ?? 'require-matching-worktree';
  setupFields.replayAttempts.value = String(config.concurrency?.replayAttempts ?? DEFAULT_REPLAY_ATTEMPTS);
  setupFields.judgeRequests.value = String(config.concurrency?.judgeRequests ?? DEFAULT_JUDGE_REQUESTS);
  populateModelSetupFields({
    baseUrl: setupFields.replayBaseUrl,
    keySource: setupFields.replayKeySource,
    apiKeyEnv: setupFields.replayApiKeyEnv,
    apiKeyToken: setupFields.replayApiKeyToken,
    model: setupFields.replayModel,
  }, setupModelFormState({
    configModel: config.models?.replay,
    currentToken: config.models?.replay?.apiKey ?? setupFields.replayApiKeyToken.value,
  }));
  populateModelSetupFields({
    baseUrl: setupFields.judgeBaseUrl,
    keySource: setupFields.judgeKeySource,
    apiKeyEnv: setupFields.judgeApiKeyEnv,
    apiKeyToken: setupFields.judgeApiKeyToken,
    model: setupFields.judgeModel,
  }, setupModelFormState({
    configModel: config.models?.judge,
    currentToken: config.models?.judge?.apiKey ?? setupFields.judgeApiKeyToken.value,
  }));
  setupFields.issueRepairJudger.checked = config.judging?.issueRepair?.enabled !== false;
  setupFields.consistencyJudger.checked = config.judging?.regressionConsistency?.enabled !== false;
  updateKeySourceFields();
}

function setupTurnsFormValue(turns) {
  if (Array.isArray(turns)) return turns.join(',');
  if (typeof turns === 'string') return turns;
  return '';
}

function populateModelSetupFields(fields, modelState) {
  fields.baseUrl.value = modelState.baseUrl;
  fields.keySource.value = modelState.keySource;
  fields.apiKeyEnv.value = modelState.apiKeyEnv;
  fields.apiKeyToken.value = modelState.apiKeyToken;
  fields.model.value = modelState.model;
}

function setupPayload() {
  return {
    replayId: setupFields.replayId.value,
    logGroupDir: setupFields.logGroupDir.value,
    runId: setupFields.runId.value,
    turns: setupFields.turns.value,
    repeats: Number(setupFields.repeats.value),
    oreturnRepo: setupFields.oreturnRepo.value,
    versionPolicy: setupFields.versionPolicy.value,
    concurrency: {
      replayAttempts: Number(setupFields.replayAttempts.value),
      judgeRequests: Number(setupFields.judgeRequests.value),
    },
    models: {
      replay: modelPayload({
        baseUrl: setupFields.replayBaseUrl.value,
        keySource: setupFields.replayKeySource.value,
        apiKeyEnv: setupFields.replayApiKeyEnv.value,
        apiKey: setupFields.replayApiKeyToken.value,
        model: setupFields.replayModel.value,
      }),
      judge: modelPayload({
        baseUrl: setupFields.judgeBaseUrl.value,
        keySource: setupFields.judgeKeySource.value,
        apiKeyEnv: setupFields.judgeApiKeyEnv.value,
        apiKey: setupFields.judgeApiKeyToken.value,
        model: setupFields.judgeModel.value,
      }),
    },
    judging: {
      issueRepair: {
        enabled: setupFields.issueRepairJudger.checked,
      },
      regressionConsistency: {
        enabled: setupFields.consistencyJudger.checked,
        target: 'fullTurn',
      },
    },
  };
}

function hasDirtyPromptEdits() {
  syncSelectedDraftFromTextarea();
  return state.sources.some((source) => isEditablePromptSource(source) && source.originalText !== source.draftText);
}

function syncSelectedDraftFromTextarea() {
  const source = selectedSource();
  if (!source || !isEditablePromptSource(source) || elements.draftText.disabled) return;
  if (source.draftText === elements.draftText.value) return;
  source.draftText = elements.draftText.value;
  source.dirty = source.originalText !== source.draftText;
}

function updateKeySourceFields() {
  updateModelKeySource({
    keySource: setupFields.replayKeySource,
    envInput: setupFields.replayApiKeyEnv,
    tokenInput: setupFields.replayApiKeyToken,
  });
  updateModelKeySource({
    keySource: setupFields.judgeKeySource,
    envInput: setupFields.judgeApiKeyEnv,
    tokenInput: setupFields.judgeApiKeyToken,
  });
}

function updateModelKeySource({ keySource, envInput, tokenInput }) {
  const direct = keySource.value === 'direct';
  envInput.closest('.setupField').hidden = direct;
  tokenInput.closest('.setupField').hidden = !direct;
  envInput.required = !direct;
  tokenInput.required = direct;
}

function renderCaseContext() {
  elements.caseSummary.textContent = state.cases.length > 0
    ? `${state.cases.length} turns | ${state.cases.reduce((total, item) => total + item.issues.length, 0)} issues`
    : 'No case context';
  renderCaseTurnTabs();
  renderReplayProgress();
  renderReplayHistory();
  renderCaseContent();
}

function renderCaseTurnTabs() {
  elements.caseTurnTabs.replaceChildren();
  for (const item of state.cases) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `caseTurnTab${item.turn === state.selectedCaseTurn ? ' active' : ''}`;
    button.textContent = `Turn ${item.turn}`;
    button.addEventListener('click', () => {
      void selectCaseTurn(item.turn);
    });
    elements.caseTurnTabs.append(button);
  }
}

function renderReplayProgress(progress = null) {
  elements.replayProgress.replaceChildren();
  const effectiveProgress = progress
    ?? state.pendingReplayProgress
    ?? (state.replaySummary ? buildReplayProgress(state.replaySummary) : null);
  if (!effectiveProgress) {
    const empty = document.createElement('div');
    empty.className = 'replayProgressEmpty';
    empty.textContent = 'Replay progress will appear here after Run.';
    elements.replayProgress.append(empty);
    return;
  }

  const summary = document.createElement('div');
  summary.className = 'replayProgressSummary';
  summary.dataset.state = effectiveProgress.state;
  const status = document.createElement('div');
  status.className = 'replayProgressStatus';
  status.textContent = effectiveProgress.statusText;
  const totals = document.createElement('div');
  totals.className = 'replayProgressTotals';
  totals.textContent = `${effectiveProgress.totals.label} | ${effectiveProgress.totals.detail}`;
  summary.append(status, totals);

  const list = document.createElement('div');
  list.className = 'replayProgressList';
  for (const item of effectiveProgress.cases) {
    const row = document.createElement('details');
    row.className = 'replayProgressCase';
    row.open = item.turn === state.selectedCaseTurn;
    row.dataset.status = item.state ?? item.status;
    const rowSummary = document.createElement('summary');
    rowSummary.textContent = `Turn ${item.turn}: ${item.status} (${item.verdict})`;
    const runs = document.createElement('div');
    runs.className = 'replayProgressRuns';
    for (const run of item.runs) {
      const runLine = document.createElement('div');
      runLine.className = 'replayProgressRun';
      runLine.dataset.status = run.state ?? run.status;
      runLine.textContent = run.label;
      runs.append(runLine);
    }
    row.append(rowSummary, runs);
    list.append(row);
  }

  elements.replayProgress.append(summary, list);
}

function renderReplayHistory() {
  elements.replayHistory.replaceChildren();
  const title = document.createElement('div');
  title.className = 'replayHistoryTitle';
  title.textContent = 'Replay History';
  elements.replayHistory.append(title);

  if (state.replayHistory.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'replayHistoryEmpty';
    empty.textContent = 'No historical replay tasks in this log group yet.';
    elements.replayHistory.append(empty);
    return;
  }

  const list = document.createElement('div');
  list.className = 'replayHistoryList';
  for (const item of state.replayHistory.slice(0, 12)) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `replayHistoryItem${item.replayId === state.replayResult?.replayId ? ' active' : ''}`;
    button.dataset.status = item.status;
    button.disabled = item.status !== 'completed';
    button.title = item.status === 'completed'
      ? 'Load this replay result'
      : 'This replay does not have summary.json yet.';
    const name = document.createElement('span');
    name.className = 'replayHistoryName';
    name.textContent = item.replayId;
    const meta = document.createElement('span');
    meta.className = 'replayHistoryMeta';
    meta.textContent = replayHistoryMeta(item);
    button.append(name, meta);
    button.addEventListener('click', () => {
      void selectReplayHistoryItem(item);
    });
    list.append(button);
  }
  elements.replayHistory.append(list);
}

async function restoreReplayState() {
  const [jobsResponse, historyResponse] = await Promise.all([
    apiGet('/api/replay/jobs'),
    apiGet('/api/replay/history'),
  ]);
  state.replayHistory = historyResponse.items ?? [];
  const activeJob = (jobsResponse.jobs ?? []).find(isActiveReplayJob);
  if (activeJob) {
    activateReplayJob(activeJob, { resume: true });
    return true;
  }

  const latestCompleted = state.replayHistory.find((item) => item.status === 'completed');
  if (latestCompleted) {
    await selectReplayHistoryItem(latestCompleted, { render: false });
    return true;
  }
  return false;
}

async function refreshReplayHistory({ render = true } = {}) {
  const historyResponse = await apiGet('/api/replay/history');
  state.replayHistory = historyResponse.items ?? [];
  if (render) renderReplayHistory();
}

async function selectReplayHistoryItem(item, { render = true } = {}) {
  if (!item || item.status !== 'completed') return;
  const summary = await apiGet(`/api/replay/${encodeURIComponent(item.replayId)}/summary`);
  state.activeReplayJob = null;
  state.pendingReplayProgress = null;
  state.replayResult = {
    replayId: item.replayId,
    resultDir: item.resultDir,
    summaryPath: item.summaryPath,
  };
  state.replaySummary = summary;
  state.runArtifacts.clear();
  const status = runStatusFromSummary(summary);
  setRunStatus(status.text, status.state);
  setResult(formatRunResultText({ result: state.replayResult, summary }));
  elements.runButton.disabled = false;
  elements.runButton.textContent = 'Run';
  elements.runButton.removeAttribute('aria-busy');
  if (render) {
    renderReplayProgress();
    renderReplayHistory();
    renderCaseContent();
  }
}

function activateReplayJob(job, { resume = false } = {}) {
  state.activeReplayJob = job;
  state.replayResult = null;
  state.replaySummary = null;
  state.pendingReplayProgress = buildPendingReplayProgress({
    turns: state.task?.turns ?? state.cases.map((item) => item.turn),
    repeats: state.task?.repeats ?? 1,
    promptEditCount: job.promptEditCount ?? 0,
  });
  elements.runButton.disabled = true;
  elements.runButton.textContent = 'Running...';
  elements.runButton.setAttribute('aria-busy', 'true');
  setRunStatus(`Replay job ${job.status}...`, 'busy');
  setResult(replayJobText(job));
  if (resume) {
    void resumeReplayJob(job);
  }
}

async function resumeReplayJob(job) {
  try {
    const result = await waitForReplayJob(job);
    const summary = await apiGet(`/api/replay/${encodeURIComponent(result.replayId)}/summary`);
    state.activeReplayJob = null;
    state.pendingReplayProgress = null;
    state.replayResult = result;
    state.replaySummary = summary;
    state.runArtifacts.clear();
    await refreshReplayHistory({ render: false });
    const status = runStatusFromSummary(summary);
    setRunStatus(status.text, status.state);
    setResult(formatRunResultText({ result, summary }));
    renderReplayProgress();
    renderReplayHistory();
    renderCaseContent();
  } catch (error) {
    state.activeReplayJob = null;
    state.pendingReplayProgress = null;
    setRunStatus(`Failed: ${error.message}`, 'error');
    setResult(`Failed: ${error.message}`);
    renderReplayProgress();
  } finally {
    elements.runButton.disabled = false;
    elements.runButton.textContent = 'Run';
    elements.runButton.removeAttribute('aria-busy');
  }
}

function isActiveReplayJob(job) {
  return job?.status === 'queued' || job?.status === 'running';
}

async function selectCaseTurn(turn) {
  if (turn === state.selectedCaseTurn) return;
  const next = caseTurnSelection({
    selectedCaseTurn: state.selectedCaseTurn,
    selectedPromptTurn: state.selectedPromptTurn,
    nextTurn: turn,
    hasDirtyPromptEdits: hasDirtyPromptEdits(),
  });
  state.selectedCaseTurn = next.selectedCaseTurn;
  state.selectedPromptTurn = next.selectedPromptTurn;
  state.selectedRunIndex = next.selectedRunIndex;
  renderCaseContext();
  renderSource();
  updateRunStatusForDirtyEdits();
  await renderDiff(selectedSource());
}

async function loadPromptsForSelectedCaseTurn() {
  const loadState = promptTurnLoadState({
    selectedCaseTurn: state.selectedCaseTurn,
    selectedPromptTurn: state.selectedPromptTurn,
    hasDirtyPromptEdits: hasDirtyPromptEdits(),
  });
  if (!loadState.canLoad) return;
  if (
    loadState.needsConfirmation
    && !window.confirm('加载当前 badcase turn 的 Prompt 会丢弃下方未运行的 Draft 修改，继续吗？')
  ) {
    return;
  }
  state.selectedPromptTurn = state.selectedCaseTurn;
  await loadPromptSourcesForSelectedTurn();
  renderCaseContext();
  await renderDiff(selectedSource());
}

function selectCaseView(view) {
  if (view === state.selectedCaseView) return;
  state.selectedCaseView = view;
  renderCaseContent();
}

function selectRunIndex(runIndex) {
  if (runIndex === state.selectedRunIndex) return;
  state.selectedRunIndex = runIndex;
  renderCaseContent();
}

async function loadPromptSourcesForSelectedTurn() {
  if (state.selectedCaseTurn === null || state.selectedCaseTurn === undefined) {
    state.sources = [];
    state.selectedId = null;
    renderTabs();
    renderSource();
    return;
  }
  const promptTurn = state.selectedPromptTurn ?? state.selectedCaseTurn;
  const sourcesResponse = await apiGet(`/api/prompt-sources?turn=${encodeURIComponent(promptTurn)}`);
  state.resolvedSource = sourcesResponse.resolvedSource ?? state.resolvedSource;
  state.sources = sourcesResponse.sources;
  state.selectedId = state.sources[0]?.id ?? null;
  renderTabs();
  renderSource();
  updateRunStatusForDirtyEdits();
}

function renderCaseContent() {
  const item = selectedCase();
  elements.caseContent.replaceChildren();
  if (!item) {
    elements.caseContent.textContent = 'No selected case.';
    return;
  }
  const shell = document.createElement('div');
  shell.className = 'caseViewShell';
  shell.append(caseViewTabs());
  const content = document.createElement('div');
  content.className = 'caseViewContent';
  shell.append(content);
  elements.caseContent.append(shell);

  if (state.selectedCaseView === 'issue') {
    renderCaseReviewFlow(item, content);
  } else if (state.selectedCaseView === 'original') {
    renderOriginalCaseView(item, content);
  } else {
    renderReplayCaseView(item, content, state.selectedCaseView);
  }
}

function renderCaseReviewFlow(item, target = elements.caseContent) {
  const flow = document.createElement('div');
  flow.className = 'caseReviewFlow';
  flow.append(
    flowSection({
      title: `Turn ${item.turn} 问题单`,
      meta: `${item.issues.length} issues`,
      content: issueListElement(item),
    }),
  );

  const relatedTurns = relatedTurnsForCase(item);
  if (relatedTurns.length > 0) {
    flow.append(
      flowSection({
        title: '相关证据轮次',
        meta: relatedTurns.map((turn) => `Turn ${turn.turn}`).join(' / '),
        content: turnTranscriptElement(relatedTurns),
      }),
    );
  }

  flow.append(
    flowSection({
      title: '前文玩家可见上下文',
      meta: `${item.visibleContext.length} turns`,
      content: turnTranscriptElement(item.visibleContext),
    }),
    flowSection({
      title: '当前问题轮次原始输出',
      meta: `Turn ${item.turn}`,
      content: currentTurnElement(item),
    }),
  );
  target.append(flow);
}

function renderOriginalCaseView(item, target) {
  target.append(
    flowSection({
      title: '当前问题轮次原始输出',
      meta: `Turn ${item.turn}`,
      content: currentTurnElement(item),
    }),
  );
}

function renderReplayCaseView(item, target, view) {
  if (!state.replayResult || !state.replaySummary) {
    target.append(emptyReplayNotice());
    return;
  }
  const runSelector = replayRunSelector(item.turn);
  if (runSelector) target.append(runSelector);
  const loading = flowSection({
    title: view === 'judge' ? 'Judge Result' : 'Replay Output',
    meta: `Turn ${item.turn} / Run ${state.selectedRunIndex}`,
    content: bubbleElement({ role: 'system', title: 'Loading', text: 'Loading replay artifact...' }),
  });
  target.append(loading);
  void renderReplayArtifactInto({
    turn: item.turn,
    runIndex: state.selectedRunIndex,
    target,
    placeholder: loading,
    view,
  });
}

function caseViewTabs() {
  const tabs = document.createElement('div');
  tabs.className = 'caseViewTabs';
  const options = [
    ['issue', 'Issue'],
    ['original', 'Original'],
    ['replay', 'Replay'],
    ['judge', 'Judge'],
  ];
  for (const [view, label] of options) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `caseViewTab${state.selectedCaseView === view ? ' active' : ''}`;
    button.textContent = label;
    button.disabled = ['replay', 'judge'].includes(view) && !state.replaySummary;
    button.addEventListener('click', () => selectCaseView(view));
    tabs.append(button);
  }
  return tabs;
}

function emptyReplayNotice() {
  return flowSection({
    title: 'Replay Output',
    meta: 'Not available yet',
    content: bubbleElement({
      role: 'system',
      title: 'No replay result',
      text: 'Run replay first, then use Replay/Judge to review generated outputs and judgments.',
    }),
  });
}

function replayRunSelector(turn) {
  const runs = replayRunsForTurn(turn);
  if (runs.length <= 1) return null;
  const row = document.createElement('div');
  row.className = 'runSelector';
  for (const run of runs) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `runSelectorButton${run.runIndex === state.selectedRunIndex ? ' active' : ''}`;
    button.textContent = `Run ${run.runIndex}`;
    button.addEventListener('click', () => selectRunIndex(run.runIndex));
    row.append(button);
  }
  return row;
}

async function renderReplayArtifactInto({ turn, runIndex, target, placeholder, view }) {
  try {
    const artifact = await loadRunArtifact({ turn, runIndex });
    if (turn !== state.selectedCaseTurn || runIndex !== state.selectedRunIndex || view !== state.selectedCaseView) return;
    placeholder.remove();
    target.append(flowSection({
      title: view === 'judge' ? 'Judge Result' : 'Replay Output',
      meta: `Turn ${turn} / Run ${runIndex}`,
      content: view === 'judge'
        ? replayJudgeElement(artifact)
        : replayOutputElement(artifact),
    }));
  } catch (error) {
    placeholder.remove();
    target.append(flowSection({
      title: 'Replay Artifact Error',
      meta: `Turn ${turn} / Run ${runIndex}`,
      content: bubbleElement({ role: 'issue', title: 'Failed to load artifact', text: error.message }),
    }));
  }
}

async function loadRunArtifact({ turn, runIndex }) {
  const replayId = state.replayResult?.replayId;
  const key = `${replayId}:${turn}:${runIndex}`;
  if (state.runArtifacts.has(key)) return state.runArtifacts.get(key);
  const artifact = await apiGet(`/api/replay/${encodeURIComponent(replayId)}/cases/${encodeURIComponent(turn)}/runs/${encodeURIComponent(runIndex)}`);
  state.runArtifacts.set(key, artifact);
  return artifact;
}

function replayOutputElement(artifact) {
  const transcript = document.createElement('div');
  transcript.className = 'bubbleTranscript replayTranscript';
  const trigger = artifact.output?.writes?.[0]?.trigger?.playerInput;
  if (trigger) {
    transcript.append(bubbleElement({ role: 'player', title: 'Player', text: trigger }));
  }
  transcript.append(bubbleElement({
    role: 'system',
    title: 'New Output',
    text: replayOutputText(artifact),
    fallbackText: artifact.output?.normalizedContent?.visibleText,
  }));
  appendChoiceBubbles(transcript, artifact.output?.choices?.options ?? artifact.output?.choices);
  return transcript;
}

function replayJudgeElement(artifact) {
  const transcript = document.createElement('div');
  transcript.className = 'bubbleTranscript replayTranscript';
  transcript.append(bubbleElement({
    role: 'issue',
    title: 'Judge',
    text: replayJudgeText(artifact),
  }));
  return transcript;
}

function issueListElement(item) {
  const transcript = document.createElement('div');
  transcript.className = 'bubbleTranscript issueTranscript';
  if (item.issues.length === 0) {
    transcript.append(bubbleElement({ role: 'issue', title: 'No issues', text: 'No issues for this turn.' }));
    return transcript;
  }
  for (const issue of item.issues) {
    const article = document.createElement('article');
    article.className = 'issueCard';
    const relatedTurns = Array.isArray(issue.relatedTurns) ? issue.relatedTurns : [];
    article.append(
      bubbleElement({
        role: 'issue',
        title: `${issue.id ?? 'issue'} | ${issue.type ?? 'unknown'} | ${issue.severity ?? '-'}`,
        text: [
          issue.reason ?? issue.rootCause ?? issue.explanation,
          issue.currentEvidence ?? issue.evidence,
          relatedTurns.length > 0 ? `相关证据：${relatedTurns.map((turn) => `Turn ${turn.turn}`).join(' / ')}` : '',
        ]
          .filter(Boolean)
          .join('\n'),
      }),
    );
    transcript.append(article);
  }
  return transcript;
}

function turnTranscriptElement(records) {
  const transcript = document.createElement('div');
  transcript.className = 'bubbleTranscript';
  if (!records?.length) {
    transcript.append(bubbleElement({ role: 'system', title: 'Empty', text: 'No visible context.' }));
    return transcript;
  }
  for (const record of records) {
    appendTurnBubbles(transcript, record);
  }
  return transcript;
}

function currentTurnElement(item) {
  const transcript = document.createElement('div');
  transcript.className = 'bubbleTranscript';
  transcript.append(
    bubbleElement({
      role: 'player',
      title: 'Player',
      text: turnInputText(item.turnInput),
    }),
  );
  const output = item.originalOutput;
  const text = item.originalRawNarrativeHtml
    ?? output?.normalizedContent?.rawHtml
    ?? output?.narrative
    ?? output?.normalizedContent?.visibleText
    ?? JSON.stringify(output, null, 2);
  transcript.append(
    bubbleElement({
      role: 'system',
      title: 'Original Output',
      text,
    }),
  );
  appendChoiceBubbles(transcript, output?.choices?.options ?? output?.choices);
  return transcript;
}

function renderTabs() {
  elements.sourceTabs.replaceChildren();
  for (const group of groupPromptSourcesByAccess(state.sources)) {
    const section = document.createElement('section');
    section.className = `sourceGroup ${group.id}`;
    const heading = document.createElement('div');
    heading.className = 'sourceGroupTitle';
    heading.textContent = `${group.title} (${group.sources.length})`;
    section.append(heading);
    for (const source of group.sources) {
      section.append(sourceTabButton(source, group));
    }
    elements.sourceTabs.append(section);
  }
}

function sourceTabButton(source, group) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = [
    'tab',
    group.id,
    source.id === state.selectedId ? 'active' : '',
    source.dirty ? 'dirty' : '',
    source.unavailable ? 'unavailable' : '',
  ].filter(Boolean).join(' ');
  const label = document.createElement('span');
  label.className = 'tabLabel';
  label.textContent = `${source.label ?? source.id}${source.unavailable ? ' (unavailable)' : ''}`;
  const badge = document.createElement('span');
  badge.className = 'tabBadge';
  badge.textContent = group.badge;
  button.append(label, badge);
  button.addEventListener('click', () => {
    state.selectedId = source.id;
    renderTabs();
    renderSource();
    void renderDiff(source);
  });
  return button;
}

function renderSource() {
  const source = selectedSource();
  if (!source) {
    elements.sourceTitle.textContent = 'Prompt';
    elements.sourcePath.textContent = '';
    elements.promptTurnNotice.textContent = '';
    elements.loadPromptTurnButton.hidden = true;
    elements.editStatePanel.hidden = true;
    elements.editStatePanel.textContent = '';
    elements.originalText.value = '';
    elements.draftText.value = '';
    return;
  }
  elements.sourceTitle.textContent = source.label ?? source.id;
  const sourceRepo = state.resolvedSource?.replayEngineOreturnRepo ?? state.resolvedSource?.oreturnRepo;
  elements.sourcePath.textContent = source.sourceKind === 'observed-llm-call'
    ? [
        `turn=${source.turn}`,
        source.stage,
        source.callKind,
        source.fieldPath,
        'source=run_logs/06-llm-calls.json',
        source.patchMode ? `patch=${source.patchMode}` : null,
        source.patchScopeLabel ? `scope=${source.patchScopeLabel}` : null,
        Array.isArray(source.preserveTags) && source.preserveTags.length > 0
          ? `preserve=${source.preserveTags.map((tag) => `<${tag}>`).join(',')}`
          : null,
      ].filter(Boolean).join(' | ')
    : [
        source.stage,
        source.file,
        source.symbol,
        sourceRepo ? `repo=${sourceRepo}` : null,
        source.unavailable ? `${source.unavailableCode ?? 'UNAVAILABLE'}: ${source.unavailableReason ?? 'Prompt source is unavailable for this version.'}` : null,
      ].filter(Boolean).join(' | ');
  if (elements.originalText.value !== source.originalText) {
    elements.originalText.value = source.originalText;
  }
  if (elements.draftText.value !== source.draftText) {
    elements.draftText.value = source.draftText;
  }
  const editable = isEditablePromptSource(source);
  elements.draftText.disabled = source.unavailable === true;
  elements.draftText.readOnly = !editable;
  elements.draftText.setAttribute('aria-readonly', String(!editable));
  elements.dirtyBadge.textContent = source.unavailable ? 'Unavailable' : source.dirty ? 'Dirty' : editable ? 'Editable' : 'View only';
  elements.dirtyBadge.classList.toggle('dirty', source.dirty);
  elements.dirtyBadge.classList.toggle('readonly', !editable && !source.unavailable);
  renderEditStatePanel({ source, editable });
  renderPromptTurnControls();
  renderTabs();
}

function renderEditStatePanel({ source, editable }) {
  if (editable || !source.editBlockReason) {
    elements.editStatePanel.hidden = true;
    elements.editStatePanel.textContent = '';
    return;
  }

  const title = document.createElement('strong');
  title.textContent = 'Current prompt is locked';
  const body = document.createElement('span');
  body.textContent = source.editBlockReasonCode === 'MULTI_TURN_TURN_SCOPED_PROMPT'
    ? 'This prompt contains current-turn memory or context material. Load exactly one replay turn to edit it safely.'
    : source.editBlockReason;
  elements.editStatePanel.replaceChildren(title, body);
  elements.editStatePanel.hidden = false;
}

function renderPromptTurnControls() {
  const promptTurn = state.selectedPromptTurn ?? state.selectedCaseTurn;
  const caseTurn = state.selectedCaseTurn;
  const dirty = hasDirtyPromptEdits();
  const loadState = promptTurnLoadState({
    selectedCaseTurn: caseTurn,
    selectedPromptTurn: promptTurn,
    hasDirtyPromptEdits: dirty,
  });
  elements.promptTurnNotice.textContent = caseTurn === promptTurn
    ? `Editing prompts for Turn ${promptTurn}`
    : `Reviewing Turn ${caseTurn}; editing prompts for Turn ${promptTurn}`;
  elements.promptTurnNotice.dataset.state = caseTurn === promptTurn ? 'aligned' : dirty ? 'dirty-mismatch' : 'mismatch';
  elements.loadPromptTurnButton.hidden = !loadState.canLoad;
  elements.loadPromptTurnButton.textContent = `Load Turn ${caseTurn} prompts`;
  elements.loadPromptTurnButton.title = loadState.needsConfirmation
    ? 'This will replace the current dirty draft prompts.'
    : 'Load prompt sources for the selected review turn.';
}

function openFullscreenViewer(targetId, trigger) {
  const target = document.getElementById(targetId);
  if (!target) return;

  fullscreenTrigger = trigger ?? null;
  elements.fullscreenViewerTitle.textContent = fullscreenTitleFor(targetId);
  elements.fullscreenViewerMeta.textContent = fullscreenMetaText();
  elements.fullscreenViewerContent.classList.toggle('diff', targetId === 'diffView');
  elements.fullscreenViewerContent.replaceChildren();

  if (targetId === 'diffView') {
    elements.fullscreenViewerContent.append(...Array.from(target.childNodes, (node) => node.cloneNode(true)));
  } else {
    elements.fullscreenViewerContent.textContent = target.value ?? target.textContent ?? '';
  }

  if (!elements.fullscreenViewer.open) {
    if (typeof elements.fullscreenViewer.showModal === 'function') {
      elements.fullscreenViewer.showModal();
    } else {
      elements.fullscreenViewer.setAttribute('open', '');
    }
  }
  elements.fullscreenViewerContent.focus();
}

function closeFullscreenViewer() {
  if (elements.fullscreenViewer.open && typeof elements.fullscreenViewer.close === 'function') {
    elements.fullscreenViewer.close();
    return;
  }
  elements.fullscreenViewer.removeAttribute('open');
  elements.fullscreenViewerContent.replaceChildren();
  fullscreenTrigger?.focus();
  fullscreenTrigger = null;
}

function fullscreenTitleFor(targetId) {
  if (targetId === 'originalText') return 'Original prompt';
  if (targetId === 'draftText') return 'Draft prompt';
  if (targetId === 'diffView') return 'Diff preview';
  return 'Content';
}

function fullscreenMetaText() {
  const source = selectedSource();
  if (!source) return 'Prompt Replay Workbench';
  return [
    source.label ?? source.id,
    elements.sourcePath.textContent,
  ].filter(Boolean).join(' | ');
}

async function renderDiff(source) {
  if (!source) {
    elements.diffView.textContent = '';
    return;
  }
  if (source.unavailable) {
    elements.diffView.textContent = source.unavailableReason ?? 'Prompt source is unavailable for this source version.';
    return;
  }
  const response = await apiPost('/api/prompt-sources/preview-diff', {
    originalText: source.originalText,
    draftText: source.draftText,
  });
  elements.diffView.replaceChildren();
  for (const segment of response.diff) {
    const span = document.createElement('span');
    span.className = segment.type === 'insert' ? 'diffInsert' : segment.type === 'delete' ? 'diffDelete' : '';
    span.textContent = `${prefixFor(segment.type)}${segment.text}`;
    elements.diffView.append(span);
  }
}

async function runReplay() {
  syncSelectedDraftFromTextarea();
  const promptEdits = state.sources.filter((source) => isEditablePromptSource(source) && source.originalText !== source.draftText);
  if (promptEdits.length === 0) {
    setRunStatus('No prompt edits to run.', 'warn');
    setResult('No prompt edits. Edit the Draft prompt first, then click Run.');
    return;
  }
  elements.runButton.disabled = true;
  elements.runButton.textContent = 'Running...';
  elements.runButton.setAttribute('aria-busy', 'true');
  setRunStatus(`Running ${promptEdits.length} prompt edit${promptEdits.length === 1 ? '' : 's'}...`, 'busy');
  state.pendingReplayProgress = buildPendingReplayProgress({
    turns: state.task?.turns ?? state.cases.map((item) => item.turn),
    repeats: state.task?.repeats ?? 1,
    promptEditCount: promptEdits.length,
  });
  renderReplayProgress();
  setResult([
    'Running...',
    `promptEdits: ${promptEdits.length}`,
    `turn: ${state.selectedCaseTurn ?? '-'}`,
    'Waiting for replay and judge results.',
  ].join('\n'));
  try {
    const job = await apiPost('/api/replay/run', { promptEdits });
    activateReplayJob(job);
    await resumeReplayJob(job);
  } catch (error) {
    state.activeReplayJob = null;
    state.pendingReplayProgress = null;
    setRunStatus(`Failed: ${error.message}`, 'error');
    setResult(`Failed: ${error.message}`);
    renderReplayProgress();
  } finally {
    elements.runButton.disabled = false;
    elements.runButton.textContent = 'Run';
    elements.runButton.removeAttribute('aria-busy');
  }
}

async function waitForReplayJob(initialJob) {
  let job = initialJob;
  while (job.status === 'queued' || job.status === 'running') {
    await sleep(1500);
    job = await apiGet(`/api/replay/jobs/${encodeURIComponent(job.jobId)}`);
    state.activeReplayJob = job;
    setRunStatus(`Replay job ${job.status}...`, 'busy');
    setResult(replayJobText(job));
  }
  if (job.status === 'failed' || job.status === 'cancelled') {
    throw new Error(job.error ?? 'Replay job failed');
  }
  return job;
}

function replayJobText(job) {
  return [
    `Replay job ${job.status}...`,
    `jobId: ${job.jobId}`,
    `replayId: ${job.replayId}`,
    job.promptEditCount !== undefined ? `promptEdits: ${job.promptEditCount}` : null,
    job.resultDir ? `resultDir: ${job.resultDir}` : 'Waiting for resultDir.',
  ].filter(Boolean).join('\n');
}

function replayHistoryMeta(item) {
  if (item.status !== 'completed') {
    return `incomplete | updated ${formatDateTime(item.updatedAt)}`;
  }
  const passText = `${item.passedRuns ?? 0}/${item.runCount ?? 0} passed`;
  return [
    passText,
    formatRate(item.overallPassRate),
    `${item.turnCount ?? item.turns?.length ?? '-'} turns`,
    `updated ${formatDateTime(item.updatedAt)}`,
  ].join(' | ');
}

function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function sleep(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function selectedSource() {
  return state.sources.find((source) => source.id === state.selectedId) ?? null;
}

function selectedCase() {
  return state.cases.find((item) => item.turn === state.selectedCaseTurn) ?? null;
}

function replayRunsForTurn(turn) {
  const summaryCase = (state.replaySummary?.cases ?? []).find((item) => Number(item.turn) === Number(turn));
  if (Array.isArray(summaryCase?.runs) && summaryCase.runs.length > 0) {
    return summaryCase.runs.map((run) => ({ runIndex: Number(run.runIndex ?? 1) }));
  }
  return [{ runIndex: 1 }];
}

function flowSection({ title, meta, content }) {
  const section = document.createElement('section');
  section.className = 'caseFlowSection';
  const header = document.createElement('div');
  header.className = 'caseFlowHeader';
  header.append(
    lineElement('caseFlowTitle', title),
    lineElement('caseFlowMeta', meta),
  );
  section.append(header, content);
  return section;
}

function lineElement(className, text) {
  const div = document.createElement('div');
  div.className = className;
  div.textContent = text;
  return div;
}

function appendTurnBubbles(container, turn) {
  const group = document.createElement('section');
  group.className = 'turnBubbleGroup';
  group.append(
    lineElement('turnBubbleTitle', `Turn ${turn.turn}`),
    bubbleElement({
      role: 'player',
      title: 'Player',
      text: turn.playerInput ?? '-',
    }),
    bubbleElement({
      role: 'system',
      title: 'Output',
      text: turn.rawNarrativeHtml ?? turn.visibleText ?? '-',
      fallbackText: turn.visibleText ?? '-',
    }),
  );
  appendChoiceBubbles(group, turn.choices);
  container.append(group);
}

function relatedTurnsForCase(item) {
  const byTurn = new Map();
  for (const issue of item.issues) {
    for (const turn of issue.relatedTurns ?? []) {
      byTurn.set(Number(turn.turn), turn);
    }
  }
  return Array.from(byTurn.values()).sort((left, right) => Number(left.turn) - Number(right.turn));
}

function turnInputText(turnInput) {
  return turnInput?.trigger?.playerInput
    ?? turnInput?.trigger?.text
    ?? turnInput?.playerInput
    ?? JSON.stringify(turnInput, null, 2)
    ?? '-';
}

function appendChoiceBubbles(container, choices) {
  if (!Array.isArray(choices) || choices.length === 0) return;
  const choiceRow = document.createElement('div');
  choiceRow.className = 'choiceBubbleRow';
  for (const choice of choices) {
    const pill = document.createElement('span');
    pill.className = 'choiceBubble';
    pill.textContent = typeof choice === 'string' ? choice : choice.text ?? JSON.stringify(choice);
    choiceRow.append(pill);
  }
  container.append(choiceRow);
}

function bubbleElement({ role, title, text, fallbackText }) {
  const bubble = document.createElement('div');
  bubble.className = `caseBubble ${role}`;
  const titleElement = document.createElement('div');
  titleElement.className = 'bubbleTitle';
  titleElement.textContent = title;
  const textElement = document.createElement('div');
  textElement.className = 'bubbleText';
  appendNarrativeSegments(textElement, text || '-', fallbackText);
  bubble.append(titleElement, textElement);
  return bubble;
}

function appendNarrativeSegments(container, text, fallbackText) {
  const segments = parseNarrativeSegments(text, fallbackText);
  if (segments.length === 1 && segments[0].type === 'text') {
    container.textContent = segments[0].text || '-';
    return;
  }

  for (const segment of segments) {
    if (segment.type === 'speaker') {
      const card = document.createElement('div');
      card.className = 'speakerLine';
      const route = document.createElement('div');
      route.className = 'speakerRoute';
      route.textContent = `${segment.speaker} -> ${segment.to}`;
      const line = document.createElement('div');
      line.className = 'speakerText';
      line.textContent = segment.text;
      card.append(route, line);
      container.append(card);
    } else if (segment.text) {
      const block = document.createElement('div');
      block.className = 'narrativeText';
      block.textContent = segment.text;
      container.append(block);
    }
  }
}

function formatChoices(choices) {
  if (!Array.isArray(choices) || choices.length === 0) return '-';
  return choices
    .map((choice) => typeof choice === 'string' ? choice : choice.text ?? JSON.stringify(choice))
    .join(' / ');
}

function shortCommit(value) {
  return typeof value === 'string' && value.length > 12 ? value.slice(0, 12) : value ?? '-';
}

function prefixFor(type) {
  if (type === 'insert') return '+ ';
  if (type === 'delete') return '- ';
  return '  ';
}


function setResult(text) {
  elements.resultView.textContent = text;
}

function setRunStatus(text, stateName = 'idle') {
  elements.runStatus.textContent = text;
  elements.runStatus.dataset.state = stateName;
}

function updateRunStatusForDirtyEdits() {
  if (isActiveReplayJob(state.activeReplayJob)) return;
  syncSelectedDraftFromTextarea();
  const dirtyCount = state.sources.filter((source) => isEditablePromptSource(source) && source.originalText !== source.draftText).length;
  if (dirtyCount > 0) {
    setRunStatus(`${dirtyCount} prompt edit${dirtyCount === 1 ? '' : 's'} ready`, 'dirty');
  } else {
    setRunStatus('No prompt edits', 'idle');
  }
}

function initCaseResize() {
  const savedHeight = Number(localStorage.getItem('promptReplayWorkbench.caseHeight'));
  if (Number.isFinite(savedHeight) && savedHeight > 0) {
    setCaseContextHeight(savedHeight);
  } else {
    updateResizeValue(280);
  }

  if ('PointerEvent' in window) {
    elements.splitResizeBar.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      if (elements.splitResizeBar.setPointerCapture) {
        try {
          elements.splitResizeBar.setPointerCapture(event.pointerId);
        } catch {
          // Window-level listeners still keep resizing usable if capture fails.
        }
      }
      startCaseResize({
        moveEvent: 'pointermove',
        endEvents: ['pointerup', 'pointercancel', 'lostpointercapture'],
        moveTarget: window,
        endTargets: [window, elements.splitResizeBar],
        cleanup: () => {
          if (elements.splitResizeBar.hasPointerCapture?.(event.pointerId)) {
            elements.splitResizeBar.releasePointerCapture(event.pointerId);
          }
        },
      });
    });
  } else {
    elements.splitResizeBar.addEventListener('mousedown', (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      startCaseResize({
        moveEvent: 'mousemove',
        endEvents: ['mouseup'],
        moveTarget: window,
        endTargets: [window],
      });
    });
  }

  elements.splitResizeBar.addEventListener('keydown', (event) => {
    const currentHeight = elements.caseContext.getBoundingClientRect().height;
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setCaseContextHeight(currentHeight - 20);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      setCaseContextHeight(currentHeight + 20);
    } else if (event.key === 'Home') {
      event.preventDefault();
      setCaseContextHeight(160);
    } else if (event.key === 'End') {
      event.preventDefault();
      setCaseContextHeight(maxCaseContextHeight());
    }
  });

  window.addEventListener('resize', () => {
    setCaseContextHeight(elements.caseContext.getBoundingClientRect().height, { persist: false });
  });
}

function startCaseResize({ moveEvent, endEvents, moveTarget, endTargets, cleanup = () => {} }) {
  stopActiveCaseResize?.();
  document.body.classList.add('isResizing');
  let ended = false;
  const onMove = (event) => {
    const top = elements.caseContext.getBoundingClientRect().top;
    setCaseContextHeight(event.clientY - top);
  };
  const onEnd = () => {
    if (ended) return;
    ended = true;
    document.body.classList.remove('isResizing');
    moveTarget.removeEventListener(moveEvent, onMove);
    for (const endTarget of endTargets) {
      for (const eventName of endEvents) {
        endTarget.removeEventListener(eventName, onEnd);
      }
    }
    window.removeEventListener('blur', onEnd);
    cleanup();
    if (stopActiveCaseResize === onEnd) {
      stopActiveCaseResize = null;
    }
  };
  stopActiveCaseResize = onEnd;
  moveTarget.addEventListener(moveEvent, onMove);
  for (const endTarget of endTargets) {
    for (const eventName of endEvents) {
      endTarget.addEventListener(eventName, onEnd);
    }
  }
  window.addEventListener('blur', onEnd);
}

function setCaseContextHeight(height, { persist = true } = {}) {
  const nextHeight = clamp(height, 160, maxCaseContextHeight());
  document.documentElement.style.setProperty('--case-context-height', `${nextHeight}px`);
  updateResizeValue(nextHeight);
  if (persist) {
    localStorage.setItem('promptReplayWorkbench.caseHeight', String(Math.round(nextHeight)));
  }
}

function maxCaseContextHeight() {
  const caseTop = elements.caseContext.getBoundingClientRect().top;
  const splitHeight = elements.splitResizeBar.getBoundingClientRect().height;
  return Math.max(220, window.innerHeight - caseTop - splitHeight - 260);
}

function updateResizeValue(height) {
  elements.splitResizeBar.setAttribute('aria-valuenow', String(Math.round(height)));
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

async function apiGet(url) {
  return parseApiResponse(await fetch(url));
}

async function apiPost(url, body) {
  return parseApiResponse(await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }));
}

async function parseApiResponse(response) {
  const text = await response.text();
  const body = text ? JSON.parse(text) : {};
  if (!response.ok) {
    const error = new Error(body.error ?? `HTTP ${response.status}`);
    error.code = body.code;
    throw error;
  }
  return body;
}
