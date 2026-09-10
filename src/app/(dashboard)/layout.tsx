import { requireProfile } from "@/lib/session";
import { AppShell } from "@/components/app-shell";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await requireProfile();
  return (
    <AppShell profile={profile} email={user.email}>
      {children}
    </AppShell>
  );
}
