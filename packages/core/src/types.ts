export type ElementKind = 'text' | 'model3d' | 'image' | 'video' | 'audio';
export type Vector3 = readonly [number, number, number];
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export interface AssetDefinition {
  /** File path relative to the presentation directory. Remote URLs are not supported. */
  source: string;
}

export interface ElementDefinition {
  kind: ElementKind;
  content?: string;
  assetId?: string;
}

export interface ElementState {
  position?: Vector3;
  /** Euler angles in radians. A renderer must document its rotation order. */
  rotation?: Vector3;
  scale?: Vector3;
  opacity?: number;
  properties?: Record<string, JsonValue>;
}

export interface Transition {
  durationMs: number;
  easing: 'linear' | 'easeInOut';
}

export interface SceneState {
  id: string;
  /** Complete membership snapshot: omitted elements are absent from this state. */
  elements: Record<string, ElementState>;
  /** Transition used when entering this state, including through backward navigation. */
  transition?: Transition;
}

export interface Page {
  id: string;
  title: string;
  /** Rehearsal estimate only. It never advances the presentation automatically. */
  plannedDurationSeconds: number;
  states: SceneState[];
}

export interface Presentation {
  schemaVersion: 1;
  id: string;
  title: string;
  elements: Record<string, ElementDefinition>;
  assets?: Record<string, AssetDefinition>;
  pages: Page[];
}

export interface Cursor {
  pageIndex: number;
  stateIndex: number;
}

export interface ResolvedElementState {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  opacity: number;
  properties: Record<string, JsonValue>;
}

export interface ResolvedSceneState {
  pageId: string;
  id: string;
  elements: Record<string, ResolvedElementState>;
  transition: Transition;
}

export interface TransitionEntry {
  elementId: string;
  definition: ElementDefinition;
  from: ResolvedElementState | null;
  to: ResolvedElementState | null;
}

export interface TransitionPlan {
  retained: TransitionEntry[];
  entering: TransitionEntry[];
  exiting: TransitionEntry[];
  transition: Transition;
}

export interface ValidationIssue {
  path: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}
