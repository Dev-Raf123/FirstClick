"use client";
import Link from "next/link";
import { SnippetBox } from "./SnippetBox";
import { ProjectMenu } from "./ProjectMenu";
import { useState } from "react";

function SnippetModal({ open, onClose, snippet }: { open: boolean; onClose: () => void; snippet: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-neutral-900 border border-indigo-700 rounded-lg p-6 max-w-lg w-full relative">
        <button
          className="absolute top-2 right-2 text-white hover:text-indigo-400 text-xl"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h3 className="text-lg font-bold text-indigo-300 mb-4">Full Tracking Snippet</h3>
        <pre className="bg-neutral-800 text-white text-xs rounded p-2 overflow-x-auto max-h-96">{snippet}</pre>
      </div>
    </div>
  );
}

interface Project {
  id: string;
  name: string;
  // add other fields as needed
}
export function ProjectList({ projects, clicksPerProject }: { projects: Project[]; clicksPerProject: Record<string, number> }) {
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [modalSnippet, setModalSnippet] = useState<string | null>(null);

  return (
    <>
      <ul>
        {projects?.length ? (
          projects
            .filter((project) => !deletedIds.includes(project.id))
            .map((project) => {
              // Build the full snippet for this project
              const fullSnippet = `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js"></script>
<script>
  window.addEventListener('DOMContentLoaded', function () {
    const SUPABASE_URL = 'https://ckhoremindgjrtmjoanw.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNraG9yZW1pbmRnanJ0bWpvYW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5MzY1NDksImV4cCI6MjA2NjUxMjU0OX0.aDJaxW_C3CfyU9nBu0JG5NaHIymO0c0GVsDywXNOqfE';
    const PROJECT_ID = '${project.id}';
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    const payload = {
      url: window.location.pathname,
      project_id: PROJECT_ID,
      user_agent: navigator.userAgent,
      referrer: document.referrer
    };

    supabaseClient.from('page_visits').insert([payload])
      .then(response => {
        // Success
      })
      .catch(error => {
        // Error
      });
  });
</script>`;

              const heatmapSnippet = `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js"></script>
<script>
  window.addEventListener('DOMContentLoaded', function () {
    const SUPABASE_URL = 'https://ckhoremindgjrtmjoanw.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNraG9yZW1pbmRnanJ0bWpvYW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5MzY1NDksImV4cCI6MjA2NjUxMjU0OX0.aDJaxW_C3CfyU9nBu0JG5NaHIymO0c0GVsDywXNOqfE';
    const PROJECT_ID = '${project.id}';
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    document.addEventListener('click', function (e) {
      const payload = {
        project_id: PROJECT_ID,
        url: window.location.pathname,
        click_x: e.clientX,
        click_y: e.clientY,
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight,
        user_agent: navigator.userAgent,
        referrer: document.referrer
      };
      supabaseClient.from('heatmap_clicks').insert([payload])
        .then(response => {
          // Success
        })
        .catch(error => {
          // Error
        });
    }, { capture: true });
  });
</script>`;

              return (
                <li key={project.id} className="mb-6 border-b border-neutral-800 pb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <Link
                      href={`/UserProjects/${project.id}`}
                      className="block p-3 rounded hover:bg-neutral-800 transition-colors"
                    >
                      <div className="font-semibold text-white flex items-center gap-2">
                        {project.name}
                        <span className="ml-2 text-xs bg-indigo-700 text-white px-2 py-0.5 rounded">
                          {clicksPerProject[project.id] || 0} clicks
                        </span>
                      </div>
                      <div className="text-xs text-neutral-400 break-all">
                        Token: <span className="font-mono">{project.id}</span>
                      </div>
                    </Link>
                    {/* Tracking Snippet */}
                    <SnippetBox projectId={project.id} />
                  </div>
                  <ProjectMenu
                    onSeeSnippet={() => {
                      setModalSnippet(fullSnippet);
                    }}
                    onSeeHeatmapSnippet={() => {
                      setModalSnippet(heatmapSnippet);
                    }}
                    onDelete={async () => {
                      if (confirm("Are you sure you want to delete this project?")) {
                        setDeletedIds(ids => [...ids, project.id]);
                        await fetch("/api/delete-project", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ projectId: project.id }),
                        });
                      }
                    }}
                  />
                </li>
              );
            })
        ) : (
          <li className="text-neutral-400">No projects yet. Create one above!</li>
        )}
      </ul>
      <SnippetModal
        open={!!modalSnippet}
        onClose={() => setModalSnippet(null)}
        snippet={modalSnippet || ""}
      />
    </>
  );
}