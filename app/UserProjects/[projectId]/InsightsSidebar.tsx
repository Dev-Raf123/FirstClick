import { useEffect, useRef } from "react";

export default function InsightsSidebar({
  clickTrend,
  clickPnL,
}: {
  clickTrend: "up" | "down" | "same";
  clickCount: number;
  clickPnL: null | { value: number; sign: "+" | "-" | "" };
}) {
  return null;
}