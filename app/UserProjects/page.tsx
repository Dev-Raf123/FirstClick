import { CustomCursor } from "@/components/custom-cursor";

export default function UserProjectsIndex() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-900 text-white cursor-none">
      <CustomCursor />
      <h1 className="text-3xl font-bold">Select a project to view analytics.</h1>
    </main>
  );
}