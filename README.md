# ChoreFlow

A chore tracker for iOS, Android and the web, built with Expo and React Native. Every chore has a
repeat interval, and the list is always sorted by how overdue each chore is, so the one that most
needs doing is at the top.

## Features

- **Repeat intervals**: every _N_ days, weeks or months, with presets for the common ones.
- **Labels**: tag each chore with any number of your own labels and filter the list by label.
- **One-tap logging**: mark a chore done from the list, from a widget, or from its edit screen.
- **Reminders**: an optional local notification when a chore comes due, and another one later if
  it's still overdue.
- **Home widgets** you can switch on and off:
  - _Consistency Tracker_: on-time score, current streak and a bar chart of recent cycles for one
    chore.
  - _Most Late Chores_: the top 3, 5 or 10 most overdue chores.
  - _Category Shortcuts_: one tile per label with chore and overdue counts.
  - _Overview_: overdue, on-track and total counts.

All data is stored on the device with AsyncStorage. There is no account or server.

## Getting started

Requirements: Node.js 22 (see `.nvmrc`; 20.19.4 or newer also works), plus the [Expo Go](https://expo.dev/go) app on your phone or a
simulator/emulator.

```bash
npm install
npm start
```

Scan the QR code with your phone's camera (iOS) or the Expo Go app (Android). If your phone can't
reach your computer, for example on guest Wi-Fi, use `npx expo start --tunnel`.

To run in a browser instead:

```bash
npm run web
```

Reminders only work on iOS and Android. They are not scheduled on the web.

## Scripts

| Command                 | What it does                                   |
| ----------------------- | ---------------------------------------------- |
| `npm start`             | Start the Expo dev server                      |
| `npm run web`           | Start the dev server and open the web version  |
| `npm run lint`          | Run ESLint over the project                    |
| `npm run format`        | Format all files with Prettier                 |
| `npm run format:check`  | Check formatting without changing files        |
| `npm run typecheck`     | Type-check with TypeScript                     |
| `npm test`              | Run the Jest unit tests                        |
| `npm run test:coverage` | Run tests with a coverage report               |
| `npm run check`         | Typecheck, lint, format check and tests (= CI) |

## Project structure

```
App.tsx                 Root component: app state, persistence, home screen layout
src/
  components/           Chore card, edit modal, header, filter bar
    widgets/            Home screen widgets and the widget settings modal
  theme/colors.ts       Color palette
  types/chore.ts        Shared data types
  utils/
    storage.ts          Load/save app data (AsyncStorage)
    time.ts             Lateness, sorting and consistency calculations
    notifications.ts    Reminder permissions and scheduling
    haptics.ts          Haptic feedback helpers
__tests__/              Unit tests for the utils
```

## Upgrading dependencies

Expo pins compatible versions of React Native and its own modules for each SDK release. Add or
upgrade those packages with `npx expo install <package>` (or `npx expo install --fix`) rather than
`npm install`. Run `npx expo-doctor` afterwards to catch mismatches.

## Continuous integration

GitHub Actions runs `npm run check` on every push to `main` and on every pull request. See
[`.github/workflows/ci.yml`](.github/workflows/ci.yml).
