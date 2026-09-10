import { requireAdmin } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { getAppSettings } from "@/lib/settings";
import { ServerSettingsForm } from "@/components/admin/server-settings-form";

export const metadata = { title: "Server" };

export default async function AdminServerPage() {
  await requireAdmin();
  const supabase = await createClient();
  const settings = await getAppSettings(supabase);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Server</h1>
        <p className="text-sm text-muted-foreground">
          Values served to clients via the connect endpoint
        </p>
      </div>
      <ServerSettingsForm settings={settings} />
    </div>
  );
}
