"use client";
import { useEffect, useState } from "react";
import { MousePointer2 } from "lucide-react";

export function CustomCursor() {
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [isPressable, setIsPressable] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const move = (e: MouseEvent) => {
      setCursor({ x: e.clientX, y: e.clientY });
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (
        el &&
        (
          el.tagName === "BUTTON" ||
          el.tagName === "A" ||
          el.getAttribute("role") === "button" ||
          el.getAttribute("tabindex") === "0"
        )
      ) {
        setIsPressable(true);
      } else {
        setIsPressable(false);
      }
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div
      style={{
        left: cursor.x,
        top: cursor.y,
        pointerEvents: "none",
        position: "fixed",
        zIndex: 9999,
        transform: "translate(-50%, -50%)",
      }}
    >
      <MousePointer2
        className={`w-6 h-6 drop-shadow-lg transition-colors duration-150 ${
          isPressable ? "text-indigo-400" : "text-white"
        }`}
      />
    </div>
  );
}