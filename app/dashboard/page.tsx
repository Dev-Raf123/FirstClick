import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AuthButton } from "@/components/auth-button";
import { ProjectList } from "./ProjectList";
import { TotalClicksCard } from "./TotalClicksCard";
import { MousePointer2 } from "lucide-react";
import Link from "next/link";
import { OnboardingTutorial } from "@/components/onboarding-tutorial";

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

  // Get total count for all projects
  const { count: totalViews } = await supabase
    .from("page_visits")
    .select("*", { count: "exact", head: true })
    .in("project_id", projects?.map((p) => p.id) || []);

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
            <MousePointer2 className="w-7 h-7 text-white -scale-x-100" />
            <span className="border border-indigo-500 text-indigo-400 text-xs px-2 py-0.5 rounded uppercase font-semibold tracking-wide ml-1">
              beta
            </span>
            <span className="text-white text-2xl font-bold">/</span>
            <AuthButton />
          </div>
        </div>
      </nav>
      <main className="relative min-h-screen max-w-7xl mx-auto py-6 px-2 sm:px-4 cursor-none">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-stretch md:items-start">
          {/* Project boxes first */}
          <div className="flex-1 flex flex-col gap-4">
            <ProjectList projects={projects || []} clicksPerProject={clicksPerProject} />
          </div>
          {/* Total Clicks Card on the right */}
          <TotalClicksCard 
            projectIds={projects?.map((p) => p.id) || []} 
            initialTotalViews={totalViews || 0} 
          />
        </div>
      </main>
    </>
  );
}