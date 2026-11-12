// This controller only drives the title and the two temporary test scenes.
export function createDemoNavigation({ showPage, fullscreen }) {
  let page = 0;
  let pending = false;

  function move(direction) {
    if (page === 0 || pending) return;
    const next = Math.max(0, Math.min(2, page + direction));
    if (next === page) return;
    page = next;
    showPage(page);
  }

  return {
    get page() { return page; },
    next: () => move(1),
    previous: () => move(-1),
    async present() {
      if (pending) return;
      pending = true;
      try {
        if (page === 0) {
          await fullscreen.enter();
          page = 1;
          showPage(page);
        } else {
          await fullscreen.toggle();
        }
      } finally {
        pending = false;
      }
    },
  };
}
