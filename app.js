import { minimumVisibleTime, prepareResources, showWhenReady } from './preparation.js';

const nextFrame = () => new Promise(resolve => requestAnimationFrame(resolve));
const loadingDurationMs = 1000;
const diagnostics = new URLSearchParams(location.search).has('diagnostics');

function whenVisible() {
  if (document.visibilityState === 'visible') return Promise.resolve();
  return new Promise(resolve => {
    const onVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;
      document.removeEventListener('visibilitychange', onVisibilityChange);
      resolve();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
  });
}

function fadeOut(overlay) {
  return new Promise(resolve => {
    let timeout;
    const finish = () => {
      overlay.removeEventListener('transitionend', onTransitionEnd);
      clearTimeout(timeout);
      resolve();
    };
    const onTransitionEnd = event => {
      if (event.target === overlay && event.propertyName === 'opacity') finish();
    };
    overlay.addEventListener('transitionend', onTransitionEnd);
    const duration = parseFloat(getComputedStyle(overlay).transitionDuration) * 1000;
    overlay.classList.add('is-fading');
    if (duration === 0) { finish(); return; }
    timeout = setTimeout(finish, Math.max(500, duration + 160));
  });
}

function cadence(frames) {
  const intervals = frames.slice(1).map((time, index) => time - frames[index]).sort((a, b) => a - b);
  return {
    frameCount: frames.length,
    averageFps: frames.length > 1 ? (frames.length - 1) * 1000 / (frames.at(-1) - frames[0]) : null,
    p95FrameMs: intervals.length ? intervals[Math.ceil(intervals.length * 0.95) - 1] : null,
    maxFrameMs: intervals.length ? intervals.at(-1) : null,
  };
}

async function revealPresentation() {
  const overlay = document.getElementById('loading');
  document.getElementById('presentation').hidden = false;
  document.body.dataset.screen = 'transition';
  performance.mark('fade-start');

  // The logo hold is static. Sample frames only during the fade, on demand.
  const frames = [];
  let frameRequest;
  if (diagnostics) {
    const recordFrame = timestamp => {
      frames.push(timestamp);
      frameRequest = requestAnimationFrame(recordFrame);
    };
    frameRequest = requestAnimationFrame(recordFrame);
  }
  try {
    await fadeOut(overlay);
    overlay.hidden = true;
    overlay.replaceChildren();
    document.body.dataset.screen = 'normal';
    await nextFrame();
  } finally {
    if (frameRequest !== undefined) cancelAnimationFrame(frameRequest);
  }
  performance.mark('normal-visible');
  performance.measure('visible-loading', 'loading-visible', 'fade-start');
  performance.measure('loading-fade', {
    start: 'fade-start', end: 'normal-visible', detail: cadence(frames),
  });
}

async function start() {
  const response = await fetch(new URL('./presentation.json', import.meta.url));
  if (!response.ok) throw new Error(`Presentation metadata unavailable (${response.status})`);
  const metadata = await response.json();
  if (typeof metadata.title !== 'string' || metadata.title.trim() === '') {
    throw new Error('Presentation metadata must contain a title');
  }
  document.title = metadata.title;
  await whenVisible();
  const introImages = Promise.all([...document.querySelectorAll('#loading img')].map(image => image.decode()));
  await introImages;
  await nextFrame();
  await nextFrame();
  performance.mark('loading-visible');
  const minimumVisible = minimumVisibleTime(loadingDurationMs);
  performance.mark('preparation-start');
  const preparation = prepareResources([
    { id: 'intro-images', prepare: () => introImages },
    { id: 'fonts', prepare: () => document.fonts.ready },
    // Add real first-page resources here when the black placeholder is replaced.
  ]).then(completed => {
    performance.mark('preparation-ready');
    performance.measure('resource-preparation', {
      start: 'preparation-start', end: 'preparation-ready', detail: { completed },
    });
    return completed;
  });

  await showWhenReady({ preparation, minimumVisible, show: revealPresentation });
  if (diagnostics) {
    const hold = performance.getEntriesByName('visible-loading')[0];
    const fade = performance.getEntriesByName('loading-fade')[0];
    console.info('[Diapo startup] ' + JSON.stringify({
      holdMs: hold.duration,
      fadeMs: fade.duration,
      totalMs: hold.duration + fade.duration,
      cadence: fade.detail,
      prepared: performance.getEntriesByName('resource-preparation')[0].detail,
      activeAnimations: document.getAnimations().filter(animation => animation.playState === 'running').length,
      remainingLogo: document.querySelectorAll('.loading-logo').length,
    }));
  }
}

start().catch(error => {
  const label = document.getElementById('loading-error');
  if (label) label.hidden = false;
  console.error('Presentation startup failed:', error);
});
