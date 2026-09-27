import { getRotationPosition } from "./rotations";
import { isBackRow } from "./systems";
import type { LiberoConfiguration, Player, Rotation, RotationPosition } from "./types";

export function getValidLiberoReplacements(
  rotation: Rotation,
  liberoConfiguration: LiberoConfiguration,
): RotationPosition[] {
  if (!liberoConfiguration.enabled || !liberoConfiguration.playerId) return [];
  return ([1, 5, 6] as RotationPosition[]).filter((position) => rotation[position] !== liberoConfiguration.playerId);
}

export function applyLibero(rotation: Rotation, players: Player[], liberoConfiguration: LiberoConfiguration): Rotation {
  if (!liberoConfiguration.enabled || !liberoConfiguration.playerId) return { ...rotation };
  const libero = players.find((player) => player.id === liberoConfiguration.playerId);
  if (!libero || !libero.roles.includes("libero")) return { ...rotation };

  const replaced = { ...rotation };
  const replacementPosition = ([1, 5, 6] as RotationPosition[]).find((position) => {
    const player = players.find((candidate) => candidate.id === rotation[position]);
    return player && !player.roles.includes("libero");
  });

  if (replacementPosition !== undefined) replaced[replacementPosition] = libero.id;
  return replaced;
}

export function restoreRotationPlayer(
  rotation: Rotation,
  originalPlayerId: string,
  liberoConfiguration: LiberoConfiguration,
): Rotation {
  if (!liberoConfiguration.enabled || !liberoConfiguration.playerId) return { ...rotation };
  const position = getRotationPosition(rotation, liberoConfiguration.playerId);
  if (position === undefined || !isBackRow(position)) return { ...rotation };
  return { ...rotation, [position]: originalPlayerId };
}
