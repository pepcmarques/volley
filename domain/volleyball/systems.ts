import { getRotationPosition } from "./rotations";
import { ROTATION_POSITIONS, type Player, type Rotation, type RotationPosition, type TeamConfiguration } from "./types";

export function isBackRow(position: RotationPosition): boolean {
  return position === 1 || position === 5 || position === 6;
}

export function getSetters(players: Player[]): Player[] {
  return players.filter((player) => player.roles.includes("setter"));
}

export function findActiveSetter(
  players: Player[],
  rotation: Rotation,
  configuration: TeamConfiguration,
): Player | undefined {
  const setters = getSetters(players);

  if (configuration.offensiveSystem === "5-1") {
    return setters[0];
  }

  if (configuration.offensiveSystem === "6-2") {
    return (
      setters.find((setter) => {
        const position = getRotationPosition(rotation, setter.id);
        return position !== undefined && isBackRow(position);
      }) ?? setters[0]
    );
  }

  return (
    setters.find((setter) => {
      const position = getRotationPosition(rotation, setter.id);
      return position !== undefined && !isBackRow(position);
    }) ?? setters[0]
  );
}

export function getOppositeHitterTacticalRole(configuration: TeamConfiguration): "center" | "oppositeHitter" {
  return configuration.setterSettingPosition === 2 ? "center" : "oppositeHitter";
}

export function validateSystemConfiguration(players: Player[], configuration: TeamConfiguration): string[] {
  const setters = getSetters(players);
  const errors: string[] = [];

  if (configuration.offensiveSystem === "5-1" && setters.length < 1) {
    errors.push("5-1 requires at least one setter.");
  }

  if ((configuration.offensiveSystem === "6-2" || configuration.offensiveSystem === "4-2") && setters.length < 2) {
    errors.push(`${configuration.offensiveSystem} requires two setters.`);
  }

  return errors;
}

export function getFrontRowPositions(): RotationPosition[] {
  return ROTATION_POSITIONS.filter((position) => !isBackRow(position));
}
