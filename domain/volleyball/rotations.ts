import { ROTATION_POSITIONS, type Rotation, type RotationPosition } from "./types";

/** Official volleyball rotation: 1 -> 6 -> 5 -> 4 -> 3 -> 2 -> 1. */
export function nextRotationPosition(position: RotationPosition): RotationPosition {
  return position === 1 ? 6 : ((position - 1) as RotationPosition);
}

export function rotate(rotation: Rotation): Rotation {
  const next = {} as Rotation;

  for (const position of ROTATION_POSITIONS) {
    next[nextRotationPosition(position)] = rotation[position];
  }

  return next;
}

export function calculateRotation(startingRotation: Rotation, rotationNumber: number): Rotation {
  const steps = ((rotationNumber % 6) + 6) % 6;
  let current = { ...startingRotation };

  for (let index = 0; index < steps; index += 1) {
    current = rotate(current);
  }

  return current;
}

export function getRotationPosition(rotation: Rotation, playerId: string): RotationPosition | undefined {
  return ROTATION_POSITIONS.find((position) => rotation[position] === playerId);
}
