import { KeyRound, User, CheckCircle2, CircleDashed } from "lucide-react";
import { requireProfile } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatMoney } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { profile } = await requireProfile();
  const supabase = await createClient();
  const isAdmin = profile.level === 1;

  async function countKeys(filter?: (q: any) => any) {
    let q = supabase.from("keys_code").select("*", { count: "exact", head: true });
    if (!isAdmin) q = q.eq("registrator", profile.username);
    if (filter) q = filter(q);
    const { count } = await q;
    return count ?? 0;
  }

  const [totalKeys, usedKeys, unusedKeys, usersCount] = await Promise.all([
    countKeys(),
    countKeys((q) => q.not("expired_date", "is", null)),
    countKeys((q) => q.is("expired_date", null)),
    isAdmin
      ? supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .then(({ count }) => count ?? 0)
      : Promise.resolve(null),
  ]);

  const { data: history } = await supabase
    .from("history")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {profile.fullname || profile.username}.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-2 text-sm">
          <span className="text-muted-foreground">Balance </span>
          <span className="font-semibold tabular-nums">
            {formatMoney(profile.saldo)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total keys" value={totalKeys} icon={KeyRound} />
        <StatCard
          label="Active keys"
          value={usedKeys}
          hint="Activated at least once"
          icon={CheckCircle2}
        />
        <StatCard
          label="Unused keys"
          value={unusedKeys}
          hint="Never activated"
          icon={CircleDashed}
        />
        {isAdmin ? (
          <StatCard label="Total users" value={usersCount ?? 0} icon={User} />
        ) : (
          <StatCard
            label="Account type"
            value="Reseller"
            hint={`Uplink: ${profile.uplink ?? "—"}`}
            icon={User}
          />
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          {history && history.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>By</TableHead>
                  <TableHead className="text-right">When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell className="font-medium">{h.info}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {h.user_do ?? "—"}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatDate(h.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No recent activity.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
