import { minimumVisibleTime, prepareResources, showWhenReady } from './preparation.js';

const nextFrame = () => new Promise(resolve => requestAnimationFrame(resolve));

async function start() {
  const metadata = await window.presentationHost.whenShown();
  document.title = metadata.title;
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
  const minimumVisible = minimumVisibleTime(metadata.loadingDurationMs);
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
}

start().catch(error => {
  delete document.body.dataset.motion;
  const label = document.querySelector('.loading-label');
  if (label) label.textContent = 'Chargement impossible';
  console.error('Presentation startup failed:', error);
});
