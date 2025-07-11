"use client";
import React, { useEffect, useState, use, } from "react";
import ReactFlow, { Background, Controls, applyNodeChanges } from "reactflow";
import "reactflow/dist/style.css";
import { createClient } from "@/lib/supabase/client";
import { CustomCursor } from "@/components/custom-cursor";
import { nodeTypes } from "./CustomNodes";


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

  console.log("Node IDs:", orderedNodes);

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
        animated: true,
        style: { stroke: nodeColorMap.get(ref) || "#6366f1", strokeWidth: 2 },
      };
    });

  return { nodes, edges, nodeColorMap, orderedNodes };
}

// ...existing code...

export default function UserProjectsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const [flowData, setFlowData] = useState<{ nodes: FlowNode[]; edges: FlowEdge[]; nodeColorMap?: Map<string, string>; orderedNodes?: string[] }>({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [edges, setEdges] = useState<FlowEdge[]>([]);
  const [clickCount, setClickCount] = useState(0);
  const [heatmapUrl, setHeatmapUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("page_visits")
        .select("id, url, referrer, project_id")
        .eq("project_id", projectId);

      if (error) {
        setLoading(false);
        return;
      }

      setClickCount(data?.length || 0); // <-- Count clicks for this project

      const built = buildFlowNodesAndEdges(data || []);
      setNodes(built.nodes);
      setEdges(built.edges);
      setFlowData(built);
      setLoading(false);
    };

    fetchAnalytics();
  }, [projectId]);

  const handleRemoveNode = (id: string) => {
    setNodes(nds => nds.filter(n => n.id !== id));
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-neutral-900 text-white cursor-none">
      {/* Top bar with green dot and click count */}
      <div
        className="w-full flex items-center justify-center border-b border-neutral-700 py-3 px-6 mb-4 bg-neutral-900/80"
        style={{ position: "absolute", top: 0, left: 0, zIndex: 20 }}
      >
        <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-3"></span>
        <span className="font-semibold text-lg mr-6">
          {clickCount} clicks
        </span>
        <div
          draggable
          onDragStart={e => {
            e.dataTransfer.setData("widget", "clicks-graph");
          }}
          onDragEnd={() => {}}
          className="flex items-center border border-indigo-500 rounded px-3 py-1 cursor-grab bg-neutral-800"
        >
          <svg width="20" height="20" fill="none"><circle cx="10" cy="10" r="8" stroke="#6366f1" strokeWidth="2"/><path d="M5 13L9 9L13 11L15 7" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"/></svg>
          <span className="ml-2 font-semibold text-indigo-300">Clicks Graph</span>
        </div>
        <div
          draggable
          onDragStart={e => {
            e.dataTransfer.setData("widget", "devices-pie");
          }}
          onDragEnd={() => {}}
          className="flex items-center border border-indigo-500 rounded px-3 py-1 cursor-grab bg-neutral-800 ml-4"
        >
          <svg width="20" height="20" fill="none"><circle cx="10" cy="10" r="8" stroke="#10b981" strokeWidth="2"/><path d="M10 6v4l3 2" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/></svg>
          <span className="ml-2 font-semibold text-green-300">Devices Pie</span>
        </div>
        <div
          draggable
          onDragStart={e => {
            e.dataTransfer.setData("widget", "log-widget");
          }}
          onDragEnd={() => {}}
          className="flex items-center border border-indigo-500 rounded px-3 py-1 cursor-grab bg-neutral-800 ml-4"
        >
          <svg width="20" height="20" fill="none"><rect x="3" y="6" width="14" height="2" rx="1" fill="#6366f1"/><rect x="3" y="10" width="14" height="2" rx="1" fill="#6366f1"/><rect x="3" y="14" width="14" height="2" rx="1" fill="#6366f1"/></svg>
          <span className="ml-2 font-semibold text-indigo-300">Logs Widget</span>
        </div>
      </div>
      <CustomCursor />
      <div style={{ width: "100%", height: "600px", background: "#18181b", borderRadius: 16, position: "relative", marginTop: 56 }}>
        {/* Legend in top left */}
        {!loading && flowData.nodeColorMap && flowData.orderedNodes && (
          <div
            style={{
              position: "absolute",
              top: 16,
              left: 16,
              background: "#23232b",
              color: "#fff",
              padding: "12px 18px",
              borderRadius: 8,
              boxShadow: "0 2px 8px #0003",
              zIndex: 10,
              fontSize: 14,
              minWidth: 180,
              maxHeight: 300,
              overflowY: "auto",
            }}
          >
            <div style={{ fontWeight: "bold", marginBottom: 6 }}>Node Legend</div>
            {flowData.orderedNodes.map((url) => (
              <div key={url} style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
                <span
                  style={{
                    display: "inline-block",
                    width: 18,
                    height: 4,
                    background: flowData.nodeColorMap?.get(url),
                    marginRight: 8,
                    borderRadius: 2,
                  }}
                />
                <span style={{ wordBreak: "break-all" }}>{url}</span>
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
            fitView
            onNodeMouseEnter={(_, node) => setHoveredNode(node.id)}
            onNodeMouseLeave={() => setHoveredNode(null)}
            onNodeClick={(_, node) => {
              // Only open heatmap for URL nodes (not widgets)
              if (
                !node.id.startsWith("clicks-graph-") &&
                !node.id.startsWith("devices-pie-") &&
                !node.id.startsWith("log-widget-")
              ) {
                setHeatmapUrl(node.id);
              }
            }}
            onDrop={e => {
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
                    data: { projectId, onRemoveNode: handleRemoveNode },
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
                    data: { projectId, onRemoveNode: handleRemoveNode },
                    draggable: true,
                  },
                ]);
              }
              if (widget === "log-widget") {
                setNodes(nds => [
                  ...nds,
                  {
                    id: `log-widget-${Date.now()}`,
                    type: "log-widget",
                    position,
                    data: { projectId, onRemoveNode: handleRemoveNode },
                    draggable: true,
                  },
                ]);
              }
            }}
            onDragOver={e => e.preventDefault()}
          >
            <Background />
            <Controls />
          </ReactFlow>
        )}
        {hoveredNode && !loading && (
          <div
            style={{
              position: "fixed",
              top: 24,
              right: 24,
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
          >
            <div style={{ fontWeight: "bold", marginBottom: 6 }}>{hoveredNode}</div>
            {hoveredNode.startsWith("clicks-graph-") || hoveredNode.startsWith("devices-pie-") ? null : (
              <>
                <div>
                  <span style={{ color: "#a3e635" }}>Users came from:</span>
                  <ul style={{ margin: 0, paddingLeft: 16 }}>
                    {Object.entries(
                      flowData.edges
                        .filter(e => e.target === hoveredNode)
                        .reduce((acc: Record<string, number>, e) => {
                          acc[e.source] = (acc[e.source] || 0) + 1;
                          return acc;
                        }, {})
                    ).map(([source, count], idx) => (
                      <li key={`${source}->${hoveredNode}-${count}-${idx}`}>
                        <b>{count}</b> {source}
                      </li>
                    ))}
                  </ul>
                </div>
                <div style={{ marginTop: 6 }}>
                  <span style={{ color: "#38bdf8" }}>Users went to:</span>
                  <ul style={{ margin: 0, paddingLeft: 16 }}>
                    {Object.entries(
                      flowData.edges
                        .filter(e => e.source === hoveredNode)
                        .reduce((acc: Record<string, number>, e) => {
                          acc[e.target] = (acc[e.target] || 0) + 1;
                          return acc;
                        }, {})
                    ).map(([target, count], idx) => (
                      <li key={`${hoveredNode}->${target}-${count}-${idx}`}>
                        <b>{count}</b> {target}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      {heatmapUrl && (
        <HeatmapModal
          url={heatmapUrl}
          projectId={projectId}
          onClose={() => setHeatmapUrl(null)}
        />
      )}
    </main>
  );
}
type HeatmapPoint = {
  click_x: number;
  click_y: number;
  viewport_width: number;
  viewport_height: number;
};
function HeatmapModal({ url, projectId, onClose }: { url: string, projectId: string, onClose: () => void }) {
  const [points, setPoints] = useState<HeatmapPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPoints() {
      const supabase = createClient();
      const { data } = await supabase
        .from("heatmap_clicks")
        .select("click_x, click_y, viewport_width, viewport_height")
        .eq("project_id", projectId)
        .eq("url", url);
      setPoints(data || []);
      setLoading(false);
    }
    fetchPoints();
  }, [url, projectId]);

  // Simple heatmap: just plot dots (for demo; for real heatmap use a library)
  return (
    <div className="fixed inset-0 z-[2000] bg-black bg-opacity-70 flex items-center justify-center">
      <div className="relative bg-neutral-900 rounded-lg p-4 shadow-lg max-w-3xl w-full h-[80vh] flex flex-col">
        <button
          className="absolute top-2 right-2 text-white text-2xl"
          onClick={onClose}
        >×</button>
        <h3 className="text-lg font-bold text-indigo-300 mb-2">Heatmap for {url}</h3>
        <div className="flex-1 relative bg-neutral-800 rounded overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full text-neutral-400">Loading...</div>
          ) : (
            <div style={{ width: "100%", height: "100%", position: "relative" }}>
              {points.map((pt, i) => {
                // Normalize to container size (assume 1000x600 for demo)
                const x = pt.viewport_width ? (pt.click_x / pt.viewport_width) * 100 : 0;
                const y = pt.viewport_height ? (pt.click_y / pt.viewport_height) * 100 : 0;
                return (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      left: `${x}%`,
                      top: `${y}%`,
                      width: 16,
                      height: 16,
                      background: "rgba(99,102,241,0.5)",
                      borderRadius: "50%",
                      transform: "translate(-50%, -50%)",
                      pointerEvents: "none",
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
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