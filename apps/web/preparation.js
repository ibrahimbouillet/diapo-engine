// Prepare resources in order rather than starting every allocation at once.
export async function prepareResources(tasks) {
  const completed = [];
  for (const task of tasks) {
    await task.prepare();
    completed.push(task.id);
  }
  return completed;
}

export async function minimumVisibleTime(milliseconds) {
  const deadline = performance.now() + milliseconds;
  do {
    await new Promise(resolve => setTimeout(resolve, Math.ceil(deadline - performance.now())));
  } while (performance.now() < deadline);
}

export async function showWhenReady({ preparation, minimumVisible, show }) {
  const [completed] = await Promise.all([preparation, minimumVisible]);
  show();
  return completed;
}
