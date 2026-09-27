export type RotationPosition = 1 | 2 | 3 | 4 | 5 | 6;

export type CourtPosition = "rightBack" | "rightFront" | "middleFront" | "leftFront" | "leftBack" | "middleBack";
export type TacticalPosition = CourtPosition | "setterBase";

export type PlayerRole =
  | "setter"
  | "outsideHitter"
  | "oppositeHitter"
  | "middleBlocker"
  | "libero"
  | "defensiveSpecialist"
  | "utility";

export type OffensiveSystem = "5-1" | "6-2" | "4-2";
export type SetterSettingPosition = 2 | 2.5 | 3;
export type TacticalRole = PlayerRole | "center";

export interface Player {
  id: string;
  name: string;
  number: number;
  roles: PlayerRole[];
  color: string;
}

export type Rotation = Record<RotationPosition, string>;

export interface TacticalAssignment {
  playerId: string;
  tacticalRole: TacticalRole;
  courtPosition: TacticalPosition;
}

export type TacticalAssignments = Partial<Record<TacticalPosition, TacticalAssignment>>;

export interface TacticalState {
  assignments: Record<CourtPosition, TacticalAssignment>;
}

export interface LiberoConfiguration {
  enabled: boolean;
  playerId?: string;
}

export interface TeamConfiguration {
  offensiveSystem: OffensiveSystem;
  setterSettingPosition: SetterSettingPosition;
  libero: LiberoConfiguration;
}

export interface ValidationIssue {
  code: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

export const ROTATION_POSITIONS: RotationPosition[] = [1, 2, 3, 4, 5, 6];
export const COURT_POSITIONS: CourtPosition[] = [
  "rightBack",
  "rightFront",
  "middleFront",
  "leftFront",
  "leftBack",
  "middleBack",
];

export const ROTATION_TO_COURT_POSITION: Record<RotationPosition, CourtPosition> = {
  1: "rightBack",
  2: "rightFront",
  3: "middleFront",
  4: "leftFront",
  5: "leftBack",
  6: "middleBack",
};
