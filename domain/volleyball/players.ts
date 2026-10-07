import type { Player, Rotation } from "./types";

export const demoPlayers: Player[] = [
  { id: "maria", name: "Sofia", number: 1, roles: ["setter"], color: "#e35d6a" },
  { id: "ana", name: "Isabella", number: 2, roles: ["outsideHitter"], color: "#18a999" },
  { id: "julia", name: "Valentina", number: 3, roles: ["oppositeHitter"], color: "#e6a23c" },
  { id: "carla", name: "Camila", number: 4, roles: ["setter"], color: "#247ba0" },
  { id: "beatriz", name: "Helena", number: 5, roles: ["outsideHitter"], color: "#c96b36" },
  { id: "fernanda", name: "Beatriz", number: 6, roles: ["oppositeHitter"], color: "#53a548" },
  { id: "gabriela", name: "Mariana", number: 7, roles: ["setter"], color: "#9b5de5" },
  { id: "laura", name: "Clara", number: 8, roles: ["libero"], color: "#f5c542" },
];

export const demoStartingRotation: Rotation = {
  1: "maria",
  2: "ana",
  3: "julia",
  4: "carla",
  5: "beatriz",
  6: "fernanda",
};
