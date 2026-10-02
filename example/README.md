# Example app

An Expo Router app that uses `reanimated-liquid-glass-tab-bar`: three tabs in the pill with a badge on one of them, a bubble tab with a badge, scroll-to-collapse on every screen, and a light and a dark theme that follows the system.

The screenshots in the main README are taken from this app on an Android emulator.

```sh
cd example
npm install --legacy-peer-deps
npx expo start
```

Open it in Expo Go, an emulator or a development build. Scroll a screen down to collapse the bar, and up to expand it.

The app imports the package from npm. To try local changes, run `npm pack` in the repository root and install the tarball into this folder with `npm install --no-save --legacy-peer-deps <tarball>`.
