import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AuthButton } from "@/components/auth-button";
import { ProjectList } from "./ProjectList";
import { MousePointer2 } from "lucide-react";
import Link from "next/link";
import { OnboardingTutorial } from "@/components/onboarding-tutorial";
import { DashboardFlexCard } from "./DashboardFlexCard";

export default async function Dashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Fetch user's projects
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Count visits per project
  const clicksPerProject: Record<string, number> = {};
  for (const project of (projects || [])) {
    const { count } = await supabase
      .from("page_visits")
      .select("*", { count: "exact", head: true })
      .eq("project_id", project.id);
    clicksPerProject[project.id] = count || 0;
  }


  return (
    <>
      <OnboardingTutorial />
      {/* Navbar */}
      <nav className="sticky top-0 z-[100] w-full border-b border-neutral-800 bg-neutral-900/80 px-2 sm:px-4 py-0 mb-8 backdrop-blur">
        <div className="flex flex-row items-center gap-8 h-12">
          {/* Horizontal nav tabs */}
          <div className="flex gap-2 h-full">
            <Link href="/dashboard/trending" className="relative flex items-center h-full px-4 text-neutral-400 font-semibold hover:text-indigo-400 transition-colors">
              <span>Trending</span>
            </Link>
            <Link href="/dashboard" className="relative flex items-center h-full px-4 text-white font-semibold hover:text-indigo-400 transition-colors">
              <span>Dashboard</span>
              {/* Active underline */}
              <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-white rounded transition-all duration-200" style={{ opacity: "1" }} />
            </Link>
            {/* Flex Store link removed */}
            <Link href="/dashboard/library" className="relative flex items-center h-full px-4 text-neutral-400 font-semibold hover:text-indigo-400 transition-colors">
              <span>Library</span>
            </Link>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <div className="relative group">
              <button className="relative p-2 rounded-lg hover:bg-neutral-800 transition-colors">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
              </button>
              <div className="absolute right-0 top-full mt-2 w-80 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">✨</span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">FirstClick v1</h4>
                    <p className="text-neutral-300 text-sm">You can now create your own backgrounds for your flex cards in library!</p>
                  </div>
                </div>
              </div>
            </div>
            <MousePointer2 className="w-7 h-7 text-white -scale-x-100" />
            <span className="border border-indigo-500 text-indigo-400 text-xs px-2 py-0.5 rounded uppercase font-semibold tracking-wide ml-1">
              beta
            </span>
            <span className="text-white text-2xl font-bold">/</span>
            <AuthButton />
          </div>
        </div>
      </nav>
      <main className="relative min-h-screen max-w-7xl mx-auto py-4 px-2 sm:px-4 cursor-none">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-stretch md:items-start">
          {/* Project boxes */}
          <div className="flex-1 flex flex-col gap-3">
            <ProjectList projects={projects || []} clicksPerProject={clicksPerProject} />
          </div>
          {/* Show Flex Card if project exists */}
          {projects && projects.length > 0 && (
            <div className="md:w-[340px]">
              <DashboardFlexCard projectId={projects[0].id} projectName={projects[0].name} />
            </div>
          )}
        </div>
      </main>
    </>
  );
}