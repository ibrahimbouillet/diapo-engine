import type { Page, Presentation } from "../../packages/core/src/index.ts";

// Content skeleton: these states are not yet a finished visual presentation.
// Timings include transitions and are rehearsal targets, never autoplay timers.
function page(
  id: string,
  title: string,
  plannedDurationSeconds: number,
  ideas: readonly string[],
): Page {
  return {
    id,
    title,
    plannedDurationSeconds,
    states: ideas.map((idea, index) => ({
      id: `${id}-${index + 1}`,
      elements: {
        "chapter-title": { properties: { text: title } },
        "key-idea": { properties: { text: idea } },
      },
      transition: { durationMs: 700, easing: "easeInOut" },
    })),
  };
}

export const presentation: Presentation = {
  schemaVersion: 1,
  id: "drepanocytose",
  title: "La drépanocytose — un voyage au cœur du sang",
  elements: {
    "chapter-title": { kind: "text", content: "La drépanocytose" },
    "key-idea": { kind: "text", content: "Un voyage au cœur du sang" },
  },
  pages: [
    page("introduction", "Entrer dans le sang", 60, [
      "Comment une cellule microscopique peut-elle changer une vie ?",
      "La drépanocytose : une maladie génétique de l'hémoglobine.",
    ]),
    page("blood", "Le rôle des globules rouges", 90, [
      "L'hémoglobine transporte l'oxygène des poumons vers les tissus.",
      "La souplesse des globules rouges facilite leur passage dans les petits vaisseaux.",
    ]),
    page("hemoglobin-s", "Ce qui change avec l'hémoglobine S", 120, [
      "Gène → hémoglobine → globule rouge.",
      "L'HbS peut former des fibres lorsqu'elle perd son oxygène.",
      "Une cellule contenant déjà de l'HbS peut alors devenir rigide et se déformer.",
    ]),
    page("consequences", "Deux conséquences à distinguer", 90, [
      "La circulation peut être perturbée dans de petits vaisseaux : crises douloureuses.",
      "La destruction accélérée des globules rouges contribue à l'anémie.",
    ]),
    page("inheritance", "Comprendre la transmission", 120, [
      "Exemple : deux parents porteurs du trait drépanocytaire, AS × AS.",
      "À chaque grossesse : 25 % AA, 50 % AS, 25 % SS.",
      "Porteur du trait et malade sont des situations différentes. Il existe aussi d'autres formes de la maladie.",
    ]),
    page("daily-life", "Vivre avec la maladie", 60, [
      "Les manifestations varient selon les personnes.",
      "Comprendre et soutenir les personnes qui vivent avec la maladie.",
    ]),
    page("care", "Dépister, prévenir et soigner", 120, [
      "Dépistage précoce, suivi médical et prévention des complications.",
      "Des traitements adaptés à chaque situation ; la recherche continue.",
    ]),
    page("summary", "Retenir trois idées", 60, [
      "Une maladie génétique de l'hémoglobine.",
      "Des globules rouges qui peuvent devenir rigides et fragiles.",
      "Des soins et un accompagnement adaptés.",
    ]),
  ],
};
