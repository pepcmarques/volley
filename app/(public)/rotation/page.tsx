"use client";

import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  calculateRotation,
  calculateTacticalAssignments,
  demoPlayers,
  demoStartingRotation,
  getRotationPosition,
  swapTacticalPositions,
  type CourtPosition,
  type OffensiveSystem,
  type Player,
  type PlayerRole,
  type Rotation,
  type SetterSettingPosition,
  type TacticalAssignment,
  type TacticalAssignments,
  type TacticalPosition,
  type TeamConfiguration,
} from "@/domain/volleyball";

type ViewMode = "rotation" | "tactical";

const courtSpots: Record<TacticalPosition, { left: number; top: number }> = {
  leftFront: { left: 25, top: 28 },
  middleFront: { left: 50, top: 16 },
  rightFront: { left: 75, top: 28 },
  leftBack: { left: 25, top: 72 },
  middleBack: { left: 50, top: 60 },
  rightBack: { left: 75, top: 72 },
  setterBase: { left: 62.5, top: 8 },
};

const courtLabels: Record<TacticalPosition, string> = {
  rightBack: "1 / Right Back",
  rightFront: "2 / Right Front",
  middleFront: "3 / Middle Front",
  leftFront: "4 / Left Front",
  leftBack: "5 / Left Back",
  middleBack: "6 / Middle Back",
  setterBase: "2.5 / Setter base",
};

const positionForCourtSpot: Record<CourtPosition, 1 | 2 | 3 | 4 | 5 | 6> = {
  rightBack: 1,
  rightFront: 2,
  middleFront: 3,
  leftFront: 4,
  leftBack: 5,
  middleBack: 6,
};

const roleNames: Record<Player["roles"][number] | "center", string> = {
  setter: "Setter",
  outsideHitter: "Outside hitter",
  oppositeHitter: "Opposite hitter",
  middleBlocker: "Middle blocker",
  libero: "Libero",
  defensiveSpecialist: "Defensive specialist",
  utility: "Utility",
  center: "Center",
};

const editableRoles: PlayerRole[] = ["setter", "outsideHitter", "oppositeHitter", "middleBlocker"];

const baseConfiguration: TeamConfiguration = {
  offensiveSystem: "4-2",
  setterSettingPosition: 3,
  libero: { enabled: false },
};

function courtPositionForRotationPosition(rotationPosition: 1 | 2 | 3 | 4 | 5 | 6): CourtPosition {
  return (Object.entries(positionForCourtSpot).find(([, position]) => position === rotationPosition)?.[0] ??
    "rightBack") as CourtPosition;
}

function swapRotationPlayers(rotation: Rotation, draggedPlayerId: string, targetPlayerId: string): Rotation {
  const nextRotation = { ...rotation };
  const draggedPosition = Object.entries(rotation).find(([, playerId]) => playerId === draggedPlayerId)?.[0];
  const targetPosition = Object.entries(rotation).find(([, playerId]) => playerId === targetPlayerId)?.[0];

  if (draggedPosition && targetPosition) {
    nextRotation[Number(draggedPosition) as keyof Rotation] = targetPlayerId;
    nextRotation[Number(targetPosition) as keyof Rotation] = draggedPlayerId;
  } else if (draggedPosition && !targetPosition) {
    nextRotation[Number(draggedPosition) as keyof Rotation] = targetPlayerId;
  } else if (!draggedPosition && targetPosition) {
    nextRotation[Number(targetPosition) as keyof Rotation] = draggedPlayerId;
  }

  return nextRotation;
}

