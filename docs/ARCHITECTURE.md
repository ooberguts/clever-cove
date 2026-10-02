# CleverCove architecture

CleverCove is a local-first Tauri 2 desktop application. React components never write persistence directly; they use the services in `src/services`.

## Layers

- **Application shell** — `src/App.tsx` owns navigation between the learner dashboard, Parent Mode, and games.
- **Profiles** — `ProfileService` exposes only public learner information. It deliberately strips `privateValues`.
- **Parent settings** — `ParentSettingsService` stores a salted hash of the local PIN. The raw PIN is never persisted.
- **Private values** — `PrivateValueService` owns validation, configuration status, updates, and comparisons for parent-provided secrets.
- **Game registry** — `src/games/registry.ts` is the catalog used by the dashboard. Required settings are resolved from each manifest.
- **Progress** — `ProgressService` records aggregate counters and timestamps. It has no API for raw answers.
- **Anonymous exports** — `AnonymousExportService` builds a new allow-listed object rather than filtering the storage object.
- **Updates** — `UpdateService` wraps the Tauri updater and process plugins. Release endpoints and signing keys must be configured before publishing updates.
- **Storage and migrations** — `AppDataService` owns the current schema and creates a backup before migration. Tauri Store persists into the operating system app-data directory. Browser local storage is used only for development preview and tests.

## Privacy boundary

Private values are reachable only through `PrivateValueService`; public profiles never include them. A guided practice game may request its own declared private value when the parent has chosen a learning mode that displays it. The Student ID game uses this narrow path to show the local practice reference, but neither the expected value nor the candidate may be put into progress. Anonymous exports are constructed from safe aggregate fields.

The application has no telemetry, analytics, advertising, cloud backend, or network API. The only optional network feature is the signed GitHub release updater.

Updater artifact generation is intentionally disabled in `tauri.conf.json` for the unsigned first-test build. Before enabling it for a production release, generate a Tauri signing key, replace the placeholder public key, add the private key as a GitHub Actions secret, and set `createUpdaterArtifacts` to `true`.
