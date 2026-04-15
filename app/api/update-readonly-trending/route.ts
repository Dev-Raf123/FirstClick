import { NextRequest, NextResponse } from "next/server";
import { createClient as createUserClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Missing Supabase service role config" }, { status: 500 });
  }

  const userClient = await createUserClient();
  const { data: { user }, error: authError } = await userClient.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const items = Array.isArray(body?.items) ? body.items : [];
  if (items.length === 0) {
    return NextResponse.json({ success: true, updated: 0 });
  }

  const adminClient = createAdminClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });

  const rows = items.map((item: any) => ({
    project_id: item.project_id,
    name: item.name,
    description: item.description ?? null,
    url: item.url ?? null,
    percent: item.percent ?? null,
    clicks_today: item.clicks_today ?? 0,
    clicks_prev: item.clicks_prev ?? 0,
    background_url: item.background_url ?? null,
    background_position: item.background_position ?? null,
    background_size: item.background_size ?? null,
    background_repeat: item.background_repeat ?? null,
    equipped_design_id: item.equipped_design_id ?? null,
    text_color: item.text_color ?? null,
    updated_at: new Date().toISOString()
  }));

  const { error } = await adminClient
    .from("read_only_trending")
    .upsert(rows, { onConflict: "project_id" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, updated: rows.length });
}
