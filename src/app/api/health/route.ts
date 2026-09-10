import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

/**
 * Diagnostic endpoint. Returns whether the Supabase environment variables are
 * configured and whether the database tables are reachable — without exposing
 * any secret values. Useful for confirming the panel is connected.
 */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const staticWords = process.env.STATIC_WORDS;

  const report: {
    env: Record<string, boolean>;
    database: { ok: boolean; error?: string } | null;
  } = {
    env: {
      NEXT_PUBLIC_SUPABASE_URL: Boolean(url),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(anon),
      SUPABASE_SERVICE_ROLE_KEY: Boolean(service),
      STATIC_WORDS: Boolean(staticWords),
    },
    database: null,
  };

  if (url && anon) {
    const supabase = createClient(url, anon);
    try {
      const { error } = await supabase
        .from("profiles")
        .select("id", { head: true, count: "exact" })
        .limit(1);
      report.database = error
        ? { ok: false, error: error.message }
        : { ok: true };
    } catch (e) {
      report.database = {
        ok: false,
        error: e instanceof Error ? e.message : "unknown error",
      };
    }
  }

  return NextResponse.json(report);
}
