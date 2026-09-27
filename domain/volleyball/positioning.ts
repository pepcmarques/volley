import { getRotationPosition } from "./rotations";
import { findActiveSetter, isBackRow } from "./systems";
import {
  COURT_POSITIONS,
  ROTATION_TO_COURT_POSITION,
  type CourtPosition,
  type Player,
  type Rotation,
  type TacticalAssignment,
  type TacticalAssignments,
  type TacticalPosition,
  type TacticalRole,
  type TeamConfiguration,
} from "./types";

const roleForPosition: Record<CourtPosition, TacticalRole> = {
  rightBack: "oppositeHitter",
  rightFront: "oppositeHitter",
  middleFront: "middleBlocker",
  leftFront: "outsideHitter",
  leftBack: "outsideHitter",
  middleBack: "middleBlocker",
};

export function calculateTacticalAssignments({
  players,
  rotation,
  configuration,
}: {
  players: Player[];
  rotation: Rotation;
  configuration: TeamConfiguration;
}): TacticalAssignments {
  const activeSetter = findActiveSetter(players, rotation, configuration);
  const assignments: TacticalAssignments = {};
  const assigned = new Set<string>();
  const assign = (courtPosition: TacticalAssignment["courtPosition"], player: Player, tacticalRole: TacticalRole) => {
    if (assignments[courtPosition]) return false;
    assignments[courtPosition] = { playerId: player.id, tacticalRole, courtPosition };
    assigned.add(player.id);
    return true;
  };

  const frontRow = ([2, 3, 4] as const)
    .map((position) => players.find((player) => rotation[position] === player.id))
    .filter(Boolean) as Player[];
  const backRow = ([1, 5, 6] as const)
    .map((position) => players.find((player) => rotation[position] === player.id))
    .filter(Boolean) as Player[];

  if (configuration.offensiveSystem === "4-2") {
    const setter = activeSetter && frontRow.some((player) => player.id === activeSetter.id) ? activeSetter : undefined;
    const outsideHitter = frontRow.find((player) => player.id !== setter?.id && player.roles.includes("outsideHitter"));
    const setterPosition = configuration.setterSettingPosition === 2 ? "rightFront" : "middleFront";
    const freePosition = configuration.setterSettingPosition === 2 ? "middleFront" : "rightFront";

    if (setter) assign(setterPosition, setter, "setter");
    if (outsideHitter) assign("leftFront", outsideHitter, "outsideHitter");

    const remainingPlayer = frontRow.find((player) => player.id !== setter?.id && player.id !== outsideHitter?.id);
    if (remainingPlayer) {
      assign(freePosition, remainingPlayer, remainingPlayer.roles[0] ?? "utility");
    }
  } else {
    for (const player of frontRow) {
      if (assigned.has(player.id)) continue;

      const tacticalRole = player.roles.includes("outsideHitter")
        ? "outsideHitter"
        : player.roles.includes("middleBlocker")
          ? "middleBlocker"
          : player.roles.includes("setter")
            ? "setter"
            : player.roles.includes("oppositeHitter")
              ? "oppositeHitter"
              : (player.roles[0] ?? "utility");
      const preferredPosition =
        tacticalRole === "outsideHitter"
          ? "leftFront"
          : tacticalRole === "middleBlocker"
            ? "middleFront"
            : "rightFront";

      if (!assign(preferredPosition, player, tacticalRole)) {
        const fallbackPosition = (["rightFront", "middleFront", "leftFront"] as const).find(
          (position) => !assignments[position],
        );
        if (fallbackPosition) assign(fallbackPosition, player, tacticalRole);
      }
    }
  }

  for (const player of backRow) {
    if (
      activeSetter?.id === player.id &&
      (configuration.offensiveSystem === "5-1" || configuration.offensiveSystem === "6-2")
    ) {
      assign("setterBase", player, "setter");
      continue;
    }
    if (!assigned.has(player.id)) {
      const rotationPosition = getRotationPosition(rotation, player.id);
      const courtPosition = rotationPosition ? ROTATION_TO_COURT_POSITION[rotationPosition] : "middleBack";
      assign(courtPosition, player, roleForPosition[courtPosition]);
    }
  }

  for (const player of players) {
    if (!assigned.has(player.id) && getRotationPosition(rotation, player.id) !== undefined) {
      const rotationPosition = getRotationPosition(rotation, player.id);
      if (rotationPosition)
        assign(
          ROTATION_TO_COURT_POSITION[rotationPosition],
          player,
          roleForPosition[ROTATION_TO_COURT_POSITION[rotationPosition]],
        );
    }
  }

  return assignments;
}

export function getTacticalPosition(
  assignments: TacticalAssignments,
  playerId: string,
): TacticalAssignment["courtPosition"] | undefined {
  return Object.values(assignments).find((assignment) => assignment?.playerId === playerId)?.courtPosition;
}

export function swapTacticalPositions(
  assignments: TacticalAssignments,
  positionA: TacticalPosition,
  positionB: TacticalPosition,
): TacticalAssignments {
  if (positionA === positionB) return { ...assignments };
  if (!assignments[positionA] || !assignments[positionB]) return { ...assignments };
  const next = { ...assignments };
  next[positionA] = { ...assignments[positionB], courtPosition: positionA };
  next[positionB] = { ...assignments[positionA], courtPosition: positionB };
  return next;
}

export function createRotationTacticalAssignments(rotation: Rotation): Record<CourtPosition, TacticalAssignment> {
  return Object.fromEntries(
    COURT_POSITIONS.map((courtPosition) => {
      const position = Object.entries(ROTATION_TO_COURT_POSITION).find(([, value]) => value === courtPosition)?.[0];
      const rotationPosition = Number(position) as keyof Rotation;
      const playerId = rotation[rotationPosition];
      return [courtPosition, { playerId, tacticalRole: roleForPosition[courtPosition], courtPosition }];
    }),
  ) as Record<CourtPosition, TacticalAssignment>;
}

export function isRotationPositionLegal(position: CourtPosition, rotationPosition: number): boolean {
  return (
    ROTATION_TO_COURT_POSITION[rotationPosition as keyof typeof ROTATION_TO_COURT_POSITION] === position ||
    isBackRow(rotationPosition as 1 | 2 | 3 | 4 | 5 | 6)
  );
}
