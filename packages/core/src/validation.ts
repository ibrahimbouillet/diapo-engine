import type { ValidationIssue, ValidationResult } from './types.ts';

const kinds = new Set(['text', 'model3d', 'image', 'video', 'audio']);
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isText = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const hasOwn = (record: Record<string, unknown>, key: string): boolean => Object.hasOwn(record, key);

function isLocalPath(value: unknown): boolean {
  if (!isText(value) || value !== value.trim() || /[<>:"|*%?#\u0000-\u001f]/u.test(value) || /^[\\/]/u.test(value)) return false;
  // Windows canonicalizes trailing dots/spaces; rejecting them also prevents disguised '..' segments.
  return value.replaceAll('\\', '/').split('/').every(part => part !== '' && !/[. ]$/u.test(part));
}

function isJson(value: unknown, ancestors = new Set<object>()): boolean {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value !== 'object' || ancestors.has(value)) return false;
  if (!Array.isArray(value) && Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) return false;
  const nextAncestors = new Set(ancestors).add(value);
  return (Array.isArray(value) ? Array.from(value) : Object.values(value)).every(item => isJson(item, nextAncestors));
}

/** Validate data before passing it to the pure runtime functions. No files are opened. */
export function validatePresentation(value: unknown): ValidationResult {
  const issues: ValidationIssue[] = [];
  const issue = (path: string, message: string): void => { issues.push({ path, message }); };
  if (!isRecord(value)) return { valid: false, issues: [{ path: '$', message: 'Expected a presentation object.' }] };
  if (value.schemaVersion !== 1) issue('schemaVersion', 'Only schema version 1 is supported.');
  if (!isText(value.id)) issue('id', 'Expected a non-empty identifier.');
  if (!isText(value.title)) issue('title', 'Expected a non-empty title.');

  const assets = isRecord(value.assets) ? value.assets : {};
  if (value.assets !== undefined && !isRecord(value.assets)) issue('assets', 'Expected an asset catalogue.');
  for (const [id, asset] of Object.entries(assets)) {
    if (!isText(id)) issue('assets', 'Asset identifiers cannot be empty.');
    if (!isRecord(asset) || !isLocalPath(asset.source)) {
      issue(`assets.${id}.source`, 'Expected a relative local file path without traversal, URL syntax or encoded path characters.');
    }
  }

  const definitions = isRecord(value.elements) ? value.elements : {};
  if (!isRecord(value.elements) || Object.keys(definitions).length === 0) issue('elements', 'Expected a non-empty element catalogue.');
  for (const [id, definition] of Object.entries(definitions)) {
    const path = `elements.${id}`;
    if (!isText(id)) issue('elements', 'Element identifiers cannot be empty.');
    if (!isRecord(definition)) { issue(path, 'Expected an element definition.'); continue; }
    if (typeof definition.kind !== 'string' || !kinds.has(definition.kind)) issue(`${path}.kind`, 'Unknown element kind.');
    if (definition.content !== undefined && typeof definition.content !== 'string') issue(`${path}.content`, 'Expected text content.');
    if (definition.assetId !== undefined && (!isText(definition.assetId) || !hasOwn(assets, definition.assetId))) {
      issue(`${path}.assetId`, 'Unknown asset reference.');
    }
  }

  if (!Array.isArray(value.pages) || value.pages.length === 0) {
    issue('pages', 'Expected at least one page.');
    return { valid: false, issues };
  }
  const pageIds = new Set<string>();
  for (const [pageIndex, page] of value.pages.entries()) {
    const pagePath = `pages[${pageIndex}]`;
    if (!isRecord(page)) { issue(pagePath, 'Expected a page object.'); continue; }
    if (!isText(page.id)) issue(`${pagePath}.id`, 'Expected a non-empty page identifier.');
    else if (pageIds.has(page.id)) issue(`${pagePath}.id`, 'Duplicate page identifier.');
    else pageIds.add(page.id);
    if (!isText(page.title)) issue(`${pagePath}.title`, 'Expected a non-empty title.');
    if (!isFiniteNumber(page.plannedDurationSeconds) || page.plannedDurationSeconds <= 0) {
      issue(`${pagePath}.plannedDurationSeconds`, 'Expected a finite positive duration.');
    }
    if (!Array.isArray(page.states) || page.states.length === 0) { issue(`${pagePath}.states`, 'Expected at least one state.'); continue; }
    const stateIds = new Set<string>();
    for (const [stateIndex, state] of page.states.entries()) {
      const statePath = `${pagePath}.states[${stateIndex}]`;
      if (!isRecord(state)) { issue(statePath, 'Expected a state object.'); continue; }
      if (!isText(state.id)) issue(`${statePath}.id`, 'Expected a non-empty state identifier.');
      else if (stateIds.has(state.id)) issue(`${statePath}.id`, 'Duplicate state identifier within this page.');
      else stateIds.add(state.id);
      if (state.transition !== undefined) {
        const transition = state.transition;
        if (!isRecord(transition)) issue(`${statePath}.transition`, 'Expected a transition object.');
        else {
          if (!isFiniteNumber(transition.durationMs) || transition.durationMs < 0) issue(`${statePath}.transition.durationMs`, 'Expected a finite non-negative duration.');
          if (transition.easing !== 'linear' && transition.easing !== 'easeInOut') issue(`${statePath}.transition.easing`, 'Unknown easing.');
        }
      }
      if (!isRecord(state.elements)) { issue(`${statePath}.elements`, 'Expected an element state map.'); continue; }
      for (const [id, element] of Object.entries(state.elements)) {
        const elementPath = `${statePath}.elements.${id}`;
        if (!hasOwn(definitions, id)) issue(elementPath, 'Unknown element reference.');
        if (!isRecord(element)) { issue(elementPath, 'Expected an element state.'); continue; }
        for (const field of ['position', 'rotation', 'scale']) {
          if (element[field] === undefined) continue;
          const vector = element[field];
          if (!Array.isArray(vector) || vector.length !== 3 || !Array.from(vector).every(isFiniteNumber)) issue(`${elementPath}.${field}`, 'Expected three finite numbers.');
        }
        if (element.opacity !== undefined && (!isFiniteNumber(element.opacity) || element.opacity < 0 || element.opacity > 1)) {
          issue(`${elementPath}.opacity`, 'Expected opacity between zero and one.');
        }
        if (element.properties !== undefined && (!isRecord(element.properties) || !isJson(element.properties))) {
          issue(`${elementPath}.properties`, 'Expected an object containing finite JSON values without cycles.');
        }
      }
    }
  }
  return { valid: issues.length === 0, issues };
}
