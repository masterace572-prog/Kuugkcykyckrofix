import { requireAdmin } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { ReferralsClient } from "@/components/admin/referrals-client";

export const metadata = { title: "Referrals" };

export default async function AdminReferralsPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: codes } = await supabase
    .from("referral_codes")
    .select("*")
    .order("created_at", { ascending: false });

  return <ReferralsClient codes={(codes ?? []) as any} />;
}
