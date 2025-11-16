---
inclusion: always
---

# Technology Stack

## Core Framework

- **Expo SDK 53** with new architecture enabled
- **React 19.0.0**
- **React Native 0.79.5**
- **TypeScript 5.3.3** with strict mode enabled

## Navigation

- **Expo Router 5.1.4** - File-based routing system
- **React Navigation** - Bottom Tabs (7.2.0) and Stack (7.1.1)
- Typed routes enabled via Expo experiments

## Styling

- **NativeWind 2.0.11** - Tailwind CSS for React Native
- **TailwindCSS 3.3.2** with PostCSS and Autoprefixer
- Tailwind content paths: `./app/**/*.{js,jsx,ts,tsx}`, `./components/**/*.{js,jsx,ts,tsx}`

## State & Storage

- **AsyncStorage** - General data persistence
- **Expo SecureStore** - Sensitive data storage

## UI Libraries

- Expo Blur, Expo Linear Gradient
- React Native Reanimated 3.17.4
- React Native Gesture Handler
- React Native Toast Message
- React Native Popover Tooltip

## Build & Development

### Common Commands

```bash
# Start development server
npm start

# Platform-specific development
npm run android
npm run ios
npm run web

# Testing
npm test

# Linting
npm run lint

# Reset project to clean state
npm run reset-project
```

### Build Configuration

- **Babel**: Uses `babel-preset-expo` with NativeWind and Reanimated plugins
- **Metro Bundler**: Used for web builds with static output
- **EAS Build**: Project ID `0cfb8075-db1d-4a85-a096-b29d6d2f4aca`

## Path Aliases

- `@/*` maps to project root (configured in tsconfig.json)

## Testing

- **Jest** with `jest-expo` preset
- React Test Renderer for component testing
