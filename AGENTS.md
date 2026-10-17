ChoreFlow is an Expo/React Native chore tracker for iOS, Android and web. Prioritize mobile-first patterns, performance, and cross-platform compatibility. The project uses npm (`package-lock.json`).

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

```bash
npm run check               # typecheck + lint + format check + tests — exactly what CI runs
npm run format              # apply Prettier
npx expo install <package>  # ALWAYS use instead of npm install — resolves SDK-compatible versions
npx expo install <package> -- --dev  # dev dependency (the extra `--` is required on Windows)
npx expo install --fix      # fix incompatible package versions
npx expo-doctor             # diagnose dependency and config issues (also runs in CI)
npx expo start              # start the dev server
```

Run `npm run check` before declaring any task done. Use `npm run lint` (`eslint .`), not `npx expo lint` — the latter skips `App.tsx` at the project root.

## Git workflow

`main` is protected for everyone, admins included: direct pushes are rejected and merges require the CI `check` job to pass on an up-to-date branch. Always work on a branch, push it, and open a pull request. Never force-push or try to bypass protection.

## Persisted data

All app data lives in AsyncStorage under `APP_DATA_STORAGE_KEY` in `src/utils/storage.ts`. Renaming the key or changing the stored shape without a migration in `loadAppData` silently wipes users' chores. Treat any change to `src/types/chore.ts` that affects saved fields as a data migration, and add a test for loading the old shape.

## Dependencies

Expo pins React, React Native and its own modules per SDK. Upgrade those with `npx expo install --fix`, never by hand or via Dependabot (which is configured to ignore them).

## Platform differences

- Notifications are scheduled only on iOS and Android; `src/utils/notifications.ts` no-ops on web.
- Dialogs use `alert` / `window.confirm` on web and `Alert.alert` on native.
- Any new native-only capability needs a `Platform.OS` guard or a web fallback.

## Code layout

- `App.tsx` currently holds app state and the single home screen. The project is moving to Expo Router: put new screens in `src/app/` (`_layout.tsx` files define navigators) and keep non-route code (components, hooks, utils) outside it. Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`. Docs: https://docs.expo.dev/router/introduction.md
- Pure logic (time calculations, storage, sorting) goes in `src/utils/` with unit tests in `__tests__/`. Components stay presentational.

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `npx eas-cli@latest <command>`; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
