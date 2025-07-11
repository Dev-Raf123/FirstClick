import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AuthButton } from "@/components/auth-button";
import { CustomCursor } from "@/components/custom-cursor";
import { SnippetBox } from "./SnippetBox"; // <-- Add this import
import { ProjectMenu } from "./ProjectMenu";
import { ProjectList } from "./ProjectList";

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

  // Fetch total views for all user's websites (assuming a 'page_visits' table with project_id)
  const { data: viewsData } = await supabase
    .from("page_visits")
    .select("id, project_id")
    .in("project_id", projects?.map((p) => p.id) || []);

  // Count visits per project
  const clicksPerProject: Record<string, number> = {};
  viewsData?.forEach((v) => {
    clicksPerProject[v.project_id] = (clicksPerProject[v.project_id] || 0) + 1;
  });

  const totalViews = viewsData ? viewsData.length : 0;

  return (
    <main className="max-w-5xl mx-auto py-12 px-4 cursor-none">
      <CustomCursor />
      {/* Dashboard header with logout button */}
      <div className="flex justify-end mb-6">
        <AuthButton />
      </div>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Projects List with border and create button */}
        <section className="flex-1 border border-neutral-700 rounded-xl bg-neutral-900/80 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Your Projects</h2>
            <form
              className="flex gap-2"
              action={async (formData) => {
                "use server";
                const supabase = await createClient();
                const name = formData.get("name") as string;
                if (name) {
                  await supabase.from("projects").insert({ name, user_id: user.id });
                  redirect("/dashboard");
                }
              }}
            >
              <input
                name="name"
                placeholder="Project name"
                className="border px-3 py-2 rounded bg-neutral-800 text-white"
                required
              />
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-500 transition-colors"
              >
                Create
              </button>
            </form>
          </div>
          <ProjectList projects={projects || []} clicksPerProject={clicksPerProject} />
        </section>
        {/* Total Views Counter */}
        <section className="md:w-80 w-auto self-start border border-neutral-700 rounded-xl bg-neutral-900/80 p-8 shadow-lg mt-8 md:mt-0">
          <h3 className="text-lg font-semibold text-white mb-2">
            Total Views on All Websites
          </h3>
          <div className="text-5xl font-extrabold text-indigo-400 mb-2">
            {totalViews}
          </div>
          <span className="text-neutral-400 text-sm">Real-time counter</span>
        </section>
      </div>
    </main>
  );
}