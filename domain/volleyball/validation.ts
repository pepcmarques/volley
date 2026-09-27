import { getRotationPosition } from "./rotations";
import { getSetters, validateSystemConfiguration } from "./systems";
import type {
  Player,
  Rotation,
  TacticalAssignment,
  TeamConfiguration,
  ValidationIssue,
  ValidationResult,
} from "./types";

export function validateLineup(players: Player[], rotation: Rotation): ValidationResult {
  const errors = [];
  const ids = Object.values(rotation);
  const knownIds = new Set(players.map((player) => player.id));

  if (ids.length !== 6 || new Set(ids).size !== 6) {
    errors.push({ code: "lineup.duplicates", message: "The starting rotation must contain six unique players." });
  }
  if (ids.some((id) => !knownIds.has(id))) {
    errors.push({ code: "lineup.unknown-player", message: "Every rotation slot must reference a known player." });
  }
  if (ids.some((id) => players.find((player) => player.id === id)?.roles.includes("libero"))) {
    errors.push({ code: "lineup.libero", message: "A libero cannot be part of the six-player starting rotation." });
  }

  return { valid: errors.length === 0, errors, warnings: [] };
}

export function validateRotation(rotation: Rotation, players: Player[]): ValidationResult {
  const lineupResult = validateLineup(players, rotation);
  const errors = [...lineupResult.errors];
  const warnings: ValidationIssue[] = [];
  const positions = Object.values(rotation).map((id) => getRotationPosition(rotation, id));
  if (positions.some((position) => position === undefined)) {
    errors.push({ code: "rotation.position", message: "Each player must occupy one rotation position." });
  }
  return { valid: errors.length === 0, errors, warnings };
}

export function validateState({
  players,
  rotation,
  tacticalAssignments,
  configuration,
}: {
  players: Player[];
  rotation: Rotation;
  tacticalAssignments: Record<string, TacticalAssignment>;
  configuration: TeamConfiguration;
}): ValidationResult {
  const rotationResult = validateRotation(rotation, players);
  const systemErrors = validateSystemConfiguration(players, configuration).map((message) => ({
    code: "system.configuration",
    message,
  }));
  const assignments = Object.values(tacticalAssignments);
  const assignmentIds = assignments.map((assignment) => assignment.playerId);
  const warnings =
    assignmentIds.length !== new Set(assignmentIds).size
      ? [{ code: "tactical.duplicate", message: "Two tactical positions currently reference the same player." }]
      : [];

  return {
    valid: rotationResult.valid && systemErrors.length === 0 && warnings.length === 0,
    errors: [...rotationResult.errors, ...systemErrors],
    warnings,
  };
}

export function validateSetterCount(players: Player[], configuration: TeamConfiguration): ValidationResult {
  const required = configuration.offensiveSystem === "5-1" ? 1 : 2;
  const actual = getSetters(players).length;
  const errors =
    actual < required
      ? [{ code: "setter.count", message: `${configuration.offensiveSystem} requires ${required} setter(s).` }]
      : [];
  return { valid: errors.length === 0, errors, warnings: [] };
}
