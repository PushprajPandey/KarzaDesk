"use client";

import React, { useEffect, useRef } from "react";

interface Dot {
  x: number;
  y: number;
  size: number;
  opacity: number;
  glowing: boolean;
  glowIntensity: number;
}

export function AnimatedBackground(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createDots = () => {
      const dots: Dot[] = [];
      const spacing = 50;
      const cols = Math.ceil(canvas.width / spacing);
      const rows = Math.ceil(canvas.height / spacing);

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          dots.push({
            x: i * spacing + Math.random() * 20 - 10,
            y: j * spacing + Math.random() * 20 - 10,
            size: Math.random() * 2 + 1,
            opacity: Math.random() * 0.3 + 0.1,
            glowing: false,
            glowIntensity: 0,
          });
        }
      }
      dotsRef.current = dots;
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      dotsRef.current.forEach((dot) => {
        const distance = Math.sqrt(
          Math.pow(mouseRef.current.x - dot.x, 2) +
            Math.pow(mouseRef.current.y - dot.y, 2),
        );

        if (distance < 100) {
          dot.glowing = true;
          dot.glowIntensity = Math.min(1, (100 - distance) / 100);
        } else {
          dot.glowing = false;
          dot.glowIntensity = Math.max(0, dot.glowIntensity - 0.02);
        }

        ctx.save();

        if (dot.glowIntensity > 0) {
          const gradient = ctx.createRadialGradient(
            dot.x,
            dot.y,
            0,
            dot.x,
            dot.y,
            30 * dot.glowIntensity,
          );
          gradient.addColorStop(
            0,
            `rgba(255, 255, 255, ${dot.glowIntensity * 0.9})`,
          );
          gradient.addColorStop(
            0.3,
            `rgba(240, 248, 255, ${dot.glowIntensity * 0.6})`,
          );
          gradient.addColorStop(
            0.7,
            `rgba(219, 234, 254, ${dot.glowIntensity * 0.3})`,
          );
          gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, 30 * dot.glowIntensity, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = `rgba(0, 0, 0, ${dot.opacity + dot.glowIntensity * 0.5})`;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.size + dot.glowIntensity * 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleResize = () => {
      resizeCanvas();
      createDots();
    };

    resizeCanvas();
    createDots();
    animate();

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
      }}
    />
  );
}
