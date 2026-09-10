import { requireProfile } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { KeysClient } from "@/components/keys/keys-client";

export const metadata = { title: "Keys" };

export default async function KeysPage() {
  const { profile } = await requireProfile();
  const supabase = await createClient();
  const isAdmin = profile.level === 1;

  let query = supabase
    .from("keys_code")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(2000);

  if (!isAdmin) query = query.eq("registrator", profile.username);

  const { data: keys } = await query;

  return <KeysClient keys={(keys ?? []) as any} isAdmin={isAdmin} />;
}
