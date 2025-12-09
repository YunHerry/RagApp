# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

知索 (RagApp) is a React Native mobile application built with Expo that provides a RAG (Retrieval-Augmented Generation) chat interface. Users can upload documents to build a personal knowledge base and chat with an AI that references those documents.

## Development Commands

```bash
# Install dependencies (uses pnpm)
pnpm install

# Start development server (clears cache)
pnpm dev

# Run on specific platforms
pnpm android          # Run on Android
pnpm ios              # Run on iOS
pnpm web              # Run on web browser

# Build commands
pnpm prebuild         # Generate native projects
pnpm prebuild:clean   # Clean and regenerate native projects

# iOS specific
pnpm pods             # Install CocoaPods dependencies
```

## Architecture

### Tech Stack
- **Framework**: Expo SDK 54 with React Native 0.81
- **Routing**: Expo Router (file-based routing in `app/`)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **UI Components**: React Native Reusables (@rn-primitives)
- **State**: React Context (DrawerContext, ChatInfoContext, WindowContext)
- **Storage**: AsyncStorage for local persistence
- **HTTP**: Axios with SSE streaming for chat responses

### Directory Structure
- `app/` - Expo Router pages. `_layout.tsx` is the root layout with drawer navigation, `index.tsx` is the main chat screen
- `components/` - React components. `ui/` contains reusable primitives from React Native Reusables
- `lib/api/` - API functions (file upload with presigned URLs)
- `lib/context/` - React contexts for global state (drawer, chat session)
- `lib/type/` - TypeScript type definitions
- `lib/config/` - Configuration (env, markdown rules, supported file types)
- `lib/constant/` - Constants (screen dimensions, storage keys)

### Key Patterns

**Context Providers** (defined in `app/_layout.tsx`):
- `ChatInfoContext` - Current chat session state
- `DrawerContext` - Drawer open state and chat list
- `WindowContext` - Modal windows state (upload, data manager)

**API Integration**:
- Backend: `https://api.ragapp.linc.work`
- User identification via `X-User-ID` header (derived from session ID)
- Chat uses SSE streaming via Axios `onDownloadProgress`
- File upload flow: presign → upload to OSS → confirm → poll status

**Styling**:
- Use NativeWind className syntax with Tailwind classes
- Theme support via `useColorScheme()` from nativewind
- Custom theme colors defined in `lib/theme.ts`

## CI/CD

GitHub Actions workflow (`.github/workflows/main.yml`) builds Android APK on push to main:
- Runs `expo prebuild --platform android --clean`
- Builds release APK with Gradle
- Creates GitHub release with APK artifact
