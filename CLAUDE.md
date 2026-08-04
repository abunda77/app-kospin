# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Sinara Soon** is an Expo-based mobile banking app for Kospin Sinara Artha, a cooperative financial institution. Built with Expo SDK 54, React Native 0.81.5, and React 19.1.0. All UI text is in Indonesian (Bahasa Indonesia).

- **Package name**: `com.abunda.poskospin`
- **EAS Project ID**: `0cfb8075-db1d-4a85-a096-b29d6d2f4aca`
- **Primary brand color**: `#1F7900` (green) — used in splash screen, menu header bar, tab bar active tint
- **Secondary brand color**: `#0066AE` (blue) — used in login button gradient, home header, fast menu icons

## Commands

```bash
# Install (always use --legacy-peer-deps — SDK 54 peer deps are not yet aligned)
npm install --legacy-peer-deps

# Start dev server
npx expo start

# Start with cache cleared (needed after SDK upgrades or if stuck on splash)
npx expo start --clear

# Tests (Jest + jest-expo preset, runs in watch mode by default)
npm test

# Lint
npm run lint

# EAS builds
eas build --profile development
eas build --platform all
```

## Architecture

### Routing — Expo Router file-based routing

Two route groups split the app:

- `app/(tabs)/` — bottom tab navigation with 4 tabs: `index` (Beranda/home with login), `dashboard` (menu grid), `mutasi` (transaction history), `akun` (account). The tab bar is a custom floating bar with device-aware bottom offset (hardware nav buttons vs gesture nav on Android, home indicator on iOS).
- `app/(menu)/` — authenticated stack screens behind a login gate. The `(menu)/_layout.tsx` checks `SecureStore` for `secure_token` on mount and on every focus; if absent, it redirects to `(tabs)`. This is the auth guard for the entire authenticated section. Includes nested route groups `kredit/` (loan detail, history, payment, thank-you) and `tabungan/` (savings deposit, withdrawal method, withdrawal thank-you, thank-you).

`app/_layout.tsx` (root) loads the SpaceMono font, hides the splash screen, wraps everything in a `ThemeProvider` with light/dark scheme, and wraps everything in `AutoLogoutProvider`.

### Authentication

- Token stored in **`expo-secure-store`** under key `secure_token`.
- Non-sensitive user data stored in **`AsyncStorage`** under key `userData`.
- Login happens inline in `app/(tabs)/index.tsx` — POST to `/api/login`, saves token + userData, redirects to `/dashboard`.
- `(menu)/_layout.tsx` re-checks auth on every screen focus via `useFocusEffect`.
- **Auto-logout**: `AutoLogoutProvider` (wrapping the entire app in root layout) automatically logs out users after 1 minute of inactivity. It detects touch events via `PanResponder` and app background/foreground transitions via `AppState`. On timeout, it calls the server logout endpoint and clears `SecureStore` + `AsyncStorage`.

### API Layer

`app/config/api.ts` fetches the API base URL dynamically at startup from `https://app.kospinsinaraartha.co.id/api/config/api-base-url` and falls back to that domain if the call fails. All endpoint paths are defined in the `API_ENDPOINTS` object. API calls are made directly with `fetch` from screens — there is no centralized API client or React Query layer.

### Styling

- **NativeWind v2** (Tailwind CSS for React Native) configured in `tailwind.config.js` and `babel.config.js` with `transformOnly` mode.
- Import `globals.css` in screens that use Tailwind classes: `import "../globals.css"`.
- `StyleSheet.create` is used heavily alongside NativeWind — both approaches coexist in this codebase.
- `expo-linear-gradient` is used for gradients (login button, banner fallback, loading states).
- `react-native-reanimated` v4 for animations — requires `react-native-worklets` and `react-native-worklets-core` as npm dependencies, and the `react-native-reanimated/plugin` in `babel.config.js`.

### Key Conventions

- Path alias: `@/` maps to project root (configured in `tsconfig.json`).
- Tab icons are local PNG files in `assets/tab-icons/`, loaded via `require()` with `tintColor`.
- `Toast` from `react-native-toast-message` must be rendered in the screen component (it's placed inside `index.tsx` and other screens, not in a root layout).
- All API-facing screens follow the pattern: get base URL via `getApiBaseUrl()`, append endpoint from `API_ENDPOINTS`, call with `fetch`, handle response inline.

## Troubleshooting Notes

- SDK 54 requires `react-native-worklets@0.5.1` and `react-native-worklets-core@1.6.2` — missing these causes `Cannot find module 'react-native-worklets/plugin'`.
- If the app sticks on splash screen: `npx expo start --clear` (Metro bundler cache from older SDKs).
- Always use `--legacy-peer-deps` for `npm install`.
