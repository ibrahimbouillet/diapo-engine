import { minimumVisibleTime, prepareResources, showWhenReady } from './preparation.js';
import { createDemoNavigation } from './navigation.js';

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

function installPresentationControls() {
  const root = document.getElementById('presentation');
  const pages = ['title', 'green', 'red'];
  const navigation = document.getElementById('slide-navigation');
  const nextButton = navigation.querySelector('[data-navigation="next"]');
  const announcement = document.getElementById('page-announcement');
  const message = document.getElementById('fullscreen-message');
  let pointerStart;

  async function enterFullscreen() {
    if (document.fullscreenElement) return;
    if (!document.fullscreenEnabled || !document.documentElement.requestFullscreen) {
      throw new Error('Fullscreen unavailable');
    }
    // Called immediately from F so the browser still has user activation.
    await document.documentElement.requestFullscreen();
    if (!document.fullscreenElement) throw new Error('Fullscreen ended before presentation started');
  }

  const controller = createDemoNavigation({
    showPage(index) {
      for (const [position, id] of pages.entries()) {
        document.getElementById(`${id}-page`).hidden = position !== index;
      }
      document.body.dataset.page = pages[index];
      navigation.hidden = index === 0;
      nextButton.disabled = index === 2;
      announcement.textContent = index === 0
        ? `Introduction : ${document.title}`
        : `Diapositive ${index} sur 2 : scène ${index === 1 ? 'verte' : 'rouge'}.`;
      message.hidden = true;
      if (index === 0 && navigation.contains(document.activeElement)) {
        root.focus({ preventScroll: true });
      }
    },
    fullscreen: {
      enter: enterFullscreen,
      toggle: () => document.fullscreenElement ? document.exitFullscreen() : enterFullscreen(),
    },
  });
  document.body.dataset.page = 'title';

  function isInteractive(target) {
    if (!(target instanceof Element)) return false;
    if (target.closest('[data-navigation]')) return false;
    return Boolean(target.closest('input, textarea, select, button, a, video, audio, [contenteditable]:not([contenteditable="false"]), [role="button"]'));
  }

  document.addEventListener('keydown', event => {
    if (event.defaultPrevented || event.repeat || event.ctrlKey || event.altKey || event.metaKey || isInteractive(event.target)) return;
    if (event.key.toLowerCase() === 'f') {
      event.preventDefault();
      message.hidden = true;
      void controller.present().catch(error => {
        message.textContent = 'Le plein écran est indisponible ici. Ouvre cette page dans ton navigateur, puis appuie sur F.';
        message.hidden = false;
        console.warn('Fullscreen request failed:', error);
      });
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      controller.next();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      controller.previous();
    }
  });

  root.addEventListener('pointerdown', event => {
    pointerStart = event.button === 0 && event.isPrimary ? { x: event.clientX, y: event.clientY } : undefined;
  });
  root.addEventListener('pointercancel', () => { pointerStart = undefined; });
  root.addEventListener('click', event => {
    const dragged = event.detail !== 0 && pointerStart && Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 8;
    pointerStart = undefined;
    if (controller.page === 0 || event.defaultPrevented || event.button !== 0 || event.detail > 1 || event.ctrlKey || event.altKey || event.metaKey || dragged || isInteractive(event.target)) return;
    const control = event.target.closest('[data-navigation]');
    const leftEdge = Math.min(root.clientWidth * 0.12, 120);
    const previous = control ? control.dataset.navigation === 'previous' : event.clientX - root.getBoundingClientRect().left < leftEdge;
    if (previous) controller.previous(); else controller.next();
  });

  document.addEventListener('fullscreenchange', () => { message.hidden = true; });
  root.focus({ preventScroll: true });
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
  document.getElementById('presentation-title').textContent = metadata.title;
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
    // Add actual resources for the first animated scene here when it is created.
  ]).then(completed => {
    performance.mark('preparation-ready');
    performance.measure('resource-preparation', {
      start: 'preparation-start', end: 'preparation-ready', detail: { completed },
    });
    return completed;
  });

  await showWhenReady({ preparation, minimumVisible, show: revealPresentation });
  installPresentationControls();
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
