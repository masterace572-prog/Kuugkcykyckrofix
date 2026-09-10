"use client";

import * as React from "react";
import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createReferral, deleteReferral } from "@/lib/actions/admin";
import { formatMoney, formatShortDate } from "@/lib/utils";
import type { ReferralCode } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const initialState = { ok: false, message: "" };

export function ReferralsClient({ codes }: { codes: ReferralCode[] }) {
  const [state, formAction, pending] = useActionState(createReferral, initialState);

  React.useEffect(() => {
    if (state.ok && state.message) toast.success(state.message);
    else if (!state.ok && state.message) toast.error(state.message);
  }, [state]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Referrals</h1>
        <p className="text-sm text-muted-foreground">
          Generate codes that grant a starting balance on registration
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create referral code</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="set_saldo">Starting balance</Label>
              <Input
                id="set_saldo"
                name="set_saldo"
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                required
              />
            </div>
            <Button type="submit" loading={pending}>
              Generate code
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created by</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {codes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No referral codes yet.
                </TableCell>
              </TableRow>
            ) : (
              codes.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-sm">{c.code}</TableCell>
                  <TableCell className="tabular-nums">{formatMoney(c.set_saldo)}</TableCell>
                  <TableCell>
                    {c.used_by ? (
                      <Badge variant="neutral">Used by {c.used_by}</Badge>
                    ) : (
                      <Badge variant="success">Available</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.created_by ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatShortDate(c.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      onClick={async () => {
                        if (!confirm(`Delete referral code "${c.code}"?`)) return;
                        const res = await deleteReferral(c.id);
                        if (res.ok) toast.success(res.message);
                        else toast.error(res.message);
                      }}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                      aria-label="Delete referral"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