export default function VolleyballPlannerPage() {
  const [players, setPlayers] = useState<Player[]>(demoPlayers);
  const [startingRotation, setStartingRotation] = useState<Rotation>(demoStartingRotation);
  const [rotationNumber, setRotationNumber] = useState(0);
  const [configuration, setConfiguration] = useState<TeamConfiguration>(baseConfiguration);
  const [viewMode, setViewMode] = useState<ViewMode>("rotation");
  const [tacticalAssignments, setTacticalAssignments] = useState<TacticalAssignments>(() =>
    calculateTacticalAssignments({
      players,
      rotation: demoStartingRotation,
      configuration: baseConfiguration,
    }),
  );
  const [selectedPosition, setSelectedPosition] = useState<TacticalPosition | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [draggedPlayerId, setDraggedPlayerId] = useState<string | null>(null);

  const rotation = calculateRotation(startingRotation, rotationNumber);
  const rotationPlayerIds = new Set(Object.values(rotation));

  const handlePlayerDrop = (targetPlayerId: string) => {
    if (!draggedPlayerId || draggedPlayerId === targetPlayerId) return;

    const nextRotation = swapRotationPlayers(rotation, draggedPlayerId, targetPlayerId);
    const nextStartingRotation = calculateRotation(nextRotation, 6 - rotationNumber);
    setTacticalAssignments(calculateTacticalAssignments({ players, rotation: nextRotation, configuration }));
    setStartingRotation(nextStartingRotation);
    setDraggedPlayerId(null);
    setSelectedPosition(null);
  };

  const changeConfiguration = (next: TeamConfiguration) => {
    const setterSettingPosition: SetterSettingPosition =
      next.offensiveSystem === "4-2" ? (next.setterSettingPosition === 2.5 ? 3 : next.setterSettingPosition) : 2.5;
    const normalizedConfiguration = { ...next, setterSettingPosition };
    setConfiguration(normalizedConfiguration);
    setTacticalAssignments(calculateTacticalAssignments({ players, rotation, configuration: normalizedConfiguration }));
  };

  const changeRotation = (next: number) => {
    const normalized = (next + 6) % 6;
    const nextRotation = calculateRotation(startingRotation, normalized);
    setRotationNumber(normalized);
    setTacticalAssignments(calculateTacticalAssignments({ players, rotation: nextRotation, configuration }));
    setSelectedPosition(null);
    setSelectedPlayerId(null);
  };

  const swapPosition = (position: TacticalPosition) => {
    if (!selectedPosition) {
      setSelectedPosition(position);
      return;
    }
    if (selectedPosition === position) {
      setSelectedPosition(null);
      return;
    }
    setTacticalAssignments((current) => swapTacticalPositions(current, selectedPosition, position));
    setSelectedPosition(null);
  };

  const playersOnCourt = players.flatMap((player) => {
    if (viewMode === "rotation") {
      const rotationEntry = Object.entries(rotation).find(([, playerId]) => playerId === player.id);
      if (!rotationEntry) return [];
      return [
        {
          player,
          courtPosition: courtPositionForRotationPosition(Number(rotationEntry[0]) as 1 | 2 | 3 | 4 | 5 | 6),
        },
      ];
    }

    const tacticalEntry = (Object.entries(tacticalAssignments) as [TacticalPosition, TacticalAssignment][]).find(
      ([, assignment]) => assignment.playerId === player.id,
    );
    return tacticalEntry ? [{ player, courtPosition: tacticalEntry[0] }] : [];
  });

  const updatePlayer = (playerId: string, changes: Partial<Player>) => {
    const nextPlayers = players.map((player) => (player.id === playerId ? { ...player, ...changes } : player));
    setPlayers(nextPlayers);
    setTacticalAssignments(calculateTacticalAssignments({ players: nextPlayers, rotation, configuration }));
  };

  return (
    <div className="planner-page">
      <header className="planner-header"></header>

      <section className="planner-shell">
        <aside className="planner-panel">
          <p className="field-label">Offensive system</p>
          <div className="segmented-control">
            {(["5-1", "6-2", "4-2"] as OffensiveSystem[]).map((system) => (
              <button
                key={system}
                className={configuration.offensiveSystem === system ? "active" : ""}
                onClick={() => changeConfiguration({ ...configuration, offensiveSystem: system })}
              >
                {system}
              </button>
            ))}
          </div>
          <p className="field-label panel-space">Setter sets from</p>
          <div className="segmented-control">
            <button
              className={configuration.setterSettingPosition === 2 ? "active" : ""}
              disabled={configuration.offensiveSystem !== "4-2"}
              onClick={() => changeConfiguration({ ...configuration, setterSettingPosition: 2 })}
            >
              Position 2
            </button>
            <button
              className={configuration.setterSettingPosition === 3 ? "active" : ""}
              disabled={configuration.offensiveSystem !== "4-2"}
              onClick={() => changeConfiguration({ ...configuration, setterSettingPosition: 3 })}
            >
              Position 3
            </button>
            <button
              className={configuration.setterSettingPosition === 2.5 ? "active" : ""}
              disabled={configuration.offensiveSystem === "4-2"}
              onClick={() => changeConfiguration({ ...configuration, setterSettingPosition: 2.5 })}
            >
              Position 2.5
            </button>
          </div>
        </aside>

        <section className="court-panel planner-court-panel">
          <div className="panel-topline">
            <div>
              <span className="section-kicker">
                {viewMode === "rotation" ? "OFFICIAL ROTATION" : "TACTICAL POSITION"}
              </span>
              <h2>{viewMode === "rotation" ? "Who must be where before serve" : "Where players move after serve"}</h2>
            </div>
            <div className="view-switch">
              <button className={viewMode === "rotation" ? "active" : ""} onClick={() => setViewMode("rotation")}>
                Rotation
              </button>
              <button className={viewMode === "tactical" ? "active" : ""} onClick={() => setViewMode("tactical")}>
                Tactical
              </button>
            </div>
          </div>
          <div className="court-wrap">
            <div className="court planner-court" aria-label={`${viewMode} volleyball court`}>
              <div className="net">
                <span>NET</span>
              </div>
              <div className="attack-line left" />
              {playersOnCourt.map(({ player, courtPosition }) => {
                const spot = courtSpots[courtPosition];
                const isSelected = selectedPosition === courtPosition || selectedPlayerId === player.id;
                return (
                  <button
                    key={player.id}
                    className={`player-token ${isSelected ? "selected" : ""}`}
                    onClick={() => {
                      swapPosition(courtPosition);
                      setSelectedPlayerId(player.id);
                    }}
                    style={{
                      left: `${spot.left}%`,
                      top: `${spot.top}%`,
                      backgroundColor: player.color,
                      willChange: "left, top",
                      transition:
                        "left 900ms cubic-bezier(0.22, 0.8, 0.25, 1), top 900ms cubic-bezier(0.22, 0.8, 0.25, 1), transform 250ms, box-shadow 250ms",
                    }}
                    title={courtLabels[courtPosition]}
                  >
                    <strong>{player.name}</strong>
                    <small>#{player.number}</small>
                  </button>
                );
              })}
              <div className="court-label front">FRONT ROW</div>
              <div className="court-label back">BACK ROW</div>
            </div>
          </div>
          <div className="court-help">
            {viewMode === "tactical"
              ? "Select one player, then another, to swap tactical positions. The rotation layer stays unchanged."
              : "Official rotation positions are derived from the starting lineup. Switch to Tactical to plan movement after the serve."}
          </div>
          <div className="phase-nav planner-phases">
            {[0, 1, 2, 3, 4, 5].map((step) => (
              <button
                key={step}
                className={rotationNumber === step ? "active" : ""}
                onClick={() => changeRotation(step)}
              >
                Rotation {step + 1}
              </button>
            ))}
          </div>
        </section>

        <aside className="planner-panel roster-panel">
          <div className="setup-heading">
            <p className="field-label">Team setup</p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="info-button" type="button" aria-label="Team setup information">
                    i
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="tooltip-content">
                    <p>Edit a player&apos;s name or primary role.</p>
                    <p>The rotation order stays attached to the player.</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {players
            .filter((player) => rotationPlayerIds.has(player.id))
            .map((player) => {
              const rotationPosition = getRotationPosition(rotation, player.id);
              const role = editableRoles.includes(player.roles[0]) ? player.roles[0] : "middleBlocker";
              return (
                <div
                  key={player.id}
                  className={`roster-player roster-editor ${draggedPlayerId === player.id ? "dragging" : ""}`}
                  draggable
                  onDragStart={() => {
                    setDraggedPlayerId(player.id);
                    setSelectedPlayerId(player.id);
                  }}
                  onDragEnd={() => setDraggedPlayerId(null)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => handlePlayerDrop(player.id)}
                  onClick={() => setSelectedPlayerId(player.id)}
                >
                  <span className="roster-number">{rotationPosition ?? "-"}</span>
                  <span className="roster-fields">
                    <input
                      aria-label={`${player.name} name`}
                      value={player.name}
                      onChange={(event) => updatePlayer(player.id, { name: event.target.value })}
                    />
                    <select
                      aria-label={`${player.name} role`}
                      value={role}
                      onChange={(event) => updatePlayer(player.id, { roles: [event.target.value as PlayerRole] })}
                    >
                      {editableRoles.map((option) => (
                        <option key={option} value={option}>
                          {roleNames[option]}
                        </option>
                      ))}
                    </select>
                  </span>
                  <em>{rotationPosition ? `P${rotationPosition}` : "Bench"}</em>
                </div>
              );
            })}
        </aside>
      </section>
    </div>
  );
}
