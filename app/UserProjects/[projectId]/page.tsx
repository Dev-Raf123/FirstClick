"use client";
import React, { useEffect, useState, use, useRef, useCallback, useMemo } from "react";
import ReactFlow, { Background, Controls, applyNodeChanges } from "reactflow";
import "reactflow/dist/style.css";
import { createClient } from "@/lib/supabase/client";
import { nodeTypes } from "./CustomNodes";
import InsightsSidebar from "./InsightsSidebar";


function getColor(index: number) {
  // Pick from a palette or generate HSL colors
  const palette = [
    "#6366f1", // indigo
    "#f59e42", // orange
    "#10b981", // green
    "#ef4444", // red
    "#3b82f6", // blue
    "#eab308", // yellow
    "#a21caf", // purple
    "#14b8a6", // teal
  ];
  return palette[index % palette.length];
}

function buildFlowNodesAndEdges(
  data: {
    id: string;
    url: string;
    referrer: string | null;
    project_id: string;
  }[]
) {
  // Normalize and collect all unique URLs and referrers
  const normalize = (url: string) => {
    try {
      const u = new URL(url, "http://dummy");
      // Treat localhost and 127.0.0.1 as internal
      if (
        u.hostname === "dummy" ||
        u.hostname === "localhost" ||
        u.hostname === "127.0.0.1"
      ) {
        return decodeURIComponent(u.pathname).replace(/\/+$/, "").trim().toLowerCase();
      }
      // Otherwise, keep host + pathname for external referrers
      return `${u.hostname}${decodeURIComponent(u.pathname)}`.replace(/\/+$/, "").trim().toLowerCase();
    } catch {
      // If it's already a pathname, just normalize it
      return decodeURIComponent(url).replace(/\/+$/, "").trim().toLowerCase();
    }
  };

  const urlSet = new Set(data.map(item => normalize(item.url)));
  const referrerSet = new Set(
    data.filter(item => item.referrer).map(item => normalize(item.referrer!))
  );

  // Classify nodes
  const onlyReferrers = Array.from(referrerSet).filter(r => !urlSet.has(r));
  const onlyTargets = Array.from(urlSet).filter(u => !referrerSet.has(u));
  const both = Array.from(urlSet).filter(u => referrerSet.has(u));

  // Arrange: referrers on top, then both, then only targets
  const orderedNodes = [...onlyReferrers, ...both, ...onlyTargets];


  // Build adjacency list for graph traversal
  const adjacency = new Map<string, string[]>();
  data.forEach(item => {
    const from = normalize(item.referrer!);
    const to = normalize(item.url);
    if (!adjacency.has(from)) adjacency.set(from, []);
    adjacency.get(from)!.push(to);
  });

  // Find entry nodes (no incoming edges)
  const allTargets = new Set(data.map(item => normalize(item.url)));
  const allSources = new Set(data.filter(item => item.referrer).map(item => normalize(item.referrer!)));
  const entryNodes = Array.from(allSources).filter(src => !allTargets.has(src));

  // BFS to assign depth (layer) to each node
  const nodeDepth = new Map<string, number>();
  const visited = new Set<string>();
  const queue: Array<{ node: string, depth: number }> = entryNodes.map(n => ({ node: n, depth: 0 }));

  while (queue.length) {
    const { node, depth } = queue.shift()!;
    if (visited.has(node)) continue;
    visited.add(node);
    nodeDepth.set(node, depth);
    (adjacency.get(node) || []).forEach(child => {
      if (!visited.has(child)) {
        queue.push({ node: child, depth: depth + 1 });
      }
    });
  }
  // For nodes not reached (like isolated or only-target nodes)
  orderedNodes.forEach(n => {
    if (!nodeDepth.has(n)) nodeDepth.set(n, 0);
  });

  // Group nodes by depth
  const layers: string[][] = [];
  nodeDepth.forEach((depth, node) => {
    if (!layers[depth]) layers[depth] = [];
    layers[depth].push(node);
  });

  // Assign positions
  const nodePositions = new Map<string, { x: number; y: number }>();
  const xStep = 250;
  const yStep = 180;
  layers.forEach((layer, layerIdx) => {
    layer.forEach((url, idx) => {
      nodePositions.set(url, { x: idx * xStep, y: layerIdx * yStep });
    });
  });

  // Assign unique color to each node
  const nodeColorMap = new Map<string, string>();
  orderedNodes.forEach((url, idx) => {
    nodeColorMap.set(url, getColor(idx));
  });

  // Create nodes (unique, normalized)
  const nodes = orderedNodes.map((url) => ({
    id: url,
    data: { label: url },
    position: nodePositions.get(url)!,
    style: {
      border: `2px solid ${nodeColorMap.get(url)}`,
      borderRadius: 8,
      padding: 8,
      background: "#18181b",
      color: "#fff",
      minWidth: 120,
      textAlign: "center",
    },
    draggable: true, // <-- Add this line to make nodes movable
  }));

  // Map normalized url to project_id for quick lookup
  const urlToProjectId = new Map(
    data.map(item => [normalize(item.url), item.project_id])
  );

  // Create edges (multiple edges to same node allowed)
  const edges = data
    .filter(
      (item) =>
        item.referrer &&
        urlToProjectId.get(normalize(item.url)) === item.project_id
    )
    .map((item, idx) => {
      const ref = normalize(item.referrer!);
      const target = normalize(item.url);
      return {
        id: `${ref}->${target}-${idx}`, // <-- Make edge id unique
        source: ref,
        target: target,
        animated: false,
        style: { stroke: nodeColorMap.get(ref) || "#6366f1", strokeWidth: 2 },
      };
    });

  return { nodes, edges, nodeColorMap, orderedNodes };
}

