import { requireProfile } from "@/lib/session";
import { AccountForm } from "@/components/settings/account-form";

export const metadata = { title: "Account" };

export default async function AccountPage() {
  const { profile } = await requireProfile();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile and password
        </p>
      </div>
      <AccountForm profile={profile} />
    </div>
  );
}
