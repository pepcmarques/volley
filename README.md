# Volleyball Rotation Planner

The planner lives at `/` and keeps official rotation order separate from tactical court movement.

## Architecture

- `domain/volleyball/types.ts` defines players, rotations, court positions, systems, libero configuration, and validation results.
- `domain/volleyball/rotations.ts` derives all six rotations immutably from the starting lineup using `1 -> 6 -> 5 -> 4 -> 3 -> 2 -> 1`.
- `domain/volleyball/systems.ts` selects active setters for `5-1`, `6-2`, and `4-2` modes and models setter setting position `2` or `3`.
- `domain/volleyball/positioning.ts` derives tactical assignments and provides immutable tactical swaps.
- `domain/volleyball/libero.ts` applies a libero as a derived back-row overlay without replacing the official rotation.
- `domain/volleyball/validation.ts` validates lineup, rotation, system, and tactical state.
- `app/page.tsx` is the React application layer. It owns selection, view mode, and undo/redo history; it does not calculate volleyball rules.

## Rules and assumptions

The six-player rotation is the official pre-serve order. Tactical positions are a separate post-serve layer. A libero is never part of the six-player starting rotation and is shown as a derived replacement for a back-row player. The `4-2` configuration uses the front-row setter behavior; the back-row setter/infiltration behavior belongs to `6-2`. The demo lineup supplies two setters for both systems.

## Development

```bash
npm run dev -- --port 3333
npm test
npm run lint
npm run build
```

Open [http://localhost:3333](http://localhost:3333) while the development server is running.
