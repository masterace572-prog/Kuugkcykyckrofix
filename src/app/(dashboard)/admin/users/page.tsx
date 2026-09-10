import { requireAdmin } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { UsersClient } from "@/components/admin/users-client";

export const metadata = { title: "Users" };

export default async function AdminUsersPage() {
  const { user } = await requireAdmin();
  const supabase = await createClient();

  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return <UsersClient users={(users ?? []) as any} selfId={user.id} />;
}
