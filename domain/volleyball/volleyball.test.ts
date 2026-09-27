import { describe, expect, it } from "vitest";
import {
  applyLibero,
  calculateRotation,
  calculateTacticalAssignments,
  demoPlayers,
  demoStartingRotation,
  findActiveSetter,
  getOppositeHitterTacticalRole,
  getRotationPosition,
  getTacticalPosition,
  restoreRotationPlayer,
  rotate,
  swapTacticalPositions,
  type TeamConfiguration,
  validateLineup,
} from "./index";

const baseConfiguration: TeamConfiguration = {
  offensiveSystem: "6-2",
  setterSettingPosition: 2.5,
  libero: { enabled: false },
};

describe("rotation engine", () => {
  it("rotates clockwise through 1 -> 6 -> 5 -> 4 -> 3 -> 2 -> 1", () => {
    const rotation = { ...demoStartingRotation };
    expect(rotate(rotation)).toEqual({ 1: "ana", 2: "julia", 3: "carla", 4: "beatriz", 5: "fernanda", 6: "maria" });
    expect(calculateRotation(rotation, 6)).toEqual(rotation);
    expect(rotation).toEqual(demoStartingRotation);
  });

  it("derives every rotation from the starting rotation", () => {
    expect(getRotationPosition(calculateRotation(demoStartingRotation, 3), "maria")).toBe(4);
  });
});

describe("offensive systems", () => {
  it("uses the back-row setter as active setter in 6-2", () => {
    const rotation = { ...demoStartingRotation, 1: "gabriela" };
    expect(findActiveSetter(demoPlayers, rotation, baseConfiguration)?.id).toBe("gabriela");
  });

  it("keeps the configured setter active in 5-1", () => {
    expect(
      findActiveSetter(demoPlayers, demoStartingRotation, { ...baseConfiguration, offensiveSystem: "5-1" })?.id,
    ).toBe("maria");
  });

  it("gives a back-row 5-1 setter the tactical 2.5 base", () => {
    const assignments = calculateTacticalAssignments({
      players: demoPlayers,
      rotation: demoStartingRotation,
      configuration: { ...baseConfiguration, offensiveSystem: "5-1" },
    });
    expect(getTacticalPosition(assignments, "maria")).toBe("setterBase");
  });

  it("gives a back-row 6-2 setter the tactical 2.5 base", () => {
    const rotation = { ...demoStartingRotation, 1: "gabriela", 2: "maria" };
    const assignments = calculateTacticalAssignments({
      players: demoPlayers,
      rotation,
      configuration: baseConfiguration,
    });
    expect(getTacticalPosition(assignments, "gabriela")).toBe("setterBase");
  });

  it("keeps the player in official position 4 visible when front-row roles collide", () => {
    const rotation = calculateRotation(demoStartingRotation, 1);
    const assignments = calculateTacticalAssignments({
      players: demoPlayers,
      rotation,
      configuration: baseConfiguration,
    });
    expect(getTacticalPosition(assignments, rotation[4])).toBeDefined();
  });

  it("changes the opposite tactical role by setter setting position", () => {
    expect(getOppositeHitterTacticalRole(baseConfiguration)).toBe("oppositeHitter");
    expect(getOppositeHitterTacticalRole({ ...baseConfiguration, setterSettingPosition: 3 })).toBe("oppositeHitter");
    expect(getOppositeHitterTacticalRole({ ...baseConfiguration, setterSettingPosition: 2 })).toBe("center");
  });

  it("uses the front-row setter for 4-2", () => {
    const rotation = { ...demoStartingRotation, 1: "gabriela", 2: "maria" };
    expect(
      findActiveSetter(demoPlayers, rotation, {
        ...baseConfiguration,
        offensiveSystem: "4-2",
      })?.id,
    ).toBe("maria");
  });

  it("places a 4-2 setter at position 2 and fills the other front positions by role", () => {
    const rotation = { 1: "ana", 2: "maria", 3: "julia", 4: "carla", 5: "beatriz", 6: "fernanda" } as const;
    const assignments = calculateTacticalAssignments({
      players: demoPlayers,
      rotation,
      configuration: { ...baseConfiguration, offensiveSystem: "4-2", setterSettingPosition: 2 },
    });

    expect(getTacticalPosition(assignments, "maria")).toBe("rightFront");
    expect(getTacticalPosition(assignments, "carla")).toBe("leftFront");
    expect(getTacticalPosition(assignments, "julia")).toBe("middleFront");
    expect(getTacticalPosition(assignments, "maria")).not.toBe("setterBase");
  });

  it("places a 4-2 setter at position 3 and uses position 2 as the free slot", () => {
    const rotation = { 1: "ana", 2: "julia", 3: "maria", 4: "carla", 5: "beatriz", 6: "fernanda" } as const;
    const assignments = calculateTacticalAssignments({
      players: demoPlayers,
      rotation,
      configuration: { ...baseConfiguration, offensiveSystem: "4-2", setterSettingPosition: 3 },
    });

    expect(getTacticalPosition(assignments, "maria")).toBe("middleFront");
    expect(getTacticalPosition(assignments, "carla")).toBe("leftFront");
    expect(getTacticalPosition(assignments, "julia")).toBe("rightFront");
    expect(getTacticalPosition(assignments, "maria")).not.toBe("setterBase");
  });
});

describe("tactical and libero layers", () => {
  it("does not alter official rotation while calculating tactics", () => {
    const rotation = { ...demoStartingRotation };
    const assignments = calculateTacticalAssignments({
      players: demoPlayers,
      rotation,
      configuration: baseConfiguration,
    });
    expect(assignments).toBeDefined();
    expect(rotation).toEqual(demoStartingRotation);
  });

  it("swaps tactical positions immutably without duplicating players", () => {
    const assignments = calculateTacticalAssignments({
      players: demoPlayers,
      rotation: demoStartingRotation,
      configuration: baseConfiguration,
    });
    const swapped = swapTacticalPositions(assignments, "rightFront", "leftFront");
    expect(swapped.rightFront!.playerId).toBe(assignments.leftFront!.playerId);
    expect(swapped.leftFront!.playerId).toBe(assignments.rightFront!.playerId);
    expect(new Set(Object.values(swapped).map((assignment) => assignment.playerId)).size).toBe(6);
    expect(assignments.rightFront!.playerId).not.toBe(swapped.rightFront!.playerId);
  });

  it("applies and restores a libero as a derived back-row overlay", () => {
    const configuration = { ...baseConfiguration, libero: { enabled: true, playerId: "laura" } };
    const withLibero = applyLibero(demoStartingRotation, demoPlayers, configuration.libero);
    expect(Object.values(withLibero)).toContain("laura");
    expect(withLibero).not.toEqual(demoStartingRotation);
    const original = restoreRotationPlayer(withLibero, "maria", configuration.libero);
    expect(original).toEqual(demoStartingRotation);
  });
});

describe("validation", () => {
  it("rejects duplicate starters and libero starters", () => {
    expect(validateLineup(demoPlayers, { ...demoStartingRotation, 6: "maria" }).valid).toBe(false);
    expect(validateLineup(demoPlayers, { ...demoStartingRotation, 6: "laura" }).valid).toBe(false);
  });
});
