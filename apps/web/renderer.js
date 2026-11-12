import { minimumVisibleTime, prepareResources, showWhenReady } from './preparation.js';

const nextFrame = () => new Promise(resolve => requestAnimationFrame(resolve));
const loadingDurationMs = 1000;

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
  document.body.dataset.motion = 'running';

  const frames = [];
  let frameRequest;
  function recordFrame(timestamp) {
    frames.push(timestamp);
    frameRequest = requestAnimationFrame(recordFrame);
  }
  frameRequest = requestAnimationFrame(recordFrame);
  const minimumVisible = minimumVisibleTime(loadingDurationMs);
  performance.mark('preparation-start');
  const preparation = prepareResources([
    { id: 'intro-images', prepare: () => introImages },
    { id: 'fonts', prepare: () => document.fonts.ready },
    // The normal page is empty today. Add real first-scene model, texture and
    // renderer warm-up tasks here when the 3D scene is implemented.
  ]).then(completed => {
    performance.mark('preparation-ready');
    performance.measure('resource-preparation', {
      start: 'preparation-start', end: 'preparation-ready', detail: { completed },
    });
    return completed;
  });

  await showWhenReady({
    preparation,
    minimumVisible,
    show: () => {
      cancelAnimationFrame(frameRequest);
      performance.mark('loading-hidden');
      const intervals = frames.slice(1).map((time, index) => time - frames[index]).sort((a, b) => a - b);
      performance.measure('loading-animation', {
        start: 'loading-visible',
        end: 'loading-hidden',
        detail: {
          frameCount: frames.length,
          averageFps: frames.length > 1 ? (frames.length - 1) * 1000 / (frames.at(-1) - frames[0]) : null,
          p95FrameMs: intervals.length ? intervals[Math.ceil(intervals.length * 0.95) - 1] : null,
          maxFrameMs: intervals.length ? intervals.at(-1) : null,
        },
      });
      document.getElementById('loading').hidden = true;
      document.getElementById('loading').replaceChildren();
      document.getElementById('presentation').hidden = false;
      document.body.dataset.screen = 'normal';
    },
  }).catch(error => {
    cancelAnimationFrame(frameRequest);
    delete document.body.dataset.motion;
    throw error;
  });
  await nextFrame();
  performance.mark('normal-visible');
  performance.measure('visible-loading', 'loading-visible', 'normal-visible');
  if (new URLSearchParams(location.search).has('diagnostics')) {
    console.info('[Diapo startup] ' + JSON.stringify({
      loadingMs: performance.getEntriesByName('visible-loading')[0].duration,
      cadence: performance.getEntriesByName('loading-animation')[0].detail,
      prepared: performance.getEntriesByName('resource-preparation')[0].detail,
      activeAnimations: document.getAnimations().filter(animation => animation.playState === 'running').length,
      remainingCells: document.querySelectorAll('.blood-cell').length,
    }));
  }
}

start().catch(error => {
  delete document.body.dataset.motion;
  const label = document.querySelector('.loading-label');
  if (label) label.textContent = 'Chargement impossible';
  console.error('Presentation startup failed:', error);
});