export default function UserProjectsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const [flowData, setFlowData] = useState<{ nodes: FlowNode[]; edges: FlowEdge[]; nodeColorMap?: Map<string, string>; orderedNodes?: string[] }>({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [edges, setEdges] = useState<FlowEdge[]>([]);
  const [clickCount, setClickCount] = useState(0);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [dailyClicks, setDailyClicks] = useState<{ date: string; clicks: number }[]>([]);
  const [clickTrend, setClickTrend] = useState<"up" | "down" | "same">("same");
  const [clickPnL, setClickPnL] = useState<null | { value: number; sign: "+" | "-" | "" }>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [timeFilter, setTimeFilter] = useState<"today" | "lifetime">("today");

  useEffect(() => {
    const fetchAnalytics = async () => {
      const supabase = createClient();

      // Get today's date for filtering
      const today = new Date().toISOString().split('T')[0];

      // Fetch total count separately (no limit)
      let countQuery = supabase
        .from("page_visits")
        .select("*", { count: "exact", head: true })
        .eq("project_id", projectId);
      
      if (timeFilter === "today") {
        countQuery = countQuery.gte("timestamp", `${today}T00:00:00`);
      }
      
      const { count: totalCount } = await countQuery;

      setClickCount(totalCount || 0);

      // Build query based on time filter
      let query = supabase
        .from("page_visits")
        .select("id, url, referrer, project_id, timestamp")
        .eq("project_id", projectId);
      
      if (timeFilter === "today") {
        query = query.gte("timestamp", `${today}T00:00:00`);
      }
      
      const { data, error } = await query
        .limit(1000)
        .order("timestamp", { ascending: false });

      if (error) {
        setLoading(false);
        return;
      }

      // Calculate daily clicks
      const dayMap: Record<string, number> = {};
      data?.forEach((row: { timestamp?: string }) => {
        const day = row.timestamp?.slice(0, 10);
        if (day) dayMap[day] = (dayMap[day] || 0) + 1;
      });
      const chartData = Object.entries(dayMap)
        .map(([date, clicks]) => ({ date, clicks }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Calculate trend
      let newTrend: "up" | "down" | "same" = "same";
      if (chartData.length >= 2) {
        const prevClicks = chartData[chartData.length - 2].clicks;
        const currClicks = chartData[chartData.length - 1].clicks;;
        if (currClicks > prevClicks) newTrend = "up";
        else if (currClicks < prevClicks) newTrend = "down";
      }

      // Calculate PnL
      let newPnL: null | { value: number; sign: "+" | "-" | "" } = null;
      if (chartData.length >= 2) {
        const prevClicks = chartData[chartData.length - 2].clicks;
        const currClicks = chartData[chartData.length - 1].clicks;
        if (prevClicks > 0) {
          const diff = currClicks - prevClicks;
          const percent = Math.abs((diff / prevClicks) * 100);
          newPnL = {
            value: Math.round(percent * 10) / 10,
            sign: diff > 0 ? "+" : diff < 0 ? "-" : "",
          };
        } else {
          newPnL = { value: 0, sign: "" };
        }
      }

      // Build flow graph
      const built = buildFlowNodesAndEdges(data || []);
      
      // Batch all state updates together (React 18+ auto-batching)
      setDailyClicks(chartData);
      setClickTrend(newTrend);
      setClickPnL(newPnL);
      setNodes(built.nodes);
      setEdges(built.edges);
      setFlowData(built);
      setLoading(false);
    };

    fetchAnalytics();
  }, [projectId, timeFilter]);

  const handleRemoveNode = (id: string) => {
    setNodes(nds => nds.filter(n => n.id !== id));
  };

  // Memoize tooltip data to avoid recalculating on every hover
  const tooltipData = useMemo(() => {
    if (!hoveredNode || !flowData.edges) return null;
    
    const incoming = flowData.edges
      .filter(e => e.target === hoveredNode)
      .reduce((acc: Record<string, number>, e) => {
        acc[e.source] = (acc[e.source] || 0) + 1;
        return acc;
      }, {});
    
    const outgoing = flowData.edges
      .filter(e => e.source === hoveredNode)
      .reduce((acc: Record<string, number>, e) => {
        acc[e.target] = (acc[e.target] || 0) + 1;
        return acc;
      }, {});
    
    return { incoming, outgoing };
  }, [hoveredNode, flowData.edges]);

  const handleNodeMouseEnter = useCallback((event: React.MouseEvent, node: { id: string }) => {
    if (isDragging) return;
    setHoveredNode(node.id);
    setTooltipPos({ x: event.clientX, y: event.clientY });
  }, [isDragging]);
  
  // Throttle mouse move updates for better performance
  const throttleTimeout = useRef<NodeJS.Timeout | null>(null);
  const handleNodeMouseMove = useCallback((event: React.MouseEvent) => {
    if (isDragging || throttleTimeout.current) return;
    throttleTimeout.current = setTimeout(() => {
      setTooltipPos({ x: event.clientX, y: event.clientY });
      throttleTimeout.current = null;
    }, 16); // ~60fps
  }, [isDragging]);
  const handleNodeMouseLeave = useCallback(() => {
    setHoveredNode(null);
    setTooltipPos(null);
  }, []);
  
  const onNodeDragStart = useCallback(() => {
    setIsDragging(true);
    setHoveredNode(null);
    setTooltipPos(null);
  }, []);
  
  const onNodeDragStop = useCallback(() => {
    setIsDragging(false);
  }, []);
  const handleNodeClick = useCallback((_: React.MouseEvent, node: FlowNode) => {
    // Click handler - functionality removed
  }, []);
  const handleDrop = useCallback((e: { preventDefault: () => void; dataTransfer: { getData: (arg0: string) => any; }; currentTarget: { getBoundingClientRect: () => any; }; clientX: number; clientY: number; }) => {
    e.preventDefault();
    const widget = e.dataTransfer.getData("widget");
    const bounds = e.currentTarget.getBoundingClientRect();
    const position = {
      x: e.clientX - bounds.left,
      y: e.clientY - bounds.top,
    };
    if (widget === "clicks-graph") {
      setNodes(nds => [
        ...nds,
        {
          id: `clicks-graph-${Date.now()}`,
          type: "clicks-graph",
          position,
          data: { projectId, timeFilter, onRemoveNode: handleRemoveNode },
          draggable: true,
        },
      ]);
    }
    if (widget === "devices-pie") {
      setNodes(nds => [
        ...nds,
        {
          id: `devices-pie-${Date.now()}`,
          type: "devices-pie",
          position,
          data: { projectId, timeFilter, onRemoveNode: handleRemoveNode },
          draggable: true,
        },
      ]);
    }
    if (widget === "logs-widget") {
      setNodes(nds => [
        ...nds,
        {
          id: `logs-widget-${Date.now()}`,
          type: "logs-widget",
          position,
          data: { projectId, timeFilter, onRemoveNode: handleRemoveNode },
          draggable: true,
        },
      ]);
    }
  }, [projectId, timeFilter]);

  

  return (
    <main className="h-screen flex bg-neutral-900 text-white cursor-none overflow-hidden">
      <div className="flex-1 flex flex-row items-start justify-center relative p-6">
        {/* Graph area */}
        <div className="flex-1 h-full w-full relative" style={{ border: "1px solid rgba(99, 102, 241, 0.2)", borderRadius: 20, background: "linear-gradient(135deg, #18181b 0%, #0f0f12 100%)", boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.05)" }}>
          {/* Centered widgets bar and total clicks at top */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-auto flex items-center gap-4 py-3 px-6 rounded-2xl backdrop-blur-xl bg-gradient-to-r from-neutral-900/95 via-neutral-900/90 to-neutral-900/95 border border-neutral-700/50 shadow-2xl z-20" style={{ minWidth: 400 }}>
            <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-neutral-800/50 border border-neutral-700/30">
              <button
                onClick={() => setTimeFilter("today")}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  timeFilter === "today" 
                    ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/50" 
                    : "text-neutral-400 hover:text-white hover:bg-neutral-700/50"
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setTimeFilter("lifetime")}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  timeFilter === "lifetime" 
                    ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/50" 
                    : "text-neutral-400 hover:text-white hover:bg-neutral-700/50"
                }`}
              >
                Lifetime
              </button>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
              <svg width="20" height="20" fill="none" className="text-indigo-400"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2"/><path d="M10 6v4l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              <span className="font-bold text-lg text-white">{clickCount}</span>
              <span className="text-xs text-indigo-300 font-medium">clicks</span>
            </div>
            <div className="w-px h-8 bg-neutral-700/50"></div>
            <div
              draggable
              onDragStart={e => {
                e.dataTransfer.setData("widget", "clicks-graph");
              }}
              onDragEnd={() => {}}
              className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-grab bg-gradient-to-br from-indigo-600/20 to-indigo-700/20 border border-indigo-500/40 hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 hover:scale-105"
            >
              <svg width="20" height="20" fill="none"><circle cx="10" cy="10" r="8" stroke="#6366f1" strokeWidth="2"/><path d="M5 13L9 9L13 11L15 7" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"/></svg>
              <span className="text-sm font-semibold text-indigo-300">Clicks</span>
            </div>
            <div
              draggable
              onDragStart={e => {
                e.dataTransfer.setData("widget", "devices-pie");
              }}
              onDragEnd={() => {}}
              className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-grab bg-gradient-to-br from-emerald-600/20 to-emerald-700/20 border border-emerald-500/40 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-200 hover:scale-105"
            >
              <svg width="20" height="20" fill="none"><circle cx="10" cy="10" r="8" stroke="#10b981" strokeWidth="2"/><path d="M10 6v4l3 2" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/></svg>
              <span className="text-sm font-semibold text-emerald-300">Devices</span>
            </div>
            <div
              draggable
              onDragStart={e => {
                e.dataTransfer.setData("widget", "logs-widget");
              }}
              onDragEnd={() => {}}
              className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-grab bg-gradient-to-br from-amber-600/20 to-amber-700/20 border border-amber-500/40 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-200 hover:scale-105"
            >
              <svg width="20" height="20" fill="none"><rect x="4" y="4" width="12" height="12" stroke="#f59e0b" strokeWidth="2" rx="2"/><line x1="7" y1="8" x2="13" y2="8" stroke="#f59e0b" strokeWidth="2"/><line x1="7" y1="12" x2="13" y2="12" stroke="#f59e0b" strokeWidth="2"/></svg>
              <span className="text-sm font-semibold text-amber-300">Sessions</span>
            </div>
          </div>
          {/* Node legend at top right */}
          {!loading && flowData.nodeColorMap && flowData.orderedNodes && (
            <div
              style={{
                position: "absolute",
                top: 20,
                right: 20,
                background: "linear-gradient(135deg, rgba(30, 30, 35, 0.95) 0%, rgba(20, 20, 25, 0.98) 100%)",
                backdropFilter: "blur(12px)",
                color: "#fff",
                padding: "16px 20px",
                borderRadius: 16,
                border: "1px solid rgba(99, 102, 241, 0.2)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)",
                zIndex: 10,
                fontSize: 13,
                minWidth: 200,
                maxHeight: 320,
                overflowY: "auto",
              }}
            >
              <div style={{ fontWeight: "bold", marginBottom: 12, fontSize: 15, color: "#c7d2fe" }}>Flow Legend</div>
              {flowData.orderedNodes.map((url) => (
                <div key={url} style={{ display: "flex", alignItems: "center", marginBottom: 8, padding: "6px 8px", borderRadius: 8, background: "rgba(255, 255, 255, 0.03)", transition: "all 0.2s" }}>
                  <span
                    style={{
                      display: "inline-block",
                      width: 20,
                      height: 6,
                      background: flowData.nodeColorMap?.get(url),
                      marginRight: 10,
                      borderRadius: 3,
                      boxShadow: `0 0 8px ${flowData.nodeColorMap?.get(url)}40`,
                    }}
                  />
                  <span style={{ wordBreak: "break-all", fontSize: 12, color: "#e5e7eb" }}>{url}</span>
                </div>
              ))}
            </div>
          )}
          {loading ? (
            <div className="flex items-center justify-center h-full">Loading...</div>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={changes => setNodes(nds => applyNodeChanges(changes, nds))}
              onNodeDragStart={onNodeDragStart}
              onNodeDragStop={onNodeDragStop}
              //fitView
              proOptions={{ hideAttribution: true }}
              onNodeMouseEnter={handleNodeMouseEnter}
              onNodeMouseMove={handleNodeMouseMove}
              onNodeMouseLeave={handleNodeMouseLeave}
              onNodeClick={handleNodeClick}
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              elementsSelectable={false}
              onlyRenderVisibleElements={true}
              nodesDraggable={true}
              nodesConnectable={false}
              nodesFocusable={false}
              edgesFocusable={false}
              panOnDrag={true}
              panOnScroll={true}
              zoomOnScroll={true}
              zoomOnDoubleClick={false}
              maxZoom={2}
              minZoom={0.1}
              preventScrolling={false}
              selectNodesOnDrag={false}
              autoPanOnNodeDrag={false}
            >
              <Background />
              <Controls />
            </ReactFlow>
          )}
          {hoveredNode && tooltipPos && !loading && !isDragging && (
            // Only show tooltip for normal nodes, not widgets
            !hoveredNode.startsWith("clicks-graph-") &&
            !hoveredNode.startsWith("devices-pie-") &&
            !hoveredNode.startsWith("logs-widget-") && (
              <div
                style={{
                  position: "fixed",
                  top: tooltipPos.y + 16,
                  left: tooltipPos.x + 16,
                  background: "#23232b",
                  color: "#fff",
                  padding: "10px 16px",
                  borderRadius: 8,
                  boxShadow: "0 2px 8px #0007",
                  zIndex: 1000,
                  pointerEvents: "none",
                  minWidth: 220,
                  maxWidth: 320,
                  fontSize: 13,
                }}
                ref={tooltipRef}
              >
                <div style={{ fontWeight: "bold", marginBottom: 6 }}>{hoveredNode}</div>
                {tooltipData && (
                  <>
                    <div>
                      <span style={{ color: "#a3e635" }}>Users came from:</span>
                      <ul style={{ margin: 0, paddingLeft: 16 }}>
                        {Object.entries(tooltipData.incoming).map(([source, count], idx) => (
                          <li key={`${source}->${hoveredNode}-${count}-${idx}`}>
                            <b>{count}</b> {source}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div style={{ marginTop: 6 }}>
                      <span style={{ color: "#38bdf8" }}>Users went to:</span>
                      <ul style={{ margin: 0, paddingLeft: 16 }}>
                        {Object.entries(tooltipData.outgoing).map(([target, count], idx) => (
                          <li key={`${hoveredNode}->${target}-${count}-${idx}`}>
                            <b>{count}</b> {target}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </main>
  );
}

interface FlowNode {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: { [key: string]: unknown };
  draggable?: boolean;
}
interface FlowEdge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
  style?: React.CSSProperties;
}