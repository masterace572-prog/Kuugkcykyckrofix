"use client";

import * as React from "react";
import { Pencil, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteUser } from "@/lib/actions/admin";
import { formatMoney, formatShortDate } from "@/lib/utils";
import type { Profile } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserEditDialog } from "@/components/admin/user-edit-dialog";

export function UsersClient({
  users,
  selfId,
}: {
  users: Profile[];
  selfId: string;
}) {
  const [search, setSearch] = React.useState("");
  const [editTarget, setEditTarget] = React.useState<Profile | null>(null);

  const filtered = React.useMemo(() => {
    if (!search.trim()) return users;
    const q = search.trim().toLowerCase();
    return users.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        (u.fullname ?? "").toLowerCase().includes(q) ||
        (u.uplink ?? "").toLowerCase().includes(q)
    );
  }, [users, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground">{users.length} registered accounts</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search users…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{u.username}</span>
                      {u.fullname ? (
                        <span className="text-xs text-muted-foreground">{u.fullname}</span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.level === 1 ? "default" : "neutral"}>
                      {u.level === 1 ? "Admin" : "Reseller"}
                    </Badge>
                  </TableCell>
                  <TableCell className="tabular-nums">{formatMoney(u.saldo)}</TableCell>
                  <TableCell>
                    <Badge variant={u.status === 1 ? "success" : "danger"}>
                      {u.status === 1 ? "Active" : "Disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatShortDate(u.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => setEditTarget(u)}
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label="Edit user"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {u.id !== selfId && u.level !== 1 ? (
                        <button
                          onClick={async () => {
                            if (!confirm(`Delete user "${u.username}"?`)) return;
                            const res = await deleteUser(u.id);
                            if (res.ok) toast.success(res.message);
                            else toast.error(res.message);
                          }}
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                          aria-label="Delete user"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <UserEditDialog
        user={editTarget}
        open={editTarget !== null}
        onOpenChange={(o) => {
          if (!o) setEditTarget(null);
        }}
      />
    </div>
  );
}
