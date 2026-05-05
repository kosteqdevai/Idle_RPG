# Idle RPG

Medieval idle RPG domain and scene-state prototype.

## Current Build

- Pure domain logic lives in `domain/`.
- Scene-state logic lives in `ui/`.
- A browser-playable MVP slice is available at `src/mvp.html`.
- Persistence uses a storage adapter so browser `localStorage` can be swapped for a future mobile storage layer without changing game logic.

## Verify

```powershell
npm.cmd test
```

