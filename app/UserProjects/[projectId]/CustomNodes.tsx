import React from "react";
import ClicksLineChart from "./ClicksLineChart";
import DevicesPieChart from "./DevicesPieChart";
import LogWidget from "./LogWidget";

export const ClicksGraphNode = React.memo(function ClicksGraphNode({ id, data }: { id: string, data: { projectId: string, onRemoveNode: (id: string) => void } }) {
  return (
    <div style={{ width: 480, maxWidth: 480, position: "relative" }}>
      <button
        style={{
          position: "absolute",
          top: 4,
          right: 4,
          background: "rgba(30,30,30,0.7)",
          color: "#fff",
          border: "none",
          borderRadius: "50%",
          width: 36,
          height: 36,
          fontSize: 28,
          fontWeight: "bold",
          cursor: "pointer",
          zIndex: 10,
          lineHeight: "32px",
          textAlign: "center",
          padding: 0,
        }}
        onClick={() => data.onRemoveNode(id)}
        title="Remove widget"
      >×</button>
      <ClicksLineChart projectId={data.projectId} />
    </div>
  );
});

export const DevicesPieNode = React.memo(function DevicesPieNode({ id, data }: { id: string, data: { projectId: string, onRemoveNode: (id: string) => void } }) {
  return (
    <div style={{ width: 320, maxWidth: 320, position: "relative" }}>
      <button
        style={{
          position: "absolute",
          top: 4,
          right: 4,
          background: "rgba(30,30,30,0.7)",
          color: "#fff",
          border: "none",
          borderRadius: "50%",
          width: 36,
          height: 36,
          fontSize: 28,
          fontWeight: "bold",
          cursor: "pointer",
          zIndex: 10,
          lineHeight: "32px",
          textAlign: "center",
          padding: 0,
        }}
        onClick={() => data.onRemoveNode(id)}
        title="Remove widget"
      >×</button>
      <DevicesPieChart projectId={data.projectId} />
    </div>
  );
});

export const LogWidgetNode = React.memo(function LogWidgetNode({ id, data }: { id: string, data: { projectId: string, onRemoveNode: (id: string) => void } }) {
  return (
    <div style={{ width: 600, maxWidth: 600, position: "relative" }}>
      <button
        style={{
          position: "absolute",
          top: 4,
          right: 4,
          background: "rgba(30,30,30,0.7)",
          color: "#fff",
          border: "none",
          borderRadius: "50%",
          width: 36,
          height: 36,
          fontSize: 28,
          fontWeight: "bold",
          cursor: "pointer",
          zIndex: 10,
          lineHeight: "32px",
          textAlign: "center",
          padding: 0,
        }}
        onClick={() => data.onRemoveNode(id)}
        title="Remove widget"
      >×</button>
      <LogWidget projectId={data.projectId} />
    </div>
  );
});

export const nodeTypes = {
  "clicks-graph": ClicksGraphNode,
  "devices-pie": DevicesPieNode,
  "log-widget": LogWidgetNode,
};