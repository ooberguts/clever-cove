# Adding a minigame

1. Create `src/games/<game-name>/` with a manifest, game logic, React entry component, and tests.
2. Give the game a stable reverse-domain-style ID such as `math.fractions-match`.
3. Implement a `GameManifest` from `src/games/types.ts`. Declare grades, skills, route, version, and every required parent setting.
4. Add the manifest to `gameRegistry` in `src/games/registry.ts`.
5. Add the component route to the application shell. The shell should pass services and the selected public learner profile into the game.
6. Use `ProgressService` for aggregate counters. Never persist raw learner responses unless a new, privacy-reviewed interface explicitly allows that data.
7. Use `PrivateValueService.matches()` when a game only needs to check a private value. `getForGuidedPractice()` is reserved for an explicitly parent-configured learning experience that must display its own reference value; document and test that exception.
8. Extend `AnonymousExportService` with an explicit allow-list of safe statistics. Do not serialize stored learner objects.

## Manifest example

```ts
export const manifest: GameManifest = {
  id: "math.fractions-match",
  title: "Fraction Match",
  description: "Match pictures with equivalent fractions.",
  supportedGrades: ["3", "4", "5"],
  subject: "math",
  skillIds: ["math.fractions.equivalence"],
  requiredSettings: [],
  version: "1.0.0",
  route: "/games/fractions-match",
  accent: "#2463d4",
};
```

The dashboard automatically locks any game whose `requiredSettings` are not configured. Keep that behavior generic; do not add a title- or ID-specific lock check.

## Completion checklist

- Mouse/touch and keyboard behavior work.
- Controls are semantic and focus-visible; feedback uses `aria-live` when appropriate.
- Progress contains no raw answers or private values.
- Anonymous export tests prove sensitive data is absent.
- `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` pass.
