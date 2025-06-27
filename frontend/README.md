# Stuf Frontend

A React + TypeScript frontend for the Stuf inventory management system.

## Quick Start

```bash
npm install
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run test` - Run tests in watch mode
- `npm run test:ci` - Run tests once (for CI)
- `npm run type-check` - Run TypeScript type checking

## Testing

The frontend uses simplified, reliable tests designed to work consistently in CI environments:

### Test Philosophy
- **Simple & Fast**: Tests focus on basic rendering and component structure
- **No External Dependencies**: All external APIs and services are mocked
- **CI-Friendly**: Tests run quickly and don't depend on network or filesystem
- **Minimal Setup**: Reduced test configuration to avoid version conflicts

### Test Structure
- `src/App.test.tsx` - Basic app rendering tests
- `src/test/setup.ts` - Minimal test setup with essential mocks
- `vitest.config.ts` - Simplified Vitest configuration

### Running Tests
```bash
# Development (watch mode)
npm run test

# CI/Production (run once)
npm run test:ci
```

## Architecture

- **React 19** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **React Router** for navigation
- **Axios** for API communication
- **Vitest** for testing

## Key Features

- Responsive design optimized for mobile and desktop
- Dark/light theme support
- AI-powered SmartAdd for item recognition
- QR code generation and scanning
- Real-time inventory management
- Advanced search and filtering
