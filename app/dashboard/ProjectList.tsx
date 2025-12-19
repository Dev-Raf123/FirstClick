"use client";
import Link from "next/link";
import { SnippetBox } from "./SnippetBox";
import { ProjectMenu } from "./ProjectMenu";
import { QuickInsights } from "./QuickInsights";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  calculateClickPercentageChange, 
  getTodayDateString, 
  getYesterdayDateString 
} from "@/lib/analytics-utils";

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
  user_id?: string;
  // add other fields as needed
}

export function ProjectList({ projects: initialProjects, clicksPerProject: initialClicksPerProject }: { projects: Project[]; clicksPerProject: Record<string, number> }) {
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [modalSnippet, setModalSnippet] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [newProjectName, setNewProjectName] = useState("");
  const [loading, setLoading] = useState(false);
  const [projectPercentages, setProjectPercentages] = useState<Record<string, number>>({});
  const [clicksPerProject, setClicksPerProject] = useState<Record<string, number>>(initialClicksPerProject);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  // Fetch percentage changes for all projects with real-time updates
  useEffect(() => {
    const supabase = createClient();
    
    async function fetchPercentages() {
      if (projects.length === 0) return;
      
      // Calculate UTC date ranges for today and yesterday
      const now = new Date();
      const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
      const todayEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
      const yesterdayStart = new Date(todayStart);
      yesterdayStart.setUTCDate(yesterdayStart.getUTCDate() - 1);
      const yesterdayEnd = new Date(todayStart);
      yesterdayEnd.setUTCMilliseconds(-1);
      
      const percentages: Record<string, number> = {};
      const totalClicks: Record<string, number> = {};

      for (const project of projects) {
        // Get total clicks for this project
        const { count: totalCount } = await supabase
          .from("page_visits")
          .select("*", { count: "exact", head: true })
          .eq("project_id", project.id);

        totalClicks[project.id] = totalCount || 0;

        // Get today's count
        const { count: todayCount } = await supabase
          .from("page_visits")
          .select("*", { count: "exact", head: true })
          .eq("project_id", project.id)
          .gte("timestamp", todayStart.toISOString())
          .lte("timestamp", todayEnd.toISOString());

        // Get yesterday's count
        const { count: yesterdayCount } = await supabase
          .from("page_visits")
          .select("*", { count: "exact", head: true })
          .eq("project_id", project.id)
          .gte("timestamp", yesterdayStart.toISOString())
          .lte("timestamp", yesterdayEnd.toISOString());

        const clicksToday = todayCount || 0;
        const clicksYesterday = yesterdayCount || 0;
        const percent = calculateClickPercentageChange(clicksToday, clicksYesterday);
        percentages[project.id] = percent;
        
        console.log(`[DASHBOARD] ${project.name}:`);
        console.log(`  Total: ${totalClicks[project.id]} clicks`);
        console.log(`  Today: ${clicksToday} clicks (${todayStart.toISOString()} to ${todayEnd.toISOString()})`);
        console.log(`  Yesterday: ${clicksYesterday} clicks`);
        console.log(`  Percentage: ${percent}%`);
      }

      setClicksPerProject(totalClicks);
      setProjectPercentages(percentages);
      setLastUpdate(Date.now());
    }

    fetchPercentages();

    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      fetchPercentages();
    }, 10000);

    // Refresh when page becomes visible (tab switching)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchPercentages();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup on unmount
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [projects]);

  async function handleCreateProject() {
    if (!newProjectName.trim()) return;
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      alert("User not authenticated. Please log in again.");
      return;
    }
    const { data, error } = await supabase
      .from("projects")
      .insert([{ name: newProjectName, user_id: user.id }])
      .select()
      .single();
    setLoading(false);
    if (!error && data) {
      setProjects([data, ...projects]);
      setNewProjectName("");
    } else {
      alert("Failed to create project");
    }
  }

  return (
    <div className="border border-neutral-700 rounded-xl bg-black p-3 sm:p-4">
      <h2 className="text-sm sm:text-xl text-white mb-3 flex items-center justify-between">
        Projects
        {projects.length === 0 && (
          <Link href="/dashboard/createproject">
            <button
              className="ml-2 px-1.5 py-0.5 bg-indigo-700 text-white rounded-md text-lg hover:bg-indigo-800 transition"
              title="Create new project"
            >
              +
            </button>
          </Link>
        )}
      </h2>
      <div className="grid grid-cols-1 gap-3">
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

              return (
                <div
                  key={project.id}
                  className="relative border border-neutral-700 bg-black rounded-lg p-3 sm:p-0 overflow-hidden"
                >
                  {/* ProjectMenu absolutely positioned in the top-right */}
                  <div className="absolute top-3 right-3 z-10">
                    <ProjectMenu
                      onSeeSnippet={() => setModalSnippet(fullSnippet)}
                      onDelete={async () => {
                        if (confirm("Are you sure you want to delete this project?")) {
                          setLoading(true);
                          const res = await fetch("/api/delete-project", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ projectId: project.id }),
                          });
                          setLoading(false);
                          if (res.ok) {
                            setProjects(prev => prev.filter(p => p.id !== project.id));
                            setDeletedIds(ids => [...ids, project.id]);
                          } else {
                            alert("Failed to delete project. Please try again.");
                          }
                        }
                      }}
                    />
                  </div>
                  <Link
                    href={`/UserProjects/${project.id}`}
                    className="block p-3 sm:p-4 hover:bg-neutral-900 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3 pr-6">
                      <div className="font-semibold text-white flex items-center gap-2 text-xs sm:text-sm flex-wrap">
                        {project.name}
                        <span className="text-[10px] bg-indigo-700 text-white px-2 py-0.5 rounded">
                          {clicksPerProject[project.id] || 0} Total clicks
                        </span>
                        {projectPercentages[project.id] !== undefined && (
                          <span 
                            key={`${project.id}-${lastUpdate}`}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            projectPercentages[project.id] > 0 ? 'bg-green-700 text-white' :
                            projectPercentages[project.id] < 0 ? 'bg-red-700 text-white' :
                            'bg-neutral-700 text-neutral-300'
                          }`}>
                            {projectPercentages[project.id] > 0 ? '+' : ''}{projectPercentages[project.id]}%
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                  <div className="px-0 sm:px-4 pb-3">
                    {/* Tracking Snippet */}
                    <SnippetBox projectId={project.id} />
                  </div>
                  {/* Quick Insights */}
                  <div className="px-3 sm:px-4 pb-4">
                    <QuickInsights projectId={project.id} />
                  </div>
                </div>
              );
            })
        ) : (
          <div className="text-neutral-400">No projects yet. Create one above!</div>
        )}
      </div>
      <SnippetModal
        open={!!modalSnippet}
        onClose={() => setModalSnippet(null)}
        snippet={modalSnippet || ""}
      />
    </div>
  );
}