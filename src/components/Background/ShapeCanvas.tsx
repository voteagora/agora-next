"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

function ShapeCanvasClient() {
  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // Circle data
  const circlesRef = useRef([
    { x: 50, y: 50, dx: 1, dy: 1, size: 384 },
    { x: 25, y: 25, dx: -1, dy: 1, size: 300 },
    { x: 75, y: 30, dx: 1, dy: -1, size: 240 },
    { x: 30, y: 70, dx: -1, dy: -1, size: 180 },
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Configure canvas
    const updateCanvasSize = () => {
      if (typeof window !== "undefined") {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    // Animation function
    const animate = () => {
      if (!canvas || !ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background dots
      ctx.fillStyle = "#cdcccd";
      ctx.globalAlpha = 0.6;

      for (let x = 0; x < canvas.width; x += 16) {
        for (let y = 0; y < canvas.height; y += 16) {
          let skipPoint = false;

          // Check if inside any circle
          for (const circle of circlesRef.current) {
            const cx = (circle.x / 100) * canvas.width;
            const cy = (circle.y / 100) * canvas.height;
            const radius = circle.size / 2;
            const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);

            if (dist <= radius) {
              skipPoint = true;
              break;
            }
          }

          if (!skipPoint) {
            ctx.beginPath();
            ctx.arc(x, y, 1.6, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Draw yellow circles
      for (const circle of circlesRef.current) {
        const cx = (circle.x / 100) * canvas.width;
        const cy = (circle.y / 100) * canvas.height;
        const radius = circle.size / 2;

        // Draw circle dots
        ctx.fillStyle = "#ffd900";

        for (let row = 0; row < 25; row++) {
          for (let col = 0; col < 25; col++) {
            const x = cx - radius + (col / 24) * circle.size;
            const y = cy - radius + (row / 24) * circle.size;

            const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
            if (dist <= radius) {
              const normalizedDist = dist / radius;
              // Scale proportionally according to circle size (384 is the reference circle)
              const scaleFactor = circle.size / 384;
              const baseDotSize = 15 * scaleFactor; // Maximum scaled size
              const minDotSize = 1.5 * scaleFactor; // Minimum scaled size
              const dotSize = Math.max(
                minDotSize,
                baseDotSize - normalizedDist * 12 * scaleFactor
              );
              const alpha = 1 - normalizedDist * 0.3;

              ctx.globalAlpha = alpha;
              ctx.beginPath();
              ctx.arc(x, y, dotSize, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }

        // Update position
        circle.x += circle.dx * 0.05; // Slower speed for smoother movement
        circle.y += circle.dy * 0.05;

        // Bounce
        const marginX = (circle.size / 2 / canvas.width) * 100;
        const marginY = (circle.size / 2 / canvas.height) * 100;

        if (circle.x <= marginX || circle.x >= 100 - marginX) {
          circle.dx = -circle.dx;
          circle.x = Math.max(marginX, Math.min(100 - marginX, circle.x));
        }

        if (circle.y <= marginY || circle.y >= 100 - marginY) {
          circle.dy = -circle.dy;
          circle.y = Math.max(marginY, Math.min(100 - marginY, circle.y));
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mounted]);

  if (!mounted) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: -10 }}
    />
  );
}

// Wrapper component
const ShapeCanvas = dynamic(() => Promise.resolve(ShapeCanvasClient), {
  ssr: false,
});

export default ShapeCanvas;
