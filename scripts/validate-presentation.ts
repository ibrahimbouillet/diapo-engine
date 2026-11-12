import { totalDurationSeconds, validatePresentation } from '../packages/core/src/index.ts';
import { presentation } from '../presentations/drepanocytose/presentation.ts';

const validation = validatePresentation(presentation);
if (!validation.valid) {
  for (const issue of validation.issues) console.error(`${issue.path}: ${issue.message}`);
  process.exitCode = 1;
} else {
  const duration = totalDurationSeconds(presentation);
  console.log(`${presentation.title}: ${presentation.pages.length} pages, ${duration} seconds planned.`);
  if (duration !== 720) {
    console.error('The first presentation must total 720 seconds (12 minutes), excluding questions.');
    process.exitCode = 1;
  }
}
