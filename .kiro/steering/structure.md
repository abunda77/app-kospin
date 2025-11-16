---
inclusion: always
---

# Project Structure

## Root Directory Organization

```
├── app/                    # Main application code (Expo Router)
├── assets/                 # Static assets (images, fonts, icons)
├── components/             # Reusable React components
├── constants/              # App constants and theme definitions
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript type definitions
└── scripts/                # Build and utility scripts
```

## App Directory (Expo Router)

The `app/` directory uses file-based routing:

- `app/(tabs)/` - Tab navigation routes (grouped route)
- `app/(menu)/` - Menu screens (grouped route with header)
- `app/components/` - Route-specific components
- `app/config/` - Configuration files (API endpoints, etc.)
- `app/_layout.tsx` - Root layout with theme provider and navigation setup
- `app/+not-found.tsx` - 404 error screen

### Routing Conventions

- Grouped routes use parentheses: `(tabs)`, `(menu)`
- Layout files: `_layout.tsx`
- Special files: `+not-found.tsx`

## Assets Organization

Assets are organized by feature/category:

- `assets/fonts/` - Custom fonts (SpaceMono)
- `assets/images/` - App images and logos
- `assets/icons/` - Icon sets
- `assets/tab-icons/` - Bottom tab navigation icons
- `assets/e-wallet/`, `assets/tagihan/`, etc. - Feature-specific assets

## Components

- `components/` - Global reusable components
- `components/ui/` - UI primitives and design system components
- `components/__tests__/` - Component tests
- `app/components/` - Route-specific components

## Configuration Files

- `app/config/api.ts` - API base URL and endpoint definitions
- `app.json` - Expo configuration
- `tsconfig.json` - TypeScript configuration with path aliases
- `tailwind.config.js` - Tailwind CSS configuration
- `babel.config.js` - Babel configuration for NativeWind and Reanimated

## Key Patterns

1. **API Configuration**: Dynamic API base URL fetched from remote config endpoint
2. **Theme Support**: Automatic dark/light theme via React Navigation ThemeProvider
3. **Type Safety**: Strict TypeScript with typed routes enabled
4. **Styling**: NativeWind classes for consistent styling across components
5. **Navigation**: Stack navigator wraps tab and menu navigators
