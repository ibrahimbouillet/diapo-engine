import type { Cursor, ElementState, Presentation, ResolvedElementState, ResolvedSceneState, SceneState, TransitionPlan } from './types.ts';

function stateAt(presentation: Presentation, cursor: Cursor): SceneState {
  if (!Number.isInteger(cursor.pageIndex) || !Number.isInteger(cursor.stateIndex) || cursor.pageIndex < 0 || cursor.stateIndex < 0) {
    throw new RangeError('Cursor indices must be non-negative integers.');
  }
  const state = presentation.pages[cursor.pageIndex]?.states[cursor.stateIndex];
  if (!state) throw new RangeError('Cursor is outside this presentation.');
  return state;
}

export function nextCursor(presentation: Presentation, cursor: Cursor): Cursor {
  stateAt(presentation, cursor);
  const page = presentation.pages[cursor.pageIndex]!;
  if (cursor.stateIndex + 1 < page.states.length) return { pageIndex: cursor.pageIndex, stateIndex: cursor.stateIndex + 1 };
  if (cursor.pageIndex + 1 < presentation.pages.length) return { pageIndex: cursor.pageIndex + 1, stateIndex: 0 };
  return { ...cursor };
}

export function previousCursor(presentation: Presentation, cursor: Cursor): Cursor {
  stateAt(presentation, cursor);
  if (cursor.stateIndex > 0) return { pageIndex: cursor.pageIndex, stateIndex: cursor.stateIndex - 1 };
  if (cursor.pageIndex > 0) {
    const previousPageIndex = cursor.pageIndex - 1;
    return { pageIndex: previousPageIndex, stateIndex: presentation.pages[previousPageIndex]!.states.length - 1 };
  }
  return { ...cursor };
}

function resolveElement(state: ElementState): ResolvedElementState {
  return {
    position: [...(state.position ?? [0, 0, 0])],
    rotation: [...(state.rotation ?? [0, 0, 0])],
    scale: [...(state.scale ?? [1, 1, 1])],
    opacity: state.opacity ?? 1,
    properties: structuredClone(state.properties ?? {}),
  };
}

/** Always resolve a complete snapshot; no values leak in from the previous state. */
export function resolveState(presentation: Presentation, cursor: Cursor): ResolvedSceneState {
  const state = stateAt(presentation, cursor);
  return {
    pageId: presentation.pages[cursor.pageIndex]!.id,
    id: state.id,
    elements: Object.fromEntries(Object.entries(state.elements).map(([id, element]) => [id, resolveElement(element)])),
    transition: state.transition ? { ...state.transition } : { durationMs: 0, easing: 'linear' },
  };
}

/** Describes identity and endpoints only. A renderer owns interpolation and object lifetime. */
export function planTransition(presentation: Presentation, from: Cursor, to: Cursor): TransitionPlan {
  const source = resolveState(presentation, from);
  const destination = resolveState(presentation, to);
  const plan: TransitionPlan = { retained: [], entering: [], exiting: [], transition: destination.transition };
  for (const elementId of new Set([...Object.keys(source.elements), ...Object.keys(destination.elements)])) {
    const definition = presentation.elements[elementId];
    if (!definition) throw new Error(`Unknown element: ${elementId}`);
    const entry = {
      elementId,
      definition: { ...definition },
      from: Object.hasOwn(source.elements, elementId) ? source.elements[elementId]! : null,
      to: Object.hasOwn(destination.elements, elementId) ? destination.elements[elementId]! : null,
    };
    if (entry.from && entry.to) plan.retained.push(entry);
    else if (entry.to) plan.entering.push(entry);
    else plan.exiting.push(entry);
  }
  return plan;
}

export function totalDurationSeconds(presentation: Presentation): number {
  return presentation.pages.reduce((total, page) => total + page.plannedDurationSeconds, 0);
}
