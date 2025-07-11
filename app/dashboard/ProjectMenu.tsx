"use client";
import { useState, useRef, useEffect } from "react";

export function ProjectMenu({
  onSeeSnippet,
  onSeeHeatmapSnippet,
  onDelete,
}: {
  onSeeSnippet: () => void;
  onSeeHeatmapSnippet: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        className="p-1 rounded hover:bg-neutral-700"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-label="Project options"
      >
        <svg width="20" height="20" fill="none">
          <circle cx="4" cy="10" r="2" fill="#fff" />
          <circle cx="10" cy="10" r="2" fill="#fff" />
          <circle cx="16" cy="10" r="2" fill="#fff" />
        </svg>
      </button>
      {open && (
        <div
          className="absolute right-0 mt-2 w-40 bg-neutral-800 border border-neutral-700 rounded shadow-lg z-50 pointer-events-auto"
          style={{ pointerEvents: "auto", cursor: "default" }} // <--- force real cursor
        >
          <button
            className="block w-full text-left px-4 py-2 hover:bg-neutral-700 text-white"
            onClick={() => {
              setOpen(false);
              onSeeSnippet();
            }}
          >
            See full snippet
          </button>
          <button
            className="block w-full text-left px-4 py-2 hover:bg-neutral-700 text-white"
            onClick={() => {
              setOpen(false);
              onSeeHeatmapSnippet();
            }}
          >
            See full snippet for Heatmaps
          </button>
          <button
            className="block w-full text-left px-4 py-2 hover:bg-red-600 hover:text-white text-red-400"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
          >
            Delete project
          </button>
        </div>
      )}
    </div>
  );
}