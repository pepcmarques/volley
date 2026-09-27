"use client";

import { useEffect, useRef, useState } from "react";

export default function VolleyballCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotationCount, setRotationCount] = useState(0);
  const [isRotationReady, setIsRotationReady] = useState(true);
  const rotationReadyRef = useRef(true);

  // Keep tracking positions using a mutable ref so the canvas loop can read them smoothly without re-rendering
  const positionsRef = useRef({
    // Left-side team (Our animated team)
    op2: { x: 80, y: 100, label: "OP2", color: "#237804" },
    oh1: { x: 200, y: 100, label: "OH1", color: "#36cfc9" },
    s1: { x: 270, y: 200, label: "S1", color: "#ff4d4f" },
    s2: { x: 150, y: 200, label: "S2", color: "#cf1322" },
    oh2: { x: 80, y: 290, label: "OH2", color: "#08979c" },
    op1: { x: 200, y: 290, label: "OP1", color: "#52c41a" },
  });

  // Targets for the animation swap
  const targetsRef = useRef({
    op2: { x: 80, y: 100 },
    oh1: { x: 200, y: 100 },
    s1: { x: 270, y: 200 },
    s2: { x: 150, y: 200 },
    oh2: { x: 80, y: 290 },
    op1: { x: 200, y: 290 },
  });

  const rotationTargetsRef = useRef({
    op2: { x: 80, y: 100 },
    oh1: { x: 200, y: 100 },
    s1: { x: 270, y: 200 },
    s2: { x: 150, y: 200 },
    oh2: { x: 80, y: 290 },
    op1: { x: 200, y: 290 },
  });

  const handleRotation = () => {
    if (!isRotationReady) return;

    const targets = targetsRef.current;
    const nextTargets = {
      op2: targets.oh1,
      oh1: targets.s1,
      s1: targets.op1,
      op1: targets.oh2,
      oh2: targets.s2,
      s2: targets.op2,
    };
    targets.op2 = { ...nextTargets.op2 };
    targets.oh1 = { ...nextTargets.oh1 };
    targets.s1 = { ...nextTargets.s1 };
    targets.op1 = { ...nextTargets.op1 };
    targets.oh2 = { ...nextTargets.oh2 };
    targets.s2 = { ...nextTargets.s2 };
    Object.keys(rotationTargetsRef.current).forEach((playerKey) => {
      const key = playerKey as keyof typeof rotationTargetsRef.current;
      rotationTargetsRef.current[key] = { ...targets[key] };
    });
    rotationReadyRef.current = false;
    setIsRotationReady(false);
    setRotationCount((count) => count + 1);
  };

  const handleAfterServe = () => {
    const targets = targetsRef.current;
    const servePositions = {
      OH: { x: 200, y: 100 },
      S: { x: 270, y: 200 },
      OP: { x: 200, y: 290 },
    };

    Object.entries(targets)
      .filter(([, target]) => target.x >= 200)
      .forEach(([playerKey]) => {
        const player = positionsRef.current[playerKey as keyof typeof positionsRef.current];
        const role = player.label.replace(/[0-9]/g, "") as keyof typeof servePositions;
        targets[playerKey as keyof typeof targets] = { ...servePositions[role] };
      });
    rotationReadyRef.current = false;
    setIsRotationReady(false);
  };

  const handleAfterPoint = () => {
    const targets = targetsRef.current;
    const rotationTargets = rotationTargetsRef.current;

    Object.keys(rotationTargets).forEach((playerKey) => {
      const key = playerKey as keyof typeof rotationTargets;
      targets[key] = { ...rotationTargets[key] };
    });
    rotationReadyRef.current = false;
    setIsRotationReady(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      // 1. Clear Canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // --- DRAW COURT ---
      // Floor Background
      ctx.fillStyle = "#f39c12";
      ctx.fillRect(20, 20, 560, 360);

      // Boundaries & Lines (White)
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 4;
      ctx.strokeRect(40, 40, 520, 320); // Outer boundary

      // Center Line (The Net)
      ctx.beginPath();
      ctx.moveTo(300, 40);
      ctx.lineTo(300, 360);
      ctx.stroke();

      // Attack Lines (3m Line / 10-foot Line)
      ctx.lineWidth = 2;
      // Left Team Attack Line
      ctx.beginPath();
      ctx.moveTo(213, 40);
      ctx.lineTo(213, 360);
      ctx.stroke();
      // Right Team Attack Line
      ctx.beginPath();
      ctx.moveTo(387, 40);
      ctx.lineTo(387, 360);
      ctx.stroke();

      // Draw Physical Net Overlay
      ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(300, 30);
      ctx.lineTo(300, 370);
      ctx.stroke();

      // --- ANIMATION INTERPOLATION (Easing) ---
      const speed = 0.08; // Easing factor
      const p = positionsRef.current;
      const t = targetsRef.current;

      Object.keys(p).forEach((playerKey) => {
        const player = p[playerKey as keyof typeof p];
        const target = t[playerKey as keyof typeof t];
        player.x += (target.x - player.x) * speed;
        player.y += (target.y - player.y) * speed;
      });

      if (!rotationReadyRef.current) {
        const rotationTargets = rotationTargetsRef.current;
        const settledInRotation = Object.keys(p).every((playerKey) => {
          const key = playerKey as keyof typeof p;
          const player = p[key];
          const target = rotationTargets[key];
          return Math.abs(player.x - target.x) < 0.5 && Math.abs(player.y - target.y) < 0.5;
        });

        if (settledInRotation) {
          rotationReadyRef.current = true;
          setIsRotationReady(true);
        }
      }

      // --- DRAW PLAYERS ---
      const players = Object.values(p);
      const radius = 18;

      players.forEach((player) => {
        // Shadow/Glow effect
        ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 3;

        // Player Circle
        ctx.beginPath();
        ctx.arc(player.x, player.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = player.color;
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();

        // Reset shadow for text
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        // Text Label
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(player.label, player.x, player.y);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem", padding: "2rem" }}>
      <div style={{ textAlign: "center" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.25rem" }}>
          Volleyball Rotation Animation
        </h2>
        <h3 className="text-lg font-semibold text-gray-700">4-2</h3>
        <p style={{ color: "#666", fontSize: "0.9rem" }}>Rotation {rotationCount}</p>
      </div>

      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        style={{
          border: "1px solid #ccc",
          borderRadius: "12px",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        }}
      />
      <div className="flex gap-8">
        <button
          onClick={handleRotation}
          disabled={!isRotationReady}
          style={{
            backgroundColor: isRotationReady ? "#722ed1" : "#9bbce8",
            color: "white",
            fontWeight: "bold",
            padding: "0.75rem 1.5rem",
            borderRadius: "8px",
            border: "none",
            cursor: isRotationReady ? "pointer" : "not-allowed",
            boxShadow: "0 4px 6px rgba(0, 112, 243, 0.2)",
            transition: "transform 0.1s ease",
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          Rotate Team
        </button>

        <button
          onClick={handleAfterServe}
          style={{
            backgroundColor: "#722ed1",
            color: "white",
            fontWeight: "bold",
            padding: "0.75rem 1.5rem",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 6px rgba(82, 196, 26, 0.2)",
            transition: "transform 0.1s ease",
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          After Serve
        </button>

        <button
          onClick={handleAfterPoint}
          style={{
            backgroundColor: "#722ed1",
            color: "white",
            fontWeight: "bold",
            padding: "0.75rem 1.5rem",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 6px rgba(114, 46, 209, 0.2)",
            transition: "transform 0.1s ease",
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          After Point
        </button>
      </div>
    </div>
  );
}
